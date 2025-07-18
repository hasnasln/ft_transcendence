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
	private t_url: string;
	private token: string | null;
	private active_pass: string | null = null; // aktif pass tutulacak
	private uuid: string | null = null; // uuid tutulacak, register ve login sonrası gelecek


	private constructor(baseUrl: string, url_altarnetive: string, token: string | null = null) {
		this.baseUrl = baseUrl;
		this.t_url = url_altarnetive;
		if (token === null) {
			this.token = localStorage.getItem('token') || null; // token localStorage'dan alınacak
		} else {
			this.token = token;
		}
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
		return this.active_pass!;
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
			console.log("Fetch URL:", url);
			console.log("Fetch Options:", options);
			return fetch(url, options)
		} catch (error) {
			console.error('Error in fetch:', error);
			throw error;
		}
	}


	public async login(email: string, password: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		this.active_pass = password;
		localStorage.setItem('password', password);
		try{
			const response = await this.myFetch(`${this.baseUrl}/login`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ "email": email, "password": password }));
			
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
				console.log("Login data:", data);
				this.setToken(data.token);
				this.uuid = data.uuid;
				console.log("Token set:", this.getToken());
				localStorage.setItem('token', data.token);
				localStorage.setItem('username', data.username);
				localStorage.setItem('uuid', data.uuid);
				localStorage.setItem('email', data.email);
				localStorage.setItem('avatar', data.uuid.at(-1) + '.png'); // Example avatar logic, can be customized
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
			localStorage.setItem('avatar', data.user.avatar);
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
		console.log("Register data:", registerData);
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
			// console.error('Error in register:', error);
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
			username: localStorage.getItem('username') || '',
			email: localStorage.getItem('email') || '',
			password: localStorage.getItem('password') || '',
			uuid: this.uuid || '',
		}
		console.log(x);
		if (name === 'password')
			x.password = data;
		else if (name === 'email')
			x.email = data;
		else if (name === 'username')
			x.username = data;
		console.log("Update data:", x);
		try{
			const response = await this.myFetch(`${this.baseUrl}/${this.uuid}`, HTTPMethod.PUT, {
				'Content-Type': 'application/json',
			}, JSON.stringify(x));

			if (!response.ok){
				throw new Error(`Update ${name} failed`);
			}

			const dataResponse = await response.json();
			if (dataResponse.token) {
				this.setToken(dataResponse.token);
				this.uuid = dataResponse.uuid;
				localStorage.setItem('token', dataResponse.token);
				localStorage.setItem('uuid', JSON.stringify(dataResponse.uuid));
				localStorage.setItem('username', JSON.stringify(dataResponse.username));
				localStorage.setItem('email', dataResponse.email);
				localStorage.setItem('avatar', dataResponse.uuid.at(-1) + '.png'); // Example avatar logic, can be customized
			} else {
				throw new Error('Token not found in response');
			}
			return dataResponse;
		} catch (error) {
			console.error(`Error in update${name}:`, error);
			throw error;
		}
	}


	//*********************************Turnuva Kısmı************************************/
	public async createTournament(name: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.t_url}`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({name: name}));
			console.log("--------------------Create Tournament response:", response);
			if (!response.ok){
				throw new Error('Create Tournament failed');
			}
			const data = await response.json();
			if (!data)
				console.log("data yok");
			console.log("Create Tournament data:", data);
			console.log("1");
			result.success = true;
			result.message = data.message || 'Mesaj kısmı boşta';
			console.log("2");
			result.data = data.data || null;
			return result;
		} catch (error) {
			console.error('create içerisnde eror var:' + error);
			throw error;
		}
	}
	
	public async deleteTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.t_url}/${tournamentId}`, HTTPMethod.DELETE, {
			});

			if (!response.ok) {
				const errorText = await response.text(); // daha açıklayıcı hata
				throw new Error(`Delete Tournament failed: ${errorText}`);
			}
			const data = await response.json();
			result.success = true;
			result.message = data.message;
			localStorage.removeItem('tdata'); // Remove tournament data from localStorage
			return result;
		} catch (error) {
			console.error('Error in deleteTournament:', error);
			throw error;
		}
	}

	public async playerJoinTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.t_url}/${tournamentId}/join`, HTTPMethod.POST, {
			});

			if (!response.ok) {
				const errorText = await response.text(); // daha açıklayıcı hata
				throw new Error(`Delete Tournament failed: ${errorText}`);
			}
			const data = await response.json();
			result.success = true;
			result.message = data.message;
			result.data = data.data;
			return result;
		} catch (error) {
			console.error('Error in playerJoinTournament:', error);
			throw error;
		}
	}
	
	public async playerLeaveTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.t_url}/${tournamentCode}/leave`, HTTPMethod.POST, {

			});

			if (!response.ok){
				throw new Error('Leave Tournament failed');
			}
			const data = await response.json();
			result.success = true;
			result.message = data.message;
			result.data = data.data;
			localStorage.removeItem('tdata'); // Remove tournament data from localStorage
			return result;
		} catch (error) {
			console.error('Error in playerLeaveTournament:', error);
			throw error;
		}
	}

	 public async getTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.t_url}/${tournamentCode}`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			if (!response.ok)
			{
				console.log("getmedi");
			}
			const data = await response.json();
			console.log("gelen:", data);
			result.success = true;
			result.message = data.message;
			result.data = data.data;
			if (data.data.status === 'completed')
				localStorage.removeItem('tdata'); // Remove tournament data from localStorage
			return result;
		} catch (error) {
			console.error('Error in getTournament:', error);
			throw error;
		}
	}

	public async startTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = {success: false, message: '', data: null};
		try{
			const response = await this.myFetch(`${this.t_url}/${tournamentId}/start`, HTTPMethod.POST,
				{
				},
			)
			if (!response.ok) {
				const errorText = await response.text(); // daha açıklayıcı hata
				throw new Error(`Delete Tournament failed: ${errorText}`);
			}
			const data = await response.json()
			result.success = true;
			result.message = data.message;
			return result
		}catch (error){
			console.error('Error in playerJoinTournament:', error);
			throw error;
		}
	}
//#region  Şimdilik Grekesiz Kodlar

	// // public async playOnlineGame(): Promise<any> {
	// // 	try{
	// // 		const response = await this.myFetch(`${this.baseUrl}/play`, HTTPMethod.POST, {
	// // 			'Content-Type': 'application/json',
	// // 		});

	// // 		if (!response.ok){
	// // 			throw new Error('Play Online Game failed');
	// // 		}
	// // 		const data = await response.json();
	// // 		return data;
	// // 	} catch (error) {
	// // 		console.error('Error in playOnlineGame:', error);
	// // 		throw error;
	// // 	}
	// // }

	// // public async playWithAI(): Promise<any> {
	// // 	try{
	// // 		const response = await this.myFetch(`${this.baseUrl}/play/ai`, HTTPMethod.POST, {
	// // 			'Content-Type': 'application/json',
	// // 		});

	// // 		if (!response.ok){
	// // 			throw new Error('Play with AI failed');
	// // 		}
	// // 		const data = await response.json();
	// // 		return data;
	// // 	} catch (error) {
	// // 		console.error('Error in playWithAI:', error);
	// // 		throw error;
	// // 	}
	// // }

	// // public async exitGame(): Promise<any> {
	// // 	try{
	// // 		const response = await this.myFetch(`${this.baseUrl}/play`, HTTPMethod.DELETE, {
	// // 			'Content-Type': 'application/json',
	// // 		});

	// // 		if (!response.ok){
	// // 			throw new Error('Exit  Game failed');
	// // 		}
	// // 		const data = await response.json();
	// // 		return data;
	// // 	} catch (error) {
	// // 		console.error('Error in exitGame:', error);
	// // 		throw error;
	// // 	}
	// // }

//#endregion
}


export const _apiManager = APIManager.getInstance('http://auth.transendence.com/api/auth', 'http://tournament.transendence.com/api/tournament');