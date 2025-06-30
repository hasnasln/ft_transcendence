import type { IPages } from "./IPages";
import { exmp } from "../languageMeneger";
import {_apiManager } from "../api/APIManeger";
import type { IApiRegister } from "../api/APIManeger";

export class RegisterPage implements IPages {
    private languageChangeHandler: (lang: string) => void;

    constructor() {
        this.languageChangeHandler = (lang: string) => {
            console.log(`Language changed to: ${lang}`);
            // Language change is handled by page reload in dropdown
            // No need to re-render here to avoid infinite loops
        };
    }

	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		exmp.addLanguageChangeListener(this.languageChangeHandler);
		exmp.waitForLoad().then(() => {
			renderRegister(container);
		});
	}

	destroy(): void {
		exmp.removeLanguageChangeListener(this.languageChangeHandler);
	}

    handleLogin(): void {
        history.pushState(null, '', '/singin');
        window.dispatchEvent(new PopStateEvent('popstate'));
    }
}

export function renderRegister(container: HTMLElement): void {
    if (!document.getElementById("custom-register-style")) {
        const style = document.createElement("style");
        style.id = "custom-register-style";
        style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes floatingParticles {
            0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.3; }
            25% { transform: translateY(-30px) translateX(10px) rotate(90deg); opacity: 0.6; }
            50% { transform: translateY(-15px) translateX(-15px) rotate(180deg); opacity: 0.8; }
            75% { transform: translateY(-40px) translateX(5px) rotate(270deg); opacity: 0.4; }
        }
        @keyframes buttonPulse {
            0% { transform: scale(1) translateY(0); box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4); }
            50% { transform: scale(1.02) translateY(-2px); box-shadow: 0 8px 25px rgba(30, 58, 138, 0.6); }
            100% { transform: scale(1) translateY(0); box-shadow: 0 4px 12px rgba(30, 58, 138, 0.4); }
        }
        
        .animate-fadeIn {
            animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .bg-animated-gradient {
            background: #1e1b4b;
            position: relative;
            overflow: hidden;
        }
        .bg-animated-gradient::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
                radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 30%),
                radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.02) 0%, transparent 25%),
                radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.01) 0%, transparent 40%);
            z-index: 1;
            animation: floatingParticles 15s ease-in-out infinite;
        }
        
        .glass-container {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
            backdrop-filter: blur(20px) saturate(180%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 24px;
            box-shadow: 
                0 20px 25px -5px rgba(0, 0, 0, 0.1),
                0 10px 10px -5px rgba(0, 0, 0, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
            position: relative;
            z-index: 2;
            animation: float 6s ease-in-out infinite;
        }
        .glass-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
            border-radius: 24px 24px 0 0;
        }
        .glass-container::after {
            content: '';
            position: absolute;
            top: 1px;
            left: 1px;
            right: 1px;
            bottom: 1px;
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
            border-radius: 23px;
            pointer-events: none;
        }
        
        .title-gradient {
            color: #1e293b;
            font-weight: 900;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .input-premium {
            background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
            border: 2px solid rgba(99, 102, 241, 0.2);
            border-radius: 16px;
            padding: 16px 20px;
            font-size: 16px;
            font-weight: 500;
            color: #1e293b;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
                0 1px 3px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
            position: relative;
        }
        .input-premium:focus {
            outline: none;
            border-color: #6366f1;
            box-shadow: 
                0 0 0 4px rgba(99, 102, 241, 0.1),
                0 4px 6px -1px rgba(0, 0, 0, 0.1),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
            transform: translateY(-2px);
        }
        .input-premium::placeholder {
            color: #64748b;
            font-weight: 400;
        }
        
        .btn-premium {
            background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%);
            border: 2px solid #2563eb;
            border-radius: 16px;
            padding: 16px 24px;
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            box-shadow: 
                0 4px 12px rgba(30, 58, 138, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }
        .btn-premium::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent, 
                rgba(255, 255, 255, 0.3), 
                transparent);
            transition: left 0.6s ease;
        }
        .btn-premium:hover {
            background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
            transform: translateY(-6px) scale(1.05);
            box-shadow: 
                0 12px 30px rgba(30, 58, 138, 0.5),
                0 6px 15px rgba(0, 0, 0, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            border-color: #3b82f6;
            animation: buttonPulse 2s ease-in-out infinite;
        }
        .btn-premium:hover::before {
            left: 100%;
        }
        .btn-premium:active {
            transform: translateY(-3px) scale(1.02);
            transition: all 0.1s ease;
        }
        .text-premium {
            color: #334155;
            font-weight: 600;
        }
        .link-premium {
            color: #3b82f6;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s ease;
            position: relative;
        }
        .link-premium::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            transition: width 0.3s ease;
        }
        .link-premium:hover {
            color: #1e40af;
            transform: translateY(-1px);
        }
        .link-premium:hover::after {
            width: 100%;
        }
        .error-premium {
            background: rgba(239, 68, 68, 0.1);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-left: 4px solid #ef4444;
            border-radius: 12px;
            padding: 16px 20px 16px 50px;
            color: #dc2626;
            font-weight: 500;
            font-size: 14px;
            box-shadow: 
                0 8px 32px rgba(239, 68, 68, 0.1),
                0 4px 16px rgba(0, 0, 0, 0.05);
            position: relative;
            animation: slideInFromTop 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        @keyframes slideInFromTop {
            0% { 
                opacity: 0; 
                transform: translateY(-20px) scale(0.95); 
            }
            100% { 
                opacity: 1; 
                transform: translateY(0) scale(1); 
            }
        }
        .error-premium::before {
            content: '⚠';
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
            color: #ef4444;
        }
        `;
        document.head.appendChild(style);
    }

    const mainBg = document.createElement("div");
    mainBg.className = "min-h-screen flex items-center justify-center bg-animated-gradient";

    const main = document.createElement("main");
    main.id = "register_main";
    main.className = "glass-container p-10 max-w-md w-full relative animate-fadeIn";

    const sectionRegister = document.createElement("section");
    sectionRegister.id = "section-register";
    sectionRegister.className = "animate-fadeIn";

    const registerForm = document.createElement("form");
    registerForm.id = "register-form";
    registerForm.className = "flex flex-col space-y-8";
    registerForm.autocomplete = "off";
    registerForm.noValidate = true;

    const registerTitle = document.createElement("h2");
    registerTitle.className = "text-4xl font-extrabold text-center mb-8 title-gradient";
    registerTitle.textContent = exmp.getLang("singin.register-b") || "Kayıt Ol";

    const regUsername = document.createElement("input");
    regUsername.type = "text";
    regUsername.id = "username";
    regUsername.placeholder = exmp.getLang("register.username") || "Username";
    regUsername.className = "input-premium w-full";

    const regEmail = document.createElement("input");
    regEmail.type = "text";
    regEmail.id = "email";
    regEmail.placeholder = exmp.getLang("register.email") || "Email";
    regEmail.className = "input-premium w-full";

    const regPassword = document.createElement("input");
    regPassword.type = "password";
    regPassword.id = "password";
    regPassword.placeholder = exmp.getLang("register.password") || "Şifre";
    regPassword.className = "input-premium w-full";

    const regRepeat = document.createElement("input");
    regRepeat.type = "password";
    regRepeat.id = "repeat_password";
    regRepeat.placeholder = exmp.getLang("register.confirmPassword") || "Şifre Tekrar";
    regRepeat.className = "input-premium w-full";

    const errorDiv = document.createElement("div");
    errorDiv.id = "error-message";
    errorDiv.className = "error-premium text-sm font-bold mt-2 w-full text-center";
    errorDiv.style.visibility = "hidden";
    errorDiv.style.height = "auto";

    const registerButton = document.createElement("button");
    registerButton.type = "submit";
    registerButton.className = "btn-premium w-full mt-4";
    registerButton.textContent = exmp.getLang("singin.register-b") || "Kayıt Ol";

    const registerFooter = document.createElement("p");
    registerFooter.className = "text-center text-premium mt-6";
    registerFooter.innerHTML = `
        <button id="show-login" type="button" class="link-premium">
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

    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = (regUsername.value || "").trim();
        const email = (regEmail.value || "").trim();
        const password = (regPassword.value || "").trim();
        const repeatPassword = (regRepeat.value || "").trim();
        
        if (!username || !email || !password || !repeatPassword) {
            if (!username) errorDiv.textContent = exmp.getLang('register-errors.required.username');
            else if (!email) errorDiv.textContent = exmp.getLang('register-errors.required.email');
            else if (!password) errorDiv.textContent = exmp.getLang('register-errors.required.password');
            else if (!repeatPassword) errorDiv.textContent = exmp.getLang('register-errors.required.confirmPassword');
            errorDiv.style.visibility = "visible";
            return;
        }
        
        if (username.length < 3 || password.length < 6) {
            if (username.length < 3) errorDiv.textContent = exmp.getLang('register-errors.minlength.username');
            else if (password.length < 6) errorDiv.textContent = exmp.getLang('register-errors.minlength.password');
            errorDiv.style.visibility = "visible";
            return;
        }
        
        if (username.length > 20 || password.length > 20) {
            if (username.length > 20) errorDiv.textContent = exmp.getLang('register-errors.maxlength.username');
            else if (password.length > 20) errorDiv.textContent = exmp.getLang('register-errors.maxlength.password');
            errorDiv.style.visibility = "visible";
            return;
        }
        
        const isValidEmail = (email: string): boolean => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        };
        
        if (!isValidEmail(email)) {
            errorDiv.textContent = exmp.getLang('register-errors.invalidCharacters.email');
            errorDiv.style.visibility = "visible";
            return;
        }
        
        if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
            errorDiv.textContent = exmp.getLang('register-errors.invalidCharacters.username');
            errorDiv.style.visibility = "visible";
            return;
        }
        
        if (password !== repeatPassword) {
            errorDiv.textContent = exmp.getLang('register-errors.passwordMismatch');
            errorDiv.style.visibility = "visible";
            return;
        }

        const registerData: IApiRegister = { username, email, password };
        
        try {
            const response = await _apiManager.register(registerData);
            if (!response.success) {
                const errorKey = response.message || 'registerFailed';
                const errorMessage = exmp.getLang(`register-errors.${errorKey}`) || 
                                   exmp.getLang('register-errors.registerFailed');
                errorDiv.textContent = errorMessage;
                errorDiv.style.visibility = "visible";
                return;
            }
            
            errorDiv.style.visibility = "hidden";
            history.pushState(null, '', '/singin');
            window.dispatchEvent(new PopStateEvent('popstate'));
        } catch (error: any) {
            errorDiv.textContent = exmp.getLang('register-errors.networkError');
            errorDiv.style.visibility = "visible";
            console.error('Registration error:', error);
        }
    };
}