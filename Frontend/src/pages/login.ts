import { _apiManager } from "../api/APIManager";
import { Router } from "../router";
import { exmp } from '../lang/languageManager';	
import { Page } from '../router';
import { ModernOverlay } from "../components/ModernOverlay.js";

let flag = false;


export class LoginPage implements Page {
	evaluate(): string {
		return `
		<div class="min-h-screen flex items-center justify-center relative overflow-hidden" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1e3a8a 75%, #1e40af 100%)">
			<div class="absolute inset-0 opacity-5 pointer-events-none">
				<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<pattern id="loginGrid" width="50" height="50" patternUnits="userSpaceOnUse">
							<path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" stroke-width="0.5"/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#loginGrid)" />
				</svg>
			</div>
			
			<div class="absolute inset-0 overflow-hidden pointer-events-none">
				<div class="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-float"></div>
				<div class="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-300/25 rounded-full animate-float-delayed"></div>
				<div class="absolute top-1/2 left-3/4 w-1 h-1 bg-indigo-300/40 rounded-full animate-float-slow"></div>
				<div class="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-300/30 rounded-full animate-float"></div>
				<div class="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-sky-300/25 rounded-full animate-float-delayed"></div>
				<div class="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400/20 rounded-full animate-float-slow"></div>
			</div>
			<main id="login-main" class="glass-container p-10 max-w-md w-full relative animate-fadeIn z-10 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-3xl shadow-2xl">
				<section id="section-login" class="animate-fadeIn">
					<form id="login-form" class="flex flex-col space-y-8" autocomplete="off" novalidate>
						<h2
						data-langm-key="singin.login-b"
						class="text-4xl font-extrabold text-center mb-8 title-gradient"> 
						</h2>
						<input
							type="text"
							id="nicname_or_mail_input"
							data-langm-key="singin.email-or-nickname-i"
							data-langm-path="placeholder"
							class="input-premium w-full"
						/>
						<input
							type="password"
							id="password_input"
							data-langm-key="singin.passwor-i"
							data-langm-path="placeholder"
							class="input-premium w-full"
						/>
						<div
							id="error_message"
							class="error-premium text-sm font-bold mt-2 w-full text-center"
							style="visibility:hidden; height:auto;"
						></div>
						<button
						data-action="singin"
						data-langm-key="singin.login-b"
						type="submit" class="btn-premium w-full mt-4"> 
						</button>
						<div class="text-center mt-6">
						<p 
							data-langm-key="singin.no-account"
							class="inline-block text-premium">
							 
						</p>
						<button 
							id="show-register"
							data-langm-key="singin.register-b"
							data-action="register"
							
							type="button"class="inline-block link-premium ml-2">
							 
						</button>
						</div>
					</form>
				</section>
			</main>
		</div>`;
	}

	onLoad?(): void {
		addFlagLangDropdown();
		exmp.applyLanguage();
		if(!flag) {
			flag = true;
			const login_form = document.getElementById('login-main');
			if (!login_form) { console.log("hata var"); return;}
			login_form.addEventListener('click', (event) => {
				event.preventDefault();
				const target = (event.target as HTMLElement).closest('[data-action]');
				if (!target)
					return;
				const action = target.getAttribute('data-action');
				if (!action) return;
				switch (action) {
					case 'register':
						Router.getInstance().go('/register');
						break;
					case 'singin':
						this.handleLogin();
						break;
					case 'open':
						const menu = document.getElementById("langDropdownMenu");
						menu!.classList.toggle('hidden');
						break;
					case 'tr':
					case 'fr':
					case 'en':
					{
						const menu = document.getElementById("langDropdownMenu");
						(document.getElementById('selectedLangFlag') as HTMLElement).textContent = getFlag(action);
						(document.getElementById('selectedLangText') as HTMLElement).textContent = action;
						menu!.classList.add('hidden');
						exmp.setLanguage(action);
						break;
					}
					default:
						console.warn(`Unknown action: ${action}`);
				}
			});
		}
	}

	private getInputValue(id: string): string {
		const input = document.getElementById(id) as HTMLInputElement;
		return input ? input.value.trim() : '';
	}

	async handleLogin(): Promise<void> {
		const nicnameOrMail = this.getInputValue('nicname_or_mail_input');
		const passwordValue = this.getInputValue('password_input');
		
			_apiManager.login(nicnameOrMail, passwordValue)
			.then((response) => {
				if (!response.success) {
					if (response.message && exmp.getLang(`auth-messages.${response.message}`) !== `auth-messages.${response.message}`) {
						ModernOverlay.show(`auth-messages.${response.message}`, 'error');
					} else {
						 ModernOverlay.show('singin-errors.INVALID_CREDENTIALS', 'error');
					}
					return Promise.reject();
				}
	
				if (response.message && exmp.getLang(`auth-messages.${response.message}`) !== `auth-messages.${response.message}`) {
					ModernOverlay.show(`auth-messages.${response.message}`, 'success');
				} else {
					ModernOverlay.show('singin-success', 'success');
				}
			})
			.then(() => Router.getInstance().go('/'))
			.catch ((error: any) => {
				// ModernOverlay.show('singin-errors.networkError', 'error');
				console.error('Login error:', error);
			});
	}
}

function getFlag(lang: string) {
	switch (lang) {
		case "tr": return "🇹🇷";
		case "en": return "🇬🇧";
		case "fr": return "🇫🇷";
		default: return "🏳️";
	}
}

function addFlagLangDropdown()
{
	const btnHtml = `
	<button
	id="langDropdownBtn"
	data-action="open"
	class="absolute top-3 right-3 text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center inline-flex items-center z-50">
		<span id="selectedLangFlag" class="mr-1 text-sm">${exmp.getLanguage()}</span>
		<span id="selectedLangText" class="text-xs">${getFlag(exmp.getLanguage())}</span>
		<svg class="w-2 h-2 ml-2" aria-hidden="true" fill="none" viewBox="0 0 10 6">
			<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
		</svg>
	</button>
	`;
	const menuHtml = `
	<div id="langDropdownMenu"
	class="z-50 hidden absolute top-0 left-full ml-2 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-32">
		<ul class="py-1 text-xs text-gray-700" aria-labelledby="langDropdownBtn">
			<li>
			<a href="#" data-action="tr" class="flex items-center px-3 py-1.5 hover:bg-gray-100"><span class="mr-2 text-sm">🇹🇷</span> tr</a>
			</li>
			<li>
			<a href="#" data-action="en" class="flex items-center px-3 py-1.5 hover:bg-gray-100"><span class="mr-2 text-sm">🇬🇧</span> en</a>
			</li>
			<li>
			<a href="#" data-action="fr" class="flex items-center px-3 py-1.5 hover:bg-gray-100"><span class="mr-2 text-sm">🇫🇷</span> fr</a>
			</li>
		</ul>
	</div>
	`;

	const login_form = document.getElementById('login-main')
	login_form!.innerHTML += btnHtml;
	login_form!.innerHTML += menuHtml;
}
