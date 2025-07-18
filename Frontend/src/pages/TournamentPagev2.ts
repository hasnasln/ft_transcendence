import { exmp } from '../languageMeneger';
import { _apiManager } from '../api/APIManager';
import { ITournament } from '../api/types';
import { PlayPage } from './play-page';
import { Page } from '../router';

// Recommended way, to include only the icons you need.
export class TournamentPage implements Page {
	private data: ITournament | null = null;
	private status: boolean = false;

	public evaluate(): string {
		return getTournamentPageHTML();
	}

	public onLoad(): void {
		this.data = JSON.parse(localStorage.getItem('tdata') || '{}'); // Retrieve tournament data from localStorage if available

		requestAnimationFrame(() => this.init());

		document.addEventListener('click', (e) => {
			const toggleContainer = document.getElementById('toggleContainer');
			if (!toggleContainer) return;

			if ((e.target as HTMLElement).closest('#showCreate')) {
				animation(toggleContainer, 1, 0);
				document.getElementById('fatma123')?.classList.remove('hidden');
				document.getElementById('fatma1234')?.classList.add('hidden');
			} else if ((e.target as HTMLElement).closest('#showJoin')) {
				animation(toggleContainer, -1, toggleContainer.offsetWidth);
				document.getElementById('fatma123')?.classList.add('hidden');
				document.getElementById('fatma1234')?.classList.remove('hidden');
			}
		});
	}

	public init(): void {
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
				case 'start-tournament':
					this.hedleStartTournament();
					break;
				case 'play-game':
					this.handlePlay();
					break;
				case 'tree':
					this.handleTree();
				default:
					break;
			}
		});
	}

	private handleTree(): void {
		console.log("----------->>>Tree tıkladı")
	}

	private async hedleStartTournament(): Promise<void> {
		console.log('Starting tournament');
		const response = await _apiManager.startTournament(this.data.code);
		if (response.success) {
			this.status = true;
			this.handeleRefresh();
		}
		console.log(response.data);
	}

	private async handeleRefresh(): Promise<void> {
		console.log('Refreshing player list');
		const x = document.getElementById('list-player');
		if (x) {
			console.log('Refreshing player list2');
			x.innerHTML = ''; // Clear the existing list
			const response = await _apiManager.getTournament(this.data.code);
			this.data.users = response.data.participants; // Update the tournament data with the new participants
			if (response.data.tournament_start)
				this.status = true; // Set status to true if the tournament has started
			// sadece 3 saniye bekle
			//! burada refleş işleminden dönen değerler kontorl edlip ona göre buton gözükme işlemi olacak
			//! şimdilik ilk refleşten sonra direk gözükür durumda.
			setTimeout(() => {
				// 3 saniye sonra listeyi güncelle
				// this.updatePlayerList(x);
				x.innerHTML = getPlayersListHTML(this.data); // Re-render the player list
				if (this.status) {
					const playButton = document.getElementById('play-button');
					if (playButton) {
						playButton.style.visibility = 'visible'; // Show the button
					}
				}
			}, 1000);
		}
	}

	private async createTournament(container: HTMLElement): Promise<void> {
		console.log('Creating tournament');
		const input = document.querySelector('#createInput') as HTMLInputElement;
		console.log('Turnuva ismi: ', input.value);
		// localStorage.removeItem('tdata'); // Clear any existing tournament data in localStorage
		if (localStorage.getItem('tdata') === null) {

			const response = await _apiManager.createTournament(input.value);
			const tdata: ITournament = {
				id: response.data.id,
				code: response.data.code,
				name: response.data.name,
				admin_id: response.data.admin_id,
				users: response.data.participants
			}
			this.data = tdata; // Store the created tournament data
			localStorage.setItem('tdata', JSON.stringify(tdata)); // Store the tournament data in localStorage
			if (localStorage.getItem("tdata") !== null)
				console.log("---------< tdata var");
			else
				console.log("---------< tdata yok");
		} else {
			this.data = JSON.parse(localStorage.getItem('tdata')!); // Retrieve the tournament data from localStorage
			this.data.name = input.value; // Update the tournament name
			// this.data.users = []; // Reset participants list
			// this.data.admin_id = localStorage.getItem('uuid') || ''; // Set admin_id to current user ID
			// localStorage.setItem('tdata', JSON.stringify(this.data)); // Store the updated tournament data in localStorage
			console.log("Turnuva ismi güncellendi: ", this.data.name);
		}
		console.log('-_-_-_-_-_-_-_->>Tournament created:', this.data);
		container.innerHTML = ''; // Clear the container
		// getTournamentTree(container, 5); // Render the tournament tree
		container.innerHTML = getShowTournamentHTML(this.data!); // Re-render the tournament section
	}

	private async joinRoom(container: HTMLElement): Promise<void> {
		const input = document.querySelector('#joinInput') as HTMLInputElement;
		const tournamentId = input.value;

		if (localStorage.getItem('tdata') === null) {
			let response = await _apiManager.joinTournament(input.value);
			if (!response.success) {
				alert('Tournament created not successfully!');
				return;
			} else {
				response = await _apiManager.getTournament(tournamentId);
				if (!response.success)
					alert("ikinci istekde sıkıntı çıktı")
			}
			const tdata: ITournament = {
				id: response.data.id,
				code: response.data.code,
				name: response.data.name,
				admin_id: response.data.admin_id,
				users: response.data.participants
			}
			localStorage.setItem('tdata', JSON.stringify(tdata)); // Store the tournament data in localStorage
			this.data = tdata; // Store the created tournament data
		} else {
			this.data = JSON.parse(localStorage.getItem('tdata')!); // Retrieve the tournament data from localStorage
		}
		console.log(`Joining room with ID: ${tournamentId}`);
		container.innerHTML = getShowTournamentHTML(this.data); // Re-render the tournament section
	}

	private async exitTournament(container: HTMLElement): Promise<void> {
		if (this.data.admin_id === localStorage.getItem('uuid')) {
			const response = await _apiManager.deleteTournament(this.data.code);
			console.log(response.message);
			console.log("Oda yöneticisi tıkladı");
			console.log('turnuva siliniyor');
		}
		else {
			const response = await _apiManager.leaveTournament(this.data.code);
			console.log(response.message);
			console.log("user tıkladı");
			console.log('Exiting tournament');
		}
		localStorage.removeItem('tdata'); // Remove tournament data from localStorage
		container.innerHTML = getTournamentFirstSectionHTML(); // Re-render the tournament section
	}

	private handlePlay() {
		const tournamentDiv = document.getElementById("tournament-main");
		if (!tournamentDiv)
			console.log(`turnuva divi yok`);
		else {
			tournamentDiv.innerHTML = '';
			const playPage = new PlayPage();
			/** todo
			const {info, menu} = playPage.render(tournamentDiv);
			// 3 sanite bekle
			if (info !== null && menu !== null) {
				info.classList.remove('hidden');
				// info.textContent = exmp.getLang("game.loading");
				info.classList.add('bg-gray-950');
				loadingWithMessage(info, 'Lütfen Telefonu Yatay Tutunuz');
							
				setTimeout(() => {
					gameInstance.initGameSettings(true, this.data.code);
					info.classList.add('hidden');
					info.classList.remove('bg-blue-500');
				}, 2000); 
			}*/
		}
	}
}

