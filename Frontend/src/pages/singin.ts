import type { IPages } from "./IPages";
import { exmp } from "../languageMeneger";
import { _apiManager } from "../api/APIManeger";

export class SinginPage implements IPages {
    private languageChangeHandler: (lang: string) => void;

    constructor() {
        this.languageChangeHandler = (lang: string) => {
            console.log(`Language changed to: ${lang}`);
            const container = document.getElementById('asd123');
            if (container) {
                container.innerHTML = '';
                renderSingin(container);
            }
        }
    }

    render(container: HTMLElement): void {
        if (!container) {
            console.error('Container not found');
            return;
        }
        exmp.addLanguageChangeListener(this.languageChangeHandler);
        exmp.waitForLoad().then(() => {
            renderSingin(container);
            requestAnimationFrame(() => {
                this.init();
            });
        });
    }

    destroy(): void {
        exmp.removeLanguageChangeListener(this.languageChangeHandler);
        document.body.innerHTML = '';
    }

    init(): void {
        const x = document.getElementById('asd123');
        if (!x) return;
        x.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            const action = target.getAttribute('data-action');
            if (!action) return;
            switch (action) {
                case 'register':
                    this.handleRegister();
                    break;
                case 'singin':
                    this.handleLogin();
                    break;
                default:
                    console.warn(`Unknown action: ${action}`);
            }
        });
    }

    handleRegister(): void {
        history.pushState({}, '', '/register');
        window.dispatchEvent(new Event('popstate'));
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

    async handleLogin(): Promise<void> {
        const nicnameOrMail = this.getInputValue('nicname_or_mail_input');
        const passwordValue = this.getInputValue('password_input');
        if (!nicnameOrMail || !passwordValue) {
            if (!nicnameOrMail) this.showError(exmp.getLang('singin-errors.required.email'));
            else if (!passwordValue) this.showError(exmp.getLang('singin-errors.required.password'));
            return;
        }
        try {
            const response = await _apiManager.login(nicnameOrMail, passwordValue);
            if (!response.success) {
                this.showError(exmp.getLang("singin-errors." + (response.message || 'Mesaj bulunamadı')));
                return;
            }
            history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
        } catch (error: any) {
            // Optionally handle error
        }
    }
}

export function renderSingin(container: HTMLElement): void {
    if (!document.getElementById("custom-signin-style")) {
        const style = document.createElement("style");
        style.id = "custom-signin-style";
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

    // Ana arka plan
    const mainBg = document.createElement("div");
    mainBg.className = "min-h-screen flex items-center justify-center bg-animated-gradient";

    const main = document.createElement("main");
    main.className = "bg-white bg-opacity-90 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full relative";

    addFlagLangDropdown(main);

    const sectionLogin = document.createElement("section");
    sectionLogin.id = "section-login";
    sectionLogin.className = "animate-fadeIn";

    const loginForm = document.createElement("form");
    loginForm.id = "login-form";
    loginForm.className = "flex flex-col space-y-6";
    loginForm.autocomplete = "off";

    const loginTitle = document.createElement("h2");
    loginTitle.className = "text-3xl font-extrabold text-center text-gray-900";
    loginTitle.textContent = exmp.getLang("singin.login-b") || "Giriş Yap";

    const loginInput = document.createElement("input");
    loginInput.type = "text";
    loginInput.id = "nicname_or_mail_input";
    loginInput.placeholder = exmp.getLang("singin.email-or-nickname-i") || "Kullanıcı adı veya Email";
    loginInput.required = true;
    loginInput.className = "shadow-sm bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out focus:shadow-lg focus:scale-[1.02]";

    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    passwordInput.id = "password_input";
    passwordInput.placeholder = exmp.getLang("singin.passwor-i") || "Şifre";
    passwordInput.required = true;
    passwordInput.className = "shadow-sm bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 transition duration-300 ease-in-out focus:shadow-lg focus:scale-[1.02]";

    const errorDiv = document.createElement("div");
    errorDiv.id = "error_message";
    errorDiv.className = "text-red-500 text-sm font-bold mt-2 w-full";
    errorDiv.style.visibility = "hidden";
    errorDiv.style.height = "1.5rem";

    const loginButton = document.createElement("button");
    loginButton.type = "submit";
    loginButton.className = "bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition transform hover:scale-105";
    loginButton.textContent = exmp.getLang("singin.login-b") || "Giriş Yap";

    const loginFooter = document.createElement("p");
    loginFooter.className = "text-center text-gray-700";
    loginFooter.innerHTML = `${exmp.getLang("singin.no-account") || "Hesabınız yok mu?"}
    <button id="show-register" type="button" class="text-indigo-600 hover:underline font-semibold">${exmp.getLang("singin.register-b") || "Kayıt Ol"}</button>`;

    loginForm.appendChild(loginTitle);
    loginForm.appendChild(loginInput);
    loginForm.appendChild(passwordInput);
    loginForm.appendChild(errorDiv);
    loginForm.appendChild(loginButton);
    loginForm.appendChild(loginFooter);
    sectionLogin.appendChild(loginForm);

    main.appendChild(sectionLogin);
    mainBg.appendChild(main);
    container.appendChild(mainBg);

    const showRegisterBtn = loginFooter.querySelector("#show-register") as HTMLButtonElement;
    showRegisterBtn.onclick = () => {
        history.pushState({}, '', '/register');
        window.dispatchEvent(new Event('popstate'));
    };

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
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
                errorDiv.textContent = exmp.getLang("singin-errors." + (response.message || 'Mesaj bulunamadı'));
                errorDiv.style.visibility = "visible";
                return;
            }
            errorDiv.style.visibility = "hidden";
            history.pushState({}, '', '/');
            window.dispatchEvent(new Event('popstate'));
        } catch (error: any) {
            errorDiv.textContent = exmp.getLang("singin-errors.INVALID_CREDENTIALS");
            errorDiv.style.visibility = "visible";
        }
    };
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
    btn.className = "absolute top-4 right-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center z-50";
    btn.innerHTML = `
        <span id="selectedLangFlag" class="mr-2">${currentFlag}</span>
        <span id="selectedLangText">${currentLang}</span>
        <svg class="w-2.5 h-2.5 ml-3" aria-hidden="true" fill="none" viewBox="0 0 10 6">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
        </svg>
    `;

    const menu = document.createElement("div");
    menu.id = "langDropdownMenu";
	menu.className = "z-50 hidden absolute top-0 left-full ml-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44";
    menu.innerHTML = `
	<ul class="py-2 text-sm text-gray-700" aria-labelledby="langDropdownBtn">
		<li>
		<a href="#" data-lang="tr" class="flex items-center px-4 py-2 hover:bg-gray-100"><span class="mr-2">🇹🇷</span> tr</a>
		</li>
		<li>
		<a href="#" data-lang="en" class="flex items-center px-4 py-2 hover:bg-gray-100"><span class="mr-2">🇬🇧</span> en</a>
		</li>
		<li>
		<a href="#" data-lang="fr" class="flex items-center px-4 py-2 hover:bg-gray-100"><span class="mr-2">🇫🇷</span> fr</a>
		</li>
	</ul>
`;

    container.appendChild(btn);
    container.appendChild(menu);

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
