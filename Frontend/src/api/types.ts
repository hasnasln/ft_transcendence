//#region  LOGIN

export interface ILoginRequest {
	username: string;
	password: string;
}

export interface ILoginResponse {
	token: string;
	user: IUser;
}

//#endregion

//#region  REGISTER

export interface IRegisterRequest {
	name: string;
	surname: string;
	username: string;
	email: string;
	password: string;
}
/*
!burada kayıt olan kişi girişe mi yönlendirilecek yoksa içeri mi alınacak ?
? içeri alınacaksa token ve user bilgisi dönecek
*/
export interface IRegisterResponse {
	token: string;
	user: IUser;
}

//#endregion

//#region USER
export interface IUser {
	id: number;
	username: string;
	name: string;
	surname: string;
	email: string;
	language: string;		// kayıtlı dil
	avatar: string;			// avatar url
}

export interface IUserSettings {
	ball_color: string;				// top rengi
	background_color: string;		// arka plan rengi
	fisrt_player_color: string;		// 1. oyuncu rengi
	second_player_color: string;	// 2. oyuncu rengi
	language: string;				// dil
}
//#endregion

//#region SETTINGS SECTİON

export interface ISettingsRequest {
	token: string;
}

export interface ISettingsResponse {
	user_settings: IUserSettings;
}

export interface ISettingsUpdateRequest {
	token: string;
	user_settings: IUserSettings;
}

//#endregion

//#region PROFILE SETTINGS SECTION
export interface IProfileSettingsRequest {
	token: string;
}

export interface IProfileSettingsResponse {
	user: IUser;
}

/*
! burada update ederken fornttan girilenleri girildiği şekilde girilmeyenleri eski hakiyle günceleyeceğim,
! farklı olanları update eder geçeriz
*/
export interface IProfileSettingsUpdateRequest {
	token: string;
	user: IUser;
}
//#endregion

//#region TOURNAMENT SECTION

export interface ITournament {
	/*
	?????
	 */
}

/*
! burada token dan userı direk çeker kullanırız
*/
export interface ITournamentCreateRequest {
	name: string; // Tournament name
}

export interface ITournamentCreateResponse {
	tournament: ITournament;
}

export interface IJoinTournamentRequest {
	tournament_id: string; // Tournament ID
}

export interface IJoinTournamentResponse {
	tournament: ITournament;
}

export interface ILeaveTournamentRequest {
	tournament_id: string; // Tournament ID
}

export interface ILeaveTournamentResponse {
}

export interface ITournamentListRequest {
	token: string;
}

export interface ITournamentPlayerListResponse {
	tournament_id: string; // Tournament ID
	players: IUser[]; // Players in the tournament
}

/*
! turnuva kurucusu Başlat a tıkladığında içerideki oyuncuların eşleştirilmesi yapılacak
! ve bana tüm eşleştirme dönecek
! 
*/
export interface ITournamentStartRequest {
	tournament_id: string; // Tournament ID
}

//#endregion

//#region LOGEOUT

export interface ILogoutRequest {
	token: string;
}
//#endregion

//! token hederda olacğı için istek içerisinden tokenlar silinecek



