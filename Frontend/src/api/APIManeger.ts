export class HTTPMethod extends String {
	public static GET: string = 'GET';
	public static POST: string = 'POST';
	public static PUT: string = 'PUT';
	public static DELETE: string = 'DELETE';
	public static PATCH: string = 'PATCH';
}

export interface IApiRegister {
	username?: string;
	password?: string;
	email?: string;
	name?: string;
	surname?: string;
}

export interface IApiTournament {
	name: string; // Tournament name
	admin: string; // Admin username
	playerCount: number; // Number of players
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
	private token: string | null;


	private constructor(baseUrl: string, token: string | null = null) {
		this.baseUrl = baseUrl;
		this.token = token;
	}

	public static getInstance(baseUrl: string): APIManager {
		if (!APIManager.instance) {
			APIManager.instance = new APIManager(baseUrl);
		}
		return APIManager.instance;
	}

	private setToken(token: string | null) {
		this.token = token;
	}

	private getToken(): string | null {
		return this.token;
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


	public async login(username: string, password: string): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/login`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ username, password }));
			
			if (!response.ok){
				throw new Error('Login failed');
			}
			const data = await response.json();
			if (data.token) {
				this.setToken(data.token);
				localStorage.setItem('token', data.token); // Store token in local storage
			} else {
				throw new Error('Token not found in response');
			}
			return data;
		} catch (error) {
			console.error('Error in login:', error);
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

	public async getME(): Promise<any> {
		try{
			const response = await this.myFetch(`${this.baseUrl}/me`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			if (!response.ok){
				throw new Error('Get ME failed');
			}
			const data = await response.json();
			return data;
		} catch (error) {
			console.error('Error in getME:', error);
			throw error;
		}
	}

	public async register(registerData: IApiRegister): Promise<any> {
		console.log('registerData: ', registerData);
		console.log('this.baseUrl: ', this.baseUrl);
		console.log('veri api manager istek register kısmına geldi');
		if (registerData.username === 'hasnasln')
		{
			await new Promise(res =>  setTimeout(res, 1000));
			const erorr: any = new Error('Username already exists');
			erorr.status = 409;
			throw erorr;
		}
		// try{
		// 	const response = await this.myFetch(`${this.baseUrl}/register`, HTTPMethod.POST, {
		// 		'Content-Type': 'application/json',
		// 	}, JSON.stringify(registerData));
			
		// 	if (!response.ok){
		// 		throw new Error('Register failed');
		// 	}
		// 	const data = await response.json();
		// 	return data;
		// } catch (error) {
		// 	console.error('Error in register:', error);
		// 	throw error;
		// }
	}

	/*
	@param name: string -> name of the item to be updated
	@param data: string -> data to be updated
	*/
	public async updateSomething(name: string, data: string){
		try{
			const response = await this.myFetch(`${this.baseUrl}/update/${name}`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ data }));

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


export const _apiManager = APIManager.getInstance('http://localhost:8080/api');