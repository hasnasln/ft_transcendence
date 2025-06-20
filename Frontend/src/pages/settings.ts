import { IApiSetSettings, _apiManager } from "../api/APIManeger";
import { exmp } from "../languageMeneger";
import { close_Button } from "../components/buttons";
const COLORS = {
    blue:    '#0000ff',
    green:   '#00ff00',
    cyan:    '#00ffff',
    lime:    '#ffff00',
    red:     '#ff0000',
    pink:    '#ff00ff',
    purple:  '#6b21a8'
};


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
		'sm:w-[65%]',
		'md:w-[50%]',
		'lg:w-[30%]',
		'bg-[#96215F]',
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
	createColorPalette(
    exmp.getLang("settings.ball-color"),
    gameSettingsContainer,
    [
        '#0000ff', // Blue
        '#00ff00', // Green
        '#00ffff', // Cyan
        '#ffff00', // Lime
        '#ff0000', // Red
        '#ff00ff', // Pink
        '#6b21a8', // Purple
		'#881337', // Rose
		'#ea580c', // Orange
    ],
    selectedTopColor
);

	
	// createLanguageSelector(gameSettingsContainer, selectedLanguage, exmp.getLanguageChoises(),
	// (lang: string ) => {selectedLanguage = lang; }
	// );
	createLanguageDropdown(
    gameSettingsContainer,
    selectedLanguage,
    exmp.getLanguageChoises(),
    (lang: string) => { selectedLanguage = lang; }
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
		localStorage.setItem('ballColor', selectedTopColor.value);

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

    const colorButtonClasses: { [key: string]: string } = {
        '#ff0000': 'text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
        '#00ff00': 'text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
        '#0000ff': 'text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
        '#ffff00': 'text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 shadow-lg shadow-lime-500/50 dark:shadow-lg dark:shadow-lime-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
        '#ff00ff': 'text-white bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 shadow-lg shadow-pink-500/50 dark:shadow-lg dark:shadow-pink-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
        '#00ffff': 'text-white bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 shadow-lg shadow-cyan-500/50 dark:shadow-lg dark:shadow-cyan-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
        '#6b21a8': 'text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
		'#881337': 'text-white bg-gradient-to-r from-rose-700 via-rose-800 to-rose-900 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-rose-300 dark:focus:ring-rose-800 shadow-lg shadow-rose-500/50 dark:shadow-lg dark:shadow-rose-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',
		'#ea580c': 'text-white bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800 shadow-lg shadow-orange-500/50 dark:shadow-lg dark:shadow-orange-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2',

    };

    const colorNames: { [key: string]: string } = {
        '#ff0000': 'Red',
        '#00ff00': 'Green',
        '#0000ff': 'Blue',
        '#ffff00': 'Lime',
        '#ff00ff': 'Pink',
        '#00ffff': 'Cyan',
        '#ea580c': 'Orange',
        '#6b21a8': 'Purple',
		'#881337': 'Rose',
    };

    colorList.forEach((color) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = colorButtonClasses[color] || '';
        btn.textContent = colorNames[color] || color;
        if (color === selectedColor.value) {
            btn.classList.add('ring-4', 'ring-black');
        }
        btn.addEventListener('click', () => {
            selectedColor.value = color;
            // Tüm butonlardan seçili class'ı kaldır
            colorContainer.querySelectorAll('button').forEach(b => b.classList.remove('ring-4', 'ring-black'));
            // Seçili butona class ekle
            btn.classList.add('ring-4', 'ring-black');
        });
        colorContainer.appendChild(btn);
    });

    wrapper.appendChild(colorContainer);
    container.appendChild(wrapper);
}

// function createLanguageSelector(container: HTMLElement, selectedLanguage: string, langs: string[], onChange: (lang: string) => void ) {
// 	const wrapper = document.createElement('div');
// 	wrapper.classList.add('flex', 'flex-col', 'w-[80%]', 'm-2');

// 	console.log("selectedLanguage: " + selectedLanguage);
// 	const label = document.createElement('label');
// 	label.textContent = exmp.getLang("settings.language-select");
// 	label.classList.add('text-lg', 'text-gray-800', 'mb-1');
// 	wrapper.appendChild(label);

// 	const select = document.createElement('select');
// 	select.value = selectedLanguage;
// 	select.classList.add('w-[50%]','border', 'border-gray-300', 'rounded-lg', 'px-2', 'py-1', 'text-gray-800');

// 	langs.forEach(lang => {
// 		const option = document.createElement('option');
// 		option.value = lang;
// 		option.textContent = lang;
// 		if (lang == selectedLanguage) { option.selected = true; }
// 		select.appendChild(option);
// 	});

// 	select.addEventListener('change', () => {
// 		selectedLanguage = select.value;
// 		onChange(selectedLanguage);
// 	});

// 	wrapper.appendChild(select);
// 	container.appendChild(wrapper);
// }

function createLanguageDropdown(
    container: HTMLElement,
    selectedLanguage: string,
    langs: string[],
    onChange: (lang: string) => void
) {
   	const langFlags: { [key: string]: string } = {
		"tr": "🇹🇷",
		"en": "🇺🇸",
		"fr": "🇫🇷",
};

    const wrapper = document.createElement('div');
    wrapper.className = "relative mb-4 flex justify-start";

    const dropdownBtn = document.createElement('button');
    dropdownBtn.type = "button";
    dropdownBtn.className = "inline-flex items-center font-medium justify-center px-4 py-2 text-sm text-gray-900 dark:text-white rounded-lg cursor-pointer bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300";
    dropdownBtn.innerHTML = `
        <span class="me-2">${langFlags[selectedLanguage] || "🌐"}</span>
        <span class="me-2">${selectedLanguage}</span>
        <svg class="w-2.5 h-2.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
    `;

    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = "z-50 hidden absolute left-0 mt-2 w-full bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700";
    dropdownMenu.style.minWidth = "150px";

    const ul = document.createElement('ul');
    ul.className = "py-2 font-medium";
    ul.role = "menu";

    langs.forEach(lang => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = "#";
        a.className = "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-white";
        a.role = "menuitem";
        a.innerHTML = `<span>${langFlags[lang] || "🌐"}</span><span>${lang}</span>`;
        if (lang === selectedLanguage) {
            a.classList.add("font-bold", "text-blue-700");
        }
        a.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.classList.add('hidden');
            dropdownBtn.innerHTML = `
                <span class="me-2">${langFlags[lang] || "🌐"}</span>
                <span class="me-2">${lang}</span>
                <svg class="w-2.5 h-2.5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            `;
            onChange(lang);
        });
        li.appendChild(a);
        ul.appendChild(li);
    });
    dropdownMenu.appendChild(ul);

    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        dropdownMenu.classList.add('hidden');
    });

    wrapper.appendChild(dropdownBtn);
    wrapper.appendChild(dropdownMenu);
    container.appendChild(wrapper);
}