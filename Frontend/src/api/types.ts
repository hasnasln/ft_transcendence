export enum AuthResponseMessages {
    // Authorization / JWT
    AUTH_HEADER_MISSING_OR_INVALID = "AUTH_HEADER_MISSING_OR_INVALID",
    TOKEN_MISSING = "TOKEN_MISSING",
    INVALID_TOKEN = "INVALID_TOKEN",
    TOKEN_VALID = "TOKEN_VALID",

    // Login
    EMAIL_AND_PASSWORD_REQUIRED = "EMAIL_AND_PASSWORD_REQUIRED",
    EMAIL_LENGTH_INVALID = "EMAIL_LENGTH_INVALID",
    INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",
    INVALID_EMAIL = "INVALID_EMAIL",
    INVALID_PASSWORD = "INVALID_PASSWORD",
    LOGIN_SUCCESS = "LOGIN_SUCCESS",

    // Register
    REGISTRATION_FIELDS_REQUIRED = "REGISTRATION_FIELDS_REQUIRED",
    USERNAME_NOT_ALPHANUMERIC = "USERNAME_NOT_ALPHANUMERIC",
    USERNAME_LENGTH_INVALID = "USERNAME_LENGTH_INVALID",
    PASSWORD_LENGTH_INVALID = "PASSWORD_LENGTH_INVALID",
    USERNAME_EXISTS = "USERNAME_EXISTS",
    EMAIL_EXISTS = "EMAIL_EXISTS",
    USER_REGISTERED = "USER_REGISTERED",

    // Update User
    USER_NOT_FOUND = "USER_NOT_FOUND",
    EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
    USER_UPDATED = "USER_UPDATED",
    NO_CHANGES_MADE = "NO_CHANGES_MADE",
}

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
