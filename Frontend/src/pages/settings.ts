import { IApiSetSettings, _apiManager } from "../api/APIManeger";
import { exmp } from "../languageMeneger";
import { close_Button } from "../components/buttons";
const COLORS = {
	red: '#ff0000',
	green: '#00ff00',
	blue: '#0000ff',
	yellow: '#ffff00',
	magenta: '#ff00ff',
	cyan: '#00ffff',
	black: '#000000'
}


export class Settings {


	async render(container: HTMLElement): Promise<void> {
		if (!container) {
			console.error('Container not found');
			return;
		}
		
		await _apiManager.settings();
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
		'sm:w-[45%]',
		'md:w-[30%]',
		'bg-blue-500',
		'rounded-r-3xl',
		'top-0',
		'left-0',
		'z-20',
		'animate-slide-in-left',
	);

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
		'h-[95%]',
		'bg-gray-300',
		'shadow-2xl',
		'shadow-gray-500',
		'relative',
		);
	const gameSettingsTitleContainer = document.createElement('div');
	gameSettingsTitleContainer.classList.add(
	);
	// /* Close Button */
	const closeButton = document.createElement('button');
	closeButton.textContent = 'X';
	closeButton.setAttribute('data-action', 'close');
	close_Button(closeButton, 'right');

	gameSettingsTitleContainer.appendChild(closeButton);
	const gameSettingsTitle = document.createElement('h1');
	gameSettingsTitle.textContent = exmp.getLang("settings.title");
	gameSettingsTitle.classList.add(
		'text-2xl',
		'font-bold',
		'text-gray-800',
	);
	gameSettingsTitleContainer.appendChild(gameSettingsTitle);
	gameSettingsContainer.appendChild(gameSettingsTitleContainer); // başlık kısmı eklendi
	
	const x = localStorage.getItem('settings');
	const y = JSON.parse(x || '{}');
	// console.log("settings---->:", y);
	// console.log("settings ball color:", y.ball_color);

	// Top Rengi 2
	const selectedTopColor = { value: y.ball_color }; // başlangıçta kırmızı olarak ayarlandı
	let selectedLanguage = exmp.getLanguage();


	// Top rengi
	createColorPalette(exmp.getLang("settings.ball-color"), gameSettingsContainer, [
		COLORS.red,
		COLORS.green,
		COLORS.blue,
		COLORS.yellow,
		COLORS.magenta,
		COLORS.cyan,
		COLORS.black
	], selectedTopColor);

	
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
            await new Promise(resolve => setTimeout(resolve, 300));
            await exmp.setLanguage(selectedLanguage);
        }
        console.log(selectedTopColor);

        const settings :IApiSetSettings = {
            ball_color: selectedTopColor.value,
            language: exmp.getLanguage()
        }
        _apiManager.set_settings(settings)
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
	select.classList.add('w-[50%]','border', 'border-gray-300', 'rounded-lg', 'px-2', 'py-1', 'text-gray-800');

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