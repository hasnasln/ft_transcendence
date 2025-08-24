import { Settings } from './Settings';
import { Profile } from './profile';
import { exmp } from '../lang/languageManager';
import { Router } from '../router';
export class HomePage {
    evaluate() {
        const profiles = [
            {
                name: "AYHAN COŞGUN",
                linkedin: "https://www.linkedin.com/in/ayhan-coşgun-8324392b9",
                github: "https://github.com/AyhanCosgun",
                avatar: "creaters/acosgun.webp"
            },
            {
                name: "HAMZA COŞKUN",
                linkedin: "https://www.linkedin.com/in/hamza-cskn",
                github: "https://github.com/hamza-cskn",
                avatar: "creaters/hcoskun.webp"
            },
            {
                name: "FATMANUR ÇETİNTAŞ",
                linkedin: "https://www.linkedin.com/in/fatmanurcetintas",
                github: "https://github.com/facetint",
                avatar: "creaters/facetint.webp"
            },
            {
                name: "BATUHAN KAS",
                linkedin: "https://www.linkedin.com/in/batuhan-kaş-545689254",
                github: "https://github.com/BatuhanKas",
                avatar: "creaters/bkas.webp"
            },
            {
                name: "HASAN ASLAN",
                linkedin: "https://www.linkedin.com/in/hasan-aslan-",
                github: "https://github.com/hasnasln",
                avatar: "creaters/haslan.webp"
            }
        ];
        const profileCards = profiles.map(profile => profileCard(profile.name, profile.linkedin, profile.github, profile.avatar)).join('');
        const hideOnSmall = window.innerWidth < 1024 || window.innerHeight < 600 ? 'opacity-0 pointer-events-none' : '';
        return `<div id="maindiv" class="relative min-h-screen w-full overflow-hidden" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #1e3a8a 75%, #1e40af 100%)">
					<div class="absolute inset-0 overflow-hidden pointer-events-none">
						<div class="absolute inset-0 opacity-5">
							<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
								<defs>
									<pattern id="homeGrid" width="50" height="50" patternUnits="userSpaceOnUse">
										<path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" stroke-width="0.5"/>
									</pattern>
								</defs>
								<rect width="100%" height="100%" fill="url(#homeGrid)" />
							</svg>
						</div>
						
						<div class="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-float"></div>
						<div class="absolute top-3/4 right-1/4 w-3 h-3 bg-cyan-300/25 rounded-full animate-float-delayed"></div>
						<div class="absolute top-1/2 left-3/4 w-1 h-1 bg-indigo-300/40 rounded-full animate-float-slow"></div>
						<div class="absolute bottom-1/4 left-1/2 w-2 h-2 bg-blue-300/30 rounded-full animate-float"></div>
						<div class="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-sky-300/25 rounded-full animate-float-delayed"></div>
						<div class="absolute bottom-1/3 left-1/3 w-2 h-2 bg-blue-400/20 rounded-full animate-float-slow"></div>
					</div>

					<div class="relative z-10 min-h-screen w-full flex flex-col justify-between items-center py-6 px-4 lg:py-8 lg:px-8">
						<div class="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto text-center space-y-4 lg:space-y-6">
							<div class="flex flex-col items-center justify-center text-center space-y-2 lg:space-y-3">
								<h1 class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-center bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent tracking-tight leading-none animate-pulse drop-shadow-2xl">
									TRANSCENDENCE
								</h1>
							</div>

							<div class="flex items-center justify-center w-full">
								<ul class="flex flex-col gap-3 p-6 bg-white/10 backdrop-blur-3xl rounded-3xl border border-white/20 shadow-2xl w-fit transition-all duration-700 hover:bg-white/15 hover:border-white/30 hover:shadow-blue-500/30 hover:shadow-2xl ring-1 ring-white/10">
									${mainMenuButton('home.play-b', 'play', 'bg-violet-400', 'border-violet-400', 'text-purple-800', 'border-purple-300', 'bg-purple-100', getPlayIconHTML())}
									${mainMenuButton('home.settings-b', 'settings', 'bg-indigo-400', 'border-indigo-400', 'text-blue-800', 'border-blue-300', 'bg-blue-100', getSettingsIconHTML())}
									${mainMenuButton('home.profile-b', 'profile', 'bg-blue-500', 'border-blue-500', 'text-green-800', 'border-green-300', 'bg-green-100', getProfileIconHTML())}
									${mainMenuButton('home.tournament-b', 'tournament', 'bg-red-400', 'border-red-400', 'text-orange-800', 'border-orange-300', 'bg-orange-100', getTournamentIconHTML())}
									${mainMenuButton('home.logout-b', 'exit', 'bg-gray-500', 'border-gray-500', 'text-red-800', 'border-red-300', 'bg-red-100', getExitIconHTML())}
								</ul>
							</div>
						</div>

						<div class="w-full max-w-7xl mx-auto pb-6 lg:pb-8">
							<div id="profileCardsContainer" class="flex flex-wrap justify-center items-center gap-1 md:gap-2 lg:gap-3 xl:gap-4 transition-all duration-500 px-1 md:px-2 lg:px-4 ${hideOnSmall}">
								${profileCards}
							</div>
						</div>
					</div>
				</div>`;
    }
    onLoad() {
        document.addEventListener('click', this.handleClick);
        exmp.applyLanguage();
    }
    handleClick = (event) => {
        switch (event.target.getAttribute('data-action')) {
            case 'play':
                Router.getInstance().go('/play');
                return;
            case 'settings':
                this.handleSettings();
                return;
            case 'profile':
                this.handleProfile();
                return;
            case 'tournament':
                Router.getInstance().go('/tournament');
                return;
            case 'exit':
                this.handleExit();
                return;
        }
    };
    handleExit() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        Router.getInstance().go('/login');
    }
    handleSettings() {
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
        new Settings().onLoad();
    }
    handleProfile() {
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
        new Profile().onLoad();
    }
}
function profileCard(name, linkedin, github, avatar) {
    return `
		<div class="profile-card w-[160px] h-[220px] md:w-[180px] md:h-[240px] lg:w-[200px] lg:h-[260px] xl:w-[220px] xl:h-[280px] group cursor-pointer transform transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100">
			<div class="relative w-full h-full bg-gradient-to-br from-blue-400 via-cyan-500 to-indigo-500 rounded-xl p-[2px] overflow-hidden transition-all duration-500 hover:scale-105 hover:rotate-1">
				<div class="absolute inset-0 bg-white/20 rounded-xl"></div>
				
				<div class="relative w-full h-full bg-white/90 rounded-xl p-3 md:p-4 flex flex-col items-center justify-between overflow-hidden">
					<div class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
						<div class="absolute top-[10%] left-[20%] w-1 h-1 bg-blue-300 rounded-full opacity-60 animate-float"></div>
						<div class="absolute top-[30%] right-[15%] w-1.5 h-1.5 bg-cyan-300 rounded-full opacity-40 animate-float-delayed"></div>
						<div class="absolute bottom-[20%] left-[10%] w-1 h-1 bg-indigo-300 rounded-full opacity-50 animate-float-slow"></div>
					</div>
					
					<div class="relative z-10 flex flex-col items-center">
						<div class="relative mb-2 md:mb-3">
							<div class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 animate-spin-slow opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
							
							<img 
								src="${avatar}" 
								alt="${name}" 
								class="relative z-10 size-12 md:size-16 lg:size-18 xl:size-20 rounded-full object-cover border-2 md:border-3 border-white shadow-xl group-hover:scale-110 transition-all duration-300"
							/>
							
							<div class="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-400 rounded-full border border-white shadow-lg animate-pulse"></div>
						</div>
						
						<div class="text-center mb-2 md:mb-3">
							<h1 class="text-xs md:text-sm lg:text-base font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
								${name}
							</h1>
							<p class="text-xs text-gray-600 font-medium">Full Stack Developer</p>
						</div>
					</div>
					
					<div class="relative z-10 w-full space-y-1 md:space-y-2">
						<a href="${linkedin}" target="_blank" rel="noopener noreferrer" 
							class="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-white/20 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300 group/link">
							<div class="w-4 h-4 md:w-5 md:h-5 bg-blue-600 rounded flex items-center justify-center group-hover/link:scale-110 transition-transform duration-300">
								<svg class="w-2 h-2 md:w-3 md:h-3 fill-white" viewBox="0 0 24 24">
									<path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 10.268h-3v-4.604c0-1.099-.021-2.513-1.532-2.513-1.532 0-1.768 1.197-1.768 2.434v4.683h-3v-9h2.881v1.233h.041c.401-.761 1.379-1.563 2.841-1.563 3.039 0 3.6 2.001 3.6 4.599v4.731z"/>
								</svg>
							</div>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-medium text-gray-700 group-hover/link:text-blue-600 transition-colors duration-300">LinkedIn</p>
							</div>
						</a>
						
						<a href="${github}" target="_blank" rel="noopener noreferrer"
							class="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-white/20 hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 group/link">
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
		</div>
	`;
}
function mainMenuButton(langkey, action, floaterBgColor, floaterBorderColor, textColor, iconBorderColor, iconBgColor, icon) {
    return `
		<li class="group relative w-80 h-14 overflow-hidden rounded-2xl transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-2xl border border-white/30 hover:border-blue-300/60 hover:from-white hover:to-blue-50/50 transform hover:scale-105 hover:-translate-y-1 ring-1 ring-white/20 hover:ring-blue-300/40" data-action="${action}">
			<div class="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-500/15 via-cyan-500/15 to-indigo-500/15 transition-opacity duration-700 rounded-2xl"></div>
			
			<div class="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
				<div class="absolute top-2 left-2 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-80 group-hover:animate-ping transition-all duration-1000"></div>
				<div class="absolute top-3 right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-60 group-hover:animate-pulse transition-all duration-1000 delay-300"></div>
				<div class="absolute bottom-3 left-4 w-1 h-1 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-70 group-hover:animate-bounce transition-all duration-1000 delay-500"></div>
			</div>
			
			<button data-action="${action}" class="relative w-full h-full flex items-center px-2 py-2 ${textColor} font-semibold transition-all duration-700 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl">
				<div data-action="${action}" class="relative flex-shrink-0 w-10 h-10 rounded-xl ${iconBgColor} ${iconBorderColor} border-2 shadow-lg flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl group-hover:shadow-blue-500/30 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/40 before:to-transparent before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-500 ring-1 ring-white/20 group-hover:ring-blue-300/50">
					${icon}
				</div>
				
				<div data-action="${action}" class="flex-1 min-w-0 ml-4 transform translate-x-0 opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out delay-100 overflow-hidden">
					<span 
						data-action="${action}" 
						data-langm-key="${langkey}" 
						class="block text-lg font-bold tracking-wide text-black group-hover:bg-gradient-to-r group-hover:from-blue-700 group-hover:to-cyan-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500 drop-shadow-sm">
					</span>
				</div>
				
				<div data-action="${action}" class="flex-shrink-0 w-6 h-6 ml-auto transform translate-x-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-700 delay-200 text-blue-500 drop-shadow-sm">
					<svg class="w-full h-full transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-action="${action}">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" data-action="${action}"></path>
					</svg>
				</div>
			</button>
			
			<div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-40 transition-opacity duration-700 blur-md -z-10 scale-110"></div>
		</li>
	`;
}
function getPlayIconHTML() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="play">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" data-action="play"></path>
        </svg>
    `;
}
function getSettingsIconHTML() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="settings">
            <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" stroke-linejoin="round" stroke-linecap="round" data-action="settings"></path>
            <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke-linejoin="round" stroke-linecap="round" data-action="settings"></path>
        </svg>
    `;
}
function getProfileIconHTML() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="profile">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" data-action="profile"></path>
        </svg>
    `;
}
function getTournamentIconHTML() {
    return `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="tournament">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.228a25.135 25.135 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" data-action="tournament"></path>
        </svg>
    `;
}
function getExitIconHTML() {
    return `
        <svg id= "asdadas" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" data-action="exit">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" data-action="exit"></path>
        </svg>
    `;
}
