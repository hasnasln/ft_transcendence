import { _apiManager } from '../api/APIManeger';
import { exmp } from '../languageMeneger';
import { close_Button } from '../components/buttons';

interface history {
	// tarih
	date: string;
	// oyuncu1
	player1: string;
	// oyuncu2
	player2: string;
	// oyuncu1 skoru
	player1Score: number;
	// oyuncu2 skoru
	player2Score: number;
	// kazanan
	winner: string;
}

interface ISection {
	name: string;
	type: string;
	placeholder: string;
	action: string;
}


export class ProfileSettings{
	private name: string;
	private surname: string;
	private nickname: string;
	private email: string;
	private password: string;


	constructor() { //! constructor da istek atıp bu değişkellere yazılması gerekn değerleri yazıp buradandevam edebilirz
		this.name = '';
		this.surname = '';
		this.nickname = '';
		this.email = '';
		this.password = '';
		if (!(localStorage.getItem('name') 
			&& localStorage.getItem('surname') 
			&& localStorage.getItem('nickname') 
			&& localStorage.getItem('email') 
			&& localStorage.getItem('password'))) {
				_apiManager.getME()
			}
		this.name = localStorage.getItem('name') || '';
		this.surname = localStorage.getItem('surname') || '';
		this.nickname = localStorage.getItem('nickname') || '';
		this.email = localStorage.getItem('email') || '';
		this.password = localStorage.getItem('password') || '';
	}


	render (container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderProfile(container);
		this.init();
	}

	init(): void {
		const profileSettingsContainer = document.getElementById('profile_main');
		if (!profileSettingsContainer) {
			console.error('Profile settings container not found');
			return;
		}

		profileSettingsContainer.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			const action = target.getAttribute('data-action');

			if (!action) return;
			switch (action) {
				case 'nick-name':
				case 'email':
				case 'password':
				case 'name':
					this.handleX(action);
					break;
				// case 'history':
				// 	this.handleHistory();
				// 	break;
				// case 'profile-settings':
				// 	this.handeleProfileSettings();
				// 	break;
				case 'close':
					this.close();
					break;
				default:
					console.warn(`Unknown action: ${action}`);
			}
		});
	}

	public static getname(): string { return this.name; }

	close(): void {
		const profileSettingsContainer = document.getElementById('profile_main');
		if (profileSettingsContainer) {
			console.log('Close button clicked');
			profileSettingsContainer.classList.remove('animate-slide-in-right');
			profileSettingsContainer.classList.add('animate-slide-out-right');
			
			profileSettingsContainer.addEventListener('animationend', () => {
				if (profileSettingsContainer.classList.contains('animate-slide-out-right')) {
					profileSettingsContainer.remove();
				}
			}, { once: true });
			return;
		}
	}


	async handleX(x: string): Promise<void> {
		const input = document.querySelector('#' + x) as HTMLInputElement;
		if (!input) {
			console.error('Input not found');
			return;
		} else if (input) {
			const value = input.value.trim();
			if (value.length < 1) {
				console.error(x + 'Input value is empty');
				return;
			}
		}
		if (input && x === 'nick-name') {
			this.nickname = input.value;
			console.log(x + ": ", this.nickname);
			await _apiManager.updateSomething('nickname', this.nickname);
		} else if (input && x === 'email') {
			this.email = input.value;
			await _apiManager.updateSomething('email', this.email);
			console.log(x + ": ", this.email);
		} else if (input && x === 'password') {
			this.password = input.value;
			await _apiManager.updateSomething('password', this.password);
			console.log(x + ": ", this.password);
		} else if (input && x === 'name') {
			this.name = input.value;
			await _apiManager.updateSomething('name', this.name);
			console.log(x + ": ", this.name);
		} else if (input && x === 'surname') {
			this.surname = input.value;
			await _apiManager.updateSomething('surname', this.surname);
			console.log(x + ": ", this.surname);
		} else {
			console.error('Input not found');
		} 
	}

	// handleHistory(): void {
	// 	const historyContainer = document.getElementById('history-button');
	// 	if (historyContainer) {
	// 		console.log('History button clicked');
	// 		const prof = document.getElementById('profile-settings-container');
	// 		if (prof) prof.remove();
	// 		const x = document.getElementById('history-container');
	// 		if (x) {
	// 			x.remove();
	// 		}else {
	// 			const secondPart = document.getElementById('second_part');
	// 			if (secondPart){
	// 				// createHistory(this.nickname, this.getHistory(), secondPart);
	// 			}
	// 		}
	// 	}
	// }

	// handeleProfileSettings(): void 	{
	// 	const profileSettingsButton = document.getElementById('profile-settings-button');
	// 	if (profileSettingsButton) {
	// 		console.log('Profile settings button clicked');
	// 		const prof = document.getElementById('history-container');
	// 		if (prof) prof.remove();
	// 		const x = document.getElementById('profile-settings-container');
	// 		if (x) {
	// 			x.remove();
	// 		}else {
	// 			const secondPart = document.getElementById('second_part');
	// 			if (secondPart){
	// 				createProfileSettings(secondPart, this.getProfileSettings());
	// 			}
	// 		}
			
	// 	}
	// }

	// getHistory(): history[] {
	// 	return [
	// 		{
	// 			date: '2025-05-01',
	// 			player1: 'Hasan',
	// 			player2: 'Veli',
	// 			player1Score: 10,
	// 			player2Score: 8,
	// 			winner: 'Hasan',
	// 		},
	// 		{
	// 			date: '2025-05-02',
	// 			player1: 'Ali',
	// 			player2: 'Mehmet',
	// 			player1Score: 5,
	// 			player2Score: 5,
	// 			winner: 'Berabere',
	// 		},
	// 		{
	// 			date: '2025-05-03',
	// 			player1: 'Hasan',
	// 			player2: 'Ayşe',
	// 			player1Score: 7,
	// 			player2Score: 9,
	// 			winner: 'Ayşe',
	// 		},
	// 	];
	// }

	getProfileSettings(): ISection[] {
		return [
			{name: exmp.getLang("profile-settings.username"), type: 'text', placeholder: exmp.getLang("profile-settings.username-placeholder"), action: 'nick-name'},
			{name: exmp.getLang("profile-settings.name"), type: 'text', placeholder: exmp.getLang("profile-settings.name-placeholder"), action: 'name'},
			{name: exmp.getLang("profile-settings.email"), type: 'email', placeholder: exmp.getLang("profile-settings.email-placeholder"), action: 'email'},
		]
	}
}

