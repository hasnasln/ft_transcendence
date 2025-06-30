import type { IPages } from './IPages';
import { Settings } from './settings';
import { ProfileSettings } from './profile';
import { exmp } from '../languageMeneger';

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

export function renderHome(container: HTMLElement) {
	const maindiv = document.createElement('div');
	maindiv.id = 'maindiv';
	maindiv.className = `
		relative min-h-screen w-full overflow-hidden
		bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900
		before:absolute before:inset-0 
		before:bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.4),transparent_70%)]
		after:absolute after:inset-0
		after:bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,198,0.3),transparent_70%)]
	`.replace(/\s+/g, ' ').trim();

	const backgroundParticles = document.createElement('div');
	backgroundParticles.className = 'absolute inset-0 overflow-hidden pointer-events-none';
	backgroundParticles.innerHTML = `
		<div class="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
		<div class="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-300/30 rounded-full animate-float-delayed"></div>
		<div class="absolute top-1/2 left-3/4 w-1 h-1 bg-pink-300/40 rounded-full animate-float-slow"></div>
		<div class="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-300/25 rounded-full animate-float"></div>
		<div class="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-cyan-300/30 rounded-full animate-float-delayed"></div>
		<div class="absolute bottom-1/3 left-1/3 w-2 h-2 bg-indigo-300/25 rounded-full animate-float-slow"></div>
	`;

	const mainLayout = document.createElement('div');
	mainLayout.className = `
		relative z-10 min-h-screen w-full flex flex-col
		justify-between items-center
		py-6 px-4 lg:py-8 lg:px-8
	`.replace(/\s+/g, ' ').trim();

	const pageLayout = document.createElement('div');
	pageLayout.className = `
		relative z-10 min-h-screen w-full flex flex-col
		justify-between items-center
		py-6 px-4 lg:py-8 lg:px-8
	`.replace(/\s+/g, ' ').trim();

	const topSection = document.createElement('div');
	topSection.className = `
		flex-1 flex flex-col items-center justify-center
		w-full max-w-6xl mx-auto
		text-center space-y-4 lg:space-y-6
	`.replace(/\s+/g, ' ').trim();

	const heroSection = document.createElement('div');
	heroSection.className = ` 
		flex flex-col items-center justify-center text-center
		space-y-2 lg:space-y-3
	`.replace(/\s+/g, ' ').trim();

	const navigationArea = document.createElement('div');
	navigationArea.className = `
		flex items-center justify-center
		w-full max-w-lg
	`.replace(/\s+/g, ' ').trim();

	const bottomSection = document.createElement('div');
	bottomSection.className = `
		w-full max-w-7xl mx-auto
		pb-6 lg:pb-8
	`.replace(/\s+/g, ' ').trim();

	const profileCardsContainer = document.createElement('div');
	profileCardsContainer.className = `
		flex flex-wrap justify-center items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4
		transition-all duration-500
		px-1 md:px-2 lg:px-4
	`.replace(/\s+/g, ' ').trim();
	
	if (window.innerWidth < 1024 || window.innerHeight < 600) {
		profileCardsContainer.classList.add('opacity-0', 'pointer-events-none');
	}

	const profiles = [
  {
	name: "AYHAN COŞGUN",
	linkedin: "https://www.linkedin.com/in/ayhan-coşgun-8324392b9",
	github: "https://github.com/AyhanCosgun",
	avatar : "creaters/acosgun.jpg"
  },
  {
	name: "HAMZA COŞKUN",
	linkedin: "https://www.linkedin.com/in/hamza-cskn",
	github: "https://github.com/hamza-cskn",
	avatar : "creaters/hcoskun.jpg"
  },
  {
	name: "FATMANUR ÇETİNTAŞ",
	linkedin: "https://www.linkedin.com/in/fatmanurcetintas",
	github: "https://github.com/facetint",
	avatar : "creaters/facetint.jpg"
  },
  {
	name: "BATUHAN KAS",
	linkedin: "https://www.linkedin.com/in/batuhan-kaş-545689254",
	github: "https://github.com/BatuhanKas",
	avatar : "creaters/bkas.jpg"

  },
  {
	name: "HASAN ASLAN",
	linkedin: "https://www.linkedin.com/in/hasan-aslan-",
	github: "https://github.com/hasnasln",
	avatar : "creaters/haslan.jpg"
  },

];

	profiles.forEach((profile, i) => {
		const card = createProfileCard(
			profile.name,
			profile.linkedin,
			profile.github,
			profile.avatar
		);
		
		card.className += ` transform transition-all duration-300 hover:scale-105
			opacity-90 hover:opacity-100`;
		
		profileCardsContainer.appendChild(card);
	});

	const heroTitle = document.createElement('h1');
	heroTitle.className = `
		text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-center
		bg-gradient-to-r from-white via-purple-200 to-pink-200
		bg-clip-text text-transparent
		tracking-tight leading-none
		animate-pulse drop-shadow-2xl
	`.replace(/\s+/g, ' ').trim();
	heroTitle.textContent = 'TRANSCENDENCE';

	const buttonContainer = document.createElement('ul');
	buttonContainer.className = `
		flex flex-col gap-3 p-6
		bg-white/5 backdrop-blur-3xl rounded-3xl
		border border-white/10 shadow-2xl
		w-full max-w-md
		transition-all duration-700
		hover:bg-white/10 hover:border-white/20
		hover:shadow-purple-500/20 hover:shadow-2xl
		ring-1 ring-white/5
	`.replace(/\s+/g, ' ').trim();
	
	createModernButton(buttonContainer, exmp.getLang('home.play-b'), 'play', 'bg-violet-400', 'border-violet-400', 'text-purple-800', 'border-purple-300', 'bg-purple-100', getPlayIcon());
	createModernButton(buttonContainer, exmp.getLang('home.settings-b'), 'settings', 'bg-indigo-400', 'border-indigo-400', 'text-blue-800', 'border-blue-300', 'bg-blue-100', getSettingsIcon());
	
	createModernButton(buttonContainer, exmp.getLang('home.profile-b'), 'profile', 'bg-blue-500', 'border-blue-500', 'text-green-800', 'border-green-300', 'bg-green-100', getProfileIcon());
	createModernButton(buttonContainer, exmp.getLang('home.tournament-b'), 'tournament', 'bg-red-400', 'border-red-400', 'text-orange-800', 'border-orange-300', 'bg-orange-100', getTournamentIcon());
	createModernButton(buttonContainer, exmp.getLang('home.logout-b'), 'exit', 'bg-gray-500', 'border-gray-500', 'text-red-800', 'border-red-300', 'bg-red-100', getExitIcon());
	
	heroSection.appendChild(heroTitle);

	navigationArea.appendChild(buttonContainer);
	
	topSection.appendChild(heroSection);
	topSection.appendChild(navigationArea);
	
	bottomSection.appendChild(profileCardsContainer);
	
	pageLayout.appendChild(topSection);
	pageLayout.appendChild(bottomSection);
	
	maindiv.appendChild(backgroundParticles);
	maindiv.appendChild(pageLayout);
	container.appendChild(maindiv);
	
	const handleResize = () => {
		if (window.innerWidth < 1024 || window.innerHeight < 600) {
			profileCardsContainer.classList.add('opacity-0', 'pointer-events-none');
		} else {
			profileCardsContainer.classList.remove('opacity-0', 'pointer-events-none');
		}
	};
	
	window.addEventListener('resize', handleResize);
}