function getTournamentPageHTML(): string {
	const tdata = localStorage.getItem('tdata');

	let content: string;
	if (tdata === null) {
		content = getTournamentFirstSectionHTML();
	} else {
		const tournamentData: ITournament = JSON.parse(tdata);
		content = getShowTournamentHTML(tournamentData);
	}

	return `
        <div id="tournament-main" class="flex flex-col items-center justify-center h-full w-full absolute top-0 left-0 z-0 bg-gray-300">
            ${content}
        </div>
    `;
}



function getJoinOrCreatePanelHTML(id: string, key: string, title: string, placeholder: string): string {
	const position = id === 'createPanel' ? 'right-0' : 'left-0';

	return `
        <div id="${id}" class="absolute top-0 w-1/2 h-full z-[1] flex items-center justify-center ${position}">
            <form class="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center">
                <h1 class="text-2xl font-bold mb-2">${title}</h1>
                
                <input 
                    type="text" 
                    id="${key}Input" 
                    placeholder="${placeholder}" 
                    class="bg-gray-200 text-sm p-3 rounded w-full mt-2 outline-none"
                />
                
                <div 
                    id="${key}_error_message" 
                    class="flex justify-center items-center text-red-500 text-sm font-bold mt-2 w-[60%] bg-red-100"
                    style="height: 1.5rem; visibility: hidden;"
                ></div>
                
                <button 
                    type="button" 
                    id="${key}Btn" 
                    data-action="${key === 'create' ? 'create-tournament' : 'join-room'}"
                    class="bg-teal-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded mt-3"
                >
                    ${exmp.getLang(title)}
                </button>
            </form>
        </div>
    `;
}

