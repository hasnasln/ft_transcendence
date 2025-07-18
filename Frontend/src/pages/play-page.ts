import { game_button } from "../components/buttons";
import { exmp } from '../languageMeneger';



function renderScoreBoard(container: HTMLElement): void
{
	const ScoreBoard = document.createElement('div');
		ScoreBoard.id = 'scoreboard';
		ScoreBoard.classList.add(
				// Konumlandırma
			'absolute',
			'top-[3%]',
			'left-1/2',
			'-translate-x-1/2',

			// Görünmez başlangıç
			'hidden',

			// Flex ayarları
			'flex',
			'justify-center',
			'items-center',

			// Padding
			'px-[2vw]',
			'py-[0.5vw]',

			// Arka plan (özel gradient)
			'bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)]',

			// Kenarlıklar
			'border-2',
			'border-[#555]',
			'rounded-[12px]',

			// Gölge (özel box-shadow)
			'shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)]',

			// Yazı tipi, boyutu ve rengi
			'font-sans',
			'text-[1.8vw]',
			'text-[#eee]',

			// Z-index
			'z-10'
		);


		const roundDiv = document.createElement('div');
		roundDiv.id = 'roundDiv';
		roundDiv.classList.add(
				// Konumlandırma
			'absolute',
			'top-[5%]',
			'left-[67%]',
			'-translate-x-1/2',

			// Görünmez başlangıç
			'hidden',

			// Flex ayarları
			'flex',
			'justify-center',
			'items-center',

			// Padding
			'px-[1.5vw]',
			'py-[0.3vw]',

			// Arka plan (özel gradient)
			'bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)]',

			// Kenarlıklar
			'border-2',
			'border-[#555]',
			'rounded-[12px]',

			// Gölge (özel box-shadow)
			'shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)]',

			// Yazı tipi, boyutu ve rengi
			'font-sans',
			'text-[1.2vw]',
			'text-[#eee]',

			// Z-index
			'z-10'
		);


		const tournamentIdDiv = document.createElement('div');
		tournamentIdDiv.id = 'tournamentIdDiv';
		tournamentIdDiv.classList.add(
				// Konumlandırma
			'absolute',
			'top-[5%]',
			'left-[30%]',
			'-translate-x-1/2',

			// Görünmez başlangıç
			'hidden',

			// Flex ayarları
			'flex',
			'justify-center',
			'items-center',

			// Padding
			'px-[1.5vw]',
			'py-[0.3vw]',

			// Arka plan (özel gradient)
			'bg-[linear-gradient(145deg,_#1e1e1e,_#2c2c2c)]',

			// Kenarlıklar
			'border-2',
			'border-[#555]',
			'rounded-[12px]',

			// Gölge (özel box-shadow)
			'shadow-[0_0_10px_rgba(255,255,255,0.2),_0_0_20px_rgba(255,255,255,0.1)]',

			// Yazı tipi, boyutu ve rengi
			'font-sans',
			'text-[1vw]',
			'text-[#eee]',

			// Z-index
			'z-10'
		);



		const span01 = document.createElement('span');
		span01.id = 'blue-team';
		span01.textContent = 'P1';
		span01.classList.add(
			'text-green-500'
		);

		const span03 = document.createElement('span');
		span03.id = 'score-table';
		span03.textContent = '0 : 0';
		span03.classList.add(
			'px-[1vw]',
			'py-[0.2vw]'
		);

		const span02 = document.createElement('span');
		span02.id = 'red-team';
		span02.textContent = 'P2';
		span02.classList.add(
			'text-green-500'
		);

		ScoreBoard.appendChild(span01);
		ScoreBoard.appendChild(span03);
		ScoreBoard.appendChild(span02);

		const span04 = document.createElement('span');
		span04.id = 'roundNo';
		span04.textContent = 'Round : 1';
		span04.classList.add(
			'text-blue-500'
		);

		const span05 = document.createElement('span');
		span05.id = 'tournamentCode';
		span05.textContent = 'Turnuva ID : ';
		span05.classList.add(
			'text-blue-500'
		);

		roundDiv.appendChild(span04);
		tournamentIdDiv.appendChild(span05);

		container.appendChild(ScoreBoard);
		container.appendChild(roundDiv);
		container.appendChild(tournamentIdDiv);

}



function createDivAddId(id: string): HTMLElement
{
	const x = document.createElement('div');
	x.id = id
	return x;
}

function createSpanAddId(id: string): HTMLElement
{
	const x = document.createElement('span');
	x.id = id;
	return x;
}

