import { exmp } from '../lang/languageManager';
import { gameInstance } from './play';
import { Router } from '../router';
import { GameEventBus, listenGameBusEvents } from './game-section/gameEventBus';
function getMenu() {
    const buttonData = [
        {
            id: 'btn-vs-computer',
            key: "play.Menu.Button.AI",
            icon: '<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v5m-3 0h6M4 11h16M5 15h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1Z"/></svg>',
            gradient: 'from-blue-500/20 to-cyan-500/20',
            hover: 'hover:from-blue-500/30 hover:to-cyan-500/30',
            border: 'border-blue-400/30 hover:border-blue-400/50',
            shadow: 'hover:shadow-blue-500/25'
        },
        {
            id: 'btn-find-rival',
            key: "play.Menu.Button.Online",
            icon: '<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 10.5h.01m-4.01 0h.01M8 10.5h.01M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-6.6a1 1 0 0 0-.69.275l-2.866 2.723A.5.5 0 0 1 8 18.635V17a1 1 0 0 0-1-1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/></svg>',
            gradient: 'from-purple-500/20 to-pink-500/20',
            hover: 'hover:from-purple-500/30 hover:to-pink-500/30',
            border: 'border-purple-400/30 hover:border-purple-400/50',
            shadow: 'hover:shadow-purple-500/25'
        },
        {
            id: 'btn-local',
            key: "play.Menu.Button.Local",
            icon: '<svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/></svg>',
            gradient: 'from-green-500/20 to-emerald-500/20',
            hover: 'hover:from-green-500/30 hover:to-emerald-500/30',
            border: 'border-green-400/30 hover:border-green-400/50',
            shadow: 'hover:shadow-green-500/25'
        },
        {
            id: "go-home",
            icon: "<svg class='w-6 h-6' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'><path stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M19 12H5m7-7-7 7 7 7'/></svg>",
            key: "play.Menu.Button.Home",
            gradient: 'from-gray-500/20 to-gray-600/20',
            hover: 'hover:from-gray-500/30 hover:to-gray-600/30',
            shadow: 'hover:shadow-gray-500/25',
        }
    ];
    return `<div id="menu"
  class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
		w-[95%] sm:w-[80%] md:w-[80%] lg:w-[50%]
		h-[95%] sm:h-[80%] md:h-[80%] lg:h-[65%]
		py-10 rounded-3xl flex flex-col justify-center items-center gap-2 z-10"
  style="
	background: 
	  linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 30, 0.95)),
	  radial-gradient(circle at center, rgba(0, 255, 255, 0.05) 0%, transparent 70%),
	  linear-gradient(rgba(0, 255, 255, 0.08) 1px, transparent 1px),
	  linear-gradient(90deg, rgba(0, 255, 255, 0.08) 1px, transparent 1px);
	background-size: auto, auto, 30px 30px, 30px 30px;
	backdrop-filter: blur(20px);
	border: 2px solid #00ffff;
	box-shadow: 
	  0 0 30px rgba(0, 255, 255, 0.4),
	  inset 0 0 30px rgba(0, 255, 255, 0.1),
	  0 25px 50px -12px rgba(0, 0, 0, 0.5);
	animation: borderGlow 3s ease-in-out infinite;
  ">
  
  <div class="text-center mb-6 px-4">
	<h2 data-langm-key="play.Menu.title"
		class="text-white text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
	  
	</h2>
	<p data-langm-key="play.Menu.subTitle"
	   class="text-cyan-200/80 text-base sm:text-lg mt-3 font-medium">
	  
	</p>
  </div>

  ${buttonData.map(({ id, key, icon, gradient, hover, shadow }) => `
	<div class="group relative
		w-full sm:w-[90%] md:w-[80%] lg:w-[70%]
		h-[10%] md:h-[12%] lg:h-[15%]
		px-2 sm:px-6">
	  <button id="${id}"
		class="relative w-full h-full bg-gradient-to-r ${gradient} ${hover} text-white text-lg sm:text-xl font-semibold rounded-2xl transition-all duration-300 transform cursor-pointer backdrop-blur-sm shadow-lg ${shadow} overflow-hidden flex items-center justify-center gap-3"
		style="border: 1px solid rgba(0, 255, 255, 0.3);
			   box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.05);">
		
		<div class="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
		
		<span class="text-xl sm:text-2xl filter drop-shadow-lg">${icon}</span>
		
		<span data-langm-key="${key}"
			  class="relative z-10 text-cyan-100"></span>

		<div class="absolute right-4 transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
		  ${id === 'go-home' ? '' :
        `<svg class="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
		   </svg>`}
		</div>
	  </button>
	</div>
  `).join('')}

</div> `;
}
function getDifficulty() {
    return `<div id="difficulty" class="
		w-[95%] sm:w-[80%] md:w-[80%] lg:w-[50%]
		h-[95%] sm:h-[80%] md:h-[80%] lg:h-[50%]
 		absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-3xl flex flex-col justify-center items-center gap-6 z-10 hidden" style="
		background: 
			linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 30, 0.95)),
			radial-gradient(circle at center, rgba(0, 255, 255, 0.05) 0%, transparent 70%),
			linear-gradient(rgba(0, 255, 255, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 255, 255, 0.08) 1px, transparent 1px);
		background-size: auto, auto, 30px 30px, 30px 30px;
		backdrop-filter: blur(20px);
		border: 2px solid #00ffff;
		box-shadow: 
			0 0 30px rgba(0, 255, 255, 0.4),
			inset 0 0 30px rgba(0, 255, 255, 0.1),
			0 25px 50px -12px rgba(0, 0, 0, 0.5);
		animation: borderGlow 3s ease-in-out infinite;
	">
		<div class="text-center mb-4">
			<h3
			data-langm-key="play.Difficulty.title"
			class="text-white text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
			</h3>
			<div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mt-2 rounded-full" style="box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);">
			</div>
		</div>
		<button id="difficulty-easy" class=" easy group relative w-[80%] h-14 text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform  cursor-pointer overflow-hidden" style="
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.15), rgba(0, 200, 100, 0.15));
		border: 1px solid rgba(0, 255, 100, 0.4);
		box-shadow: 0 0 20px rgba(0, 255, 100, 0.3), inset 0 0 20px rgba(0, 255, 100, 0.05);
		backdrop-filter: blur(10px);
		">
			<div class="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<span
			data-langm-key="play.Difficulty.Button.easy"
			class="relative z-10 text-green-200">
			</span>
		</button>
		<button id="difficulty-medium" class=" medium group relative w-[80%] h-14 text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform  cursor-pointer overflow-hidden" style="
		background: linear-gradient(135deg, rgba(255, 200, 0, 0.15), rgba(255, 150, 0, 0.15));
		border: 1px solid rgba(255, 200, 0, 0.4);
		box-shadow: 0 0 20px rgba(255, 200, 0, 0.3), inset 0 0 20px rgba(255, 200, 0, 0.05);
		backdrop-filter: blur(10px);
		">
			<div class="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<span
			data-langm-key="play.Difficulty.Button.medium"
			class="relative z-10 text-yellow-200">
			</span>
		</button>
		<button id="difficulty-hard" class=" hard group relative w-[80%] h-14 text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform  cursor-pointer overflow-hidden" style="
		background: linear-gradient(135deg, rgba(255, 0, 100, 0.15), rgba(255, 0, 150, 0.15));
		border: 1px solid rgba(255, 0, 100, 0.4);
		box-shadow: 0 0 20px rgba(255, 0, 100, 0.3), inset 0 0 20px rgba(255, 0, 100, 0.05);
		backdrop-filter: blur(10px);
		">
			<div class="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
			<span
			data-langm-key="play.Difficulty.Button.hard"
			class="relative z-10 text-red-200">
			</span>
		</button">
			${getGoBackButton()}
	</div>`;
}
function getGoBackButton() {
    return `
		<button id="go-back-p" class="
		bg-red-500 text-white home group w-[50px] h-[50px] border border-red-600 rounded-full
		flex items-center justify-center
		hover:bg-red-600 hover:border-red-700 hover:shadow-red-500/25 hover:shadow-lg hover:scale-105
		transition-all duration-300 transform  cursor-pointer"
			style="
				padding: 0.5rem;
			">
			<svg class="w-6 h-6 text-white group-hover:text-gray-300 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 12H5m7-7-7 7 7 7"/></svg>
		</button>
	</div>`;
}
export class PlayPage {
    evaluate() {
        return retroGridBackground(getDifficulty() + getMenu());
    }
    onLoad() {
        Promise.all([Router.getInstance().preloadLazyPage("/game"), gameInstance.preparePlayProcess(false)])
            .then(() => Router.getInstance().go("/game"))
            .then(() => {
            requestAnimationFrame(() => {
                Router.getInstance().invalidatePage('/play');
                listenGameBusEvents();
                gameInstance.startPlayProcess();
            });
        });
        exmp.applyLanguage();
    }
    chooseMode(mode) {
        GameEventBus.getInstance().emit({ type: 'GAME_MODE_CHOSEN', payload: { mode } });
    }
    chooseAIDifficulty(level) {
        GameEventBus.getInstance().emit({ type: 'AI_DIFFICULTY_CHOSEN', payload: { level } });
    }
    goBack() {
        console.log("Going back to the previous page");
        // gameInstance.finalize();
        Router.getInstance().invalidatePage("/game");
        Router.getInstance().invalidatePage("/play");
        Router.getInstance().go("/play", true);
    }
    goHome() {
        Router.getInstance().go('/');
    }
    onButtonClick(buttonId) {
        switch (buttonId) {
            case 'btn-vs-computer':
                return this.chooseMode('vsAI');
            case 'btn-find-rival':
                return this.chooseMode('remoteGame');
            case 'btn-local':
                return this.chooseMode('localGame');
            case 'difficulty-easy':
                return this.chooseAIDifficulty('easy');
            case 'difficulty-medium':
                return this.chooseAIDifficulty('medium');
            case 'difficulty-hard':
                return this.chooseAIDifficulty('hard');
            case 'go-home':
                return this.goHome();
            case 'go-back-p':
                return this.goBack();
            default:
                console.warn(`Unknown button clicked: ${buttonId}`);
                break;
        }
    }
}
export function retroGridBackground(inner) {
    return `
	<div class="min-h-screen min-w-screen
	relative flex justify-center items-center overflow-hidden"
	style="
		background:
		linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 30, 0.95)),
		radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
		radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.08) 0%, transparent 50%),
		radial-gradient(circle at 40% 40%, rgba(0, 255, 255, 0.05) 0%, transparent 70%);
	">
		<div class="absolute inset-0 pointer-events-none"
			style="
				background-image: 
				linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
				linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
				background-size: 50px 50px;
				animation: gridPulse 4s ease-in-out infinite;
			">
		</div>
		<div class="absolute inset-0 pointer-events-none"
			style="
				background-image: 
				linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
				linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
				background-size: 20px 20px;
				animation: gridPulse 6s ease-in-out infinite reverse;
			">
		</div>
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="absolute top-[10%] left-[10%] w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full 
						bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-xl"
					style="animation: floatingOrbs 8s ease-in-out infinite;">
			</div>
			<div class="absolute top-[70%] right-[15%] w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full 
						bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl"
					style="animation: floatingOrbs 6s ease-in-out infinite reverse;">
			</div>
			<div class="absolute bottom-[20%] left-[60%] w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full 
						bg-gradient-to-r from-green-400/10 to-cyan-400/10 blur-xl"
					style="animation: floatingOrbs 10s ease-in-out infinite;">
			</div>
 		</div>
		${inner}
	</div>`;
}
