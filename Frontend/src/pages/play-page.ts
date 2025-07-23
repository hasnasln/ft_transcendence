import { exmp } from '../languageMeneger';
import { gameInstance } from './play';
import { Page } from '../router';

function getMenu(): string {
  const buttonData = [
    { id: 'btn-vs-computer', text: exmp.getLang("game.vs-compiter-b"), icon: '🤖', gradient: 'from-blue-500/20 to-cyan-500/20', hover: 'hover:from-blue-500/30 hover:to-cyan-500/30', border: 'border-blue-400/30 hover:border-blue-400/50', shadow: 'hover:shadow-blue-500/25' },
    { id: 'btn-find-rival', text: exmp.getLang("game.find-reval-b"), icon: '⚔️', gradient: 'from-purple-500/20 to-pink-500/20', hover: 'hover:from-purple-500/30 hover:to-pink-500/30', border: 'border-purple-400/30 hover:border-purple-400/50', shadow: 'hover:shadow-purple-500/25' },
    { id: 'btn-local', text: exmp.getLang("game.local-game"), icon: '🏠', gradient: 'from-green-500/20 to-emerald-500/20', hover: 'hover:from-green-500/30 hover:to-emerald-500/30', border: 'border-green-400/30 hover:border-green-400/50', shadow: 'hover:shadow-green-500/25' },
    { id: 'tournament', text: exmp.getLang("game.tournament"), icon: '🏆', gradient: 'from-yellow-500/20 to-orange-500/20', hover: 'hover:from-yellow-500/30 hover:to-orange-500/30', border: 'border-yellow-400/30 hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-500/25' }
  ];
  
  return `<div id="menu" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] max-w-2xl rounded-3xl flex flex-col justify-center items-center gap-6 z-10  p-8" style="
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
      <div class="text-center mb-6">
        <h2 class="text-white text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">PONG ARENA</h2>
        <div class="w-32 h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mx-auto rounded-full" style="box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);"></div>
        <p class="text-cyan-200/80 text-lg mt-3 font-medium">Oyun modunu seçin</p>
      </div>
      ${buttonData.map(({id, text, icon, gradient, hover, border, shadow}) => `
        <div class="group relative w-full max-w-md">
          <button id="${id}" class="modern-menu-button relative w-full h-16 bg-gradient-to-r ${gradient} ${hover} text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer backdrop-blur-sm shadow-lg ${shadow} overflow-hidden flex items-center justify-center gap-3" style="
			border: 1px solid rgba(0, 255, 255, 0.3);
			box-shadow: 0 0 15px rgba(0, 255, 255, 0.2), inset 0 0 15px rgba(0, 255, 255, 0.05);
		  ">
            <div class="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span class="text-2xl filter drop-shadow-lg">${icon}</span>
            <span class="relative z-10 text-cyan-100">${text}</span>
            <div class="absolute right-4 transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
              <svg class="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        </div>
      `).join('')}
    </div>`;
}

function getDifficulty(): string {
  return `<div id="difficulty" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[60%] rounded-3xl flex flex-col justify-center items-center gap-6 z-10 hidden" style="
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
        <h3 class="text-white text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Zorluk Seviyesi Seçin</h3>
        <div class="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto mt-2 rounded-full" style="box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);"></div>
      </div>
      <button data-level="easy" class="modern-difficulty-button easy group relative w-[80%] h-[15%] text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden" style="
		background: linear-gradient(135deg, rgba(0, 255, 0, 0.15), rgba(0, 200, 100, 0.15));
		border: 1px solid rgba(0, 255, 100, 0.4);
		box-shadow: 0 0 20px rgba(0, 255, 100, 0.3), inset 0 0 20px rgba(0, 255, 100, 0.05);
		backdrop-filter: blur(10px);
	  ">
        <div class="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span class="relative z-10 text-green-200">${exmp.getLang("game.vs-compiter-difficulty-b-easy")}</span>
      </button>
      <button data-level="medium" class="modern-difficulty-button medium group relative w-[80%] h-[15%] text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden" style="
		background: linear-gradient(135deg, rgba(255, 200, 0, 0.15), rgba(255, 150, 0, 0.15));
		border: 1px solid rgba(255, 200, 0, 0.4);
		box-shadow: 0 0 20px rgba(255, 200, 0, 0.3), inset 0 0 20px rgba(255, 200, 0, 0.05);
		backdrop-filter: blur(10px);
	  ">
        <div class="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span class="relative z-10 text-yellow-200">${exmp.getLang("game.vs-compiter-difficulty-b-medium")}</span>
      </button>
      <button data-level="hard" class="modern-difficulty-button hard group relative w-[80%] h-[15%] text-white text-xl font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden" style="
		background: linear-gradient(135deg, rgba(255, 0, 100, 0.15), rgba(255, 0, 150, 0.15));
		border: 1px solid rgba(255, 0, 100, 0.4);
		box-shadow: 0 0 20px rgba(255, 0, 100, 0.3), inset 0 0 20px rgba(255, 0, 100, 0.05);
		backdrop-filter: blur(10px);
	  ">
        <div class="absolute inset-0 bg-gradient-to-r from-red-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span class="relative z-10 text-red-200">${exmp.getLang("game.vs-compiter-difficulty-b-hard")}</span>
      </button>
    </div>`;
}

export class PlayPage implements Page {

	public evaluate(): string {
		return retroGridBackground(getDifficulty() + getMenu());
	}

	public onLoad(): void {
    	gameInstance.startPlayProcess(false);
	}
}

export function retroGridBackground(inner: string) {
	return `
		<div class="w-[100%] min-h-screen relative flex justify-center items-center flex-col overflow-hidden" style="
			background: 
				linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 30, 0.95)),
				radial-gradient(circle at 20% 80%, rgba(0, 255, 255, 0.08) 0%, transparent 50%),
				radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.08) 0%, transparent 50%),
				radial-gradient(circle at 40% 40%, rgba(0, 255, 255, 0.05) 0%, transparent 70%);
		">
			<div class="absolute inset-0 pointer-events-none" style="
				background-image: 
					linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
					linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
				background-size: 50px 50px;
				animation: gridPulse 4s ease-in-out infinite;
			"></div>
			<div class="absolute inset-0 pointer-events-none" style="
				background-image: 
					linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
					linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
				background-size: 20px 20px;
				animation: gridPulse 6s ease-in-out infinite reverse;
			"></div>
			<div class="absolute inset-0 overflow-hidden pointer-events-none">
				<div class="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-xl" style="animation: floatingOrbs 8s ease-in-out infinite;"></div>
				<div class="absolute top-[70%] right-[15%] w-24 h-24 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl" style="animation: floatingOrbs 6s ease-in-out infinite reverse;"></div>
				<div class="absolute bottom-[20%] left-[60%] w-20 h-20 rounded-full bg-gradient-to-r from-green-400/10 to-cyan-400/10 blur-xl" style="animation: floatingOrbs 10s ease-in-out infinite;"></div>
			</div>
			${inner}
		</div>`
}