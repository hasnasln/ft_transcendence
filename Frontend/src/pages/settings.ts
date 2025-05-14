interface choise{
	name: string;
	selected: string;
}

interface language{
	name: string;
	code: string;
}

interface SettingsData {
	section_title: string;
	ball: choise;
	background: choise;
	player1: choise;
	player2: choise;
	language: language[];
}


interface hasan{
	top: string;
	background: string;
	player1: string;
	player2: string;
	lang: string;
}


export class Settings {
	private selectedTopColor: string;
	private selectedBackgroundColor: string;
	private selectedPlayer1Color: string;
	private selectedPlayer2Color: string;
	private selectedLanguage: string;
	constructor() {
		this.selectedTopColor = '#ffffff';
		this.selectedBackgroundColor = '#ffffff';
		this.selectedPlayer1Color = '#ffffff';
		this.selectedPlayer2Color = '#ffffff';
		this.selectedLanguage = 'tr';
	}

	setSelectedTopColor(color: string): void { this.selectedBackgroundColor = color; }
	setSelectedBackgroundColor(color: string): void { this.selectedBackgroundColor = color; }
	setSelectedPlayer1Color(color: string): void { this.selectedPlayer1Color = color; }
	setSelectedPlayer2Color(color: string): void { this.selectedPlayer2Color = color; }
	setSelectedLanguage(lang: string): void { this.selectedLanguage = lang; }


	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderSettings(container, this.getLang('en'), (ahmet: hasan) => {
			this.setSelectedTopColor(ahmet.top);
			this.setSelectedBackgroundColor(ahmet.background);
			this.setSelectedPlayer1Color(ahmet.player1);
			this.setSelectedPlayer2Color(ahmet.player2);
			this.setSelectedLanguage(ahmet.lang);
			console.log('Selected Top Color:', this.selectedTopColor);
			console.log('Selected Background Color:', this.selectedBackgroundColor);
			console.log('Selected Player 1 Color:', this.selectedPlayer1Color);
			console.log('Selected Player 2 Color:', this.selectedPlayer2Color);
			console.log('Selected Language:', this.selectedLanguage);
		});
		this.init();
	}

	init(): void {
		const x = document.getElementById('settings_main');
		if (!x)
			return;
		x.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			const action = target.getAttribute('data-action');

			if (!action) return;

			switch (action) {
				case 'close':
					this.close();
					break;
			}
		});
	}

	getLang(lang: string): SettingsData {
		if (lang === 'en') {
			return {
				section_title: 'Game Settings',
				ball:{name: 'Ball Color', selected: '#ffffff'},
				background: {name: 'Background Color', selected: '#ffffff'},
				player1:{name: 'Player 1 Color', selected: '#ffffff'},
				player2:{name: 'Player 2 Color', selected: '#ffffff'},
				language: [
					{name: 'English', code: 'en'},
					{name: 'Turkish', code: 'tr'}
				] 
			}
		}
		else 
		{
			return {
				section_title: 'Oyun Ayarları',
				ball:{name: 'Top Rengi', selected: '#ffffff'},
				background: {name: 'Arka Plan Rengi', selected: '#ffffff'},
				player1:{name: 'Oyuncu 1 Rengi', selected: '#ffffff'},
				player2:{name: 'Oyuncu 2 Rengi', selected: '#ffffff'},
				language: [
					{name: 'Türkçe', code: 'tr'},
					{name: 'İngilizce', code: 'en'}
				]
			}
		}
	}

	hendelColoerChoise(): void
	{
	}

	destroy(): void {
		document.body.innerHTML = '';
	}

	close(): void {
		const settings_main = document.getElementById('settings_main');
		if (settings_main) {
			settings_main.classList.remove('animate-slide-in-left');
			settings_main.classList.add('animate-slide-out-left');

			settings_main.addEventListener('animationend', () => {
				if (settings_main.classList.contains('animate-slide-out-left')) {
					settings_main.remove();
				}
			  }, { once: true });
		}
	}
}


