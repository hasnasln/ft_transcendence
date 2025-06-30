import type { IPages } from "./IPages";
import { exmp } from "../languageMeneger";
import {_apiManager } from "../api/APIManeger";
import type { IApiRegister } from "../api/APIManeger";

export class RegisterPage implements IPages {
    private languageChangeHandler: (lang: string) => void;

    constructor() {
        this.languageChangeHandler = (lang: string) => {
            const container = document.getElementById('register_main');
            if (container) {
                container.innerHTML = '';
                renderRegister(container);
            }
        };
    }

	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		exmp.addLanguageChangeListener(this.languageChangeHandler);
		renderRegister(container);
		requestAnimationFrame(() => {
			this.init();
		});
	}

	destroy(): void {
		exmp.removeLanguageChangeListener(this.languageChangeHandler);
		document.getElementById("register_main")?.removeEventListener('click', this.mainClikHandler); // sayfa değişince eventleri temizler
	}

	init(): void {
		document.getElementById("register_main")?.addEventListener('click', this.mainClikHandler);
	}

	private mainClikHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
			const action = target.getAttribute('data-action');

			if (!action) return;
			switch (action) {
				case 'register':
					this.handleRegister();
					break;
				case 'login':
					this.handleLogin();
					break;
				default:
					console.warn(`Unknown action: ${action}`);
			}
	}

	private showError(message: string): void {
		const errorDiv = document.getElementById('error-message');
		if (errorDiv) {
			errorDiv.textContent = message;
			errorDiv.style.visibility = 'visible';
		} else {
			console.error('Error message div not found');
		}
	}

	private getInputValue(id: string): string | null {
		const inout = document.getElementById(id) as HTMLInputElement | null;
		// const result = inout ? inout.value.trim() : null;
		// return result ? result === "" ? null : result : null;
		return inout ? inout.value.trim() : null;
	}

	async handleRegister(): Promise	<void> {
		console.log('Register button clicked');
		const username = this.getInputValue("username");
		const email = this.getInputValue("email");
		const password = this.getInputValue("password");
		const repeatPassword = this.getInputValue("repeat_password");
		if (!username || !email || !password || !repeatPassword) {
			if (!username) this.showError(exmp.getLang('register-errors.required.username'));
			else if (!email) this.showError(exmp.getLang('register-errors.required.email'));
			else if (!password) this.showError(exmp.getLang('register-errors.required.password'));
			else if (!repeatPassword) this.showError(exmp.getLang('register-errors.required.confirmPassword')); 
			return;
		} 
		else if (username.length < 3 || password.length < 6) {
			if (username.length < 3) this.showError(exmp.getLang('register-errors.minlength.username'));
			else if (password.length < 6) this.showError(exmp.getLang('register-errors.minlength.password'));
			return;
		} else if (username.length > 20 || password.length > 20) {
			if (username.length > 20) this.showError(exmp.getLang('register-errors.maxlength.username'));
			else if (password.length > 20) this.showError(exmp.getLang('register-errors.maxlength.password'));
			return;
		} else if (!/^[a-zA-Z0-9_.]+@[a-zA-Z0-9_.]+\.[a-zA-Z]{2,}$/.test(email)) {
			this.showError(exmp.getLang('register-errors.invalidCharacters.email'));
			return;
		} else if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
			this.showError(exmp.getLang('register-errors.invalidCharacters.username'));
			return;
		} else if (password !== repeatPassword) {
			this.showError(exmp.getLang('register-errors.passwordMismatch'));
			return;
		}
		const x: IApiRegister = 
		{
			username : username,
			email : email,
			password : password,
		}
		try{
			const response = await _apiManager.register(x);
			if (!response.success)
			{
				this.showError(response.message || exmp.getLang('register.registerFailed'));
				return;
			}
			history.pushState(null, '', '/singin');
			window.dispatchEvent(new PopStateEvent('popstate'));
		} catch (error: any) {
			console.error('Error during registration:', error);
		}
	}

	handleLogin(): void {
		console.log('Login button clicked');
		history.pushState(null, '', '/singin');
		window.dispatchEvent(new PopStateEvent('popstate'));
		this.destroy();
	}

	getTitle(): string {
		return "Kayıt Ol";
	}

	getPath(): string {
		return "/register";
	}
}

