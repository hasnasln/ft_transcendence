import { Page } from "../router";
import { exmp } from '../languageMeneger';

export class GamePage implements Page {

    public evaluate(): string {
        return `
            <div id="game-wrapper" class="bg-gray-300 w-[100%] relative flex justify-center items-center flex-col">
                <canvas id="game-canvas" class="w-[90%]"></canvas>
                ${getScoreBoard()}
                ${getSetBoard()}
                <div id="set-toast" class="absolute bottom-[20%] left-1/2 -translate-x-1/2 bg-black text-white text-[1.5vw] px-[2vw] py-[1vw] rounded-[8px] z-10 hidden"></div>
                <div id="end-message" class="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white text-[2vw] px-[4vw] py-[2vw] rounded-[12px] z-10 hidden"></div>
                <div id="info" class="absolute top-[20%] left-1/2 -translate-x-1/2 bg-black text-white text-[1.8vw] px-[2vw] py-[1vw] rounded-[8px] z-10 hidden"></div>
                <button id="ready-button" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[45%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 bg-blue-500 hover:bg-blue-700 hover:scale-105 transition-all transform hidden">${exmp.getLang("game.stratt-game")}</button>
                <button id="resume-button" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[45%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 bg-blue-500 hover:bg-blue-700 hover:scale-105 transition-all transform hidden">${exmp.getLang("game.continue-game")}</button>
                <button id="newmatch-button" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[60%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 bg-blue-500 hover:bg-blue-700 hover:scale-105 transition-all transform hidden">${exmp.getLang("game.new-game")}</button>
                <button id="turnHomePage-button" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[75%] px-[2.8vw] py-[1.2vw] text-[1.5vw] text-white border-none rounded-[12px] cursor-pointer z-30 bg-blue-500 hover:bg-blue-700 hover:scale-105 transition-all transform hidden">Ana sayfaya dön</button>
            </div>`;
    }
}

function getScoreBoard(): string {
    return `
    <div id="scoreboard" class="absolute top-[3%] left-1/2 -translate-x-1/2 hidden flex justify-center items-center px-[2vw] py-[0.5vw] bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)] border-2 border-[#555] rounded-[12px] shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)] font-sans text-[1.8vw] text-[#eee] z-10">
        <span id="blue-team" class="text-green-500">P1</span>
        <span id="score-table" class="px-[1vw] py-[0.2vw]">0 : 0</span>
        <span id="red-team" class="text-green-500">P2</span>
    </div>
    <div id="roundDiv" class="absolute top-[5%] left-[67%] -translate-x-1/2 hidden flex justify-center items-center px-[1.5vw] py-[0.3vw] bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)] border-2 border-[#555] rounded-[12px] shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)] font-sans text-[1.2vw] text-[#eee] z-10">
        <span id="roundNo" class="text-blue-500">Round : 1</span>
    </div>
    <div id="tournamentIdDiv" class="absolute top-[5%] left-[30%] -translate-x-1/2 hidden flex justify-center items-center px-[1.5vw] py-[0.3vw] bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)] border-2 border-[#555] rounded-[12px] shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)] font-sans text-[1vw] text-[#eee] z-10">
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