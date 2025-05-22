import { exmp } from '../languageMeneger';
// Recommended way, to include only the icons you need.


export class TournamentPage {
	// private  currentLanguage: string; // Mevcut dili saklamak için


	constructor() {
		// this.currentLanguage = exmp.getLanguage();
	}

	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderTournament(container);
		requestAnimationFrame(() => {
			this.init();
		});
	}

	init(): void {
		const container = document.getElementById('tournament-main');
		if (!container) {
			console.error('Container not found');
			return;
		}
		container.addEventListener('click', (event) => {
			event.preventDefault();
			//! closet metodu ile tıklanan elementin üstündeki data-action attribute'ü olan elementi buluyoruz
			//? burası sorun farklı noktalarda sorun çıkarabilir
			//* örnek olarak içerideki bir tıklanma istenmeyen dışardaki bir tıklamayı çalıştırabilir, düşünülmesi lazım
			const target = (event.target as HTMLElement).closest('[data-action]');
			if (!target) return;
			const action = target.getAttribute('data-action');
			if (!action) return;
			switch (action) {
				case 'create-tournament':
					this.createTournament(container);
					break;
				case 'join-room':
					this.joinRoom(container);
					break;
				case 'exit-tournament':
					this.exitTournament(container);
					break;
				default:
					break;
			}
		});
	}

	private createTournament(contaier: HTMLElement): void {
		const input = document.querySelector('#tournament-form input') as HTMLInputElement;
		const tournamentId = input.value;
		console.log(`Creating tournament with ID: ${tournamentId}`);
		contaier.innerHTML = ''; // Clear the container
		ShowTournament(contaier); // Re-render the tournament section
	}

	private joinRoom(contaier: HTMLElement): void {
		const input = document.querySelector('#tournament-form input') as HTMLInputElement;
		const tournamentId = input.value;
		console.log(`Joining room with ID: ${tournamentId}`);
		contaier.innerHTML = ''; // Clear the container
		ShowTournament(contaier); // Re-render the tournament section
	}

	private exitTournament(container: HTMLElement): void {
		console.log('Exiting tournament');
		container.innerHTML = ''; // Clear the container
		createTournamentSection(container); // Re-render the tournament section
	}
}

function renderTournament(container: HTMLElement) {
	const div = document.createElement('div');
	div.id = 'tournament-main';
	div.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'h-full',
		'w-full',
		'absolute',
		'top-0',
		'left-0',
		'z-0',
		'bg-gray-900',
	);

	createTournamentSection(div);
	// ShowTournament(div);
	container.appendChild(div);
}


function createTournamentSection(container: HTMLElement): void{
	const div01 = document.createElement('div');
	div01.id = 'tournament-div01';
	div01.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'rounded-3xl',
		'w-[30%]',
		'h-[30%]',
		'bg-white',
		'gap-6',
	)

	const title = document.createElement('h1');
	title.textContent = exmp.getLang('tournament.title');
	title.classList.add(
		'text-2xl',
		'font-bold',
		'text-center',
	);

	const p = document.createElement('p');
	p.textContent = "aşağıdaki kısma id girip katıl butonuna tıklarsanız oda arayacak, isim girip oluştur derseniz oda oluşturacak";
	p.classList.add(
		'text-gray-500',
		'text-sm',
		'text-center',
		'w-[80%]',
	);

	const form = document.createElement('form');
	form.id = 'tournament-form';
	form.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'gap-4',
	);

	const input = document.createElement('input');
	input.type = 'text';
	input.placeholder = exmp.getLang('tournament.input');
	input.classList.add(
		'border',
		'border-gray-300',
		'rounded-lg',
		'px-4',
		'py-2',
		'w-[80%]',
	);

	const buttonWrapper = document.createElement('div');
	buttonWrapper.classList.add(
		'flex',
		'justify-center',
		'items-center',
		'flex-row',
		'gap-4',
	);

	const button2 = document.createElement('button');
	button2.textContent = exmp.getLang('tournament.join-room');
	button2.classList.add(
		'bg-blue-500',
		'text-white',
		'px-4',
		'py-2',
		'rounded-lg',
		'hover:bg-blue-700',
		'transition-colors',
		'duration-300',
	);
	button2.setAttribute('data-action', 'join-room');


	const button = document.createElement('button');
	button.textContent = exmp.getLang('tournament.button');
	button.classList.add(
		'bg-blue-500',
		'text-white',
		'px-4',
		'py-2',
		'rounded-lg',
		'hover:bg-blue-700',
		'transition-colors',
		'duration-300',
	);
	button.setAttribute('data-action', 'create-tournament');
	// button.type = 'submit';

	form.appendChild(input);
	buttonWrapper.appendChild(button2);
	buttonWrapper.appendChild(button);
	form.appendChild(buttonWrapper);

	div01.appendChild(title);
	div01.appendChild(p);
	div01.appendChild(form);
	container.appendChild(div01);
}


