import { exmp } from '../languageMeneger';
import { gameInstance } from './play';
import { loadingWithMessage } from '../components/loading';
import { Page } from '../router';

function getScoreBoard(): string {
  return `
    <div id="scoreboard" class="scoreboard-card absolute top-[3%] left-1/2 -translate-x-1/2 hidden z-10">
      <div data-status="inprogress" class="teams">
        <span class="team-info team-home">
          <span class="team-info-container">
            <span id="blue-team" class="team-name-info">P1</span>
          </span>
        </span>
        <span class="event-scoreboard">
          <span class="event-score-container">
            <span class="current-time-container">
              <span class="event-current-time">
                <span id="roundNo" class="event-clock">(Round 1)</span>
                <span class="current-part">PONG</span>
              </span>
              <span class="progress-dots" data-progress="1S">
                <span class="load"></span>
              </span>
            </span>
            <span class="score-container">
              <span id="score-home" class="score-home">0</span>
              <span class="custom-sep">-</span>
              <span id="score-away" class="score-away">0</span>
            </span>
          </span>
        </span>
        <span class="team-info team-away">
          <span class="team-info-container">
            <span id="red-team" class="team-name-info">P2</span>
          </span>
        </span>
      </div>
    </div>
    <div id="tournamentIdDiv" class="absolute top-[15%] left-1/2 -translate-x-1/2 hidden px-[1.5vw] py-[0.3vw] bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)] border-2 border-[#555] rounded-[12px] shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)] font-sans text-[1vw] text-[#eee] z-10">
      <span id="tournamentCode" class="text-blue-500">Turnuva ID : </span>
    </div>
  `;
}

