import { Player, checkForRemoteMatch } from "./matchmaking";
import { Server } from "socket.io";
import { IApiResponseWrapper, HTTPMethod, myFetch } from "./server";
import { error } from "console";
import { emitErrorToClient } from "./errorHandling";

export type Participant = {
    uuid: string;
    username: string;
};

export class Result<T = any> {
  constructor(
    public statusCode: number,
    public data: T | null,
    public message: string
  ) {}
}

export enum TournamentStatus {
    CREATED = 'created',
    ONGOING = 'ongoing',
    COMPLETED = 'completed'
}

export type TournamentData = {
    id: number;
    code: string;
    name: string;
    admin_id: string;
    participants: Participant[];
    status: TournamentStatus
    start_time?: Date;
    end_time?: Date;
    tournament_start?: TournamentStart | null;
};

export type TournamentStart = {
    rounds: Round[];
}

export type Round = {
    round_number: number;
    matches: Match[];
    winners: Participant[] | null;
    expected_winner_count: number;
    is_completed: boolean;
}

export type Match = {
    participant1: Participant;
    participant2: Participant;
}

function isParticipantAmongWinners(participantId: string, activeRound: Round): boolean
{
	return activeRound.winners?.some(p => p.uuid === participantId) ?? false;
}

function isFinalMatch(activeRound: Round): boolean
{
	return (activeRound.expected_winner_count === 1 && activeRound.winners === null);
}

function findMyMatch(tournament: TournamentData, participantId: string): {roundNumber: number, match_id : string | null, finalMatch : boolean}
{
    if (tournament.status === TournamentStatus.CREATED) {
        
        throw new Error(`Tournament ${tournament.name} is not ONGOING yet`);
    }

    if (tournament.status === TournamentStatus.COMPLETED) {
        
        throw new Error(`Tournament ${tournament.name} is COMPLETED already`);
    }

    const participant = tournament.participants.find(p => p.uuid === participantId);
    if (!participant) {
        throw new Error(`Participant Not Found in the tournament ${tournament.name}`);
    }

    if (!tournament.tournament_start) {
        throw new Error(`Tournament ${tournament.name} is not ONGOING yet`);
    }

    const activeRound = tournament.tournament_start.rounds.find(r => !r.is_completed);
    if (!activeRound) {
        throw new Error(`No Active Round in the tournament ${tournament.name}`);
    }
    if (activeRound.is_completed) {
        throw new Error(`Round Already Completed in the tournament ${tournament.name}`);
    }

    let  match_id: string;
    const roundNumber = activeRound.round_number;
    const finalMatch = isFinalMatch(activeRound);
    
    for (const match of activeRound.matches)
    {
        if (match.participant1.uuid === participantId || match.participant2.uuid === participantId)
        {
             match_id = `${tournament.code}_r${activeRound.round_number}_m${match.participant1.username}_vs_${match.participant2.username}`;
             const opponentId = match.participant1.uuid === participantId ?  match.participant2.uuid :  match.participant1.uuid;
             if (isParticipantAmongWinners(participantId, activeRound))
                throw new Error(`You have already played your match in this round : ${activeRound.round_number}, tournament ${tournament.name}. Wait for next round !`);
             else if (isParticipantAmongWinners(opponentId, activeRound))
                throw new Error(`You have already played your match in this round : ${activeRound.round_number}, tournament ${tournament.name} and eliminated`);
             else
                return {roundNumber, match_id, finalMatch};

        }
    }

    if (isParticipantAmongWinners(participantId, activeRound))
        return {roundNumber, match_id: null, finalMatch: false};
    else
        throw new Error(`You have already been eliminated from the tournament ${tournament.name} !`);

}



export async function  getTournament(tournamentCode: string): Promise<IApiResponseWrapper>
{
  const result: IApiResponseWrapper = {success: false, message: '', data: null};
  try{
    const response = await myFetch(`http://tournament.transendence.com/api/tournament/${tournamentCode}`, HTTPMethod.GET, {
      'Content-Type': 'application/json',
      'bypass': 'bypassauth'
    });
    if (!response.ok)
    {
      console.log("getmedi");
    }
    const data = await response.json();
    console.log("gelen:", JSON.stringify(data, null, 2));
    result.success = true;
    result.message = data.message;
    result.data = data.data;
    return result;
  } catch (error) {
    console.error('Error in getTournament:', error);
    throw error;
  }
}


export async function  pushWinnerToTournament(tournamentCode: string, roundNumber: number, matchWinner: Participant): Promise<Result>
{
    const url = `http://tournament.transendence.com/api/tournament/${tournamentCode}`;
    const body = {round_number: roundNumber, winner: matchWinner};

    try
    {
        const response = await fetch(url, {
        method: 'PATCH',
        headers: {
        'Content-Type': 'application/json',
        'bypass': 'bypassauth'
        },
        body: JSON.stringify(body)
        });

        // JSON yanıtı al
        const result = await response.json() as Result;
        console.log("pushWinner isteğinin yanıtı:", JSON.stringify(result, null, 2));
        return result;
    }
    catch (err: any)
    {
        console.error('Fetch error:', err);
        throw err;
    }
}


const waitingMatches: Map<string, Map<string, Player>> = new Map();

export async function handleTournamentMatch(player: Player, io: Server, tournamentCode: string)
{
    try
    {
        const response = await getTournament(tournamentCode!);
        if (!response.success)
            throw error(`Could not get the tournament with code : ${tournamentCode}`);

        const match_id = findMyMatch(response.data, player.uuid).match_id;
        if(!match_id)
        {
            io.to(player.socket.id).emit("goToNextRound");
            return;
        }
        
        if (!waitingMatches.has(match_id))
            waitingMatches.set(match_id, new Map<string, Player>());
        const myMatchMap = waitingMatches.get(match_id);
        if (!myMatchMap) {
            throw new Error(`Maç bulunamadı: match_id = ${match_id}`);
        }
        myMatchMap.set(player.username, player);
        myMatchMap.forEach((value, key) => {
        console.log(`Key: ${key}, Value: {${value.socket}, ${value.username}, ${value.uuid}`);
        });

        if (myMatchMap.size > 2)
            throw new Error(`Bir şeyler ters gitti ! myMatchMap.size 2 den büyük olamaz, şu an ${myMatchMap.size}`);
        const roundNumber = findMyMatch(response.data, player.uuid).roundNumber;
        const finalMatch = findMyMatch(response.data, player.uuid).finalMatch;
        checkForRemoteMatch(io, myMatchMap, 'tournament', tournamentCode, roundNumber, finalMatch);
    }
    catch (err: any)
    {
    console.error("Hata kodu:", err.message);
    emitErrorToClient(err.message, player.socket.id, io);
    }

    

}


// export async function sendRequest(request: FastifyRequest) {
// 	const responseData = await unitRequest('http://localhost:8081/api/auth/validate', {
// 		method: "POST",
// 		headers: {
// 			'Authorization': request.headers.authorization as string,
// 		},
// 		//body: JSON.stringify(request.body)
// 	});
// }

