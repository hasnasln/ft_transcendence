import type { IPages } from './IPages';
import { Settings } from './settings';
import { ProfileSettings } from './profile';
import { exmp } from '../languageMeneger';
import { creaters } from '../components/creaters';

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
				this.handleExit();
				break;
			case 'facetint':
				this.handleFacetintPage();
				break;
			default:
				console.warn(`Unknown action: ${action}`);
		}
	}


	handleFacetintPage(): void {
		console.log('Facetint button clicked');
		history.pushState({}, '', '/facetint');
		window.dispatchEvent(new Event('popstate'));
		this.destroy();
	}

	handlePlay(): void {
		console.log('Play button clicked');
		history.pushState({}, '', '/play');
		window.dispatchEvent(new Event('popstate'));
		this.destroy();
	}

	handleExit(): void {
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
    'bg-gradient-to-br',
    'from-[#ece9e2]',
    'via-[#e0dbd1]',
    'to-[#cfc8bb]',
);

	const profiles = [
  {
    name: "AYHAN COŞGUN",
    linkedin: "https://www.linkedin.com/in/ayhan-coşgun-8324392b9",
    github: "https://github.com/AyhanCosgun",
	avatar : "creaters/ayhan.png"
  },
  {
    name: "HAMZA COŞKUN",
    linkedin: "https://www.linkedin.com/in/hamza-cskn",
    github: "https://github.com/hamza-cskn",
	avatar : "creaters/hamza.png"
  },
  {
    name: "BATUHAN KAS",
    linkedin: "https://www.linkedin.com/in/batuhan-kaş-545689254",
    github: "https://github.com/BatuhanKas",
	avatar : "creaters/batuhan.png"

  },
  {
    name: "HASAN ASLAN",
    linkedin: "https://www.linkedin.com/in/hasan-aslan-",
    github: "https://github.com/hasnasln",
	avatar : "creaters/hasan.png"
  },
  {
	name: "FATMANUR ÇETİNTAŞ",
    linkedin: "https://www.linkedin.com/in/fatmanurcetintas",
    github: "https://github.com/facetint",
	avatar : "creaters/fatma.png"
  }
];

const positions = [
  'fixed top-8 left-8',
  'fixed top-8 right-8',
  'fixed bottom-8 left-8',
  'fixed bottom-8 right-8',
  'absolute top-8 left-1/2 -translate-x-1/2 z-10'
];

for (let i = 0; i < positions.length; i++) {
  const card = createProfileCard(
    profiles[i].name,
    profiles[i].linkedin,
    profiles[i].github,
	profiles[i].avatar
  );
  card.classList.add(...positions[i].split(' '));
  maindiv.appendChild(card);
}

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
    'absolute',
    'left-1/2',
    '-translate-x-1/2',
    'top-[55%]',
    'z-0'
);

	CreateChoiseButton(choicesdiv, exmp.getLang('home.play'), 'play');
	CreateChoiseButton(choicesdiv, exmp.getLang('home.settings'), 'settings');
	CreateChoiseButton(choicesdiv, exmp.getLang('home.profile') , 'profile');
	CreateChoiseButton(choicesdiv, exmp.getLang('home.tournament'), 'tournament'); 
	CreateChoiseButton(choicesdiv, exmp.getLang('home.logout'), 'exit');
	// CreateChoiseButton(choicesdiv, exmp.getLang('facetint'), 'facetint');

	maindiv.appendChild(choicesdiv);
	container.appendChild(maindiv);
}

function createProfileCard(

  name: string,
  linkedin: string,
  github: string,
  avatar: string
): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML = `

<div
  class="profile-card w-[300px] rounded-md shadow-xl overflow-hidden bg-white flex flex-col items-center justify-center gap-3 transition-all duration-300 group"
>
  <div
    class="avatar w-full pt-5 flex items-center justify-center flex-col gap-1"
  >
    <div class="img_container w-full flex items-center justify-center relative z-40">
	<img src="${avatar}" alt="${name}" class="size-36 z-40 border-4 border-white rounded-full object-cover group-hover:border-8 group-hover:transition-all group-hover:duration-300 transition-all duration-300" />
    </div>
  </div>
  <div class="headings *:text-center *:leading-4">
	<p class="text-xl font-serif font-semibold text-[#434955]">${name}</p>  </div>
  <div class="w-full items-center justify-center flex">
    <ul
	class="flex flex-col items-start gap-2 *:inline-flex *:gap-2 *:items-center *:justify-center *:border-b-[1.5px] *:border-b-stone-700 *:border-dotted *:text-xs *:font-semibold *:text-[#434955] pb-3"    >
      <li>
        <svg class="fill-stone-700 group-hover:fill-[#58b0e0]" height="15" width="15" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.268h-3v-4.604c0-1.099-.021-2.513-1.532-2.513-1.532 0-1.768 1.197-1.768 2.434v4.683h-3v-9h2.881v1.233h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v4.731z"/>
        </svg>
		<a href="${linkedin}" target="_blank" class="hover:underline break-all max-w-[230px]">
		${linkedin.replace('https://www.', '').replace('linkedin.com/in/', 'linkedin.com/in/')}
		</a>
      <li>
        <svg class="fill-stone-700 group-hover:fill-[#58b0e0]" height="15" width="15" viewBox="0 0 24 24">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
        </svg>
		<a href="${github}" target="_blank" class="hover:underline">${github.replace('https://','')}</a>      </li>
    </ul>
  </div>
  <hr
      class="w-full group-hover:h-5 h-3 bg-[#1a237e] group-hover:transition-all group-hover:duration-300 transition-all duration-300"

</div>
    `.trim();
    return div.firstElementChild as HTMLElement;
}

function CreateChoiseButton(container: HTMLElement, text: string, action: string = 'play') {
    const button = document.createElement('button');
    button.setAttribute('data-action', action);
    button.type = 'button';
    button.className = [
        'cursor-pointer',
        'text-white',
        'font-bold',
        'relative',
        'text-xl',
        'w-[13em]',
        'h-[6em]',
        'text-center',
        'bg-gradient-to-r',
        'from-[#2563eb]',
        'from-10%',
        'via-[#3b82f6]',
        'via-30%',
        'to-[#60a5fa]',
        'to-90%',
        'bg-[length:400%]',
        'rounded-[40px]',
        'z-10',
		'border-2', 
        'border-[#1a237e]',   
        'hover:brightness-150',
        'hover:-translate-y-[2px]',
        'hover:border-b-[8px]',
        'active:border-b-[3px]',
        'active:brightness-90',
        'active:translate-y-[3px]',
        'transition-all',
        'duration-300',
        'my-2'
    ].join(' ');

    const before = document.createElement('span');
    before.setAttribute('aria-hidden', 'true');
    before.className = [
        'pointer-events-none',
        'absolute',
        '-top-[8px]',
        '-bottom-[8px]',
        '-left-[8px]',
        '-right-[8px]',
        'bg-gradient-to-r',
        'from-violet-500',
        'from-10%',
        'via-sky-500',
        'via-30%',
        'to-pink-500',
        'bg-[length:400%]',
        '-z-10',
        'rounded-[45px]',
        'blur-xl',
        'opacity-70',
        'transition-all',
        'ease-in-out',
        'duration-1000',
        'hover:bg-[length:10%]'
    ].join(' ');

    button.appendChild(before);

    const label = document.createElement('span');
    label.className = 'relative z-10';
    label.textContent = text;

    button.appendChild(label);
    container.appendChild(button);
}