function renderProfile(container: HTMLElement) {
	const user = localStorage.getItem('user');
	const userData = user ? JSON.parse(user) : null;

	const wrapper = document.createElement('div');
	wrapper.id = 'profile_main';
	wrapper.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'h-[100vh]',
		'w-[90%]',
		'sm:w-[45%]',
		'md:w-[30%]',
		'bg-blue-500',
		'rounded-l-3xl',
		'absolute',
		'right-0',
		'top-0',
		'gap-4',
		'animate-slide-in-right',
		'z-20',
	)

	const profileContainer = document.createElement('div');
	profileContainer.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'border',
		'border-gray-300',
		'rounded-3xl',
		'bg-gray-300',
		'w-[90%]',
		'h-[95%]',
		'absolute',
	);
	
	/* Close Button */
	const closeButton = document.createElement('button');
	closeButton.textContent = 'X';
	closeButton.setAttribute('data-action', 'close');
	close_Button(closeButton, 'left');
	profileContainer.appendChild(closeButton);

	const firstPart = document.createElement('div');
	firstPart.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'w-full',
		'h-[40%]',
		'gap-3',
		'border-b-2',
		'border-blue-500',
	);

	// ayarların ve geçmişin gözükeceği kısım
	const secondPart = document.createElement('div');
	secondPart.id = 'second_part';
	secondPart.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'w-full',
		'h-[60%]',
	);

	const titleContainer = document.createElement('div');
	const title = document.createElement('h1');
	title.textContent = exmp.getLang('profile.title');
	title.classList.add(
		'text-2xl',
		'font-bold',
		'text-gray-800',
		'border-b-2',
		'border-gray-900',
	);
	titleContainer.appendChild(title);
	firstPart.appendChild(titleContainer);

	const imageContainer = document.createElement('div');
	const profileImage = document.createElement('img');
	profileImage.src = userData.avatar;
	profileImage.alt = 'Profile Image';
	profileImage.classList.add(
		'rounded-full',
		'w-40',
		'h-25',
	);
	imageContainer.appendChild(profileImage);
	firstPart.appendChild(imageContainer);
	// console.log("--------------------------" + userData.name);

	const nameContainer = document.createElement('div');
	const name = document.createElement('h2');
	name.textContent = "--> " + userData.name + " <--" || "Local strogadan çekilen user.data da isim bulunamadı."; // bu kısımda kullanıcı adını dinamik olarak alabiliriz
	name.classList.add(
		'text-xl',
		'font-bold',
		'text-gray-800',
	);
	nameContainer.appendChild(name);
	firstPart.appendChild(nameContainer);

	// const ProfileSettingsButton = document.createElement('button');
	// ProfileSettingsButton.textContent = exmp.getLang('profile.profile-settings');
	// ProfileSettingsButton.setAttribute('data-action', 'profile-settings');
	// ProfileSettingsButton.id = 'profile-settings-button';
	// ProfileSettingsButton.classList.add(
	// 	'bg-blue-500',
	// 	'text-white',
	// 	'px-4',
	// 	'py-2',
	// 	'rounded-lg',
	// );

	// firstPart.appendChild(ProfileSettingsButton);
	// const HistoryButton = document.createElement('button');
	// HistoryButton.textContent = exmp.getLang('profile.history');
	// HistoryButton.setAttribute('data-action', 'history');
	// HistoryButton.id = 'history-button';
	// HistoryButton.classList.add(
	// 	'bg-blue-500',
	// 	'text-white',
	// 	'px-4',
	// 	'py-2',
	// 	'rounded-lg',
	// );
	
	//! Butonlara çift basınca işevli oluyor sebebi nedir ?
	//? sebebi toggle fonsiyonunu kullanmak mış remove ve add kullanmaya başladık
	
	// createProfileSettings(secondPart);
	/*
	toggle('className') ne yapar?
	Eğer "hidden" sınıfı varsa, onu çıkarır.
	Eğer "hidden" sınıfı yoksa, onu ekler.
		Bu sayede, aynı kodla bir öğeyi gizleyip göstermek (yani toggle etmek) kolaylaşır.
	*/

	
	// firstPart.appendChild(HistoryButton);
	createProfileSettings(secondPart, new ProfileSettings().getProfileSettings());
	profileContainer.appendChild(firstPart);
	profileContainer.appendChild(secondPart);
	wrapper.appendChild(profileContainer);
	container.appendChild(wrapper);
}