function createProfileCard(
  name: string,
  linkedin: string,
  github: string,
  avatar: string
): HTMLElement {
  const div = document.createElement('div');
  div.innerHTML = `
<div class="profile-card w-[160px] h-[220px] md:w-[180px] md:h-[240px] lg:w-[200px] lg:h-[260px] xl:w-[220px] xl:h-[280px] group cursor-pointer">
  <div class="relative w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-xl p-[2px] overflow-hidden transition-all duration-500 hover:scale-105 hover:rotate-1">
    <!-- Glassmorphism background -->
    <div class="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-xl"></div>
    
    <!-- Inner card content -->
    <div class="relative w-full h-full bg-white/90 backdrop-blur-lg rounded-xl p-3 md:p-4 flex flex-col items-center justify-between overflow-hidden">
      <!-- Floating particles animation -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div class="absolute top-[10%] left-[20%] w-1 h-1 bg-purple-300 rounded-full opacity-60 animate-float"></div>
        <div class="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-pink-300 rounded-full opacity-40 animate-float-delayed"></div>
        <div class="absolute bottom-[20%] left-[10%] w-1 h-1 bg-blue-300 rounded-full opacity-50 animate-float-slow"></div>
      </div>
      
      <!-- Avatar section -->
      <div class="relative z-10 flex flex-col items-center">
        <div class="relative mb-2 md:mb-3">
          <!-- Glowing ring animation -->
          <div class="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-spin-slow opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <!-- Avatar image -->
          <img 
            src="${avatar}" 
            alt="${name}" 
            class="relative z-10 size-12 md:size-16 lg:size-18 xl:size-20 rounded-full object-cover border-2 md:border-3 border-white shadow-xl group-hover:scale-110 transition-all duration-300"
          />
          
          <!-- Status indicator -->
          <div class="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full border border-white shadow-lg animate-pulse"></div>
        </div>
        
        <!-- Name and title -->
        <div class="text-center mb-2 md:mb-3">
          <h3 class="text-xs md:text-sm lg:text-base font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors duration-300 leading-tight">
            ${name}
          </h3>
          <p class="text-xs text-gray-600 font-medium">Full Stack Developer</p>
        </div>
      </div>
      
      <!-- Social links -->
      <div class="relative z-10 w-full space-y-1 md:space-y-2">
        <!-- LinkedIn -->
        <a href="${linkedin}" target="_blank" rel="noopener noreferrer" 
           class="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 group/link">
          <div class="w-4 h-4 md:w-5 md:h-5 bg-blue-600 rounded flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
            <svg class="w-2 h-2 md:w-3 md:h-3 fill-white" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.268h-3v-4.604c0-1.099-.021-2.513-1.532-2.513-1.532 0-1.768 1.197-1.768 2.434v4.683h-3v-9h2.881v1.233h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v4.731z"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-gray-700 group-hover/link:text-blue-600 transition-colors duration-300">LinkedIn</p>
          </div>
        </a>
        
        <!-- GitHub -->
        <a href="${github}" target="_blank" rel="noopener noreferrer"
           class="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 group/link">
          <div class="w-4 h-4 md:w-5 md:h-5 bg-gray-800 rounded flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
            <svg class="w-2 h-2 md:w-3 md:h-3 fill-white" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.371.823 1.102.823 2.222v3.293c0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-medium text-gray-700 group-hover/link:text-gray-800 transition-colors duration-300">GitHub</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</div>`;
  return div.firstElementChild as HTMLElement;
}