function renderSetBoard(container: HTMLElement): void
{
	const setboard = createDivAddId('setboard');
		setboard.classList.add(
			'absolute',
			'bottom-[3%]',
			'left-1/2',
			'transform',
			'-translate-x-1/2',
			'mt-[0.3vw]',

			'hidden',              
			'flex',
			'flex-col',
			'justify-center',
			'items-center',
			'px-[2vw]',               // padding: 0vw 2vw
			'py-0',

			// Özel gradient 
			'bg-gradient-to-br',
			'from-[#1e1e1e]',
			'to-[#2c2c2c]',

			'border',
			'border-2',
			'border-[#555]',
			'rounded-[12px]',

			// Yakın bir box-shadow 
			'shadow-[0_0_10px_rgba(255,255,255,0.2),0_0_20px_rgba(255,255,255,0.1)]',

			'font-sans',
			'text-[1.4vw]',
			'text-[#eee]',
			'z-10'
			
		);

	

		// Başlık kısmı
		const setboard0 = createDivAddId('set-title');

		const setboard00 = createSpanAddId('setler');
		setboard00.textContent = exmp.getLang("game.sets");
		setboard00.classList.add(
			'text-[1.3vw]'
		);

		setboard0.appendChild(setboard00);

		// Skor kısmı
		const setboard1 = createDivAddId('set-skor');

		const setboard10 = createSpanAddId('blue-team-s');
		const setboard11 = createSpanAddId('set-table');
		const setboard12 = createSpanAddId('red-team-s');

		setboard10.textContent = "P1";
		setboard10.classList.add(
			'text-green-500'
		);
		setboard11.textContent = "0 : 0";
		setboard11.classList.add(
			'px-[1vw]',
			'py-[0.2vw]'
		);
		setboard12.textContent = "P2";
		setboard12.classList.add(
			'text-green-500'
		);

		setboard1.appendChild(setboard10);
		setboard1.appendChild(setboard11);
		setboard1.appendChild(setboard12);

		// Her şeyi birleştir
		setboard.appendChild(setboard0);
		setboard.appendChild(setboard1);
		container.appendChild(setboard);
}



function createButtonWithNameId(id: string, Name: string): HTMLElement {
	const button = document.createElement("button");
	if (id !== '')
		button.id = id;
	if (Name !== '')
		button.textContent = Name;
	return button;
}


function renderMenu(container: HTMLElement): HTMLElement
{
    const menudiv = createDivAddId('menu');
    menudiv.classList.add(
        'absolute',
        'top-1/2',
        'left-1/2',
        '-translate-x-1/2',
        '-translate-y-1/2',
        'w-[60%]',
        'h-[70%]',
        'bg-black',
        'rounded-3xl',
        'flex',
        'flex-col',
        'justify-center',
        'items-center',
        'gap-8', // butonlar arası boşluk
        'z-10',
        'hidden'
    );

    const buttonData = [
        { id: 'btn-vs-computer', text: exmp.getLang("game.vs-compiter-b") },
        { id: 'btn-find-rival', text: exmp.getLang("game.find-reval-b") },
        { id: 'btn-local', text: exmp.getLang("game.local-game") },
		{ id: 'tournament', text: exmp.getLang("game.tournament") }
    ];

    buttonData.forEach(({ id, text }) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = "relative group";

        const outerDiv = document.createElement('div');
		outerDiv.className = "relative w-[28rem] h-16 opacity-90 overflow-hidden rounded-2xl bg-black z-10";
        // Animasyonlu gradient çizgi
        const animDiv = document.createElement('div');
        animDiv.className = "absolute z-10 -translate-x-44 group-hover:translate-x-[30rem] ease-in transition-all duration-700 h-full w-44 bg-gradient-to-r from-gray-500 to-white/10 opacity-30 -skew-x-12";

        // Butonun kendisi
        const btnWrapper = document.createElement('div');
        btnWrapper.className = "absolute flex items-center justify-center text-white z-[1] opacity-90 rounded-2xl inset-0.5 bg-black";

        const button = document.createElement('button');
        button.id = id;
		button.className = "input font-semibold text-2xl h-full opacity-90 w-full px-20 py-4 rounded-2xl bg-black";
		button.textContent = text;

        btnWrapper.appendChild(button);

        // Alt animasyonlu blur gradient
        const blurDiv = document.createElement('div');
        blurDiv.className = "absolute duration-1000 group-hover:animate-spin w-full h-[100px] bg-gradient-to-r from-green-500 to-yellow-500 blur-[30px]";

        // Hepsini sırayla ekle
        outerDiv.appendChild(animDiv);
        outerDiv.appendChild(btnWrapper);
        outerDiv.appendChild(blurDiv);
        groupDiv.appendChild(outerDiv);
        menudiv.appendChild(groupDiv);
    });

		container.appendChild(menudiv);
		container.appendChild(menudiv);

    container.appendChild(menudiv);

    return menudiv;
}


