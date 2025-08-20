import { Router } from "../router";
import { TournamentResponseMessages, AuthResponseMessages } from "./types";

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
	new_password?: string;
	email?: string;
	uuid?: string;
}

export interface IApiResponseWrapper {
	code?: number;
	success?: boolean;
	message?: string;
	messageKey?: string;
	data?: any;
}

export class APIManager {
	private static instance: APIManager;
	private baseUrl: string;
	private t_url: string;
	private token: string | null;
	private active_pass: string | null = null;
	private uuid: string | null = null;

	private constructor(baseUrl: string, url_altarnetive: string) {
		this.baseUrl = baseUrl;
		this.t_url = url_altarnetive;
		this.token = localStorage.getItem('token') || null;
		this.uuid = localStorage.getItem('uuid') || null;
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
			console.log("API Call:", url, method, headers, body);
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
			console.log("API Response:", response);
			return response;
		} catch (error) {
			console.error('Error in fetch:', error);
			throw error;
		}
	}

	public async login(email: string, password: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		this.active_pass = password;
		localStorage.setItem('password', password);
		try {
			const response = await this.apiCall(`${this.baseUrl}/login`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ "email": email, "password": password }));

			result.code = response.status;
			const data = await response.json();
			console.log("Login data:", data);
			console.log("Login response", response);

			if (response.ok && data.token) {
				result.success = true;
				result.data = data;
				result.message = data.message;
				
				this.setToken(data.token);
				this.uuid = data.uuid;
				localStorage.setItem('token', data.token);
				localStorage.setItem('username', data.username);
				localStorage.setItem('uuid', data.uuid);
				localStorage.setItem('email', data.email);
			} else {
				result.success = false;
				result.message = data.error;
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
			this.setToken(null);
			Router.getInstance().invalidateAllPages();
		} catch (error) {
			console.error('Error in logout:', error);
			throw error;
		}
	}

	public async register(registerData: IApiRegister): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		console.log("Register data:", registerData);
		try {
			const response = await this.apiCall(`${this.baseUrl}/register`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify(registerData));

			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;
			result.data = response.ok ? data : null;

			result.message = response.ok ? (data.message || 'USER_REGISTERED') : (data.error || data.message || '');
			result.messageKey = result.message;

			return result;
		} catch (error) {
			console.error('Error in register:', error);
			throw error;
		}
	}

    public async verifyEmailToken(token: string): Promise<IApiResponseWrapper> {
        const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.baseUrl}/verify`, HTTPMethod.PATCH, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ token }));

            const data = await response.json();
            result.code = response.status;
            result.success = response.ok;
            result.data = response.ok ? data : null;
            result.message = response.ok ? data.message : (data.error || data.message);

            return result;
        } catch (error) {
            console.error('Error in verifyEmailToken:', error);
            throw error;
        }
    }

    public async resendVerification(email: string): Promise<IApiResponseWrapper> {
        const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`http://auth.transendence.com:8081/api/auth/send-mail`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ email }));

            const data = await response.json();
            result.code = response.status;
            result.success = response.ok;
            result.data = response.ok ? data : null;
            result.message = data.message;

            return result;
        } catch (error) {
            console.error('Error in resendVerification:', error);
            throw error;
        }
    }

	public async updateSomething(name: string, data: string, data2?:string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		
		//! nul olmayan güncellencek - bos olmayan 
		const x: IApiRegister = {
			username: localStorage.getItem('username') || '',
			email: localStorage.getItem('email') || '',
			uuid: this.uuid || '',
		}
		if (name === 'password')
		{
			x.password = data;
			x.new_password = data2;
		}
		else if (name === 'email')
			x.email = data;
		else if (name === 'username')
			x.username = data;
		
		try {
			const response = await this.apiCall(`${this.baseUrl}/${this.uuid}`, HTTPMethod.PUT, {
				'Content-Type': 'application/json',
			}, JSON.stringify(x));

			const dataResponse = await response.json();
			result.success = response.ok;
			result.code = response.status;

			if (response.ok && dataResponse.token) {
				result.data = dataResponse;
				
				const backendKey = dataResponse.message || 'USER_UPDATED';
				result.messageKey = backendKey;

				
				this.setToken(dataResponse.token);
				this.uuid = dataResponse.uuid;
				localStorage.setItem('token', dataResponse.token);
				localStorage.setItem('username', dataResponse.username);
				localStorage.setItem('uuid', dataResponse.uuid);
				localStorage.setItem('email', dataResponse.email);
			} else {
				const backendKey = dataResponse.error || dataResponse.message || `Update ${name} failed`;
				result.messageKey = backendKey;

			}
			
			return result;
		} catch (error) {
			console.error(`Error in update${name}:`, error);
			throw error;
		}
	}

	public async createTournament(name: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}`, HTTPMethod.POST, {
				'Content-Type': 'application/json',
			}, JSON.stringify({ name: name }));

			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;
			result.data = data.data || null;

			const backendKey = data.message || data.error || '';
			result.messageKey = backendKey;

			return result;
		} catch (error) {
			console.error('Error in createTournament:', error);
			throw error;
		}
	}

	public async deleteTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentId}`, HTTPMethod.DELETE, {});

			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;

			const backendKey = response.ok ? data.message : (data.error || data.message || '');
			result.messageKey = backendKey;

			return result;
		} catch (error) {
			console.error('Error in deleteTournament:', error);
			throw error;
		}
	}

	public async joinTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentId}/join`, HTTPMethod.POST, {
			});

			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;
			result.data = data.data;
			result.messageKey = data.message;

			return result;
		} catch (error) {
			console.error('Error in joinTournament:', error);
			throw error;
		}
	}

	public async leaveTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentCode}/leave`, HTTPMethod.POST, {
			});

			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;
			result.data = data.data;

			const backendKey = response.ok ? data.message : (data.error || data.message || '');
			result.messageKey = backendKey;

			return result;
		} catch (error) {
			console.error('Error in leaveTournament:', error);
			throw error;
		}
	}

	public async getTournament(tournamentCode: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentCode}`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});
			
			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;
			result.data = data.data;

			const backendKey = response.ok ? data.message : (data.error || data.message || '');
			result.messageKey = backendKey;

			return result;
		} catch (error) {
			console.error('Error in getTournament:', error);
			throw error;
		}
	}

	public async haveTournament(): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}`, HTTPMethod.GET, {
				'Content-Type': 'application/json',
			});

			if (response.ok) {
				const data = await response.json();
				result.success = true;
				result.code = response.status;
				result.data = data.data;

				const backendKey = data.message || '';
				result.messageKey = backendKey;

			} else {
				result.success = false;
				result.code = response.status;
				result.message = 'No tournament found for this user';
				result.messageKey = 'ERR_TOURNAMENT_NOT_FOUND';
			}

			return result;
		} catch (error) {
			console.error('Error in haveTournament:', error);
			throw error;
		}	
	}

	public async startTournament(tournamentId: string): Promise<IApiResponseWrapper> {
		const result: IApiResponseWrapper = { success: false, messageKey: '', data: null, code: 0 };
		try {
			const response = await this.apiCall(`${this.t_url}/${tournamentId}/start`, HTTPMethod.POST, {})
			
			const data = await response.json();
			result.success = response.ok;
			result.code = response.status;

			const backendKey = response.ok ? data.message : (data.error || data.message || '');
			result.messageKey = backendKey;

			return result;
		} catch (error) {
			console.error('Error in startTournament:', error);
			throw error;
		}
	}

	public isTokenExpired() :boolean {
		const token = this.getToken();
		if (!token) return true;
		try {
			const payload = this.decodeJWT(token);
			const exp = payload.exp;
			return !exp || Date.now() >= exp * 1000;
		} catch (error) {
			return true;
		}
	}

	public decodeJWT(token: string) {
		const [, payload] = token.split('.');
		const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
		const json = atob(b64);
		return JSON.parse(json);
	}
}

export const _apiManager = APIManager.getInstance('http://auth.transendence.com/api/auth', 'http://tournament.transendence.com/api/tournament');