function createModernButton(container: HTMLElement, text: string, action: string, floaterBgColor: string, floaterBorderColor: string, textColor: string, iconBorderColor: string, iconBgColor: string, icon: string) {
    const listItem = document.createElement('li');
    listItem.className = `
        group relative w-14 h-14 overflow-hidden rounded-2xl 
        transition-all duration-700 ease-out
        hover:w-80 hover:shadow-2xl hover:shadow-purple-500/30
        cursor-pointer
        bg-gradient-to-br from-white/90 to-gray-50/90 
        backdrop-blur-2xl border border-white/30
        hover:border-purple-300/60 hover:from-white hover:to-purple-50/50
        transform hover:scale-105 hover:-translate-y-1
        ring-1 ring-white/20 hover:ring-purple-300/40
    `.replace(/\s+/g, ' ').trim();
    listItem.setAttribute('data-action', action);
    
    const backgroundGradient = document.createElement('div');
    backgroundGradient.className = `
        absolute inset-0 opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-purple-500/15 via-pink-500/15 to-blue-500/15
        transition-opacity duration-700
        rounded-2xl
    `.replace(/\s+/g, ' ').trim();
    
    const particles = document.createElement('div');
    particles.className = 'absolute inset-0 pointer-events-none overflow-hidden rounded-2xl';
    particles.innerHTML = `
        <div class="absolute top-2 left-2 w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-ping transition-all duration-1000"></div>
        <div class="absolute top-3 right-3 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-pulse transition-all duration-1000 delay-300"></div>
        <div class="absolute bottom-3 left-4 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-70 group-hover:animate-bounce transition-all duration-1000 delay-500"></div>
    `;
    
    const button = document.createElement('button');
    button.setAttribute('data-action', action);
    button.className = `
        relative w-full h-full flex items-center
        px-4 py-3 ${textColor} font-semibold
        transition-all duration-700 ease-out
        focus:outline-none focus:ring-2 focus:ring-purple-500/50
        rounded-2xl
    `.replace(/\s+/g, ' ').trim();
    
    const iconWrapper = document.createElement('div');
    iconWrapper.setAttribute('data-action', action); 
    iconWrapper.className = `
        relative flex-shrink-0 w-10 h-10 
        rounded-xl ${iconBgColor} ${iconBorderColor}
        border-2 shadow-lg
        flex items-center justify-center
        transition-all duration-500 ease-out
        group-hover:scale-110 group-hover:rotate-6
        group-hover:shadow-xl group-hover:shadow-purple-500/30
        before:absolute before:inset-0 before:rounded-xl
        before:bg-gradient-to-br before:from-white/40 before:to-transparent
        before:opacity-0 group-hover:before:opacity-100
        before:transition-opacity before:duration-500
        ring-1 ring-white/20 group-hover:ring-purple-300/50
    `.replace(/\s+/g, ' ').trim();
    iconWrapper.innerHTML = icon;

    const svgElement = iconWrapper.querySelector('svg');
    if (svgElement) {
        svgElement.setAttribute('data-action', action);
        const paths = svgElement.querySelectorAll('path');
        paths.forEach(path => path.setAttribute('data-action', action));
    }
    
    const textWrapper = document.createElement('div');
    textWrapper.setAttribute('data-action', action);
    textWrapper.className = `
        flex-1 min-w-0 ml-4 
        transform translate-x-full opacity-0
        group-hover:translate-x-0 group-hover:opacity-100
        transition-all duration-700 ease-out delay-100
        overflow-hidden
    `.replace(/\s+/g, ' ').trim();
    
    const textElement = document.createElement('span');
    textElement.setAttribute('data-action', action);
    textElement.className = `
        block text-lg font-bold tracking-wide
        bg-gradient-to-r from-gray-800 to-gray-600
        bg-clip-text text-transparent
        group-hover:from-purple-700 group-hover:to-pink-600
        transition-all duration-500
        drop-shadow-sm
    `.replace(/\s+/g, ' ').trim();
    textElement.textContent = text;
    
    const arrow = document.createElement('div');
    arrow.setAttribute('data-action', action);
    arrow.className = `
        flex-shrink-0 w-6 h-6 ml-auto
        transform translate-x-full opacity-0
        group-hover:translate-x-0 group-hover:opacity-100
        transition-all duration-700 delay-200
        text-purple-500 drop-shadow-sm
    `.replace(/\s+/g, ' ').trim();
    arrow.innerHTML = `
        <svg class="w-full h-full transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-action="${action}">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" data-action="${action}"></path>
        </svg>
    `;
    
    const glowBorder = document.createElement('div');
    glowBorder.className = `
        absolute inset-0 rounded-2xl
        bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500
        opacity-0 group-hover:opacity-40
        transition-opacity duration-700
        blur-md -z-10 scale-110
    `.replace(/\s+/g, ' ').trim();
    
    textWrapper.appendChild(textElement);
    
    button.appendChild(iconWrapper);
    button.appendChild(textWrapper);
    button.appendChild(arrow);
    
    listItem.appendChild(backgroundGradient);
    listItem.appendChild(particles);
    listItem.appendChild(glowBorder);
    listItem.appendChild(button);
    
    container.appendChild(listItem);
}

function getPlayIcon(): string {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="play">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" data-action="play"></path>
        </svg>
    `;
}

function getSettingsIcon(): string {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="settings">
            <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" stroke-linejoin="round" stroke-linecap="round" data-action="settings"></path>
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke-linejoin="round" stroke-linecap="round" data-action="settings"></path>
        </svg>
    `;
}

function getProfileIcon(): string {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="profile">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" data-action="profile"></path>
        </svg>
    `;
}

function getTournamentIcon(): string {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="tournament">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.135 25.135 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" data-action="tournament"></path>
        </svg>
    `;
}

function getExitIcon(): string {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="exit">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" data-action="exit"></path>
        </svg>
    `;
}