function ShowTournament(container: HTMLElement): void {
	const div02 = document.createElement('div');
	div02.id = 'tournament-div02';
	div02.classList.add(
		'flex',
		'flex-col',
		'justify-start',
		'items-center',
		'rounded-3xl',
		'w-[90%]',
		'h-[90%]',
		'bg-white',
		'p-6',
		'shadow-xl',
		'gap-4',
		'overflow-y-auto'
	);
	TournamentInformation(div02);
	
	container.appendChild(div02);

}


function TournamentInformation(container: HTMLElement): void {

	const tournament01 = document.createElement('div');
	tournament01.classList.add(
		'flex',
		'flex-col',
		'justify-between',
		'items-center',
		'bg-gray-900',
		'rounded-lg',
		'p-4',
		'w-[80%]',
		'h-[40%]'
	);

	const div01 = document.createElement('div');
	div01.classList.add(
		'w-full',
		'flex',
		'flex-row',
		'justify-between',
		'items-center',
		'gap-4',
		'p-4',
	);

	const div001 = document.createElement('div');
	div001.classList.add(
		'flex',
		'flex-row',
		'justify-center',
		'items-center',
		'gap-4',
	);

	const img = document.createElement('img');
	img.src = 'IMG/trophy.png';
	img.classList.add(
		'w-[50px]',
		'h-[50px]',
	);

	const title = document.createElement('h1');
	title.textContent = 'ft_trancendence';
	title.classList.add(
		'text-2xl',
		'font-bold',
		'text-center',
		'text-white',
	);

	div001.appendChild(img);
	div001.appendChild(title);

	const exit = document.createElement('div');
	exit.setAttribute('data-action', 'exit-tournament');
	exit.classList.add(
		'flex',
		'justify-center',
		'items-center',
		'flex-row',
		'bg-red-500',
		'text-white',
		'px-4',
		'py-2',
		'gap-2',
		'rounded-lg',
		'hover:bg-red-700',
		'transition-colors',
		'duration-300',
		'hover:cursor-pointer',
	);
	
	const img02 = document.createElement('img');
	img02.src = 'IMG/exit.png';
	img02.classList.add(
		'w-[30px]',
		'h-[35px]',
	);

	const p = document.createElement('p');
	p.textContent = exmp.getLang('tournament.exit');

	exit.appendChild(img02);
	exit.appendChild(p);


	const div02 = document.createElement('div');
	div02.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-start',
		'w-full',
		'bg-gray-800',
		'h-[20%]',
	);

	const div02p1 = document.createElement('p');
	div02p1.textContent = exmp.getLang('tournament.id');
	div02p1.classList.add(
		'text-gray-400',
		'text-lg',
		'pl-4',
	);

	const div02p2 = document.createElement('p');
	div02p2.textContent = '6510236541';
	div02p2.classList.add(
		'text-white',
		'text-lg',
		'pl-4',
		'font-bold',
	);

	div02.appendChild(div02p1);
	div02.appendChild(div02p2);

	const div03 = document.createElement('div');
	div03.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-start',
		'w-full',
		'bg-gray-800',
		'h-[20%]',
	);

	const div03p1 = document.createElement('p');
	div03p1.textContent = exmp.getLang('tournament.creater');
	div03p1.classList.add(
		'text-gray-400',
		'text-lg',
		'pl-4',
	);

	const div03p2 = document.createElement('p');
	div03p2.textContent = 'Ahmet Yılmaz';
	div03p2.classList.add(
		'text-white',
		'text-lg',
		'pl-4',
		'font-bold',
	);

	div03.appendChild(div03p1);
	div03.appendChild(div03p2);

	const div04 = document.createElement('div');
	div04.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-start',
		'w-full',
		'bg-gray-800',
		'h-[20%]',
	);

	const div04p1 = document.createElement('p');
	div04p1.textContent = exmp.getLang('tournament.total-player');
	div04p1.classList.add(
		'text-gray-400',
		'text-lg',
		'pl-4',
	);
	const div04p2 = document.createElement('p');
	div04p2.textContent = '10';
	div04p2.classList.add(
		'text-white',
		'text-lg',
		'pl-4',
		'font-bold',
	);

	div04.appendChild(div04p1);
	div04.appendChild(div04p2);
	
	div01.appendChild(div001);
	div01.appendChild(exit);
	tournament01.appendChild(div01);
	tournament01.appendChild(div02);
	tournament01.appendChild(div03);
	tournament01.appendChild(div04);

	const tournament02 = document.createElement('div');
	tournament02.classList.add(
		'flex',
		'flex-col',
		'justify-between',
		'items-center',
		'bg-gray-900',
		'rounded-lg',
		'p-4',
		'gap-4',
		'w-[80%]',
		'h-[60%]'
	);

	const div11 = document.createElement('div');
	div11.classList.add(
		'w-full',
		'flex',
		'flex-row',
		'justify-start',
		'items-center',
		'gap-4',
		'pl-4',
		'pt-1',
	);
	
	const div11p1 = document.createElement('p');
	div11p1.textContent = exmp.getLang('tournament.joined-player');
	div11p1.classList.add(
		'text-2xl',
		'font-bold',
		'text-center',
		'text-white',
	);


	// oyuncuların sıralanacağı kısım
	const div12 = document.createElement('div');
	div12.classList.add(
		'flex',
		'flex-col',
		'items-start',         // sola hizalı kartlar daha profesyonel görünür
		'justify-start',
		'w-full',
		'h-full',
		'overflow-y-auto',
		'gap-4',               // kartlar arası boşluk daha belirgin
		'p-4',                 // iç boşluk
		'rounded-2xl',         // yuvarlatılmış köşeler
		'bg-gray-800',            // arka plan beyaz
		'shadow-inner',        // iç gölge efekti
		'scrollbar',                // scrollbar'ı etkinleştir
		'scrollbar-thumb-gray-600',
		'scrollbar-track-gray-200',
		'hover:scrollbar-thumb-gray-800',
		'rounded-md',
		'max-h-[90%]'          // taşma olmaması için maksimum yükseklik
	);

	//! oyuncuları listele fonksiyonu
	listPlayers(div12);


	const div13 = document.createElement('div');
	div13.classList.add(
		'flex',
		'flex-row',
		'justify-start',
		'items-center',
		'gap-4',
		'p-4',
		'bg-gray-400',
		'w-[25%]',
		'rounded-lg',
		'hover:bg-yellow-500',
		'transition-colors',
		'duration-300',
		'hover:cursor-pointer',
	);

	const div13_b = document.createElement('div');
	div13_b.classList.add(
		'flex',
		'justify-center',
		'items-center',
		'w-full',
	);
	div13_b.textContent = exmp.getLang('tournament.play');


	div13.appendChild(div13_b);

	
	div11.appendChild(div11p1);

	
	tournament02.appendChild(div11);
	tournament02.appendChild(div12);
	tournament02.appendChild(div13);

	container.appendChild(tournament01);
	container.appendChild(tournament02);
}



