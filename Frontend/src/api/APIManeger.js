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
    active_pass = null; // aktif pass tutulacak
    uuid = null; // uuid tutulacak, register ve login sonrası gelecek
    constructor(baseUrl, url_altarnetive, token = null) {
        this.baseUrl = baseUrl;
        this.t_url = url_altarnetive;
        if (token === null) {
            this.token = localStorage.getItem('token') || null; // token localStorage'dan alınacak
        }
        else {
            this.token = token;
        }
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
    myFetch(url, method, headers, body) {
        try {
            const options = {
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
            return fetch(url, options);
        }
        catch (error) {
            console.error('Error in fetch:', error);
            throw error;
        }
    }
    async login(email, password) {
        const result = { success: false, message: '', data: null };
        this.active_pass = password;
        localStorage.setItem('password', password);
        try {
            const response = await this.myFetch(`${this.baseUrl}/login`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ "email": email, "password": password }));
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
                console.log("Login data:", data);
                this.setToken(data.token);
                this.uuid = data.uuid;
                console.log("Token set:", this.getToken());
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                localStorage.setItem('uuid', data.uuid);
                localStorage.setItem('email', data.email);
                localStorage.setItem('avatar', data.uuid.at(-1) + '.png'); // Example avatar logic, can be customized
            }
            else {
                result.success = false;
                result.message = 'Token not found in response';
                return result;
            }
            return result;
        }
        catch (error) {
            // console.error('Error in login:', error);
            throw error;
        }
    }
    /*
    !logout kısmında dil özelliğini setleyebilirz ? bakacağım
    */
    async logout() {
        try {
            const response = await this.myFetch(`${this.baseUrl}/logout`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            });
            if (!response.ok) {
                throw new Error('Logout failed');
            }
            this.setToken(null);
            return response;
        }
        catch (error) {
            console.error('Error in logout:', error);
            throw error;
        }
    }
    async settings() {
        try {
            const response = await this.myFetch(`${this.baseUrl}/settings`, HTTPMethod.GET, {
                'Content-Type': 'application/json',
            });
            if (!response.ok) {
                throw new Error('Settings failed');
            }
            const data = await response.json();
            localStorage.setItem('settings', JSON.stringify(data));
            console.log("Settings data:", data);
            return data;
        }
        catch (error) {
            console.error('Error in settings:', error);
            throw error;
        }
    }
    async set_settings(choises) {
        try {
            const response = await this.myFetch(`${this.baseUrl}/settings`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify(choises));
            if (!response.ok) {
                throw new Error('Settings failed');
            }
            const data = await response.json();
            localStorage.setItem('settings', JSON.stringify(data));
            console.log("Settings data:", data);
            return data;
        }
        catch (error) {
            console.error('Error in settings:', error);
            throw error;
        }
    }
    async getME() {
        try {
            const response = await this.myFetch(`${this.baseUrl}/me`, HTTPMethod.GET, {
                'Content-Type': 'application/json',
            });
            if (!response.ok) {
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
        }
        catch (error) {
            console.error('Error in getME:', error);
            throw error;
        }
    }
    async register(registerData) {
        const result = { success: false, message: '', data: null };
        console.log("Register data:", registerData);
        try {
            const response = await this.myFetch(`${this.baseUrl}/register`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify(registerData));
            if (!response.ok) {
                result.success = false;
                // diğer hatalar alt alta dizilecek
                if (response.status === 409)
                    result.message = 'Username or email already exists';
                return result;
            }
            result.success = true;
            const data = await response.json();
            if (!data) {
                console.log("hasan");
            }
            result.data = data;
            return result;
        }
        catch (error) {
            // console.error('Error in register:', error);
            throw error;
        }
    }
    /*
    @param name: string -> name of the item to be updated
    @param data: string -> data to be updated
    */
    async updateSomething(name, data) {
        //! nul olmayan güncellencek - bos olmayan 
        const x = {
            username: localStorage.getItem('username') || '',
            email: localStorage.getItem('email') || '',
            password: localStorage.getItem('password') || '',
            uuid: this.uuid || '',
        };
        console.log(x);
        if (name === 'password')
            x.password = data;
        else if (name === 'email')
            x.email = data;
        else if (name === 'username')
            x.username = data;
        console.log("Update data:", x);
        try {
            const response = await this.myFetch(`${this.baseUrl}/${this.uuid}`, HTTPMethod.PUT, {
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
            }
            else {
                throw new Error('Token not found in response');
            }
            return dataResponse;
        }
        catch (error) {
            console.error(`Error in update${name}:`, error);
            throw error;
        }
    }
    //*********************************Turnuva Kısmı************************************/
    async createTournament(name) {
        const result = { success: false, message: '', data: null };
        try {
            const response = await this.myFetch(`${this.t_url}`, HTTPMethod.POST, {
                'Content-Type': 'application/json',
            }, JSON.stringify({ name: name }));
            console.log("--------------------Create Tournament response:", response);
            if (!response.ok) {
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
        }
        catch (error) {
            console.error('create içerisnde eror var:' + error);
            throw error;
        }
    }
    async deleteTournament(tournamentId) {
        const result = { success: false, message: '', data: null };
        try {
            const response = await this.myFetch(`${this.t_url}/${tournamentId}`, HTTPMethod.DELETE, {});
            if (!response.ok) {
                const errorText = await response.text(); // daha açıklayıcı hata
                throw new Error(`Delete Tournament failed: ${errorText}`);
            }
            const data = await response.json();
            result.success = true;
            result.message = data.message;
            return result;
        }
        catch (error) {
            console.error('Error in deleteTournament:', error);
            throw error;
        }
    }
    async playerJoinTournament(tournamentId) {
        const result = { success: false, message: '', data: null };
        try {
            const response = await this.myFetch(`${this.t_url}/${tournamentId}/join`, HTTPMethod.POST, {});
            if (!response.ok) {
                const errorText = await response.text(); // daha açıklayıcı hata
                throw new Error(`Delete Tournament failed: ${errorText}`);
            }
            const data = await response.json();
            result.success = true;
            result.message = data.message;
            result.data = data.data;
            return result;
        }
        catch (error) {
            console.error('Error in playerJoinTournament:', error);
            throw error;
        }
    }
    async playerLeaveTournament(tournamentCode) {
        const result = { success: false, message: '', data: null };
        try {
            const response = await this.myFetch(`${this.t_url}/${tournamentCode}/leave`, HTTPMethod.POST, {});
            if (!response.ok) {
                throw new Error('Leave Tournament failed');
            }
            const data = await response.json();
            result.success = true;
            result.message = data.message;
            result.data = data.data;
            return result;
        }
        catch (error) {
            console.error('Error in playerLeaveTournament:', error);
            throw error;
        }
    }
    async getTournament(tournamentCode) {
        const result = { success: false, message: '', data: null };
        try {
            const response = await this.myFetch(`${this.t_url}/${tournamentCode}`, HTTPMethod.GET, {
                'Content-Type': 'application/json',
            });
            if (!response.ok) {
                console.log("getmedi");
            }
            const data = await response.json();
            console.log("gelen:", data);
            result.success = true;
            result.message = data.message;
            result.data = data.data;
            return result;
        }
        catch (error) {
            console.error('Error in getTournament:', error);
            throw error;
        }
    }
    async startTournament(tournamentId) {
        const result = { success: false, message: '', data: null };
        try {
            const response = await this.myFetch(`${this.t_url}/${tournamentId}/start`, HTTPMethod.POST, {});
            if (!response.ok) {
                const errorText = await response.text(); // daha açıklayıcı hata
                throw new Error(`Delete Tournament failed: ${errorText}`);
            }
            const data = await response.json();
            result.success = true;
            result.message = data.message;
            return result;
        }
        catch (error) {
            console.error('Error in playerJoinTournament:', error);
            throw error;
        }
    }
}
export const _apiManager = APIManager.getInstance('http://auth.transendence.com/api/auth', 'http://tournament.transendence.com/api/tournament');
