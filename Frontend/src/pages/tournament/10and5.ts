export enum ParticipantStatus {
    DISCONNECTED = 'disconnected',
    JOINED = 'joined',
}

export type Participant = {
    uuid: string;
    username: string;
    status?: ParticipantStatus;
};


export enum TournamentStatus {
    CREATED = 'created',
    ONGOING = 'ongoing',
    COMPLETED = 'completed'
}

export enum MatchStatus {
    CREATED = 'created',
    WAITING_PLAYER = 'waiting_player',
    ONGOING = 'ongoing',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

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

export const tournament10: TournamentData = {
    id: 2,
    code: "T10B1",
    name: "10 Kişilik Turnuva",
    admin_id: "uuid-admin-2",
    lobby_members: [],
    participants: [
        { uuid: "uuid-p1", username: "Player1", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p2", username: "Player2", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p3", username: "Player3", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p4", username: "Player4", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p5", username: "Player5", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p6", username: "Player6", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p7", username: "Player7", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p8", username: "Player8", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p9", username: "Player9", status: ParticipantStatus.JOINED },
        { uuid: "uuid-p10", username: "Player10", status: ParticipantStatus.JOINED }
    ],
    status: TournamentStatus.COMPLETED,
    start_time: "2025-08-05T12:00:00Z",
    end_time: "2025-08-05T15:30:00Z",
    tournament_start: {
        rounds: [
            {
                round_number: 1,
                matches: [
                    { participant1: { uuid: "uuid-p1", username: "Player1" }, participant2: { uuid: "uuid-p2", username: "Player2" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p3", username: "Player3" }, participant2: { uuid: "uuid-p4", username: "Player4" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p5", username: "Player5" }, participant2: { uuid: "uuid-p6", username: "Player6" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p7", username: "Player7" }, participant2: { uuid: "uuid-p8", username: "Player8" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p9", username: "Player9" }, participant2: { uuid: "uuid-p10", username: "Player10" }, status: MatchStatus.COMPLETED }
                ],
                winners: [
                    { uuid: "uuid-p1", username: "Player1" },
                    { uuid: "uuid-p3", username: "Player3" },
                    { uuid: "uuid-p5", username: "Player5" },
                    { uuid: "uuid-p7", username: "Player7" },
                    { uuid: "uuid-p9", username: "Player9" }
                ],
                expected_winner_count: 5,
                is_completed: true
            },
            {
                round_number: 2,
                matches: [
                    { participant1: { uuid: "uuid-p1", username: "Player1" }, participant2: { uuid: "uuid-p3", username: "Player3" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p5", username: "Player5" }, participant2: { uuid: "uuid-p7", username: "Player7" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p9", username: "Player9" }, participant2: { uuid: "uuid-bye", username: "BYE" }, status: MatchStatus.COMPLETED }
                ],
                winners: [
                    { uuid: "uuid-p1", username: "Player1" },
                    { uuid: "uuid-p7", username: "Player7" },
                    { uuid: "uuid-p9", username: "Player9" }
                ],
                expected_winner_count: 3,
                is_completed: true
            },
            {
                round_number: 3,
                matches: [
                    { participant1: { uuid: "uuid-p1", username: "Player1" }, participant2: { uuid: "uuid-p7", username: "Player7" }, status: MatchStatus.COMPLETED },
                    { participant1: { uuid: "uuid-p9", username: "Player9" }, participant2: { uuid: "uuid-bye", username: "BYE" }, status: MatchStatus.COMPLETED }
                ],
                winners: [
                    { uuid: "uuid-p1", username: "Player1" },
                    { uuid: "uuid-p9", username: "Player9" }
                ],
                expected_winner_count: 2,
                is_completed: true
            },
            {
                round_number: 4,
                matches: [
                    { participant1: { uuid: "uuid-p1", username: "Player1" }, participant2: { uuid: "uuid-p9", username: "Player9" }, status: MatchStatus.COMPLETED }
                ],
                winners: [
                    { uuid: "uuid-p1", username: "Player1" }
                ],
                expected_winner_count: 1,
                is_completed: true
            }
        ]
    }
};


export const tournament5: TournamentData = {
    id: 1,
    code: "T5A1",
    name: "5 Kişilik Turnuva",
    admin_id: "uuid-admin-1",
    lobby_members: [],
    participants: [
        { uuid: "uuid-alice", username: "Alice", status: ParticipantStatus.JOINED },
        { uuid: "uuid-bob", username: "Bob", status: ParticipantStatus.JOINED },
        { uuid: "uuid-charlie", username: "Charlie", status: ParticipantStatus.JOINED },
        { uuid: "uuid-david", username: "David", status: ParticipantStatus.JOINED },
        { uuid: "uuid-eve", username: "Eve", status: ParticipantStatus.JOINED }
    ],
    status: TournamentStatus.COMPLETED,
    start_time: "2025-08-01T12:00:00Z",
    end_time: "2025-08-01T14:00:00Z",
    tournament_start: {
        rounds: [
            {
                round_number: 1,
                expired_at: 1755267633,
                matches: [
                    {
                        participant1: { uuid: "uuid-alice", username: "Alice" },
                        participant2: { uuid: "uuid-bob", username: "Bob" },
                        status: MatchStatus.COMPLETED
                    },
                    {
                        participant1: { uuid: "uuid-charlie", username: "Charlie" },
                        participant2: { uuid: "uuid-david", username: "David" },
                        status: MatchStatus.COMPLETED
                    },
                    {
                        participant1: { uuid: "uuid-eve", username: "Eve" },
                        participant2: { uuid: "uuid-bye", username: "BYE" },
                        status: MatchStatus.COMPLETED
                    }
                ],
                winners: [
                    { uuid: "uuid-alice", username: "Alice" },
                    { uuid: "uuid-david", username: "David" },
                    { uuid: "uuid-eve", username: "Eve" }
                ],
                expected_winner_count: 3,
                is_completed: true
            },
            {
                round_number: 2,
                matches: [
                    {
                        participant1: { uuid: "uuid-alice", username: "Alice" },
                        participant2: { uuid: "uuid-david", username: "David" },
                        status: MatchStatus.COMPLETED
                    },
                    {
                        participant1: { uuid: "uuid-eve", username: "Eve" },
                        participant2: { uuid: "uuid-bye", username: "BYE" },
                        status: MatchStatus.COMPLETED
                    }
                ],
                winners: [
                    { uuid: "uuid-alice", username: "Alice" },
                    { uuid: "uuid-eve", username: "Eve" }
                ],
                expected_winner_count: 2,
                is_completed: true
            },
            {
                round_number: 3,
                matches: [
                    {
                        participant1: { uuid: "uuid-alice", username: "Alice" },
                        participant2: { uuid: "uuid-eve", username: "Eve" },
                        status: MatchStatus.COMPLETED
                    }
                ],
                winners: [
                    { uuid: "uuid-alice", username: "Alice" }
                ],
                expected_winner_count: 1,
                is_completed: true
            }
        ]
    }
};