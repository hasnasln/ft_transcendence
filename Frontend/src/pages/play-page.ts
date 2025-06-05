import { game_button } from "../components/buttons";

/*
Socor board ilk başta gizli olacak
*/
function renderScoreBoard(container: HTMLElement): void
{
	const ScoreBoard = document.createElement('div');
		ScoreBoard.id = 'scoreboard';
		ScoreBoard.classList.add(
				// Konumlandırma
			'absolute',
			'top-[4%]',
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

		container.appendChild(ScoreBoard);

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
/**
 * 
 * setboard ilk başta gizli 
 * 
 */
function renderSetBoard(container: HTMLElement): void
{
	const setboard = createDivAddId('setboard');
		setboard.classList.add(
			'absolute',
			'bottom-[4%]',
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
		setboard00.textContent = "SETLER";
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
	const  menudiv = createDivAddId('menu');
		menudiv.classList.add(
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
			'hidden'
		);
		
		const button1 = createButtonWithNameId('btn-vs-computer','VS Computer');
		const button2 = createButtonWithNameId('btn-find-rival','Find a Rival');
		const button3 = createButtonWithNameId('btn-local','Local Game');
		const button4 = createButtonWithNameId('tournament','Tournament Game');

		game_button(button1);
		game_button(button2);
		game_button(button3);
		game_button(button4);

		menudiv.appendChild(button1);
		menudiv.appendChild(button2);
		menudiv.appendChild(button3);
		menudiv.appendChild(button4);

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

		const button1 = createButtonWithNameId('', 'Easy');
		const button2 = createButtonWithNameId('', 'medium');
		const button3 = createButtonWithNameId('', 'hard');

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
		
		set_toast.classList.add(
			'absolute',
			'bottom-[20%]',
			'left-1/2',
			'-translate-x-1/2',
			'bg-[#222]',
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
			'bg-[#000000cc]',
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
			'bg-[#222]',
			'text-white',
			'text-[1.8vw]',
			'px-[2vw]',
			'py-[1vw]',
			'rounded-[8px]',
			'z-10',
			'hidden'
		);

		const start_Button = createButtonWithNameId('start-button', 'Maçı Başlat');		// id= start-button
		const devambutton = createButtonWithNameId('resume-button', 'Maça Devam Et');		// id= start-button
		const new_match = createButtonWithNameId('newmatch-button', 'Yeni Maça Başla');		// id= start-button

		[start_Button, devambutton, new_match].forEach(btn => {
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

		start_Button.classList.add('top-1/2');
    	devambutton.classList.add('top-[40%]');
    	new_match.classList.add('top-[70%]');


		renderScoreBoard(paly_div);
		renderSetBoard(paly_div);
		const menu= renderMenu(paly_div);
		renderDifficulty(paly_div);


		[start_Button, devambutton, new_match, set_toast, end_message, info].forEach(child => {
		paly_div.appendChild(child);
		})

		container.appendChild(paly_div);

		return {info: info, menu: menu};
	}
	init (): void {

	}
}