export function renderSettings(container: HTMLElement, data: SettingsData, 
	onSave: (Selection: hasan) => void
): void 
{
	const settings_main = document.createElement('div');
	settings_main.id = 'settings_main';
	settings_main.classList.add(
		"absolute",
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'h-[100vh]',
		'w-[90%]',
		'sm:w-[60%]',
		'md:w-[40%]',
		'bg-cyan-500',
		'rounded-r-3xl',
		'top-0',
		'left-0',
		'z-20',
		'animate-slide-in-left',
	);

	/* Close Button */
	const closeButton = document.createElement('button');
	closeButton.textContent = 'X';
	closeButton.setAttribute('data-action', 'close');
	closeButton.classList.add(
		'absolute',
		'top-8',
		'right-9',
		'text-Black',
		'px-4',
		'py-2',
		'rounded-full',
		'hover:bg-cyan-700',
		'transition-colors',
		'duration-300'
	);

	settings_main.appendChild(closeButton);
	// Game Settings
	const gameSettingsContainer = document.createElement('div');
	gameSettingsContainer.classList.add(
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'border',
		'border-gray-300',
		'rounded-3xl',
		'w-[90%]',
		'h-[95%]'
	);
	const gameSettingsTitleContainer = document.createElement('div');
	gameSettingsTitleContainer.classList.add(
	);
	const gameSettingsTitle = document.createElement('h1');
	gameSettingsTitle.textContent = data.section_title;
	gameSettingsTitle.classList.add(
		'text-2xl',
		'font-bold',
		'text-gray-800',
	);
	gameSettingsTitleContainer.appendChild(gameSettingsTitle);
	gameSettingsContainer.appendChild(gameSettingsTitleContainer); // başlık kısmı eklendi
	
	// Top Rengi 2
	const selectedTopColor = { value: '#ffffff' };
	const selectedBackgroundColor = { value: '#ffffff' };
	const selectedPlayer1Color = { value: '#ffffff' };
	const selectedPlayer2Color = { value: '#ffffff' };

	// Top rengi
	createColorPalette(data.ball.name, gameSettingsContainer, [
	'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
	], selectedTopColor);

	// Arka Plan Rengi
	createColorPalette(data.background.name, gameSettingsContainer, [
		'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
		], selectedBackgroundColor);
	
	// Oyuncu 1 (sen) Rengi
	createColorPalette(data.player1.name, gameSettingsContainer, [
		'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
		], selectedPlayer1Color);

	// Oyuncu 2 (rakip) Rengi
	createColorPalette(data.player2.name, gameSettingsContainer, [
		'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
		], selectedPlayer2Color);

	const selectedLanguage = { value: 'tr' };
	createLanguageSelector(gameSettingsContainer, selectedLanguage, data.language);

	// Gönder Butonu
	const gameSettingsButtonContainer = document.createElement('div');
	gameSettingsButtonContainer.classList.add(
		'flex',
		'flex-row',
		'items-center',
		'justify-center',
		'gap-8',
		'm-2',
	);
	const gameSettingsButton = document.createElement('button');
	gameSettingsButton.textContent = 'Ayarları Kaydet';
	gameSettingsButton.classList.add(
		'bg-blue-500',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'rounded-lg',
		'hover:bg-blue-700',
	);


	//! onsave fonksiyonu ayarları sınıf içerisi kaydettik sınıf içerisindeki bir istek ile bacende yönlendirilecek
	gameSettingsButton.addEventListener('click', () => {
		onSave({
			top: selectedTopColor.value,
			background: selectedBackgroundColor.value,
			player1: selectedPlayer1Color.value,
			player2: selectedPlayer2Color.value,
			lang: selectedLanguage.value
		});
	});
	gameSettingsButtonContainer.appendChild(gameSettingsButton);
	gameSettingsContainer.appendChild(gameSettingsButtonContainer); // ayarları kaydet butonu eklendi
	settings_main.appendChild(gameSettingsContainer); // ayarları kaydet butonu eklendi
	container.appendChild(settings_main); // ayarları kaydet butonu eklendi
}

function createColorPalette(title: string, container: HTMLElement, colorList: string[], selectedColor: { value: string }) {
	const wrapper = document.createElement('div');
	wrapper.classList.add('flex', 'flex-col', 'items-start', 'w-[80%]', 'm-2');

	const label = document.createElement('label');
	label.textContent = `${title}:`;
	label.classList.add('text-lg', 'text-gray-800', 'mb-2');
	wrapper.appendChild(label);

	const colorContainer = document.createElement('div');
	colorContainer.classList.add('flex', 'flex-wrap', 'gap-2');

	colorList.forEach((color) => {
		const colorBox = document.createElement('div');
		colorBox.classList.add('w-8', 'h-8', 'rounded', 'cursor-pointer', 'border-2', 'border-transparent');
		colorBox.style.backgroundColor = color;
		colorBox.setAttribute('data-action', 'color');

		colorBox.addEventListener('click', () => {
			selectedColor.value = color;
			
			// Tüm kutuların border'ını sıfırla
			colorContainer.querySelectorAll('div').forEach((box) => {
				box.classList.remove('border-black');
				box.classList.add('border-transparent');
			});

			// Seçilen kutuya border ekle
			colorBox.classList.remove('border-transparent');
			colorBox.classList.add('border-black');
		});
   		colorContainer.appendChild(colorBox);
	});
	wrapper.appendChild(colorContainer);
	container.appendChild(wrapper);
}

function createLanguageSelector(container: HTMLElement, selectedLanguage: { value: string }, langs: language[]) {
	const wrapper = document.createElement('div');
	wrapper.classList.add('flex', 'flex-col', 'w-[80%]', 'm-2');

	const label = document.createElement('label');
	label.textContent = 'Dil Seçimi:';
	label.classList.add('text-lg', 'text-gray-800', 'mb-1');
	wrapper.appendChild(label);

	const select = document.createElement('select');
	select.classList.add('border', 'border-gray-300', 'rounded-lg', 'px-2', 'py-1', 'text-gray-800');

	langs.forEach(lang => {
		const option = document.createElement('option');
		option.value = lang.code;
		option.textContent = lang.name;
		select.appendChild(option);
	});

	select.addEventListener('change', () => {
		selectedLanguage.value = select.value;
		console.log('Seçilen dil:', selectedLanguage.value);
	});

	wrapper.appendChild(select);
	container.appendChild(wrapper);
}