// function createHistory(player: string, historyl: history[], container: HTMLElement) 
// {
// 	const historyContainer = document.createElement('div');
// 	historyContainer.id = 'history-container';
// 	historyContainer.classList.add(
// 		'flex',
// 		'flex-col',
// 		'items-start',         // sola hizalı kartlar daha profesyonel görünür
// 		'justify-start',
// 		'w-full',
// 		'h-full',
// 		'overflow-y-auto',
// 		'overflow-x-hidden',
// 		'gap-4',               // kartlar arası boşluk daha belirgin
// 		'p-4',                 // iç boşluk
// 		'rounded-2xl',         // yuvarlatılmış köşeler
// 		'bg-cyan-500',            // arka plan beyaz
// 		'shadow-inner',        // iç gölge efekti
// 		'scrollbar',                // scrollbar'ı etkinleştir
// 		'scrollbar-thumb-blue-600',
// 		'scrollbar-track-blue-200',
// 		'hover:scrollbar-thumb-blue-800',
// 		'rounded-md',
// 		'max-h-[90%]'          // taşma olmaması için maksimum yükseklik
// 	);
// 	historyl.forEach((game) => {
// 		createHistoryCard(player, game, historyContainer);
// 	});
// 	container.appendChild(historyContainer);
// }


// // history de her bir kartı oluşturmak için fonksiyon
// function createHistoryCard(player: string, history: history, container: HTMLElement) {
// 	const card = document.createElement('div');
// 	card.classList.add(
// 		'flex',
// 		'flex-col',
// 		'items-start',
// 		'justify-start',
// 		'p-4',
// 		'rounded-2xl',
// 		'w-[95%]',
// 		'shadow-lg',
// 		'transition-transform',
// 		'hover:scale-[1.02]',
// 		'hover:shadow-2xl',
// 		'text-white',
// 		'mb-4'
// 	);

