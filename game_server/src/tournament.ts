import {HTTPMethod, tournamentApiCall} from "./httpApiManager";

export type Participant = {
    uuid: string;
    username: string;
};

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
    expired_at: Date | null;
}

export type Match = {
    participant1: Participant;
    participant2: Participant;
}

export function isFinalMatch(activeRound: Round): boolean {
    return (activeRound.expected_winner_count === 1 && activeRound.winners === null);
}

export function generateMatchId(tournamentCode: string, roundNumber: number, participant1: Participant, participant2: Participant): string {
    const p1 = participant1.username.replace(/\s+/g, '_').toLowerCase();
    const p2 = participant2.username.replace(/\s+/g, '_').toLowerCase();
    const first = p1 < p2 ? p1 : p2;
    const second = p1 < p2 ? p2 : p1;
    return `${tournamentCode}_r${roundNumber}_m${first}_vs_${second}`;
}

export function extractMatch(tournament: TournamentData, participantId: string): { roundNumber: number, match_id: string, finalMatch: boolean } {
    const activeRound = tournament.tournament_start!.rounds.find(r => !r.is_completed);
    if (!activeRound) {
        throw new Error(`No Active Round in the tournament ${tournament.name}`);
    }

    const roundNumber = activeRound.round_number;
    const finalMatch = isFinalMatch(activeRound);

    const match = activeRound.matches
        .find(m => m.participant1.uuid === participantId || m.participant2.uuid === participantId);

    if (!match) {
        throw new Error(`You are not playing in this tournament ${tournament.name} or you have already played your match in this round : ${activeRound.round_number}`);
    }

    const match_id: string = generateMatchId(tournament.code, roundNumber, match.participant1, match.participant2);
    return { roundNumber, match_id, finalMatch }
    }

export async function getTournament(tournamentCode: string): Promise<TournamentData | null> {
    const result = await tournamentApiCall(`tournament/${tournamentCode}`, HTTPMethod.GET)

    if (result.statusCode === 404) {
        return null;
    }

    if (result.statusCode !== 200) {
        throw new Error(`Failed to fetch tournament data: ${result.message}`);
    }

    return result.data as TournamentData;
}

export async function patchWinnersToTournament(tournamentCode: string, roundNumber: number, winner: Participant) {
    const response = await tournamentApiCall(`tournament/${tournamentCode}`, HTTPMethod.PATCH, {}, JSON.stringify({round_number: roundNumber, winner}));

    if (response.statusCode !== 200) {
        throw new Error(`Failed to patch winners to tournament: ${response.message}`);
    }
}

export async function joinMatch(tournamentCode: string, roundNumber: number, participant: Participant) {
    const response = await tournamentApiCall(`tournament/${tournamentCode}/join-match`, HTTPMethod.PATCH, {}, JSON.stringify({round_number:  roundNumber, participant }));

    if (response.statusCode !== 200) {
        throw new Error(`Failed to join match by code: ${response.message}`);
    }
}

export async function leaveMatch(tournamentCode: string, roundNumber: number, participant: Participant) {
    const response = await tournamentApiCall(`tournament/${tournamentCode}/leave-match`,
        HTTPMethod.PATCH, {}, JSON.stringify({round_number:  roundNumber, participant }));

    if (response.statusCode !== 200) {
        throw new Error(`Failed to join match by code: ${response.message}`);
    }
}
