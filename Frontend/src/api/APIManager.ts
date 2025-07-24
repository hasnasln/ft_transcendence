import { Router } from "../router";

export class HTTPMethod extends String {
	public static GET: string = 'GET';
	public static POST: string = 'POST';
	public static PUT: string = 'PUT';
	public static DELETE: string = 'DELETE';
	public static PATCH: string = 'PATCH';
}

export interface IApiSetSettings {
	ball_color: string,
	language: string //! kaldırılacak
}

export interface IApiRegister {
	username?: string;
	password?: string;
	email?: string;
	uuid?: string;
}

export interface IApiTournament {
	name: string; // Tournament name
	admin: string; // Admin username
	playerCount: number; // Number of players
}

export interface IApiResponseWrapper {
	code: number; // HTTP status code
	success: boolean;
	message?: string;
	data?: any; // Data can be of any type, depending on the API response
}

export class APIManager {
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
			this.token = localStorage.getItem('token') || null; 
		} else {
			this.token = token;
		}
	}

	public static getInstance(baseUrl: string, url_altarnetive: string): APIManager {
		if (!APIManager.instance) {
			APIManager.instance = new APIManager(baseUrl, url_altarnetive);
		}
		return APIManager.instance;
	}

	public setToken(token: string | null) {
		this.token = token;
	}

	public getToken(): string | null {
		return this.token;
	}

	public getActivePass(): string {
		return this.active_pass!;
	}

	private async apiCall(url: string, method: string, headers: HeadersInit, body?: BodyInit): Promise<Response> {
		try {
			const options: RequestInit = {
				method,
				headers: {
					...headers,
					Authorization: this.getToken() ? `Bearer ${this.getToken()}` : '',
				},
			};
			
			if (body) {
				options.body = body;
			}

			const response = await fetch(url, options);
			if (response.status >= 500 && response.status < 600) {
				Router.getInstance().go('/500', true);
				throw new Error(`Server error: ${response.status}`);
			}

			if (response.status === 403) {
				this.logout();
				Router.getInstance().go('/login', true);
				throw new Error('Unauthorized access, redirecting to login');
			}

			return response;
		} catch (error) {
			console.error('Error in fetch:', error);
			throw error;
		}
	}

	public async login(email: string, password: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		this.active_pass = password;
		localStorage.setItem('password', password);
		try {
			const response = await this.apiCall(`${this.baseUrl}/login`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ "email": email, "password": password }));

			result.code = response.status;
			if (!response.ok) {
				result.success = false;
				if (response.status === 401) {
					result.message = 'INVALID_CREDENTIALS';
					return result;
				}
			}

			const data = await response.json();
			if (data.token) {
				result.success = true;
				result.data = data;
				result.message = 'Login successful';
				this.setToken(data.token);
				this.uuid = data.uuid;
				localStorage.setItem('token', data.token);
				localStorage.setItem('username', data.username);
				localStorage.setItem('uuid', data.uuid);
				localStorage.setItem('email', data.email);
				localStorage.setItem('avatar', data.uuid.at(-1) + '.png'); // Example avatar logic, can be customized
			} else {
				result.success = false;
				result.message = data.error || 'Token not found in response';
				return result;
			}
			return result;
		} catch (error) {
			console.error('Error in login:', error);
			throw error;
		}
	}

	/*
	!logout kısmında dil özelliğini setleyebilirz ? bakacağım
	*/
	public async logout(): Promise<any> {
		try {
			const response = await this.apiCall(`${this.baseUrl}/logout`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			});
			if (!response.ok) {
				throw new Error('Logout failed');
			}
			this.setToken(null);
			return response;
		} catch (error) {
			console.error('Error in logout:', error);
			throw error;
		}
	}

	public async getSettings(): Promise<any> {
		try {
			const response = await this.apiCall(`${this.baseUrl}/settings`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			if (!response.ok) {
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

	public async updateSettings(choises: IApiSetSettings): Promise<any> {
		try {
			const response = await this.apiCall(`${this.baseUrl}/settings`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(choises));
			if (!response.ok) {
				throw new Error('Settings failed');
			}
			const data = await response.json();
			localStorage.setItem('settings', JSON.stringify(data));
			return data;
		} catch (error) {
			console.error('Error in settings:', error);
			throw error;
		}
	}

	public async getMe(): Promise<any> {
		try {
			const response = await this.apiCall(`${this.baseUrl}/me`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			if (!response.ok) {
				throw new Error('Get ME failed');
			}
			const data = await response.json();
			localStorage.setItem('name', data.user.name);
			localStorage.setItem('surname', data.user.surname);
			localStorage.setItem('username', data.user.username);
			localStorage.setItem('email', data.user.email);
			localStorage.setItem('avatar', data.user.avatar);
			return data;
		} catch (error) {
			console.error('Error in getME:', error);
			throw error;
		}
	}

	public async register(registerData: IApiRegister): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		console.log("Register data:", registerData);
		try {
			const response = await this.apiCall(`${this.baseUrl}/register`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(registerData));

			if (!response.ok) {
				result.success = false;
				// diğer hatalar alt alta dizilecek
				if (response.status === 409)
					result.message = 'Username or email already exists';
				return result;
			}
			result.code = response.status;
			result.success = true;
			result.data = await response.json();
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
	public async updateSomething(name: string, data: string) {
		//! nul olmayan güncellencek - bos olmayan 
		const x: IApiRegister = {
			username: localStorage.getItem('username') || '',
			email: localStorage.getItem('email') || '',
			password: localStorage.getItem('password') || '',
			uuid: this.uuid || '',
		}
		if (name === 'password')
			x.password = data;
		else if (name === 'email')
			x.email = data;
		else if (name === 'username')
			x.username = data;
		try {
			const response = await this.apiCall(`${this.baseUrl}/${this.uuid}`, HTTPMethod.PUT, {
				'Content-Type': 'application/json',
			}, JSON.stringify(x));

			if (!response.ok) {
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
				const msg= dataResponse.error || 'Token not found in response';
				throw new Error(msg);
			}
			return dataResponse;
		} catch (error) {
			console.error(`Error in update${name}:`, error);
			throw error;
		}
	}

	//*********************************Turnuva Kısmı************************************/
	public async createTournament(name: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ name: name }));
			console.log("--------------------Create Tournament response:", response);
			if (!response.ok) {
				throw new Error('Create Tournament failed');
			}
			const data = await response.json();
			result.success = true;
			result.message = data.message || 'Mesaj kısmı boşta';
			result.data = data.data || null;
			result.code = response.status;
			return result;
		} catch (error) {
			console.error('create içerisnde eror var:' + error);
			throw error;
		}
	}

	public async deleteTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentId}`, HTTPMethod.DELETE, {});

			const data = await response.json();
			result.success = response.ok;
			result.message = response.ok ? data.message : data.error || 'No message';
			result.code = response.status;
			return result;
		} catch (error) {
			console.error('Error in deleteTournament:', error);
			throw error;
		}
	}

	public async joinTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentId}/join`, HTTPMethod.POST, {
			});

			if (!response.ok) {
				const errorText = await response.text(); // daha açıklayıcı hata
				throw new Error(`Delete Tournament failed: ${errorText}`);
			}
			const data = await response.json();
			result.success = true;
			result.message = data.message;
			result.data = data.data;
			result.code = response.status;
			return result;
		} catch (error) {
			console.error('Error in playerJoinTournament:', error);
			throw error;
		}
	}

	public async leaveTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentCode}/leave`, HTTPMethod.POST, {
			});

			const data = await response.json();
			result.success = response.ok;
			result.message = response.ok ? data.message : data.error || 'No message';
			result.data = data.data;
			result.code = response.status;
			return result;
		} catch (error) {
			console.error('Error in playerLeaveTournament:', error);
			throw error;
		}
	}

	public async getTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentCode}`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			const data = await response.json();
			result.success = true;
			result.message = data.message;
			result.data = data.data;
			result.code = response.status;
			return result;
		} catch (error) {
			console.error('Error in getTournament:', error);
			throw error;
		}
	}

	public async startTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, message: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentId}/start`, HTTPMethod.POST, {})
			if (!response.ok) {
				const errorText = await response.text(); // daha açıklayıcı hata
				throw new Error(`Delete Tournament failed: ${errorText}`);
			}
			const data = await response.json()
			result.success = true;
			result.message = data.message;
			result.code = response.status;
			return result
		} catch (error) {
			console.error('Error in playerJoinTournament:', error);
			throw error;
		}
	}
}

export const _apiManager = APIManager.getInstance('http://auth.transendence.com/api/auth', 'http://tournament.transendence.com/api/tournament');