function getTournamentFirstSectionHTML(): string {
	return `
        <div id="tournament-container" class="relative bg-white rounded-[30px] shadow-lg w-[768px] max-w-full min-h-[480px] overflow-hidden transition-all-ease font-montserrat">
            ${getJoinOrCreatePanelHTML('createPanel', 'create', exmp.getLang('tournament-first-page.create-title'), exmp.getLang('tournament-first-page.create-placeholder'))}
            
            ${getJoinOrCreatePanelHTML('joinPanel', 'join', exmp.getLang('tournament-first-page.join-title'), exmp.getLang('tournament-first-page.join-placeholder'))}
            
            <div id="toggleContainer" class="absolute top-0 w-1/2 h-full z-[10]">
                <div id="fatma" class="bg-gradient-to-r from-indigo-600 to-teal-500 h-full w-[100%] relative flex items-center justify-center">
                    <!-- Join Toggle Content (visible by default) -->
                    <div id="fatma1234" class="z-[100] w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white">
                        <h1 class="text-3xl font-bold">${exmp.getLang('tournament-first-page.m-title-for-showcreate')}</h1>
                        <button id="showCreate" class="bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded">
                            ${exmp.getLang('tournament-first-page.m-join-button')}
                        </button>
                    </div>
                    
                    <div id="fatma123" class="hidden z-[100] w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white">
                        <h1 class="text-3xl font-bold">${exmp.getLang('tournament-first-page.m-title-for-showjoin')}</h1>
                        <button id="showJoin" class="bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded">
                            ${exmp.getLang('tournament-first-page.m-create-button')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}



function animation(obje: HTMLElement, dir: number, start: number) {
	let x = 0;

	function move() {
		x += dir * 20;
		obje.style.transform = `translateX(${start + x}px)`;
		if (x >= obje.offsetWidth || x <= -obje.offsetWidth)
			return;
		requestAnimationFrame(move)
	}
	move();
}

function getShowTournamentHTML(tdata: ITournament): string {
	return `
        <div id="tournament-div02" class="flex flex-col justify-start items-center rounded-3xl w-[1200px] h-[900px] bg-gray-300 p-6 gap-4 overflow-y-auto overflow-x-auto scrollbar">
            ${getTournamentInformationHTML(tdata)}
        </div>
    `;
}


function getTournamentInformationHTML(tdata: ITournament): string {
	const isAdmin = tdata.admin_id === localStorage.getItem('uuid');

	return `
        <div class="flex flex-col justify-between items-center bg-gray-900 rounded-lg p-4 w-[640px] h-[350px] lg:w-[950px] lg:h-[500px]">
            <div class="w-full flex flex-row justify-between items-center gap-4 p-4">
                <div class="flex flex-row justify-center items-center gap-4 p-1">
                    <img src="/IMG/trophy.png" class="w-[50px] h-[50px]" alt="Trophy">
                    <h1 class="text-2xl font-bold text-center text-white">${tdata.name}</h1>
                </div>
                
                ${isAdmin ? `
                    <div id="start-button" data-action="start-tournament" class="flex justify-center items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-300">
                        BASLAT
                    </div>
                ` : ''}
                
                <div data-action="exit-tournament" class="flex justify-center items-center flex-row bg-red-500 text-white px-4 py-2 gap-2 rounded-lg hover:bg-red-700 transition-colors duration-300 hover:cursor-pointer">
                    <img src="/IMG/exit.png" class="w-[30px] h-[35px]" alt="Exit">
                    <p>${exmp.getLang('tournament-second-page.exit')}</p>
                </div>
            </div>
            
            <div class="flex flex-col justify-center items-start w-full bg-gray-800 h-[20%]">
                <p class="text-gray-400 text-lg pl-4">${exmp.getLang('tournament-second-page.tournament-id')}</p>
                <p class="text-white text-lg pl-4 font-bold">${tdata.code}</p>
            </div>
            
            <div class="flex flex-col justify-center items-start w-full bg-gray-800 h-[20%]">
                <p class="text-gray-400 text-lg pl-4">${exmp.getLang('tournament-second-page.tournament-creater')}</p>
                <p class="text-white text-lg pl-4 font-bold">${tdata.users[0].username}</p>
            </div>
            
            <div class="flex flex-col justify-center items-start w-full bg-gray-800 h-[20%]">
                <p class="text-gray-400 text-lg pl-4">${exmp.getLang('tournament-second-page.tournament-total-players')}</p>
                <p class="text-white text-lg pl-4 font-bold">10</p>
            </div>
        </div>
        
        <div class="flex flex-col justify-between items-center bg-gray-900 rounded-lg p-4 gap-4 w-[640px] h-[400px] lg:w-[980px] lg:h-[600px]">
            <!-- Header -->
            <div class="w-full flex flex-row justify-between items-center pl-4 pr-5 pt-1">
                <p class="text-2xl font-bold text-center text-white">${exmp.getLang('tournament-second-page.tournament-joined-players')}</p>
                <div data-action="tree">T</div>
                <img src="/IMG/refresh.png" data-action="refresh" class="w-[30px] h-[35px] hover:cursor-pointer hover:scale-110" alt="Refresh">
            </div>
            
            <div id="list-player" class="flex flex-col items-center justify-start w-full h-full overflow-y-auto gap-4 p-4 rounded-2xl bg-gray-800 shadow-inner scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-200 hover:scrollbar-thumb-gray-800 rounded-md max-h-[90%]">
                ${getPlayersListHTML(tdata)}
            </div>
            
            <div id="play-button" data-action="play-game" class="flex flex-row justify-start items-center gap-4 p-4 bg-gray-400 w-[25%] rounded-lg hover:bg-yellow-500 transition-colors duration-300 hover:cursor-pointer" style="visibility: hidden;">
                <div class="flex justify-center items-center w-full">
                    ${exmp.getLang('tournament-second-page.play')}
                </div>
            </div>
        </div>
    `;
}



function getPlayersListHTML(tdata: ITournament): string {
	return tdata.users.map(player => `
        <div class="flex flex-row justify-center items-center bg-gray-700 rounded-lg p-4 w-[84%] h-[15%] m-2 shadow-lg hover:bg-gray-600 transition-colors duration-300 transition-transform hover:scale-[1.02]">
            <p class="text-white text-lg font-bold">${player.username}</p>
        </div>
    `).join('');
}
