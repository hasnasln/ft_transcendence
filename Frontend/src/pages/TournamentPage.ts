import { game_button } from '../components/buttons';
import { exmp } from '../languageMeneger';
import { game } from './play';

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
				case 'refresh':
					this.handeleRefresh();
					break;
				default:
					break;
			}
		});
	}

	private handeleRefresh(): void {
		console.log('Refreshing player list');
		const x = document.getElementById('list-player');
		if (x) {
			console.log('Refreshing player list2');
			x.innerHTML = ''; // Clear the existing list
			// sadece 3 saniye bekle
			//! burada refleş işleminden dönen değerler kontorl edlip ona göre buton gözükme işlemi olacak
			//! şimdilik ilk refleşten sonra direk gözükür durumda.
			setTimeout(() => {
				// 3 saniye sonra listeyi güncelle
				// this.updatePlayerList(x);
				listPlayers(x); // Re-render the player list
				let status = true;
				if (status)
				{
					const playButton = document.getElementById('play-button');
					if (playButton) {
						playButton.style.visibility = 'visible'; // Show the button
					}
				}
			}, 1000);
		}
		
	}

	private createTournament(container: HTMLElement): void {
		const input = document.querySelector('#tournament-form input') as HTMLInputElement;
		const tournamentId = input.value;
		console.log(`Creating tournament with ID: ${tournamentId}`);
		container.innerHTML = ''; // Clear the container
		ShowTournament(container); // Re-render the tournament section
	}

	private joinRoom(container: HTMLElement): void {
		const input = document.querySelector('#tournament-form input') as HTMLInputElement;
		const tournamentId = input.value;
		console.log(`Joining room with ID: ${tournamentId}`);
		container.innerHTML = ''; // Clear the container
		ShowTournament(container); // Re-render the tournament section
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
		'bg-gray-300',
	);
	hasnasln(div);
	// createTournamentSection(div);
	// ShowTournament(div);
	container.appendChild(div);
}

function hasnasln(container: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.id = 'tournament-container';
    wrapper.className = "relative bg-white rounded-[30px] shadow-lg w-[768px] max-w-full min-h-[480px] overflow-hidden transition-all-ease font-montserrat";


    // turnuva oluşturma 
    const createPanel = document.createElement('div');
    createPanel.id = 'createPanel';
    createPanel.className = "absolute top-0 right-0 w-1/2 h-full z-10 flex items-center justify-center transition-all-ease";
    createPanel.innerHTML = `
    <form class="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center">
        <h1 class="text-2xl font-bold mb-2">Turnuva Oluştur</h1>
        <input type="text" placeholder="Turnuva Adı" class="bg-gray-200 text-sm p-3 rounded w-full mt-2 outline-none" id="createInput"/>
        <button type="button" class="bg-teal-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded mt-3" id="createBtn">Oluştur</button>
    </form>
    `;

    // turnuvaya katılma paneli için
    const joinPanel = document.createElement('div');
    joinPanel.id = 'joinPanel';
    joinPanel.className = "absolute top-0 left-0 w-1/2 h-full z-[1] flex items-center justify-center";
    joinPanel.innerHTML = `
    <form class="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center">
        <h1 class="text-2xl font-bold mb-2">Turnuvaya Katıl</h1>
        <input type="text" placeholder="Turnuva Kodu" class="bg-gray-200 text-sm p-3 rounded w-full mt-2 outline-none" id="joinInput"/>
        <button type="button" class="bg-teal-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded mt-3" id="joinBtn">Katıl</button>
    </form>
    `;

	function toggleWithCreate(container : HTMLElement) {
		container.innerHTML = `
		<div id="fatma1234" class="w-1/2 hidden flex flex-col items-center justify-center text-center px-6 text-white">
          <h1 class="text-3xl font-bold">Turnuvaya Katıl</h1>
          <p class="text-sm mt-4 mb-6">Daha önce oluşturduğun turnuvaya katılabilirsin.</p>
          <button id="showJoin" class="bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded">Katıl Paneli</button>
        </div>
		`;

	}

	function toggleWithJoin(container : HTMLElement) {
		container.innerHTML = `
		 <div id="fatma123" class="w-1/2 flex flex-col items-center justify-center text-center px-6 text-white">
          <h1 class="text-3xl font-bold">Yeni Turnuva</h1>
          <p class="text-sm mt-4 mb-6"></p>
          <button id="showCreate" class="bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded">Oluştur</button>
        </div>
		`;
		
	}
    // panel değiştimek için bunalr
    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'toggleContainer';
    toggleContainer.className = "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-[1000] transition-all-ease";
   
	const fatma = document.createElement('div');
	fatma.id = 'fatma';
	fatma.className = "toggle bg-gradient-to-r from-indigo-600 to-teal-500 h-full w-[200%] relative left-[-100%] transition-all-ease flex";
	toggleContainer.appendChild(fatma);

	toggleWithJoin(fatma);
	toggleWithCreate(fatma);
    wrapper.appendChild(createPanel);
    wrapper.appendChild(joinPanel);
    wrapper.appendChild(toggleContainer);
    container.appendChild(wrapper);

	const showJoinBtn = toggleContainer.querySelector('#showJoin') as HTMLButtonElement;
    const showCreateBtn = toggleContainer.querySelector('#showCreate') as HTMLButtonElement;
    const createBtn = createPanel.querySelector('#createBtn') as HTMLButtonElement;
    const joinBtn = joinPanel.querySelector('#joinBtn') as HTMLButtonElement;
    const createInput = createPanel.querySelector('#createInput') as HTMLInputElement;
    const joinInput = joinPanel.querySelector('#joinInput') as HTMLInputElement;
	const x = toggleContainer.querySelector('#fatma1234') as HTMLDivElement;
	const y = toggleContainer.querySelector('#fatma123') as HTMLDivElement;
	
	
    // animasyonnnnn ->>>>>>>>>>
    showCreateBtn.addEventListener('click', () => {
		ahmet(toggleContainer, -1, 0);
		x.classList.remove('hidden'); //fatma1234
		y.classList.add('hidden'); //fatma123
    });
	
	
	showJoinBtn.addEventListener('click', () => {
		ahmet(toggleContainer, 1, -400);
		x.classList.add('hidden'); //fatma1234
		y.classList.remove('hidden'); //fatma123
		
	});

    createBtn.addEventListener('click', () => {
		alert('Turnuva oluşturuldu: ' + createInput.value);
    });

    joinBtn.addEventListener('click', () => {
		alert('Turnuvaya katılınıyor: ' + joinInput.value);
    });
}

