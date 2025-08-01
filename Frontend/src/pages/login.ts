import { _apiManager } from "../api/APIManager";
import { Router } from "../router";
import { exmp } from "../languageManager";
import { Page } from '../router';

export class LoginPage implements Page {
    evaluate(): string {
        return `
        <div class="min-h-screen flex items-center justify-center bg-animated-gradient">
            <main id="login-main" class="glass-container p-10 max-w-md w-full relative animate-fadeIn">
                <section id="section-login" class="animate-fadeIn">
                    <form id="login-form" class="flex flex-col space-y-8" autocomplete="off" novalidate>
                        <h2 class="text-4xl font-extrabold text-center mb-8 title-gradient">
                            ${exmp.getLang("singin.login-b") || "Giriş Yap"}
                        </h2>
                        <input
                            type="text"
                            id="nicname_or_mail_input"
                            placeholder="${exmp.getLang("singin.email-or-nickname-i") || "Kullanıcı adı veya Email"}"
                            class="input-premium w-full"
                        />
                        <input
                            type="password"
                            id="password_input"
                            placeholder="${exmp.getLang("singin.passwor-i") || "Şifre"}"
                            class="input-premium w-full"
                        />
                        <div
                            id="error_message"
                            class="error-premium text-sm font-bold mt-2 w-full text-center"
                            style="visibility:hidden; height:auto;"
                        ></div>
                        <button type="submit" class="btn-premium w-full mt-4">
                            ${exmp.getLang("singin.login-b") || "Giriş Yap"}
                        </button>
                        <p class="text-center text-premium mt-6">
                            ${exmp.getLang("singin.no-account") || "Hesabınız yok mu?"}
                            <button id="show-register" type="button" class="link-premium ml-2">
                                ${exmp.getLang("singin.register-b") || "Kayıt Ol"}
                            </button>
                        </p>
                    </form>
                </section>
            </main>
        </div>`;
    }

    onLoad?(): void {
        renderSingin();
        const x = document.getElementById('asd123');
        if (!x) return;
        x.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const action = target.getAttribute('data-action');
            if (!action) return;
            switch (action) {
                case 'register':
                    Router.getInstance().go('/register');
                    break;
                case 'singin':
                    this.handleLogin();
                    break;
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        });

    }

    private showError(message: string): void {
        const errorMessage = document.getElementById('error_message');
        if (!errorMessage) return;
        errorMessage.style.visibility = 'visible';
        errorMessage.textContent = message;
    }

    private getInputValue(id: string): string {
        const input = document.getElementById(id) as HTMLInputElement;
        return input ? input.value.trim() : '';
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    async handleLogin(): Promise<void> {
        const nicnameOrMail = this.getInputValue('nicname_or_mail_input');
        const passwordValue = this.getInputValue('password_input');
        
        if (!nicnameOrMail || !passwordValue) {
            if (!nicnameOrMail) this.showError(exmp.getLang('singin-errors.required.email'));
            else if (!passwordValue) this.showError(exmp.getLang('singin-errors.required.password'));
            return;
        }

        if (nicnameOrMail.includes('@') && !this.isValidEmail(nicnameOrMail)) {
            this.showError(exmp.getLang('singin-errors.invalid.email') || 'Invalid email format');
            return;
        }
        
        try {
            const response = await _apiManager.login(nicnameOrMail, passwordValue);
            if (!response.success) {
                const errorKey = response.message || 'INVALID_CREDENTIALS';
                const errorMessage = exmp.getLang(`singin-errors.${errorKey}`) || 
                                   exmp.getLang('singin-errors.INVALID_CREDENTIALS');
                this.showError(errorMessage);
                return;
            }
            
            Router.getInstance().go('/');
        } catch (error: any) {
            const errorMessage = exmp.getLang('singin-errors.networkError');
            this.showError(errorMessage);
            console.error('Login error:', error);
        }
    }
}

const customStyle = `
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
        }`

