export class HTTPMethod extends String {
	public static GET: string = 'GET';
	public static POST: string = 'POST';
	public static PUT: string = 'PUT';
	public static DELETE: string = 'DELETE';
	public static PATCH: string = 'PATCH';
}

export interface IApiSetSettings{
	ball_color: string,
	language: string //! kaldırılacak
}

export interface IApiRegister {
	username?: string;
	password?: string;
	email?: string;
	uuid?: string;
	// name?: string;
	// surname?: string;
}

export interface IApiTournament {
	name: string; // Tournament name
	admin: string; // Admin username
	playerCount: number; // Number of players
}


export interface IApiResponseWrapper {
	success: boolean;
	message?: string;
	data?: any; // Data can be of any type, depending on the API response
}

/*
? Online oyna tuşuna basan oyuncunun oyun verilerini fornt mu yollayacak, bunu yerine sadece token yollayıp, verilen o token ile bacend verileri kendi içerisinde mi halledecek ?
*/
export interface IPlayerOnlineData {

}

export class APIManager
{
	private static instance: APIManager;
	private baseUrl: string;
	private url_altarnative: string;
	private token: string | null;
	private active_pass: string;
	private uuid: string;


	private constructor(baseUrl: string, url_altarnetive: string, token: string | null = null) {
		this.baseUrl = baseUrl;
		this.url_altarnative = url_altarnetive;
		this.token = token;
	}

	public static getInstance(baseUrl: string, url_altarnetive: string): APIManager {
		if (!APIManager.instance) {
			APIManager.instance = new APIManager(baseUrl,url_altarnetive);
		}
		return APIManager.instance;
	}

	public setToken(token: string | null) {
		this.token = token;
	}

	public getToken(): string | null {
		return this.token;
	}

	public getActivePass(): string
	{
		return this.active_pass;
	}

	private myFetch(url: string, method: string, headers: HeadersInit, body?: BodyInit): Promise<Response> {
		try{
			const options: RequestInit = {
				method,
				headers: {
					...headers,
					Authorization: this.getToken() ? `Bearer ${this.getToken()}` : '', //! token varsa kullan yoksa boş kullan
				},
			};
			if (body) {
				options.body = body;
			}
			return fetch(url, options)
		} catch (error) {
			console.error('Error in fetch:', error);
			throw error;
		}
	}


	public async login(username: string, password: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		this.active_pass = password;
		try{
			const response = await this.myFetch(`${this.baseUrl}/login`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ username, password }));
			
