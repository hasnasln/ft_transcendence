import type { IPages } from './IPages';
import { Settings } from './settings';
import { ProfileSettings } from './profile';


interface HomePageData {
	play_button_name: string;
	settings_button_name: string;
	profile_button_name: string;
}

export class HomePage implements IPages {
	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderHome(container, this.getLang('en'));
		// setTimeout(() => this.init(), 3);
		// //! Burada yaşanan sıktıntı render fonsiyonu tam bitmeden init fonksiyonu çalışıyor
		// //! bu yüzden init fonsiyonu main div i bulamıyor
		// //? çözüm olarak setTimeout ile 3 ms bekletiyorum
		// //? ama bu çok mantıklı değil
		// //? bunun yerine render fonksiyonunun bitişini beklemek daha mantıklı
		// //? ama nasıl yapacağımı bilmiyorum
		requestAnimationFrame(() => {
			this.init();
		});
		//! burada kesin bir çözüme ihtiyacım var
	}


	destroy(): void {
		document.body.innerHTML = '';
	}

	init(): void {
		const abcdmain = document.getElementById('maindiv');
		if (!abcdmain){
			console.error('maindiv not found');
			return;}

		abcdmain.addEventListener('click', (event) => {
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
				default:
					console.warn(`Unknown action: ${action}`);
			}
		}
		);

		// document.body.addEventListener('click', (event) => {
		// 	const target = event.target as HTMLElement;
		// 	const action = target.getAttribute('data-action');

		// 	if (!action) return;
		// 	switch (action) {
		// 		case 'play':
		// 			this.handlePlay();
		// 			break;
		// 		case 'settings':
		// 			this.handleSettings();
		// 			break;
		// 		case 'profile':
		// 			this.handleProfile();
		// 			break;
		// 		default:
		// 			console.warn(`Unknown action: ${action}`);
		// 	}
		// });
	}


	getLang(lang: string): HomePageData {
		if (lang === 'en') {
			return {
				play_button_name: 'Play',
				settings_button_name: 'Settings',
				profile_button_name: 'Profile',
			};
		} else 
		{
			return {
				play_button_name: 'Oyna',
				settings_button_name: 'Ayarlar',
				profile_button_name: 'Profil',
			};
		}
	}
	handlePlay(): void {
		console.log('Play button clicked');
	}

	handleSettings(): void {
		console.log('Settings button clicked');
		const old_settings = document.getElementById('settings_main');
		if (old_settings) {
		  old_settings.classList.remove('animate-slide-in-left');
		  old_settings.classList.add('animate-slide-out-left');
		  
		  // Animasyon bittiğinde elementi kaldır
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
		if (old_settings){
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
}




export function renderHome(container: HTMLElement, data: HomePageData) {

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
		'z-0'
	);



	const choicesdiv = document.createElement('div');
	choicesdiv.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'rounded-3xl',
		'w-[30%]',
		'h-[30%]',
		'bg-white',
		'gap-6',
	);

	CreateChoiseButton(choicesdiv, data.play_button_name, 'play');
	CreateChoiseButton(choicesdiv, data.settings_button_name, 'settings');
	CreateChoiseButton(choicesdiv, data.profile_button_name , 'profile');

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
		'w-[70%]'
	);
	container.appendChild(button);
}