export function renderRegister(container: HTMLElement): void {
    if (!document.getElementById("custom-register-style")) {
        const style = document.createElement("style");
        style.id = "custom-register-style";
        style.textContent = `
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation-name: fadeIn;
            animation-duration: 0.8s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
        }
        .bg-animated-gradient {
            background: linear-gradient(90deg, #8b5cf6, #6366f1, #ec4899);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
        }
        `;
        document.head.appendChild(style);
    }

    const mainBg = document.createElement("div");
    mainBg.className = "min-h-screen flex items-center justify-center bg-animated-gradient";

    const main = document.createElement("main");
    main.id = "register_main";
    main.className = "bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full relative";

    const sectionRegister = document.createElement("section");
    sectionRegister.id = "section-register";
    sectionRegister.className = "animate-fadeIn";

    const registerForm = document.createElement("form");
    registerForm.id = "register-form";
    registerForm.className = "flex flex-col space-y-6";
    registerForm.autocomplete = "off";

    const registerTitle = document.createElement("h2");
    registerTitle.className = "text-3xl font-extrabold text-center text-gray-900";
    registerTitle.textContent = exmp.getLang("singin.register-b") || "Kayıt Ol";

    const regUsername = document.createElement("input");
    regUsername.type = "text";
    regUsername.id = "username";
    regUsername.placeholder = exmp.getLang("register.username") || "Username";
    regUsername.required = true;
    regUsername.className = "shadow-sm bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out focus:shadow-lg focus:scale-[1.02]";

    const regEmail = document.createElement("input");
    regEmail.type = "email";
    regEmail.id = "email";
    regEmail.placeholder = exmp.getLang("register.email") || "Email";
    regEmail.required = true;
    regEmail.className = regUsername.className;

    const regPassword = document.createElement("input");
    regPassword.type = "password";
    regPassword.id = "password";
    regPassword.placeholder = exmp.getLang("register.password") || "Şifre";
    regPassword.required = true;
    regPassword.className = regUsername.className;

    const regRepeat = document.createElement("input");
    regRepeat.type = "password";
    regRepeat.id = "repeat_password";
    regRepeat.placeholder = exmp.getLang("register.confirmPassword") || "Şifre Tekrar";
    regRepeat.required = true;
    regRepeat.className = regUsername.className;

    const errorDiv = document.createElement("div");
    errorDiv.id = "error-message";
    errorDiv.className = "text-red-500 text-sm font-bold mt-2 w-full";
    errorDiv.style.visibility = "hidden";
    errorDiv.style.height = "1.5rem";

    const registerButton = document.createElement("button");
    registerButton.type = "submit";
    registerButton.className = "bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition transform hover:scale-105";
    registerButton.textContent = exmp.getLang("singin.register-b") || "Kayıt Ol";

    const registerFooter = document.createElement("p");
    registerFooter.className = "text-center text-gray-700";
    registerFooter.innerHTML = `
        <button id="show-login" type="button" class="text-indigo-600 hover:underline font-semibold">
            ${exmp.getLang("singin.login-b") || "Giriş Yap"}
        </button>
    `;

    registerForm.appendChild(registerTitle);
    registerForm.appendChild(regUsername);
    registerForm.appendChild(regEmail);
    registerForm.appendChild(regPassword);
    registerForm.appendChild(regRepeat);
    registerForm.appendChild(errorDiv);
    registerForm.appendChild(registerButton);
    registerForm.appendChild(registerFooter);
    sectionRegister.appendChild(registerForm);

    main.appendChild(sectionRegister);
    mainBg.appendChild(main);
    container.appendChild(mainBg);

    const showLoginBtn = registerFooter.querySelector("#show-login") as HTMLButtonElement;
    showLoginBtn.onclick = () => {
        history.pushState({}, '', '/singin');
        window.dispatchEvent(new Event('popstate'));
    };
}