			if (!response.ok){ 
				result.success = false;
				if (response.status === 401){
					result.message = 'INVALID_CREDENTIALS';
					return result;
				}
			}
			const data = await response.json();
			if (data.token) {
				result.success = true;
				result.data = data;
				result.message = 'Login successful';
				// console.log("Login data:", data);
				this.setToken(data.token);
				//! uuid kısmı konuşulacak
				this.uuid = data.uuid;
				localStorage.setItem('token', data.token);
				console.log("Token set:", this.getToken());
				// console.log("data.uzer -----> "	+ JSON.stringify(data.user));
				localStorage.setItem('user', JSON.stringify(data.user));
				// const x = localStorage.getItem('user');
				// const y = JSON.parse(x || '{}');
				// console.log("localStorage user name:", y.name);
				// await exmp.setLanguage(data.user.language); // Set language from user data // burada beklemek sorunumuzu çözdü
			} else {
				result.success = false;
				result.message = 'Token not found in response';
				return result;
			}
			return result;
		} catch (error) {
			// console.error('Error in login:', error);
			throw error;
		}
	}

	/*
	!logout kısmında dil özelliğini setleyebilirz ? bakacağım
	*/
	public async logout(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/logout`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			});
			if (!response.ok){
				throw new Error('Logout failed');
			}
			this.setToken(null);
			return response;
		} catch (error) {
			console.error('Error in logout:', error);
			throw error;
		}
	}

	public async settings(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/settings`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			if (!response.ok){
				throw new Error('Settings failed');
			}
			const data = await response.json();
			localStorage.setItem('settings', JSON.stringify(data));
			console.log("Settings data:", data);
			return data;
		} catch (error) {
			console.error('Error in settings:', error);
			throw error;
		}
	}

	public async set_settings(choises: IApiSetSettings): Promise<any>
	{
		try{
			const response = await this.myFetch(`${this.baseUrl}/settings`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(choises));
			if (!response.ok){
				throw new Error('Settings failed');
			}
			const data = await response.json();
			localStorage.setItem('settings', JSON.stringify(data));
			console.log("Settings data:", data);
			return data;
		} catch (error) {
			console.error('Error in settings:', error);
			throw error;
		}

	}

	public async getME(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/me`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			if (!response.ok){
				throw new Error('Get ME failed');
			}
			const data = await response.json();
			console.log("Get ME data:", data);
			localStorage.setItem('name', data.user.name);
			localStorage.setItem('surname', data.user.surname);
			localStorage.setItem('username', data.user.username);
			localStorage.setItem('email', data.user.email);
			localStorage.setItem('prfilePicture', data.user.avatar);
			console.log("name:", localStorage.getItem('name'));
			console.log("surname:", localStorage.getItem('surname'));
			console.log("username:", localStorage.getItem('username'));
			console.log("email:", localStorage.getItem('email'));
			console.log("profilePicture:", localStorage.getItem('prfilePicture'));
			return data;
		} catch (error) {
			console.error('Error in getME:', error);
			throw error;
		}
	}

	public async register(registerData: IApiRegister): Promise<IApiResponseWrapper> {
		const result : IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.baseUrl}/register`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(registerData));
			
			if (!response.ok){
				result.success = false;
				// diğer hatalar alt alta dizilecek
				if (response.status === 409)
					result.message = 'Username or email already exists';
				return result;
			}
			result.success = true;
			const data = await response.json();
			if (!data)
			{
				console.log("hasan");
			}
			result.data = data;
			return result;
		} catch (error) {
			console.error('Error in register:', error);
			throw error;
		}
	}

	/*
	@param name: string -> name of the item to be updated
	@param data: string -> data to be updated
	*/
	public async updateSomething(name: string, data: string){
		//! nul olmayan güncellencek - bos olmayan 
		const x: IApiRegister = {
			username: '',
			email: '',
			password: '',
			uuid: this.uuid
		}
		if (name === 'password')
			x.password = data;
		else if (name === 'email')
			x.email = data;
		else if (name === 'nickname')
			x.username = data;
		try{
			const response = await this.myFetch(`${this.baseUrl}/update/${name}`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(x));

			if (!response.ok){
				throw new Error(`Update ${name} failed`);
			}

			const dataResponse = await response.json();
			if (dataResponse.token) {
				this.setToken(dataResponse.token);
			} else {
				throw new Error('Token not found in response');
			}
			return dataResponse;
		} catch (error) {
			console.error(`Error in update${name}:`, error);
			throw error;
		}
	}

	public async createTournament(tournamentData: IApiTournament): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/tournament`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(tournamentData));

			if (!response.ok){
				throw new Error('Create Tournament failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in createTournament:', error);
			throw error;
		}
	}
	
	public async deleteTournament(tournamentId: string): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/tournament/${tournamentId}`, HTTPMethod.DELETE, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Delete Tournament failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in deleteTournament:', error);
			throw error;
		}
	}

	public async playerJoinTournament(tournamentId: string): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/tournament/${tournamentId}`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Join Tournament failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in playerJoinTournament:', error);
			throw error;
		}
	}
	
	public async playerLeaveTournament(tournamentId: string): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/tournament/${tournamentId}`, HTTPMethod.DELETE, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Leave Tournament failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in playerLeaveTournament:', error);
			throw error;
		}
	}

	public async getTournament(tournamentId: string): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/tournament/${tournamentId}`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Get Tournament failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in getTournament:', error);
			throw error;
		}
	}

	public async playOnlineGame(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/play`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Play Online Game failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in playOnlineGame:', error);
			throw error;
		}
	}

	public async playWithAI(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/play/ai`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Play with AI failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in playWithAI:', error);
			throw error;
		}
	}

	public async exitGame(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/play`, HTTPMethod.DELETE, {
				'Content-Type': 'application/json',
			});

			if (!response.ok){
				throw new Error('Exit  Game failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in exitGame:', error);
			throw error;
		}
	}
}


export const _apiManager = APIManager.getInstance('http://localhost:3000/api', 'hasan.com');