// 	if (history.winner === 'Berabere') {
// 		card.classList.add('bg-yellow-500');
// 	} else if (player === history.winner) {
// 		card.classList.add('bg-green-500');
// 	} else {
// 		card.classList.add('bg-red-500');
// 	}

// 	const date = document.createElement('h3');
// 	date.textContent = `📅 ${history.date}`;
// 	date.classList.add(
// 		'text-sm',
// 		'font-semibold',
// 		'mb-2',
// 		'text-white'
// 	);

// 	const match = document.createElement('div');
// 	match.classList.add(
// 		'flex',
// 		'flex-row',
// 		'items-center',
// 		'justify-between',
// 		'w-full',
// 		'text-lg',
// 		'font-bold',
// 	);

// 	const player1 = document.createElement('span');
// 	player1.textContent = `${history.player1} : ${history.player1Score}`;

// 	const vs = document.createElement('span');
// 	vs.textContent = history.winner === 'Berabere' ? '🤝' : 'VS';

// 	const player2 = document.createElement('span');
// 	player2.textContent = `${history.player2Score} : ${history.player2}`;

// 	match.appendChild(player1);
// 	match.appendChild(vs);
// 	match.appendChild(player2);

// 	const result = document.createElement('p');
// 	result.textContent = history.winner === 'Berabere'
// 		? 'Sonuç: Berabere'
// 		: `Kazanan: ${history.winner}`;
// 	result.classList.add(
// 		'text-sm',
// 		'mt-2',
// 		'italic'
// 	);

// 	card.appendChild(date);
// 	card.appendChild(match);
// 	card.appendChild(result);
// 	container.appendChild(card);
// }


//! Profil kısmındaki ayarlar butonuna tıklayınca gözükecek kısım
function createProfileSettings(container: HTMLElement, settings: ISection[]) {
	const profileSettingsContainer = document.createElement('div');
	profileSettingsContainer.id = 'profile-settings-container';
	profileSettingsContainer.classList.add(
		'flex',
		'flex-col',
		'items-start',
		'justify-start',
		'w-full',
		'h-full',
		'gap-6',
		'p-6',
		'rounded-2xl',
		'shadow-md',
		'text-gray-800',
		'overflow-y-auto'
	);
	settings.forEach(({ name, type, placeholder, action }) => {
		const settingGroup = document.createElement('div');
		settingGroup.classList.add(
			'w-full',
			'flex',
			'flex-col',
			'gap-2',
			'p-4',
			'border',
			'border-blue-500',
			'rounded-lg',
			'bg-gray-50',
			'shadow-sm'
		);
		const settingLabel = document.createElement('label');
		settingLabel.textContent = name;
		settingLabel.classList.add('text-sm', 'font-medium');
		const settingInput = document.createElement('input');
		settingInput.type = type;
		settingInput.placeholder = placeholder;
		settingInput.id = action;
		settingInput.classList.add(
			'border',
			'border-gray-300',
			'rounded-md',
			'p-2',
			'focus:outline-none',
			'focus:ring-2',
			'focus:ring-cyan-500'
		);
		const saveButton = document.createElement('button');
		saveButton.textContent = name +" " + exmp.getLang("profile-settings.update"); ;
		saveButton.setAttribute('data-action', `${action}`);
		saveButton.classList.add(
			'self-end',
			'mt-2',
			'bg-blue-500',
			'text-white',
			'font-bold',
			'py-1',
			'px-4',
			'rounded-md',
			'hover:bg-blue-700',
			'transition'
		);
		settingGroup.appendChild(settingLabel);
		settingGroup.appendChild(settingInput);
		settingGroup.appendChild(saveButton);

		profileSettingsContainer.appendChild(settingGroup);
	});
	container.appendChild(profileSettingsContainer);
	return profileSettingsContainer;
}