function renderDifficulty(container: HTMLElement): void
{
	const difficulty = createDivAddId('difficulty');
		difficulty.classList.add(
			'absolute',
			'top-1/2',
			'left-1/2',
			'-translate-x-1/2',
			'-translate-y-1/2',
			'w-[50%]',
			'h-[60%]',
			'bg-gray-300',
			'rounded-3xl',
			'flex',
			'flex-col',
			'justify-center',
			'items-center',
			'gap-4',
			'z-10',
			'hidden',
		);

		const button1 = createButtonWithNameId('', exmp.getLang("game.vs-compiter-difficulty-b-easy"));
		const button2 = createButtonWithNameId('', exmp.getLang("game.vs-compiter-difficulty-b-medium"));
		const button3 = createButtonWithNameId('', exmp.getLang("game.vs-compiter-difficulty-b-hard"));

		button1.setAttribute('data-level', 'easy');
		button2.setAttribute('data-level', 'medium');
		button3.setAttribute('data-level', 'hard');

		game_button(button1);
		game_button(button2);
		game_button(button3);

		difficulty.appendChild(button1);
		difficulty.appendChild(button2);
		difficulty.appendChild(button3);

		container.appendChild(difficulty);
}



export class PlayPage
{
	constructor()
	{
		console.log("PlayPage constructor çağrıldı");
	}
	
	render (container: HTMLElement): {info: HTMLElement | null, menu: HTMLElement | null}
	{
		if (!container) {
			console.error('Container not found');
			return {info: null, menu: null};
		}

		const paly_div = document.createElement('div');
		paly_div.id = 'game-wrapper';
		paly_div.classList.add(
			'bg-gray-300',
			'w-[100%]',
			//'h-[100%]',
			'relative',
			'flex',
			'justify-center',
			'items-center',
			'flex-col',
		);

		const canvas = document.createElement('canvas');
		canvas.id = 'game-canvas';
		canvas.classList.add(
			"w-[90%]",
			//'left-[5%]',
			//"absolute",
		);
		paly_div.appendChild(canvas);
		
		const set_toast = createDivAddId('set-toast');
		const end_message = createDivAddId('end-message');
		const info = createDivAddId('info');
		const countdown = createDivAddId('countdown');

		countdown.classList.add(
			'absolute',
			'top-[40%]',
			'left-1/2',
			'-translate-x-1/2',
			'bg-black',
			'text-white',
			'text-[1.8vw]',
			'px-[2vw]',
			'py-[1vw]',
			'rounded-[30px]',
			'z-10',
			'hidden'
		);
		
		set_toast.classList.add(
			'absolute',
			'bottom-[20%]',
			'left-1/2',
			'-translate-x-1/2',
			'bg-black',
			'text-white',
			'text-[1.5vw]',
			'px-[2vw]',
			'py-[1vw]',
			'rounded-[8px]',
			'z-10',
			'hidden'
		);

		end_message.classList.add(
			'absolute',
			'top-[30%]',
			'left-1/2',
			'-translate-x-1/2',
			'-translate-y-1/2',
			'bg-black',
			'text-white',
			'text-[2vw]',
			'px-[4vw]',
			'py-[2vw]',
			'rounded-[12px]',
			'z-10',
			'hidden'
		);


			info.classList.add(

			'absolute',
			'top-[20%]',
			'left-1/2',
			'-translate-x-1/2',
			'bg-black',
			'text-white',
			'text-[1.8vw]',
			'px-[2vw]',
			'py-[1vw]',
			'rounded-[8px]',
			'z-10',
			'hidden'
		);

		const start_Button = createButtonWithNameId('start-button', exmp.getLang("game.stratt-game"));		// id= start-button
		const devambutton = createButtonWithNameId('resume-button', exmp.getLang("game.continue-game"));		// id= start-button
		const new_match = createButtonWithNameId('newmatch-button', exmp.getLang("game.new-game"));		// id= start-button
		const turnToHomePage = createButtonWithNameId('turnHomePage-button', 'Ana sayfaya dön');


		[start_Button, devambutton, new_match, turnToHomePage].forEach(btn => {
    	btn.classList.add(	
			  	'absolute',
				'left-1/2',
				'-translate-x-1/2',
				'-translate-y-1/2',
				'px-[2.8vw]',
				'py-[1.2vw]',
				'text-[1.5vw]',
				'text-white',
				'border-none',
				'rounded-[12px]',
				'cursor-pointer',
				'z-30',
				'bg-blue-500',
				'hover:bg-blue-700',
				'hover:scale-105',
				'transition-all',
				'transform',
				'hidden'
			);
		});

		devambutton.classList.add('top-[45%]');
		start_Button.classList.add('top-[45%]');
    	new_match.classList.add('top-[60%]');
		turnToHomePage.classList.add('top-[75%]');


		renderScoreBoard(paly_div);
		renderSetBoard(paly_div);
		const menu= renderMenu(paly_div);
		renderDifficulty(paly_div);


		[start_Button, devambutton, new_match, turnToHomePage, set_toast, end_message, info, countdown].forEach(child => {
		paly_div.appendChild(child);
		})

		container.appendChild(paly_div);

		return {info: info, menu: menu};
	}
	init (): void {

	}
}