async function submit() {
    const loginInput = document.getElementById("nicname_or_mail_input") as HTMLInputElement;
    const passwordInput = document.getElementById("password_input") as HTMLInputElement;
    const errorDiv = document.getElementById("error_message") as HTMLDivElement;

    const nicnameOrMail = (loginInput.value || "").trim();
    const passwordValue = (passwordInput.value || "").trim();
    
    if (!nicnameOrMail || !passwordValue) {
        errorDiv.textContent = !nicnameOrMail
            ? exmp.getLang('singin-errors.required.email')
            : exmp.getLang('singin-errors.required.password');
        errorDiv.style.visibility = "visible";
        return;
    }
    
    try {
        const response = await _apiManager.login(nicnameOrMail, passwordValue);
        if (!response.success) {
            const errorKey = response.message || 'INVALID_CREDENTIALS';
            const errorMessage = exmp.getLang(`singin-errors.${errorKey}`) ||
                exmp.getLang('singin-errors.INVALID_CREDENTIALS');
            errorDiv.textContent = errorMessage;
            errorDiv.style.visibility = "visible";
            return;
        }
        
        errorDiv.style.visibility = "hidden";
        Router.getInstance().go('/');
    } catch (error: any) {
        errorDiv.textContent = exmp.getLang('singin-errors.networkError');
        errorDiv.style.visibility = "visible";
    }
}

export function renderSingin(): void {
    const container = Router.getInstance().rootContainer();
    // Inject custom styles once
    if (!document.getElementById("custom-signin-style")) {
        const style = document.createElement("style");
        style.id = "custom-signin-style";
        style.textContent = customStyle;
        document.head.appendChild(style);
    }

    // Initialize language dropdown
    addFlagLangDropdown(container);

    // Wire up buttons and form
    const showRegisterBtn = container.querySelector("#show-register");
    showRegisterBtn?.addEventListener("click", () => {
        Router.getInstance().go("/register");
    });

    const loginForm = container.querySelector("#login-form") as HTMLFormElement;
    loginForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        submit();
    });
}

function getFlag(lang: string) {
    switch (lang) {
        case "tr": return "🇹🇷";
        case "en": return "🇬🇧";
        case "fr": return "🇫🇷";
        default: return "🏳️";
    }
}

function addFlagLangDropdown(container: HTMLElement)
{
    const oldBtn = container.querySelector('#langDropdownBtn');
    const oldMenu = container.querySelector('#langDropdownMenu');
    if (oldBtn) 
        oldBtn.remove();
    if (oldMenu)
        oldMenu.remove();

    const currentLang = exmp.getLanguage();
    const currentFlag = getFlag(currentLang);

    const btn = document.createElement("button");
    btn.id = "langDropdownBtn";
    btn.type = "button";
    btn.className = "absolute top-3 right-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center inline-flex items-center z-50";
    btn.innerHTML = `
        <span id="selectedLangFlag" class="mr-1 text-sm">${currentFlag}</span>
        <span id="selectedLangText" class="text-xs">${currentLang}</span>
        <svg class="w-2 h-2 ml-2" aria-hidden="true" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
        </svg>
    `;

    const menu = document.createElement("div");
    menu.id = "langDropdownMenu";
	menu.className = "z-50 hidden absolute top-0 left-full ml-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-32";
    menu.innerHTML = `
	<ul class="py-1 text-xs text-gray-700" aria-labelledby="langDropdownBtn">
		<li>
		<a href="#" data-lang="tr" class="flex items-center px-3 py-1.5 hover:bg-gray-100"><span class="mr-2 text-sm">🇹🇷</span> tr</a>
		</li>
		<li>
		<a href="#" data-lang="en" class="flex items-center px-3 py-1.5 hover:bg-gray-100"><span class="mr-2 text-sm">🇬🇧</span> en</a>
		</li>
		<li>
		<a href="#" data-lang="fr" class="flex items-center px-3 py-1.5 hover:bg-gray-100"><span class="mr-2 text-sm">🇫🇷</span> fr</a>
		</li>
	</ul>
`;

    const login_form = document.getElementById('login-main')
    login_form!.appendChild(btn);
    login_form!.appendChild(menu);


    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!btn.contains(e.target as Node) && !menu.contains(e.target as Node)) {
            menu.classList.add('hidden');
        }
    });

    menu.querySelectorAll('a[data-lang]').forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const lang = item.getAttribute('data-lang');
            const flag = item.querySelector('span')?.textContent || '';
            const text = (item as HTMLElement).innerText.replace(flag, '').trim();
            (document.getElementById('selectedLangFlag') as HTMLElement).textContent = flag;
            (document.getElementById('selectedLangText') as HTMLElement).textContent = text;
            menu.classList.add('hidden');
            await exmp.setLanguage(lang!);
            // SPA router ile mevcut route'u yeniden yükle
            window.dispatchEvent(new Event('popstate'));
        });
    });
}
