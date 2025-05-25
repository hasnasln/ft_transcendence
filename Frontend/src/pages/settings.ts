import { exmp } from "../languageMeneger";

export class Settings {

	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderSettings(container);
		requestAnimationFrame(() => {
			this.init();
		});
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


export function renderSettings(container: HTMLElement): void 
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
	gameSettingsTitle.textContent = exmp.getLang("settings.title");
	gameSettingsTitle.classList.add(
		'text-2xl',
		'font-bold',
		'text-gray-800',
	);
	gameSettingsTitleContainer.appendChild(gameSettingsTitle);
	gameSettingsContainer.appendChild(gameSettingsTitleContainer); // başlık kısmı eklendi
	
	// Top Rengi 2
	const selectedTopColor = { value: '#ffff00' };
	const selectedBackgroundColor = { value: '#0000ff' };
	const selectedPlayer1Color = { value: '#00ffff' };
	const selectedPlayer2Color = { value: '#00ff00' };
	let selectedLanguage = exmp.getLanguage();


//#region  COLOR PALETTE 
	// Top rengi
	createColorPalette(exmp.getLang("settings.ball-color"), gameSettingsContainer, [
	'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
	], selectedTopColor);

	// Arka Plan Rengi
	createColorPalette(exmp.getLang("settings.background-color"), gameSettingsContainer, [
		'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
		], selectedBackgroundColor);
	
	// Oyuncu 1 (sen) Rengi
	createColorPalette(exmp.getLang("settings.player-one-color"), gameSettingsContainer, [
		'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
		], selectedPlayer1Color);

	// Oyuncu 2 (rakip) Rengi
	createColorPalette(exmp.getLang("settings.player-two-color"), gameSettingsContainer, [
		'#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000'
		], selectedPlayer2Color);
//#endregion

	createLanguageSelector(gameSettingsContainer, selectedLanguage, exmp.getLanguageChoises(),
	(lang: string ) => {selectedLanguage = lang; }
	);

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
	gameSettingsButton.textContent = exmp.getLang("settings.save-button");
	gameSettingsButton.classList.add(
		'bg-blue-500',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'rounded-lg',
		'hover:bg-blue-700',
	);
	
	gameSettingsButtonContainer.appendChild(gameSettingsButton);
	gameSettingsContainer.appendChild(gameSettingsButtonContainer); // ayarları kaydet butonu eklendi
	settings_main.appendChild(gameSettingsContainer); // ayarları kaydet butonu eklendi
	container.appendChild(settings_main); // ayarları kaydet butonu eklendi

	
	//! onsave fonksiyonu ayarları sınıf içerisi kaydettik sınıf içerisindeki bir istek ile bacende yönlendirilecek
	gameSettingsButton.addEventListener('click', async () => {
		Settings.prototype.close();
		if (selectedLanguage !== exmp.getLanguage())
		{
			// console.log("1");
			// 0.3 saniye bekle
			//! ne kadar mantıklı bilmiyorum ama işimizi gördü :)
			await new Promise(resolve => setTimeout(resolve, 300));
			await exmp.setLanguage(selectedLanguage);
		}
		// console.log("enter tusuna basıldıktan sonra değer :" + selectedLanguage);
	});
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
		colorBox.classList.add('w-8', 'h-8', 'rounded', 'cursor-pointer', 'border-4', 'border-transparent');
		colorBox.style.backgroundColor = color;
		colorBox.setAttribute('data-action', 'color');
		if (color == selectedColor.value) {
			colorBox.classList.remove('border-transparent');
			colorBox.classList.add('border-black');
		}

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

function createLanguageSelector(container: HTMLElement, selectedLanguage: string, langs: string[], onChange: (lang: string) => void ) {
	const wrapper = document.createElement('div');
	wrapper.classList.add('flex', 'flex-col', 'w-[80%]', 'm-2');


	console.log("selectedLanguage: " + selectedLanguage);
	const label = document.createElement('label');
	label.textContent = exmp.getLang("settings.language-select");
	label.classList.add('text-lg', 'text-gray-800', 'mb-1');
	wrapper.appendChild(label);

	const select = document.createElement('select');
	select.value = selectedLanguage;
	select.classList.add('border', 'border-gray-300', 'rounded-lg', 'px-2', 'py-1', 'text-gray-800');

	langs.forEach(lang => {
		const option = document.createElement('option');
		option.value = lang;
		option.textContent = lang;
		if (lang == selectedLanguage) { option.selected = true; }
		select.appendChild(option);
	});

	select.addEventListener('change', () => {
		selectedLanguage = select.value;
		onChange(selectedLanguage);
	});

	wrapper.appendChild(select);
	container.appendChild(wrapper);
}