function ahmet(obje: HTMLElement, dir: number, start: number)
{
	let x = 0;

	function move(){
		
		x += dir * 10;
		obje.style.transform =  `translateX(${start + x}px)`;
		if (x === 400 || x === -400)
			return;
		requestAnimationFrame(move)
	}
	move();
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
		'gap-6',
	)

	const title = document.createElement('h1');
	title.textContent = exmp.getLang('tournament.first-page.title');
	title.classList.add(
		'text-6xl',
		'font-bold',
		'text-center',
		'text-gray-900',
	);

	const p = document.createElement('p');
	p.textContent = exmp.getLang('tournament.first-page.description');
	p.classList.add(
		'text-gray-900',
		'text-xl',
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
	input.placeholder = exmp.getLang('tournament.first-page.input-placeholder');
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
	button2.textContent = exmp.getLang('tournament.first-page.join');
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
	button.textContent = exmp.getLang('tournament.first-page.create');
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
		'bg-gray-300',
		'p-6',
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
	img.src = '/IMG/trophy.png';
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
	img02.src = '/IMG/exit.png';
	img02.classList.add(
		'w-[30px]',
		'h-[35px]',
	);

	const p = document.createElement('p');
	p.textContent = exmp.getLang('tournament.second-page.exit');

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
	div02p1.textContent = exmp.getLang('tournament.second-page.tournament-id');
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
	div03p1.textContent = exmp.getLang('tournament.second-page.tournament-creater');
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
	div04p1.textContent = exmp.getLang('tournament.second-page.tournament-total-players');
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
		'justify-between',
		'items-center',
		'pl-4',
		'pr-5',
		'pt-1',
	);
	
	const div11p1 = document.createElement('p');
	div11p1.textContent = exmp.getLang('tournament.second-page.tournament-joined-players');
	div11p1.classList.add(
		'text-2xl',
		'font-bold',
		'text-center',
		'text-white',
	);

	const div11img = document.createElement('img');
	div11img.src = '/IMG/refresh.png';
	div11img.classList.add(
		'w-[30px]',
		'h-[35px]',
		'hover:cursor-pointer',
		'hover:scale-110',
	);
	div11img.setAttribute('data-action', 'refresh');


	// oyuncuların sıralanacağı kısım
	const div12 = document.createElement('div');
	div12.id = 'list-player';
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
	div13.id = 'play-button';
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

	div13.style.visibility = 'hidden'; // başlangıçta görünmez

	const div13_b = document.createElement('div');
	div13_b.classList.add(
		'flex',
		'justify-center',
		'items-center',
		'w-full',
	);
	div13_b.textContent = exmp.getLang('tournament.second-page.play');


	div13.appendChild(div13_b);

	
	div11.appendChild(div11p1);
	div11.appendChild(div11img);

	
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