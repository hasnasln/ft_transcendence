import { game_button } from "../companent/buttons";

/*
Socor board ilk başta gizli olacak
*/
function renderScoreBoard(container: HTMLElement): void {
	const ScoreBoard = document.createElement('div');
	ScoreBoard.id = 'scoreboard';
	ScoreBoard.classList.add(
		'absolute',
		'top-[5%]',
		'z-10',
		'w-64',                   // Sabit ve uygun genişlik
		'bg-cyan-600',            // Arka plan rengi
		'text-white',             // Yazı rengi
		'text-[1.8vw]',
		'rounded-2xl',            // Yumuşak köşeler
		'p-3',                    // İç boşluk
		'shadow-lg',              // Gölge efekti
		'flex',
		'flex-row',
		'items-center',
		'justify-between',        // Eşit boşlukla dağıt
		'text-lg',                // Yazı boyutu
		'font-semibold',
		'tracking-wide',
		'hidden' // Başlangıçta gizli
	);

	const span01 = document.createElement('span');
	span01.id = 'blue-team';
	span01.textContent = 'P1';

	const span03 = document.createElement('span');
	span03.id = 'score-table';
	span03.textContent = '0 : 0';

	const span02 = document.createElement('span');
	span02.id = 'red-team';
	span02.textContent = 'P2';

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
function renderSetBoard(container: HTMLElement): void {
	const setboard = createDivAddId('setboard');
	setboard.classList.add(
		'absolute',
		'bottom-[4%]',
		'z-10',
		'w-48',                   // Sabit genişlik (responsive uyumlu)
		'bg-cyan-800',            // Arka plan rengi
		'text-white',             // Yazı rengi
		'text-[1.4vw]',
		'rounded-3xl',            // Yumuşak köşeler
		'p-4',                    // İç boşluk
		'shadow-lg',              // Gölgelendirme
		'flex',
		'flex-col',
		'items-center',
		'gap-4',
		'hidden'  // Başlangıçta gizli
		
	);

	// Başlık kısmı
	const setboard0 = createDivAddId('set-title');
	setboard0.classList.add('text-xl', 'font-bold', 'tracking-wide');

	const setboard00 = createSpanAddId('setler');
	setboard00.textContent = "SETLER";

	setboard0.appendChild(setboard00);

	// Skor kısmı
	const setboard1 = createDivAddId('set-skor');
	setboard1.classList.add(
		'w-full',
		'flex',
		'justify-between',
		'items-center',
		'text-lg',
		'font-semibold'
	);

	const setboard10 = createSpanAddId('blue-team-s');
	const setboard11 = createSpanAddId('set-table');
	const setboard12 = createSpanAddId('red-team-s');

	setboard10.textContent = "P1";
	setboard11.textContent = "0 : 0";
	setboard12.textContent = "P2";

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


function renderMenu(container: HTMLElement): void
{
	const  menudiv = createDivAddId('menu');
	menudiv.classList.add(
		'w-[50%]',
		'h-[50%]',
		'bg-gray-300',
		'rounded-3xl',
		'flex',
		'justify-center',
		'items-center',
		'flex-col',
		'gap-3',
		'z-10', 
		// 'hidden' //!
	);
	
	const button1 = createButtonWithNameId('btn-vs-computer','VS Computer');
	const button2 = createButtonWithNameId('btn-find-rival','Find a Rival');
	const button3 = createButtonWithNameId('btn-local','Local Game');

	game_button(button1);
	game_button(button2);
	game_button(button3);

	menudiv.appendChild(button1);
	menudiv.appendChild(button2);
	menudiv.appendChild(button3);

	container.appendChild(menudiv);
}


function renderDifficlty(container: HTMLElement): void
{
	const difficulty = createDivAddId('difficulty');
	difficulty.classList.add(
		'w-[50%]',
		'h-[50%]',
		'bg-gray-300',
		'rounded-3xl',
		'flex',
		'justify-center',
		'items-center',
		'flex-col',
		'gap-3',
		'hidden',//!
		'z-10', 
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



export class PlayPage {
	constructor()
	{
		console.log("PlayPage constructor çağrıldı");
	}
	render (container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}

		const paly_div = document.createElement('div');
		paly_div.id = 'game-wrapper';
		paly_div.classList.add(
			'bg-gray-300',
			'w-full',
			'h-full',
			'relative',
			'flex',
			'justify-center',
			'items-center',
			'flex-col',
		);

		const canvas = document.createElement('canvas');
		canvas.classList.add(
			"w-[90%]",
			"absolute",
		);
		canvas.id = 'game-canvas';
		const set_toast = createDivAddId('set-toast');
		const end_message = createDivAddId('end-message');
		const info = createDivAddId('info');

		paly_div.appendChild(canvas);		// id= game-canvas
		renderScoreBoard(paly_div);			// id= scoreboard
		renderSetBoard(paly_div);			// id = setboard
		const start_Button = createButtonWithNameId('start-button', 'Maçı Başlat');		// id= start-button
		const devambutton = createButtonWithNameId('resume-button', 'Maça Devam Et');		// id= start-button
		const new_mach = createButtonWithNameId('newmatch-button', 'Yeni Maça Başla');		// id= start-button
		
		set_toast.classList.add(
			'absolute',
			'bottom-[20%]',
			'items-center',
			'bg-cyan-600',
			'rounded-3xl',
			'text-white',
			'text-xl',
			'mb-4',
			'z-10', 
			'hidden' // Başlangıçta gizli
		)

		end_message.classList.add(
			'absolute',
			'top-[30%]',
			'items-center',
			'bg-cyan-600',
			'rounded-3xl',
			'text-white',
			'text-xl',
			'mb-4',
			'z-10', 
			'hidden' // Başlangıçta gizli
		)


			info.classList.add(
			'absolute',
			'top-[20%]',
			'items-center',
			'bg-blue-500',
			'rounded-3xl',
			'text-white',
			'text-xl',
			'mb-4',
			'z-10', 
			'hidden' // Başlangıçta gizli
		)

		start_Button.classList.add(
			'absolute',
			'top-[40%]',
			'w-[50%]',
			'h-[16%]',
			'items-center',
			'p-5',
			'text-[1.8vw]',
			'bg-blue-500',
			'rounded-3xl',
			'text-white',
			'text-xl',
			'mb-4',
			'z-10', 
			'hidden' // Başlangıçta gizli
		)

		devambutton.classList.add(
			'absolute',
			'top-[40%]',
			'items-center',
			'z-20',
			'p-5',
			'text-[1.8vw]',
			'bg-blue-500',
			'rounded-3xl',
			'text-white',
			'text-xl',
			'mb-4',
			'hidden' // Başlangıçta gizli
		)

		new_mach.classList.add(
			'absolute',
			'top-[70%]',
			'items-center',
			'z-20',
			'p-5',
			'bg-blue-500',
			'text-[1.8vw]',
			'rounded-3xl',
			'text-white',
			'text-xl',
			'mb-4',
			'hidden' // Başlangıçta gizli
		)

		paly_div.appendChild(start_Button);	// id= start-button
		paly_div.appendChild(devambutton);	// id= resume-button
		paly_div.appendChild(new_mach);		// id= newmatch-button

		renderMenu(paly_div);
		renderDifficlty(paly_div);
		paly_div.appendChild(set_toast);		// id= set-toast
		paly_div.appendChild(end_message);		// id= end-message
		paly_div.appendChild(info);		// id= info

		container.appendChild(paly_div);
	}
	init (): void {

	}
}