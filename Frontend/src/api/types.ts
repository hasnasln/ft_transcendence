export interface IUser {
	id: number;
	username: string;
	name: string;
	surname: string;
	email: string;
	language: string;
	avatar: string;
}

export interface ITournamentUser {
	uuid: string;
	username: string;
}

export interface ITournament{
	id: number;
	code: string;
	name: string;
	admin_id: string;
	lobby_members: ITournamentUser[];
	status?: string;
	participants?: ITournamentUser[];
}
