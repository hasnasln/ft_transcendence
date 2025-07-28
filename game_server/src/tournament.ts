import { IApiResponseWrapper, HTTPMethod, apiCall } from "./server";

export type Participant = {
    uuid: string;
    username: string;
};

export class Result<T = any> {
    constructor(
        public statusCode: number,
        public data: T | null,
        public message: string
    ) { }
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

export function isParticipantAmongWinners(participantId: string, activeRound: Round): boolean {
    return activeRound.winners?.some(p => p.uuid === participantId) ?? false;
}

export function isFinalMatch(activeRound: Round): boolean {
    return (activeRound.expected_winner_count === 1 && activeRound.winners === null);
}

export function findMyMatch(tournament: TournamentData, participantId: string): { roundNumber: number, match_id: string | null, finalMatch: boolean } {
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

    let match_id: string;
    const roundNumber = activeRound.round_number;
    const finalMatch = isFinalMatch(activeRound);

    for (const match of activeRound.matches) {
        if (match.participant1.uuid === participantId || match.participant2.uuid === participantId) {
            match_id = `${tournament.code}_r${activeRound.round_number}_m${match.participant1.username}_vs_${match.participant2.username}`;
            const opponentId = match.participant1.uuid === participantId ? match.participant2.uuid : match.participant1.uuid;
            if (isParticipantAmongWinners(participantId, activeRound))
                throw new Error(`You have already played your match in this round : ${activeRound.round_number}, tournament ${tournament.name}. Wait for next round !`);
            else if (isParticipantAmongWinners(opponentId, activeRound))
                throw new Error(`You have already played your match in this round : ${activeRound.round_number}, tournament ${tournament.name} and eliminated`);
            else
                return { roundNumber, match_id, finalMatch };

        }
    }

    if (isParticipantAmongWinners(participantId, activeRound))
        return { roundNumber, match_id: null, finalMatch: false };
    else
        throw new Error(`You have already been eliminated from the tournament ${tournament.name} !`);
}

export async function getTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
    const result: IApiResponseWrapper = { success: false, message: '', data: null };
    try {
        const response = await apiCall(`http://tournament.transendence.com/api/tournament/${tournamentCode}`, HTTPMethod.GET, {
            'Content-Type': 'application/json',
            'x-api-key': 'bypassauth' // i never heard about envs
        });

        const data = await response.json();
        if (!response.ok) {
            result.message = data.error;
            return result;
        }
        result.success = true;
        result.message = data.message;
        result.data = data.data;
        return result;
    } catch (error) {
        console.error('Error in getTournament:', error);
        throw error;
    }
}


export async function pushWinnerToTournament(tournamentCode: string, roundNumber: number, matchWinner: Participant): Promise<Result> {
    const url = `http://tournament.transendence.com/api/tournament/${tournamentCode}`;
    const body = { round_number: roundNumber, winner: matchWinner };

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'bypass': 'bypassauth'
            },
            body: JSON.stringify(body)
        });

        const result = await response.json() as Result;
        //console.log("pushWinner isteğinin yanıtı:", JSON.stringify(result, null, 2));
        return result;
    } catch (err: any) {
        console.error('pushWinner Fetch error:', err);
        throw err;
    }
}


export async function joinMatchByCode(token: string, tournamentCode: string, roundNumber: number, participant: Participant): Promise<Result> {
    const url = `http://tournament.transendence.com/api/tournament/${tournamentCode}/join-match`;
    const body = { round_number: roundNumber, participant: participant };

    try {
        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const result = await response.json() as Result;
        //console.log("joinMatchByCode isteğinin yanıtı:", JSON.stringify(result, null, 2));
        return result;
    }
    catch (err: any) {
        console.error(' joinMatchByCode Fetch error:', err);
        throw err;
    }
}

