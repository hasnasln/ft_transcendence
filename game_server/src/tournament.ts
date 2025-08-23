import {HTTPMethod, tournamentApiCall} from "./httpApiManager";

export type TournamentData = {
    id: number;
    code: string;
    name: string;
    admin_id: string;
    lobby_members: Participant[];
    participants: Participant[];
    status: TournamentStatus
    start_time?: string;
    end_time?: string;
    tournament_start?: TournamentStart | null;
};

export enum TournamentStatus {
    CREATED = 'created',
    ONGOING = 'ongoing',
    COMPLETED = 'completed'
}

export type Participant = {
    uuid: string;
    username: string;
    status?: ParticipantStatus;
};

export enum ParticipantStatus {
    DISCONNECTED = 'disconnected',
    JOINED = 'joined',
}

export type TournamentStart = {
    rounds: Round[];
}

export type Round = {
    round_number: number;
    expired_at?: number;
    matches: Match[];
    winners: Participant[] | null;
    expected_winner_count: number;
    is_completed: boolean;
}

export type Match = {
    participant1: Participant;
    participant2: Participant;
    status: MatchStatus;
}

export enum MatchStatus {
    CREATED = 'created',
    WAITING_PLAYER = 'waiting_player',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export function isFinalMatch(activeRound: Round): boolean {
    return (activeRound.expected_winner_count === 1 && (activeRound.winners === null || activeRound.winners.length === 0));
}

export function generateMatchId(tournamentCode: string, roundNumber: number, participant1: Participant, participant2: Participant): string {
    const p1 = participant1.username.replace(/\s+/g, '_').toLowerCase();
    const p2 = participant2.username.replace(/\s+/g, '_').toLowerCase();
    const first = p1 < p2 ? p1 : p2;
    const second = p1 < p2 ? p2 : p1;
    return `${tournamentCode}_r${roundNumber}_m${first}_vs_${second}`;
}

export function extractMatch(tournament: TournamentData, participantId: string): { roundNumber: number, match_id: string, finalMatch: boolean }
{
    try
    {
        const activeRound = tournament.tournament_start!.rounds.find(r => !r.is_completed);
        if (!activeRound) {
            throw new Error(`No Active Round in the tournament ${tournament.name}`);
        }

        const roundNumber = activeRound.round_number;
        const finalMatch = isFinalMatch(activeRound);

        const match = activeRound.matches
            .find(m => m.participant1.uuid === participantId || m.participant2.uuid === participantId);

        if (!match) {
            if(activeRound.winners && activeRound.winners.find(p => p.uuid === participantId) !== undefined)
                throw new Error(`You qualified to the next round ! Wait for the next round.`);
            else
                throw new Error(`You have already played your match in this round : ${activeRound.round_number}. Wait for the next round.`);
        }

        switch (match.status)
        {
            case MatchStatus.ONGOING:
                throw new Error(`Match is ongoing. Match ID: ${match.participant1.uuid} vs ${match.participant2.uuid}`);
            case MatchStatus.COMPLETED:
                throw new Error(`Match is already completed. Match ID: ${match.participant1.uuid} vs ${match.participant2.uuid}`);
            case MatchStatus.CANCELLED:     
                throw new Error(`Match is cancelled. Match ID: ${match.participant1.uuid} vs ${match.participant2.uuid}`);
        }        

        const match_id: string = generateMatchId(tournament.code, roundNumber, match.participant1, match.participant2);
        return { roundNumber, match_id, finalMatch }
    }
    catch (err: any) {
        console.error("Error extracting match:", err);
        throw new Error(err);
    }   
}

export async function getTournament(tournamentCode: string): Promise<TournamentData | null> {
    const result = await tournamentApiCall(`tournament/${tournamentCode}`, HTTPMethod.GET)
    if (result instanceof Error) {
        throw result;
    }
    if (result.statusCode === 404) {
        return null;
    }

    if (result.statusCode !== 200) {
        throw new Error(`Failed to fetch tournament data: ${result.message}`);
    }


    
    console.log("Tournament Data received:", JSON.stringify(result.data as TournamentData, null, 2));

    return result.data as TournamentData;
}

export async function patchWinnersToTournament(tournamentCode: string, roundNumber: number, winner: Participant) {
    const response = await tournamentApiCall(`tournament/${tournamentCode}`, HTTPMethod.PATCH, {}, JSON.stringify({round_number: roundNumber, winner: winner}));
    if (response instanceof Error) {
        throw response;
    }
    if (response.statusCode !== 200) {
        throw new Error(`Failed to patch winners to tournament: ${response.message}`);
    }
}

export async function joinMatch(tournamentCode: string, roundNumber: number, participant: Participant) {
    const response = await tournamentApiCall(`tournament/${tournamentCode}/join-match`, HTTPMethod.PATCH, {}, JSON.stringify({round_number:  roundNumber, participant: participant }));
    if (response instanceof Error) {
        throw response;
    }
    if (response.statusCode !== 200) {
        throw new Error(`Failed to join match by code: ${response.message}`);
    }
}

export async function leaveMatch(tournamentCode: string, roundNumber: number, participant: Participant) {
    const response = await tournamentApiCall(`tournament/${tournamentCode}/leave-match`,
        HTTPMethod.PATCH, {}, JSON.stringify({round_number:  roundNumber, participant: participant }));

    if (response instanceof Error) {
        throw response;
    }

    if (response.statusCode !== 200) {
        throw new Error(`Failed to join match by code: ${response.message}`);
    }
}
