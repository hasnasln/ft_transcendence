import { exmp } from "../languageMeneger";
import { Page } from "../router";
import { retroGridBackground } from "./play-page";

export class GamePage implements Page {

    public evaluate(): string {
        return retroGridBackground(getScoreBoard() + getSetBoard() + this.hiddenButtons());
    }

    public hiddenButtons() {
        return `<canvas id="game-canvas" class="w-[90%]"></canvas>
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
				<button id="ready-button" class="modern-game-button absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[45%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 transition-all transform hidden">${exmp.getLang("game.stratt-game")}</button>
				<button id="resume-button" class="modern-game-button absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[45%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 transition-all transform hidden">${exmp.getLang("game.continue-game")}</button>
				<button id="newmatch-button" class="modern-game-button absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[60%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 transition-all transform hidden">${exmp.getLang("game.new-game")}</button>
				<button id="turnHomePage-button" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[75%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-red-200 rounded-2xl cursor-pointer z-30 transition-all duration-300 transform hidden font-semibold" style="
					background: linear-gradient(135deg, rgba(255, 0, 100, 0.15), rgba(255, 0, 150, 0.15));
					border: 2px solid rgba(255, 0, 100, 0.4);
					box-shadow: 0 0 20px rgba(255, 0, 100, 0.3), inset 0 0 20px rgba(255, 0, 100, 0.05);
					backdrop-filter: blur(10px);
				" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 0 30px rgba(255, 0, 100, 0.5), inset 0 0 30px rgba(255, 0, 100, 0.1)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 20px rgba(255, 0, 100, 0.3), inset 0 0 20px rgba(255, 0, 100, 0.05)';">Ana sayfaya dön</button>    `;
    }
}

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


function getSetBoard(): string {
    return `
    <div id="setboard" class="absolute bottom-[3%] left-1/2 transform -translate-x-1/2 mt-[0.3vw] hidden flex flex-col justify-center items-center px-[2vw] py-0 bg-gradient-to-br from-[#1e1e1e] to-[#2c2c2c] border border-2 border-[#555] rounded-[12px] shadow-[0_0_10px_rgba(255,255,255,0.2),0_0_20px_rgba(255,255,255,0.1)] font-sans text-[1.4vw] text-[#eee] z-10">
        <div id="set-title">
        <span id="setler" class="text-[1.3vw]">${exmp.getLang("game.sets")}</span>
        </div>
        <div id="set-skor">
        <span id="blue-team-s" class="text-green-500">P1</span>
        <span id="set-table" class="px-[1vw] py-[0.2vw]">0 : 0</span>
        <span id="red-team-s" class="text-green-500">P2</span>
        </div>
    </div>
    `;
}