function listPlayers(container: HTMLElement): void {
	const players = [
		{ name: 'Ahmet', score: 100 },
		{ name: 'Mehmet', score: 200 },
		{ name: 'Ayşe', score: 150 },
		{ name: 'Fatma', score: 120 },
		{ name: 'Ahmet', score: 100 },
		{ name: 'Mehmet', score: 200 },
		{ name: 'Ayşe', score: 150 },
		{ name: 'Fatma', score: 120 },
	];

	players.forEach(player => {
		const playerDiv = document.createElement('div');
		playerDiv.classList.add(
			'flex',
			'flex-row',
			'justify-between',
			'items-center',
			'bg-gray-700',
			'rounded-lg',
			'p-4',
			'w-[97%]',
			'h-[15%]',
			'm-2',
			'shadow-lg',
			'hover:bg-gray-600',
			'transition-colors',
			'duration-300',
			'transition-transform',
			'hover:scale-[1.02]',
		);
		const playerName = document.createElement('p');
		playerName.textContent = player.name;
		playerName.classList.add(
			'text-white',
			'text-lg',
			'font-bold',
		);
		const playerScore = document.createElement('p');
		playerScore.textContent = player.score.toString();
		playerScore.classList.add(
			'text-white',
			'text-lg',
			'font-bold',
		);

		playerDiv.appendChild(playerName);
		playerDiv.appendChild(playerScore);
		container.appendChild(playerDiv);
});
}