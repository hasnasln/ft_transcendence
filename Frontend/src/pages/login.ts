import { _apiManager } from "../api/APIManager";
import { Router } from "../router";
import { exmp } from "../languageManager";
import { Page } from '../router';
import { AuthResponseMessages } from "../api/types";
import { ModernOverlay } from "../components/ModernOverlay.js";


export class LoginPage implements Page {
	evaluate(): string {
		return `
		<div class="min-h-screen flex items-center justify-center bg-animated-gradient">
			<main id="login-main" class="glass-container p-10 max-w-md w-full relative animate-fadeIn">
				<section id="section-login" class="animate-fadeIn">
					<form id="login-form" class="flex flex-col space-y-8" autocomplete="off" novalidate>
						<h2
						data-langm-key="singin.login-b"
						class="text-4xl font-extrabold text-center mb-8 title-gradient">!_!
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
						type="submit" class="btn-premium w-full mt-4">!_!
						</button>
						<div class="text-center mt-6">
						<p 
							data-langm-key="singin.no-account"
							class="inline-block text-premium">
							!_!
						</p>
						<button 
							id="show-register"
							data-langm-key="singin.register-b"
							data-action="register"
							
							type="button"class="inline-block link-premium ml-2">
							!_!
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
					console.log("bla bla bla")
					break;
				}
				default:
					console.warn(`Unknown action: ${action}`);
			}
		});
		
		const btn = document.getElementById("langDropdownBtn");
		const menu = document.getElementById("langDropdownMenu");
		document.addEventListener('click', (e) => {
			const target = e.target as Node;
			// Eğer tıklanan yer buton ya da menünün içindeyse hiçbir şey yapma
			if (btn!.contains(target) || menu!.contains(target)) return;
			// Dışarı tıklanmışsa menüyü kapat
			menu!.classList.add('hidden');
		});

	}

	private getInputValue(id: string): string {
		const input = document.getElementById(id) as HTMLInputElement;
		return input ? input.value.trim() : '';
	}

	async handleLogin(): Promise<void> {
		const nicnameOrMail = this.getInputValue('nicname_or_mail_input');
		const passwordValue = this.getInputValue('password_input');
		
		try {
			const response = await _apiManager.login(nicnameOrMail, passwordValue);
			if (!response.success) {
				const messageKey = response.message as AuthResponseMessages;
				let errorMessage = '';

				switch (messageKey) {
					case AuthResponseMessages.EMAIL_AND_PASSWORD_REQUIRED:
					case AuthResponseMessages.EMAIL_LENGTH_INVALID:
					case AuthResponseMessages.INVALID_EMAIL_FORMAT:
					case AuthResponseMessages.INVALID_EMAIL:
					case AuthResponseMessages.INVALID_PASSWORD:
						errorMessage = exmp.getLang(`auth-messages.${messageKey}`) || 
									  exmp.getLang('singin-errors.INVALID_CREDENTIALS');
						break;
					default:
						errorMessage = exmp.getLang('singin-errors.INVALID_CREDENTIALS');
						break;
				}

				ModernOverlay.show(errorMessage, 'error');
				return;
			}
			
			const successMessage = exmp.getLang(`auth-messages.${AuthResponseMessages.LOGIN_SUCCESS}`);
			ModernOverlay.show(successMessage, 'success');
			
			setTimeout(() => {
				Router.getInstance().go('/');
			}, 1000);
			
		} catch (error: any) {
			const errorMessage = exmp.getLang('singin-errors.networkError');
			ModernOverlay.show(errorMessage, 'error');
			console.error('Login error:', error);
		}
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
