import { exmp } from '../languageMeneger';
import { gameInstance } from './play';
import { _apiManager } from '../api/APIManeger';
import { loadingWithMessage } from '../components/loading';
import { PlayPage } from './play-page';
// Recommended way, to include only the icons you need.
export class TournamentPage {
    // private  currentLanguage: string; // Mevcut dili saklamak için
    data; // Tournament data, initially null
    status = false;
    constructor() {
        this.data =
            {
                id: -1,
                code: '',
                name: '',
                admin_id: '',
                users: [],
            }; // Initialize with undefined
        this.data = JSON.parse(localStorage.getItem('tdata') || '{}'); // Retrieve tournament data from localStorage if available
        // this.currentLanguage = exmp.getLanguage();
    }
    render(container) {
        if (!container) {
            console.error('Container not found');
            return;
        }
        renderTournament(container);
        requestAnimationFrame(() => {
            this.init();
        });
    }
    init() {
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
            const target = event.target.closest('[data-action]');
            if (!target)
                return;
            const action = target.getAttribute('data-action');
            if (!action)
                return;
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
    handleTree() {
        console.log("----------->>>Tree tıkladı");
    }
    async hedleStartTournament() {
        console.log('Starting tournament');
        const response = await _apiManager.startTournament(this.data.code);
        if (response.success === true) {
            this.status = true;
            this.handeleRefresh();
        }
        console.log(response.data);
    }
    async handeleRefresh() {
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
                listPlayers(x, this.data); // Re-render the player list
                if (this.status) {
                    const playButton = document.getElementById('play-button');
                    if (playButton) {
                        playButton.style.visibility = 'visible'; // Show the button
                    }
                }
            }, 1000);
        }
    }
    async createTournament(container) {
        console.log('Creating tournament');
        const input = document.querySelector('#createInput');
        console.log('Turnuva ismi: ', input.value);
        // localStorage.removeItem('tdata'); // Clear any existing tournament data in localStorage
        if (localStorage.getItem('tdata') === null) {
            const response = await _apiManager.createTournament(input.value);
            const tdata = {
                id: response.data.id,
                code: response.data.code,
                name: response.data.name,
                admin_id: response.data.admin_id,
                users: response.data.participants
            };
            this.data = tdata; // Store the created tournament data
            localStorage.setItem('tdata', JSON.stringify(tdata)); // Store the tournament data in localStorage
            if (localStorage.getItem("tdata") !== null)
                console.log("---------< tdata var");
            else
                console.log("---------< tdata yok");
        }
        else {
            this.data = JSON.parse(localStorage.getItem('tdata')); // Retrieve the tournament data from localStorage
            this.data.name = input.value; // Update the tournament name
            // this.data.users = []; // Reset participants list
            // this.data.admin_id = localStorage.getItem('uuid') || ''; // Set admin_id to current user ID
            // localStorage.setItem('tdata', JSON.stringify(this.data)); // Store the updated tournament data in localStorage
            console.log("Turnuva ismi güncellendi: ", this.data.name);
        }
        console.log('-_-_-_-_-_-_-_->>Tournament created:', this.data);
        container.innerHTML = ''; // Clear the container
        // getTournamentTree(container, 5); // Render the tournament tree
        ShowTournament(container, this.data); // Re-render the tournament section
    }
    async joinRoom(container) {
        const input = document.querySelector('#joinInput');
        const tournamentId = input.value;
        if (localStorage.getItem('tdata') === null) {
            let response = await _apiManager.playerJoinTournament(input.value);
            if (response.success === false) {
                alert('Tournament created not successfully!');
                return;
            }
            else {
                response = await _apiManager.getTournament(tournamentId);
                if (response.success == false)
                    alert("ikinci istekde sıkıntı çıktı");
            }
            const tdata = {
                id: response.data.id,
                code: response.data.code,
                name: response.data.name,
                admin_id: response.data.admin_id,
                users: response.data.participants
            };
            localStorage.setItem('tdata', JSON.stringify(tdata)); // Store the tournament data in localStorage
            this.data = tdata; // Store the created tournament data
        }
        else {
            this.data = JSON.parse(localStorage.getItem('tdata')); // Retrieve the tournament data from localStorage
        }
        console.log(`Joining room with ID: ${tournamentId}`);
        container.innerHTML = ''; // Clear the container
        ShowTournament(container, this.data); // Re-render the tournament section
    }
    async exitTournament(container) {
        if (this.data.admin_id === localStorage.getItem('uuid')) {
            const response = await _apiManager.deleteTournament(this.data.code);
            console.log(response.message);
            console.log("Oda yöneticisi tıkladı");
            console.log('turnuva siliniyor');
        }
        else {
            const response = await _apiManager.playerLeaveTournament(this.data.code);
            console.log(response.message);
            console.log("user tıkladı");
            console.log('Exiting tournament');
        }
        localStorage.removeItem('tdata'); // Remove tournament data from localStorage
        container.innerHTML = ''; // Clear the container
        t_first_section(container); // Re-render the tournament section
    }
    handlePlay() {
        const tournamentDiv = document.getElementById("tournament-main");
        if (!tournamentDiv)
            console.log(`turnuva divi yok`);
        else {
            tournamentDiv.innerHTML = '';
            const playPage = new PlayPage();
            const { info, menu } = playPage.render(tournamentDiv);
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
            }
        }
    }
}
function renderTournament(container) {
    const div = document.createElement('div');
    div.id = 'tournament-main';
    div.classList.add('flex', 'flex-col', 'items-center', 'justify-center', 'h-full', 'w-full', 'absolute', 'top-0', 'left-0', 'z-0', 'bg-gray-300');
    if (localStorage.getItem('tdata') === null) {
        console.log("---------------------->tdata yok");
        t_first_section(div);
    }
    else {
        const tdata = JSON.parse(localStorage.getItem('tdata'));
        ShowTournament(div, tdata); // Render the tournament section with existing data
        // getTournamentTree(div, 5); // Render the tournament tree
        console.log('Tournament data from localStorage:', tdata);
        console.log('Tournament data from localStorage:', localStorage.getItem('tdata'));
    }
    container.appendChild(div);
}
function joinorcreate(container, id, key, title, placeholder) {
    const panel = document.createElement('div');
    panel.id = id;
    panel.className = "absolute top-0 w-1/2 h-full z-[1] flex items-center justify-center";
    if (id === 'createPanel')
        panel.classList.add('right-0');
    else
        panel.classList.add('left-0');
    const form = document.createElement('form');
    form.className = "bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center";
    const h1 = document.createElement('h1');
    h1.className = "text-2xl font-bold mb-2";
    h1.textContent = title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = "bg-gray-200 text-sm p-3 rounded w-full mt-2 outline-none";
    input.id = key + 'Input';
    input.placeholder = placeholder;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = "bg-teal-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded mt-3";
    button.id = key + 'Btn';
    button.textContent = exmp.getLang(title);
    button.setAttribute('data-action', key === 'create' ? 'create-tournament' : 'join-room');
    const showError = document.createElement('div');
    showError.id = key + '_error_message';
    showError.classList.add('flex', 'justify-center', 'items-center', 'text-red-500', 'text-sm', 'font-bold', 'mt-2', 'w-[60%]', 'bg-red-100');
    showError.style.height = '1.5rem';
    showError.style.visibility = 'hidden'; // Initially hidden
    form.appendChild(h1);
    form.appendChild(input);
    form.appendChild(showError);
    form.appendChild(button);
    panel.appendChild(form);
    container.appendChild(panel);
}
function t_first_section(container) {
    const wrapper = document.createElement('div');
    wrapper.id = 'tournament-container';
    wrapper.className = "relative bg-white rounded-[30px] shadow-lg w-[768px] max-w-full min-h-[480px] overflow-hidden transition-all-ease font-montserrat";
    // // turnuva oluşturma 
    // // const createPanel = document.createElement('div');
    // // createPanel.id = 'createPanel';
    // // createPanel.className = "absolute top-0 right-0 w-1/2 h-full z-[1] flex items-center justify-center";
    // // createPanel.innerHTML = `
    // // <form class="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center">
    // // 	<h1 class="text-2xl font-bold mb-2">${exmp.getLang('tournament-first-page.create-title')}</h1>
    // // 	<input type="text" placeholder="${exmp.getLang('tournament-first-page.create-placeholder')}" class="bg-gray-200 text-sm p-3 rounded w-full mt-2 outline-none" id="createInput"/>
    // // 	<button type="button" class="bg-teal-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded mt-3" id="createBtn">${exmp.getLang('tournament-first-page.create-button')}</button>
    // // </form>
    // // `;
    // // turnuvaya katılma paneli için
    // // const joinPanel = document.createElement('div');
    // // joinPanel.id = 'joinPanel';
    // // joinPanel.className = "absolute top-0 left-0 w-1/2 h-full z-[1] flex items-center justify-center";
    // // joinPanel.innerHTML = `
    // // <form class="bg-white flex flex-col items-center justify-center h-full w-full px-10 text-center">
    // // 	<h1 class="text-2xl font-bold mb-2">${exmp.getLang('tournament-first-page.join-title')}</h1>
    // // 	<input type="text" placeholder="${exmp.getLang('tournament-first-page.join-placeholder')}" class="bg-gray-200 text-sm p-3 rounded w-full mt-2 outline-none" id="joinInput"/>
    // // 	<button type="button" class="bg-teal-600 text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded mt-3" id="joinBtn" >${exmp.getLang('tournament-first-page.join-button')}</button>
    // // </form>
    // // `;
    function toggleWithJoin(container) {
        container.innerHTML = ''; // Clear the container
        const div02 = document.createElement('div');
        div02.id = 'fatma1234';
        div02.className = "z-[100] w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white";
        const h2 = document.createElement('h1');
        h2.className = "text-3xl font-bold";
        h2.textContent = exmp.getLang('tournament-first-page.m-title-for-showcreate');
        const button2 = document.createElement('button');
        button2.id = 'showCreate';
        button2.className = "bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded";
        button2.textContent = exmp.getLang('tournament-first-page.m-join-button');
        div02.appendChild(h2);
        div02.appendChild(button2);
        container.appendChild(div02);
    }
    function toggleWithCreate(container) {
        // container.innerHTML = ''; // Clear the container
        const div01 = document.createElement('div');
        div01.id = 'fatma123';
        div01.className = "hidden z-[100] w-full flex flex-col items-center justify-center gap-4 text-center px-6 text-white";
        const h1 = document.createElement('h1');
        h1.className = "text-3xl font-bold";
        h1.textContent = exmp.getLang('tournament-first-page.m-title-for-showjoin');
        ;
        const button = document.createElement('button');
        button.id = 'showJoin';
        button.className = "bg-transparent border border-white text-white text-xs font-semibold uppercase tracking-wide py-2 px-12 rounded";
        button.textContent = exmp.getLang('tournament-first-page.m-create-button');
        div01.appendChild(h1);
        div01.appendChild(button);
        container.appendChild(div01);
    }
    // panel değiştimek için bunalr
    const toggleContainer = document.createElement('div');
    toggleContainer.id = 'toggleContainer';
    toggleContainer.className = "absolute top-0 w-1/2 h-full z-[10]";
    const fatma = document.createElement('div');
    fatma.id = 'fatma';
    fatma.className = "bg-gradient-to-r from-indigo-600 to-teal-500 h-full w-[100%] relative flex items-center justify-center";
    toggleWithJoin(fatma); // join panelini göster kısmı gözükecek
    toggleWithCreate(fatma); // turnuva oluşturma paneli gizli olacak
    toggleContainer.appendChild(fatma);
    joinorcreate(wrapper, 'createPanel', 'create', exmp.getLang('tournament-first-page.create-title'), exmp.getLang('tournament-first-page.create-placeholder'));
    // // wrapper.appendChild(createPanel);
    // // wrapper.appendChild(joinPanel);
    joinorcreate(wrapper, 'joinPanel', 'join', exmp.getLang('tournament-first-page.join-title'), exmp.getLang('tournament-first-page.join-placeholder'));
    wrapper.appendChild(toggleContainer);
    container.appendChild(wrapper);
    const showCreateBtn = toggleContainer.querySelector('#showCreate');
    const showJoinBtn = toggleContainer.querySelector('#showJoin');
    // bunlar zaten var
    // const createBtn = createPanel.querySelector('#createBtn') as HTMLButtonElement;
    // const joinBtn = joinPanel.querySelector('#joinBtn') as HTMLButtonElement;
    // createBtn.setAttribute('data-action', 'create-tournament');
    // joinBtn.setAttribute('data-action', 'join-room');
    // animasyonnnnn ->>>>>>>>>>
    showCreateBtn.addEventListener('click', () => {
        animation(toggleContainer, 1, 0);
        const x = document.getElementById('fatma123');
        x.classList.remove('hidden');
        const y = document.getElementById('fatma1234');
        y.classList.add('hidden');
    });
    showJoinBtn.addEventListener('click', () => {
        animation(toggleContainer, -1, toggleContainer.offsetWidth);
        const y = document.getElementById('fatma1234');
        y.classList.remove('hidden');
        const x = document.getElementById('fatma123');
        x.classList.add('hidden');
    });
}
function animation(obje, dir, start) {
    let x = 0;
    function move() {
        x += dir * 20;
        obje.style.transform = `translateX(${start + x}px)`;
        if (x >= obje.offsetWidth || x <= -obje.offsetWidth)
            return;
        requestAnimationFrame(move);
    }
    move();
}
//! yenilendiği için ihtiyaç yok
// function createTournamentSection(container: HTMLElement): void{
// 	const div01 = document.createElement('div');
// 	div01.id = 'tournament-div01';
// 	div01.classList.add(
// 		'flex',
// 		'flex-col',
// 		'justify-center',
// 		'items-center',
// 		'rounded-3xl',
// 		'w-[30%]',
// 		'h-[30%]',
// 		'gap-6',
// 	)
// 	const title = document.createElement('h1');
// 	title.textContent = exmp.getLang('tournament.first-page.title');
// 	title.classList.add(
// 		'text-6xl',
// 		'font-bold',
// 		'text-center',
// 		'text-gray-900',
// 	);
// 	const p = document.createElement('p');
// 	p.textContent = exmp.getLang('tournament.first-page.description');
// 	p.classList.add(
// 		'text-gray-900',
// 		'text-xl',
// 		'text-center',
// 		'w-[80%]',
// 	);
// 	const form = document.createElement('form');
// 	form.id = 'tournament-form';
// 	form.classList.add(
// 		'flex',
// 		'flex-col',
// 		'justify-center',
// 		'items-center',
// 		'gap-4',
// 	);
// 	const input = document.createElement('input');
// 	input.type = 'text';
// 	input.placeholder = exmp.getLang('tournament.first-page.input-placeholder');
// 	input.classList.add(
// 		'border',
// 		'border-gray-300',
// 		'rounded-lg',
// 		'px-4',
// 		'py-2',
// 		'w-[80%]',
// 	);
// 	const buttonWrapper = document.createElement('div');
// 	buttonWrapper.classList.add(
// 		'flex',
// 		'justify-center',
// 		'items-center',
// 		'flex-row',
// 		'gap-4',
// 	);
// 	const button2 = document.createElement('button');
// 	button2.textContent = exmp.getLang('tournament.first-page.join');
// 	button2.classList.add(
// 		'bg-blue-500',
// 		'text-white',
// 		'px-4',
// 		'py-2',
// 		'rounded-lg',
// 		'hover:bg-blue-700',
// 		'transition-colors',
// 		'duration-300',
// 	);
// 	button2.setAttribute('data-action', 'join-room');
// 	const button = document.createElement('button');
// 	button.textContent = exmp.getLang('tournament.first-page.create');
// 	button.classList.add(
// 		'bg-blue-500',
// 		'text-white',
// 		'px-4',
// 		'py-2',
// 		'rounded-lg',
// 		'hover:bg-blue-700',
// 		'transition-colors',
// 		'duration-300',
// 	);
// 	button.setAttribute('data-action', 'create-tournament');
// 	// button.type = 'submit';
// 	form.appendChild(input);
// 	buttonWrapper.appendChild(button2);
// 	buttonWrapper.appendChild(button);
// 	form.appendChild(buttonWrapper);
// 	div01.appendChild(title);
// 	div01.appendChild(p);
// 	div01.appendChild(form);
// 	container.appendChild(div01);
// }
function ShowTournament(container, tdata) {
    const div02 = document.createElement('div');
    div02.id = 'tournament-div02';
    div02.classList.add('flex', 'flex-col', 'justify-start', 'items-center', 'rounded-3xl', 'w-[1200px]', 'h-[900px]', 'bg-gray-300', 'p-6', 'gap-4', 'overflow-y-auto', 'overflow-x-auto', 'scrollbar');
    TournamentInformation(div02, tdata);
    container.appendChild(div02);
}
function TournamentInformation(container, tdata) {
    const tournament01 = document.createElement('div');
    tournament01.classList.add('flex', 'flex-col', 'justify-between', 'items-center', 'bg-gray-900', 'rounded-lg', 'p-4', 'w-[640px]', 'h-[350px]', 'lg:w-[950px]', 'lg:h-[500px]');
    const div01 = document.createElement('div');
    div01.classList.add('w-full', 'flex', 'flex-row', 'justify-between', 'items-center', 'gap-4', 'p-4');
    const div001 = document.createElement('div');
    div001.classList.add('flex', 'flex-row', 'justify-center', 'items-center', 'gap-4', 'p-1');
    const img = document.createElement('img');
    img.src = '/IMG/trophy.png';
    img.classList.add('w-[50px]', 'h-[50px]');
    const title = document.createElement('h1');
    title.textContent = tdata.name;
    title.classList.add('text-2xl', 'font-bold', 'text-center', 'text-white');
    div001.appendChild(img);
    div001.appendChild(title);
    const exit = document.createElement('div');
    exit.setAttribute('data-action', 'exit-tournament');
    exit.classList.add('flex', 'justify-center', 'items-center', 'flex-row', 'bg-red-500', 'text-white', 'px-4', 'py-2', 'gap-2', 'rounded-lg', 'hover:bg-red-700', 'transition-colors', 'duration-300', 'hover:cursor-pointer');
    const img02 = document.createElement('img');
    img02.src = '/IMG/exit.png';
    img02.classList.add('w-[30px]', 'h-[35px]');
    const p = document.createElement('p');
    p.textContent = exmp.getLang('tournament-second-page.exit');
    exit.appendChild(img02);
    exit.appendChild(p);
    const div02 = document.createElement('div');
    div02.classList.add('flex', 'flex-col', 'justify-center', 'items-start', 'w-full', 'bg-gray-800', 'h-[20%]');
    const div02p1 = document.createElement('p');
    div02p1.textContent = exmp.getLang('tournament-second-page.tournament-id');
    div02p1.classList.add('text-gray-400', 'text-lg', 'pl-4');
    const div02p2 = document.createElement('p');
    div02p2.textContent = tdata.code;
    div02p2.classList.add('text-white', 'text-lg', 'pl-4', 'font-bold');
    div02.appendChild(div02p1);
    div02.appendChild(div02p2);
    const div03 = document.createElement('div');
    div03.classList.add('flex', 'flex-col', 'justify-center', 'items-start', 'w-full', 'bg-gray-800', 'h-[20%]');
    const div03p1 = document.createElement('p');
    div03p1.textContent = exmp.getLang('tournament-second-page.tournament-creater');
    div03p1.classList.add('text-gray-400', 'text-lg', 'pl-4');
    const div03p2 = document.createElement('p');
    div03p2.textContent = tdata.users[0].username; //! bu kısım oda yöneticisi olmayanlarda bakılacak
    div03p2.classList.add('text-white', 'text-lg', 'pl-4', 'font-bold');
    div03.appendChild(div03p1);
    div03.appendChild(div03p2);
    const div04 = document.createElement('div');
    div04.classList.add('flex', 'flex-col', 'justify-center', 'items-start', 'w-full', 'bg-gray-800', 'h-[20%]');
    const div04p1 = document.createElement('p');
    div04p1.textContent = exmp.getLang('tournament-second-page.tournament-total-players');
    div04p1.classList.add('text-gray-400', 'text-lg', 'pl-4');
    const div04p2 = document.createElement('p');
    div04p2.textContent = '10';
    div04p2.classList.add('text-white', 'text-lg', 'pl-4', 'font-bold');
    div04.appendChild(div04p1);
    div04.appendChild(div04p2);
    //! yönetici olana başlat butonu ekle
    /* Başlat button */
    const sButton = document.createElement('div');
    sButton.id = 'start-button';
    sButton.classList.add('flex', 'justify-center', 'items-center', 'bg-green-500', 'text-white', 'px-4', 'py-2', 'rounded-lg', 'hover:bg-green-700', 'transition-colors', 'duration-300');
    sButton.textContent = 'BASLAT';
    sButton.setAttribute('data-action', 'start-tournament');
    div01.appendChild(div001);
    // !yöneti ci mi ? --> şimdilik full ture olarak devam ediyorum bacend gelince bakılacak
    if (tdata.admin_id === localStorage.getItem('uuid')) {
        div01.appendChild(sButton); // Başlat butonunu ekle
    }
    div01.appendChild(exit);
    tournament01.appendChild(div01);
    tournament01.appendChild(div02);
    tournament01.appendChild(div03);
    tournament01.appendChild(div04);
    const tournament02 = document.createElement('div');
    tournament02.classList.add('flex', 'flex-col', 'justify-between', 'items-center', 'bg-gray-900', 'rounded-lg', 'p-4', 'gap-4', 'w-[640px]', 'h-[400px]', 'lg:w-[980px]', 'lg:h-[600px]');
    const div11 = document.createElement('div');
    div11.classList.add('w-full', 'flex', 'flex-row', 'justify-between', 'items-center', 'pl-4', 'pr-5', 'pt-1');
    const div11p1 = document.createElement('p');
    div11p1.textContent = exmp.getLang('tournament-second-page.tournament-joined-players');
    div11p1.classList.add('text-2xl', 'font-bold', 'text-center', 'text-white');
    const divtree = document.createElement('div');
    divtree.setAttribute("data-action", "tree");
    divtree.textContent = "T";
    const div11img = document.createElement('img');
    div11img.src = '/IMG/refresh.png';
    div11img.classList.add('w-[30px]', 'h-[35px]', 'hover:cursor-pointer', 'hover:scale-110');
    div11img.setAttribute('data-action', 'refresh');
    // oyuncuların sıralanacağı kısım
    const div12 = document.createElement('div');
    div12.id = 'list-player';
    div12.classList.add('flex', 'flex-col', 'items-center', // sola hizalı kartlar daha profesyonel görünür
    'justify-start', 'w-full', 'h-full', 'overflow-y-auto', 'gap-4', // kartlar arası boşluk daha belirgin
    'p-4', // iç boşluk
    'rounded-2xl', // yuvarlatılmış köşeler
    'bg-gray-800', // arka plan beyaz
    'shadow-inner', // iç gölge efekti
    'scrollbar', // scrollbar'ı etkinleştir
    'scrollbar-thumb-gray-600', 'scrollbar-track-gray-200', 'hover:scrollbar-thumb-gray-800', 'rounded-md', 'max-h-[90%]' // taşma olmaması için maksimum yükseklik
    );
    //! oyuncuları listele fonksiyonu
    listPlayers(div12, tdata);
    const div13 = document.createElement('div');
    div13.id = 'play-button';
    div13.classList.add('flex', 'flex-row', 'justify-start', 'items-center', 'gap-4', 'p-4', 'bg-gray-400', 'w-[25%]', 'rounded-lg', 'hover:bg-yellow-500', 'transition-colors', 'duration-300', 'hover:cursor-pointer');
    div13.setAttribute('data-action', 'play-game');
    div13.style.visibility = 'hidden'; // başlangıçta görünmez
    const div13_b = document.createElement('div');
    div13_b.classList.add('flex', 'justify-center', 'items-center', 'w-full');
    div13_b.textContent = exmp.getLang('tournament-second-page.play');
    div13.appendChild(div13_b);
    div11.appendChild(div11p1);
    div11.appendChild(divtree);
    div11.appendChild(div11img);
    tournament02.appendChild(div11);
    tournament02.appendChild(div12);
    tournament02.appendChild(div13);
    container.appendChild(tournament01);
    container.appendChild(tournament02);
}
function listPlayers(container, tdata) {
    const players = tdata.users;
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('flex', 'flex-row', 'justify-center', 'items-center', 'bg-gray-700', 'rounded-lg', 'p-4', 'w-[84%]', 'h-[15%]', 'm-2', 'shadow-lg', 'hover:bg-gray-600', 'transition-colors', 'duration-300', 'transition-transform', 'hover:scale-[1.02]');
        const playerName = document.createElement('p');
        playerName.textContent = player.username; // Oyuncu ismi
        playerName.classList.add('text-white', 'text-lg', 'font-bold');
        playerDiv.appendChild(playerName);
        container.appendChild(playerDiv);
    });
}
