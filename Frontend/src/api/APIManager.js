import { Router } from "../router";
export class HTTPMethod extends String {
    static GET = 'GET';
    static POST = 'POST';
    static PUT = 'PUT';
    static DELETE = 'DELETE';
    static PATCH = 'PATCH';
}
export class APIManager {
    static instance;
    baseUrl;
    t_url;
    token;
    active_pass = null;
    uuid = null;
    constructor(baseUrl, url_altarnetive) {
        this.baseUrl = baseUrl;
        this.t_url = url_altarnetive;
        this.token = localStorage.getItem('token') || null;
        this.uuid = localStorage.getItem('uuid') || null;
    }
    static getInstance(baseUrl, url_altarnetive) {
        if (!APIManager.instance) {
            APIManager.instance = new APIManager(baseUrl, url_altarnetive);
        }
        return APIManager.instance;
    }
    setToken(token) {
        this.token = token;
    }
    getToken() {
        return this.token;
    }
    getActivePass() {
        return this.active_pass;
    }
    async apiCall(url, method, headers, body) {
        try {
            const options = {
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
        }
        catch (error) {
            console.error('Error in fetch:', error);
            throw error;
        }
    }
    async login(email, password) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.baseUrl}/login`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ "email": email, "password": password }));
            result.code = response.status;
            const data = await response.json();
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
            }
            else {
                result.success = false;
                result.message = data.error;
            }
            return result;
        }
        catch (error) {
            console.error('Error in login:', error);
            throw error;
        }
    }
    /*
    !logout kısmında dil özelliğini setleyebilirz ? bakacağım
    */
    async logout() {
        try {
            this.setToken(null);
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('uuid');
            localStorage.removeItem('email');
            this.uuid = null;
            this.active_pass = null;
            Router.getInstance().invalidateAllPages();
        }
        catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    }
    async register(registerData) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        console.log("Register data:", registerData);
        try {
            const response = await this.apiCall(`${this.baseUrl}/register`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify(registerData));
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.data = response.ok ? data : null;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async verifyEmailToken(token) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
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
        }
        catch (error) {
            console.error('Error in verifyEmailToken:', error);
            throw error;
        }
    }
    async resendVerification(email) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.baseUrl}/send-mail`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ email }));
            const data = await response.json();
            result.code = response.status;
            result.success = response.ok;
            result.data = response.ok ? data : null;
            result.message = data.message;
            return result;
        }
        catch (error) {
            console.error('Error in resendVerification:', error);
            throw error;
        }
    }
    async updateSomething(name, data, data2) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        //! nul olmayan güncellencek - bos olmayan 
        const x = {
            username: localStorage.getItem('username') || '',
            email: localStorage.getItem('email') || '',
            uuid: this.uuid || '',
        };
        if (name === 'password') {
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
            }
            else {
                const backendKey = dataResponse.error || dataResponse.message || `Update ${name} failed`;
                result.messageKey = backendKey;
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async createTournament(name) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ name: name }));
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.data = data.data || null;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            console.error('Error in createTournament:', error);
            throw error;
        }
    }
    async deleteTournament(tournamentId) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}/${tournamentId}`, HTTPMethod.DELETE, {});
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async joinTournament(tournamentId) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}/${tournamentId}/join`, HTTPMethod.POST, {});
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.data = data.data;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async leaveTournament(tournamentCode) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}/${tournamentCode}/leave`, HTTPMethod.POST, {});
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.data = data.data;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getTournament(tournamentCode) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}/${tournamentCode}`, HTTPMethod.GET, {
                'Content-Type': 'application/json',
            });
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.data = data.data;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async haveTournament() {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}`, HTTPMethod.GET, {
                'Content-Type': 'application/json',
            });
            if (response.ok) {
                const data = await response.json();
                result.success = true;
                result.code = response.status;
                result.data = data.data;
                result.messageKey = response.ok ? data.message : data.error;
            }
            else {
                result.success = false;
                result.code = response.status;
                result.message = 'No tournament found for this user';
                result.messageKey = 'ERR_TOURNAMENT_NOT_FOUND';
            }
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async startTournament(tournamentId) {
        const result = { success: false, messageKey: '', data: null, code: 0 };
        try {
            const response = await this.apiCall(`${this.t_url}/${tournamentId}/start`, HTTPMethod.POST, {});
            const data = await response.json();
            result.success = response.ok;
            result.code = response.status;
            result.messageKey = response.ok ? data.message : data.error;
            return result;
        }
        catch (error) {
            console.error('Error in startTournament:', error);
            throw error;
        }
    }
    isTokenExpired() {
        const token = this.getToken();
        if (!token)
            return true;
        try {
            const payload = this.decodeJWT(token);
            const exp = payload.exp;
            return !exp || Date.now() >= exp * 1000;
        }
        catch (error) {
            return true;
        }
    }
    decodeJWT(token) {
        const [, payload] = token.split('.');
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = atob(b64);
        return JSON.parse(json);
    }
}
export const _apiManager = APIManager.getInstance('http://auth.transendence.com/api/auth', 'http://tournament.transendence.com/api/tournament');
