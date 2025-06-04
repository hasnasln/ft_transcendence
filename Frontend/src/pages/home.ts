import type { IPages } from './IPages';
import { Settings } from './settings';
import { ProfileSettings } from './profile';
import { exmp } from '../languageMeneger';
import { creaters } from '../companent/creaters';

export class HomePage implements IPages {
	private languageChangeHandler: (lang: string) => void;
	private currentLanguage: string; // Mevcut dili saklamak için
	private isInitialRender: boolean = true; // İlk render kontrolü

	constructor() {
		console.log("homepage -> constructor calisti.");
		this.currentLanguage = exmp.getLanguage();
		
		this.languageChangeHandler = (lang: string) => {
			if (this.currentLanguage === lang && !this.isInitialRender) {
				return; // Aynı dil ve ilk render değilse işlem yapma
			}
			
			console.log("homepage -> languageChangeHandler calisti.");
			console.log(`Language changed to: ${lang}`);
			
			this.currentLanguage = lang;
			this.isInitialRender = false;
			
			const container = document.getElementById('content-container');
			if (container) {
				container.innerHTML = '';
				renderHome(container);
				this.init(); // Yeni render sonrası init çağrısı
			}
		};
	}

	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		
		exmp.addLanguageChangeListener(this.languageChangeHandler);

		exmp.waitForLoad().then(() => {
			renderHome(container);
			this.init(); // Doğrudan init çağrısı
		});
	}

	destroy(): void {
		exmp.removeLanguageChangeListener(this.languageChangeHandler);
		document.getElementById('maindiv')?.remove();
	}

	init(): void {
		const abcdmain = document.getElementById('maindiv');
		if (!abcdmain) {
			console.error('maindiv not found');
			return;
		}

		// Önceki event listener'ı kaldır
		abcdmain.removeEventListener('click', this.handleClick);
		// Yeni event listener ekle
		abcdmain.addEventListener('click', e => {
			console.log('HomePage clicked');
			this.handleClick(e);
		});
		console.log('HomePage initialized');
	}

	private handleClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		const action = target.getAttribute('data-action');

		if (!action) return;
		
		switch (action) {
			case 'play':
				this.handlePlay();
				break;
			case 'settings':
				this.handleSettings();
				break;
			case 'profile':
				this.handleProfile();
				break;
			case 'tournament':
				this.handleTournament();
				break;
			case 'exit':
				this.handelExit();
				break;
			default:
				console.warn(`Unknown action: ${action}`);
		}
	}

	handlePlay(): void {
		console.log('Play button clicked');
		history.pushState({}, '', '/play');
		window.dispatchEvent(new Event('popstate'));
		this.destroy();
	}

	handelExit(): void {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		// dil ayarı silinmesin kalsın
		// localStorage.removeItem('language');
		console.log('Exit button clicked');
		window.location.href = '/singin';
	}

	handleSettings(): void {
		console.log('Settings button clicked');
		const old_settings = document.getElementById('settings_main');
		if (old_settings) {
			old_settings.classList.remove('animate-slide-in-left');
			old_settings.classList.add('animate-slide-out-left');
			
			old_settings.addEventListener('animationend', () => {
				if (old_settings.classList.contains('animate-slide-out-left')) {
					old_settings.remove();
				}
			}, { once: true });
			return;
		}
		
		const hsn = new Settings();
		hsn.render(document.getElementById('content-container') as HTMLElement);
	}

	handleProfile(): void {
		console.log('Profile button clicked');
		const old_settings = document.getElementById('profile_main');
		if (old_settings) {
			old_settings.classList.remove('animate-slide-in-right');
			old_settings.classList.add('animate-slide-out-right');

			old_settings.addEventListener('animationend', () => {
				if (old_settings.classList.contains('animate-slide-out-right')) {
					old_settings.remove();
				}
			}, { once: true });
			return;
		}
		const hsn = new ProfileSettings();
		hsn.render(document.getElementById('content-container') as HTMLElement);
	}

	
	handleTournament(): void {
		console.log('Tournament button clicked');
		history.pushState({}, '', '/tournament');
		window.dispatchEvent(new Event('popstate'));
	}
}

// renderHome ve CreateChoiseButton fonksiyonları aynı kalacak



export function renderHome(container: HTMLElement) {

	const maindiv = document.createElement('div');
	maindiv.id = 'maindiv';
	maindiv.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'h-full',
		'w-full',
		'absolute',
		'top-0',
		'left-0',
		'z-0',
		'bg-gray-300',
		'relative',
		'overflow-hidden',
	);

	creaters(maindiv, 'top-0', 'left-3', 50, 'hamza');
	creaters(maindiv, 'top-0', 'right-3', 50, 'hasan');
	creaters(maindiv, 'top-1/2', 'left-3', 50, 'batuhan');
	creaters(maindiv, 'top-1/2', 'right-3', 50, 'ayhan');
	creaters(maindiv, 'top-3', 'right-[50]', 10, 'fatma');



	const choicesdiv = document.createElement('div');
	choicesdiv.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'rounded-3xl',
		'w-[30%]',
		'h-[30%]',
		'gap-6',
	);

	CreateChoiseButton(choicesdiv, exmp.getLang('home.play'), 'play');
	CreateChoiseButton(choicesdiv, exmp.getLang('home.settings'), 'settings');
	CreateChoiseButton(choicesdiv, exmp.getLang('home.profile') , 'profile');
	CreateChoiseButton(choicesdiv, exmp.getLang('home.tournament'), 'tournament'); 
	CreateChoiseButton(choicesdiv, exmp.getLang('home.logout'), 'exit');

	maindiv.appendChild(choicesdiv);
	container.appendChild(maindiv);
}


function CreateChoiseButton(container: HTMLElement, text: string, action: string = 'play') {
	const button = document.createElement('button');
	button.setAttribute('data-action', action);
	button.textContent = text;
	button.classList.add(
		'bg-blue-500',
		'text-white',
		'px-4',
		'py-2',
		'rounded-lg',
		'hover:bg-blue-700',
		'transition-colors',
		'duration-300',
		'w-[70%]',
		'hover:scale-105',
		'transform',
		'transition-transform',
	);
	container.appendChild(button);
}