function getMenu(): string {
  const buttonData = [
    { id: 'btn-vs-computer', text: exmp.getLang("game.vs-compiter-b"), icon: '🤖', gradient: 'from-blue-500/20 to-cyan-500/20', hover: 'hover:from-blue-500/30 hover:to-cyan-500/30', border: 'border-blue-400/30 hover:border-blue-400/50', shadow: 'hover:shadow-blue-500/25' },
    { id: 'btn-find-rival', text: exmp.getLang("game.find-reval-b"), icon: '⚔️', gradient: 'from-purple-500/20 to-pink-500/20', hover: 'hover:from-purple-500/30 hover:to-pink-500/30', border: 'border-purple-400/30 hover:border-purple-400/50', shadow: 'hover:shadow-purple-500/25' },
    { id: 'btn-local', text: exmp.getLang("game.local-game"), icon: '🏠', gradient: 'from-green-500/20 to-emerald-500/20', hover: 'hover:from-green-500/30 hover:to-emerald-500/30', border: 'border-green-400/30 hover:border-green-400/50', shadow: 'hover:shadow-green-500/25' },
    { id: 'tournament', text: exmp.getLang("game.tournament"), icon: '🏆', gradient: 'from-yellow-500/20 to-orange-500/20', hover: 'hover:from-yellow-500/30 hover:to-orange-500/30', border: 'border-yellow-400/30 hover:border-yellow-400/50', shadow: 'hover:shadow-yellow-500/25' }
  ];
  
  return `<div id="menu" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] max-w-2xl rounded-3xl flex flex-col justify-center items-center gap-6 z-10 hidden p-8" style="
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
		return `
			<style>
				@keyframes borderGlow {
					0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
					50% { box-shadow: 0 0 60px rgba(0, 255, 255, 0.6), inset 0 0 50px rgba(0, 255, 255, 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.7); }
				}
				@keyframes floatingOrbs {
					0% { transform: translate(0, 0) rotate(0deg); }
					33% { transform: translate(30px, -30px) rotate(120deg); }
					66% { transform: translate(-20px, 20px) rotate(240deg); }
					100% { transform: translate(0, 0) rotate(360deg); }
				}
				@keyframes gridPulse {
					0%, 100% { opacity: 0.1; }
					50% { opacity: 0.3; }
				}
				@keyframes neonPulse {
					0%, 100% { 
						box-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff, 0 0 20px #00ffff;
					}
					50% { 
						box-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff, 0 0 40px #00ffff;
					}
				}
				@keyframes neonGlow {
					0%, 100% { 
						text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff, 0 0 15px #00ffff;
					}
					50% { 
						text-shadow: 0 0 8px #00ffff, 0 0 16px #00ffff, 0 0 24px #00ffff, 0 0 32px #00ffff;
					}
				}
				@keyframes loading_dots {
					0% {
						width: 3px;
						transform: translateX(0px);
					}
					40% {
						width: 3px;
						transform: translateX(57px);
					}
					75% {
						width: 100%;
						transform: translateX(0px);
					}
					100% {
						width: 3px;
						transform: translateX(0px);
					}
				}
				
				/* Scoreboard Styles */
				.scoreboard-card {
					display: none;
				}
				.scoreboard-card:not(.hidden) {
					display: block;
				}
				#tournamentIdDiv:not(.hidden) {
					display: flex;
					justify-content: center;
					align-items: center;
				}
				.scoreboard-card * {
					font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
				}
				.scoreboard-card .teams {
					display: flex;
					flex-wrap: nowrap;
					align-items: center;
					justify-content: center;
					background: linear-gradient(90deg, transparent, #111, transparent);
				}
				.scoreboard-card .teams > span {
					flex: 1;
					text-align: center;
					position: relative;
					font-size: 13px;
					text-wrap: nowrap;
				}
				.scoreboard-card .teams .team-name-info {
					text-wrap: nowrap;
					color: #ffffff;
					max-width: 210px;
					text-overflow: ellipsis;
					font-weight: 600;
					overflow: hidden;
					display: block;
				}
				.scoreboard-card .teams span.progress-dots {
					height: 3px;
					position: relative;
					width: 60px;
					display: block;
					overflow: hidden;
					margin: 0;
					border-radius: 10px;
				}
				.scoreboard-card .teams span.progress-dots .load {
					background: linear-gradient(90deg, #3a3dff, #ff2929);
					display: block;
					height: 1.5px;
					width: 3px;
					bottom: 0;
					position: absolute;
					transform: translateX(0px);
					animation: loading_dots 7.5s ease both infinite;
				}
				.scoreboard-card .teams .team-home,
				.scoreboard-card .teams .team-away {
					padding: 15px 37px;
					position: relative;
					overflow: hidden;
				}
				.scoreboard-card .teams .team-away {
					transform: skew(-41deg, 0deg);
					border-radius: 10px 10px 30px 10px;
				}
				.scoreboard-card .teams .team-home {
					border-radius: 10px 10px 10px 30px;
					transform: skew(41deg, 0deg);
				}
				.scoreboard-card .teams .team-home::after {
					position: absolute;
					top: -3px;
					background: #00caff;
					content: "";
					height: 23px;
					border-radius: 27px;
					left: -20px;
					filter: blur(2px);
					transform: rotate(208deg);
					width: 20px;
					box-shadow: 0px 0px 32px #00ffed;
				}
				.scoreboard-card .teams .team-home::before {
					position: absolute;
					bottom: -15px;
					background: #0048ff;
					content: "";
					height: 17px;
					border-radius: 80px;
					right: 0;
					filter: blur(1px);
					transform: translate(-50%, 0%);
					width: 80%;
					box-shadow: 0px 0px 32px #0026ff;
				}
				.scoreboard-card .teams .team-away::after {
					position: absolute;
					top: -3px;
					background: #cc9d00;
					content: "";
					height: 23px;
					border-radius: 27px;
					right: -20px;
					filter: blur(2px);
					transform: rotate(208deg);
					width: 20px;
					box-shadow: 0px 0px 32px #cc3700;
				}
				.scoreboard-card .teams .team-away::before {
					position: absolute;
					bottom: -15px;
					background: #ff0000;
					content: "";
					height: 17px;
					border-radius: 80px;
					left: 0;
					filter: blur(1px);
					transform: translate(50%, 0%);
					width: 80%;
					box-shadow: 0px 0px 32px #d50000;
				}
				.scoreboard-card .teams .team-home .team-name-info {
					transform: skew(-41deg, 0);
				}
				.scoreboard-card .teams .team-away .team-name-info {
					transform: skew(41deg, 0);
				}
				.scoreboard-card .event-scoreboard .event-score-container {
					display: flex;
					flex-wrap: wrap;
					padding: 10px;
					border-radius: 10px;
					width: fit-content;
					background: linear-gradient(#1e1e1e 0%, #0c0c0c8e 4%, #1a1419);
					box-shadow:
						inset 0 0 1px 0 #2c2c2c,
						0 0 20px 0 #1313139c;
					margin: 10px 0;
				}
				.scoreboard-card .event-scoreboard .event-score-container .score-container {
					font-size: 24px;
					background: linear-gradient(90deg, #3a3dff, #ff2929);
					-webkit-background-clip: text;
					width: 100%;
					-webkit-text-fill-color: transparent;
				}
				.scoreboard-card .event-scoreboard .event-score-container .current-time-container {
					font-size: 12px;
					margin-bottom: 8px;
					width: 100%;
					font-family: "SegoeUI";
					color: #a1a1a1;
					justify-content: center;
					text-align: center;
					display: flex;
					flex-direction: column;
					align-items: center;
					row-gap: 5px;
				}
				.scoreboard-card .event-scoreboard .event-score-container .current-time-container .event-clock {
					font-weight: 500;
					color: #eee;
					margin-right: 10px;
				}
				
				.modern-menu-button:hover {
					transform: translateY(-3px) scale(1.05) !important;
					animation: neonPulse 1.5s ease-in-out infinite !important;
					background: 
						linear-gradient(145deg, rgba(0, 40, 80, 0.9), rgba(0, 80, 120, 0.9)),
						radial-gradient(circle at center, rgba(0, 255, 255, 0.2) 0%, transparent 70%) !important;
					color: #ffffff !important;
					text-shadow: 0 0 15px #00ffff, 0 0 25px #00ffff !important;
					border-color: #ffffff !important;
				}
				
				.modern-difficulty-button:hover {
					transform: translateY(-3px) scale(1.05) !important;
					text-shadow: 0 0 15px currentColor, 0 0 25px currentColor !important;
					background: 
						linear-gradient(145deg, rgba(80, 0, 40, 0.9), rgba(120, 0, 60, 0.9)),
						radial-gradient(circle at center, rgba(255, 0, 128, 0.2) 0%, transparent 70%) !important;
					color: #ffffff !important;
				}
				
				.modern-difficulty-button.easy:hover {
					animation: neonPulse 1.5s ease-in-out infinite !important;
					box-shadow: 0 0 20px rgba(0, 255, 128, 0.6), 0 0 40px rgba(0, 255, 128, 0.3) !important;
				}
				
				.modern-difficulty-button.medium:hover {
					animation: neonPulse 1.5s ease-in-out infinite !important;
					box-shadow: 0 0 20px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 255, 0, 0.3) !important;
				}
				
				.modern-difficulty-button.hard:hover {
					animation: neonPulse 1.5s ease-in-out infinite !important;
					box-shadow: 0 0 20px rgba(255, 64, 64, 0.6), 0 0 40px rgba(255, 64, 64, 0.3) !important;
				}
				
				.modern-game-button {
					background: 
						linear-gradient(135deg, rgba(0, 255, 255, 0.15), rgba(0, 200, 255, 0.15)) !important;
					border: 2px solid rgba(0, 255, 255, 0.4) !important;
					box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.05) !important;
					backdrop-filter: blur(10px) !important;
					color: #00ffff !important;
				}
				
				.modern-game-button:hover {
					background: 
						linear-gradient(135deg, rgba(0, 150, 255, 0.25), rgba(0, 200, 255, 0.25)) !important;
					border: 2px solid rgba(0, 255, 255, 0.8) !important;
					box-shadow: 
						0 0 30px rgba(0, 255, 255, 0.6),
						0 0 50px rgba(0, 255, 255, 0.4),
						inset 0 0 30px rgba(0, 255, 255, 0.1) !important;
					color: #ffffff !important;
				}
				
				/* Canvas specific styles */
				#game-canvas {
					background: transparent !important;
					background-color: transparent !important;
				}
			</style>
			<div id="game-wrapper" class="w-[100%] min-h-screen relative flex justify-center items-center flex-col overflow-hidden" style="
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
				<!-- Secondary Grid -->
				<div class="absolute inset-0 pointer-events-none" style="
					background-image: 
						linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
						linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
					background-size: 20px 20px;
					animation: gridPulse 6s ease-in-out infinite reverse;
				"></div>
				<!-- Floating orbs -->
				<div class="absolute inset-0 overflow-hidden pointer-events-none">
					<div class="absolute top-[10%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/10 to-blue-400/10 blur-xl" style="animation: floatingOrbs 8s ease-in-out infinite;"></div>
					<div class="absolute top-[70%] right-[15%] w-24 h-24 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl" style="animation: floatingOrbs 6s ease-in-out infinite reverse;"></div>
					<div class="absolute bottom-[20%] left-[60%] w-20 h-20 rounded-full bg-gradient-to-r from-green-400/10 to-cyan-400/10 blur-xl" style="animation: floatingOrbs 10s ease-in-out infinite;"></div>
				</div>
				<canvas id="game-canvas" class="w-[90%] rounded-2xl relative z-10" style="background: transparent !important;"></canvas>
				${getScoreBoard()}
				${getDifficulty()}
				${getMenu()}
				<div id="set-toast" class="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-black text-white text-[1.5vw] px-[2vw] py-[1vw] rounded-[8px] z-10 hidden"></div>
				<div id="end-message" class="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white text-[2vw] px-[4vw] py-[2vw] rounded-[12px] z-10 hidden"></div>
				<div id="info" class="absolute top-[20%] left-1/2 -translate-x-1/2 text-white text-[1.8vw] px-[2vw] py-[1vw] rounded-2xl z-10 hidden" style="
					background: 
						linear-gradient(145deg, rgba(0, 0, 0, 0.95), rgba(10, 10, 30, 0.95)),
						radial-gradient(circle at center, rgba(0, 255, 255, 0.08) 0%, transparent 70%),
						linear-gradient(rgba(0, 255, 255, 0.08) 1px, transparent 1px),
						linear-gradient(90deg, rgba(0, 255, 255, 0.08) 1px, transparent 1px);
					background-size: auto, auto, 25px 25px, 25px 25px;
					backdrop-filter: blur(20px);
					border: 2px solid #00ffff;
					box-shadow: 
						0 0 30px rgba(0, 255, 255, 0.4),
						inset 0 0 30px rgba(0, 255, 255, 0.1);
				"></div>
				<div id="countdown" class="absolute top-[40%] left-1/2 -translate-x-1/2 bg-black text-white text-[1.8vw] px-[2vw] py-[1vw] rounded-[30px] z-10 hidden"></div>
				<button id="start-button" class="modern-game-button absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[45%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 transition-all transform hidden">${exmp.getLang("game.stratt-game")}</button>
				<button id="resume-button" class="modern-game-button absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[45%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 transition-all transform hidden">${exmp.getLang("game.continue-game")}</button>
				<button id="newmatch-button" class="modern-game-button absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[60%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 transition-all transform hidden">${exmp.getLang("game.new-game")}</button>
				<button id="turnHomePage-button" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[75%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-red-200 rounded-2xl cursor-pointer z-30 transition-all duration-300 transform hidden font-semibold" style="
					background: linear-gradient(135deg, rgba(255, 0, 100, 0.15), rgba(255, 0, 150, 0.15));
					border: 2px solid rgba(255, 0, 100, 0.4);
					box-shadow: 0 0 20px rgba(255, 0, 100, 0.3), inset 0 0 20px rgba(255, 0, 100, 0.05);
					backdrop-filter: blur(10px);
				" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 30px rgba(255, 0, 100, 0.5), inset 0 0 30px rgba(255, 0, 100, 0.1)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px rgba(255, 0, 100, 0.3), inset 0 0 20px rgba(255, 0, 100, 0.05)';">Ana sayfaya dön</button>
			</div>`;
	}

	public onLoad(): void {
		const info = document.getElementById('info') as HTMLElement;
		info.classList.remove('hidden');
		info.classList.add('bg-gradient-to-br', 'from-blue-500/20', 'to-purple-500/20');
		loadingWithMessage(info, 'Lütfen Telefonu Yatay Tutunuz');
		
    //todo bunu sil
    gameInstance.startPlayProcess(false);
    info.classList.add('hidden');
    info.classList.remove('bg-gradient-to-br', 'from-blue-500/20', 'to-purple-500/20');
    const menu = document.getElementById('menu') as HTMLElement;
    menu.classList.remove('hidden');
	}
}