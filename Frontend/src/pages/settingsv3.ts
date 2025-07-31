import { Page } from "../router";
import { exmp } from "../languageManager";

export class Settingsv3 implements Page{
	private isOpen = false;
	private selectedColor = localStorage.getItem('ballColor') || '#3b82f6';
	private selectedLanguage = localStorage.getItem('language') || 'tr';
	private tmpLanguage: string | null = null;
	private colors = [
		'#3b82f6', // Electric Blue
		'#ef4444', // Vibrant Red
		'#10b981', // Emerald Green
		'#f59e0b', // Amber Gold
		'#8b5cf6', // Deep Purple
		'#ec4899', // Hot Pink
		'#06b6d4', // Bright Cyan
		'#84cc16', // Electric Lime
		'#f97316', // Bright Orange
		'#6366f1', // Rich Indigo
		'#14b8a6', // Teal
		'#64748b'  // Modern Gray
	];
	private langFlags: { [key: string]: string } = {
		"tr": "🇹🇷",
		"en": "🇺🇸", 
		"fr": "🇫🇷",
	};
	private langNames: { [key: string]: string } = {
		"tr": "Türkçe",
		"en": "English",
		"fr": "Français",
	};

	evaluate(): string {
		return `
		<div
			id="settings_main"
			class="fixed inset-0 z-50 flex bg-gradient-to-br from-slate-900/40 via-purple-900/25 to-indigo-900/30 backdrop-blur-md backdrop-saturate-120 backdrop-hue-rotate-15 opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
				<div class="absolute inset-0 overflow-hidden pointer-events-none">
					<div class="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/8 to-cyan-500/8 rounded-full blur-3xl animate-pulse opacity-60"></div>
					<div class="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"></div>
					<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/8 to-teal-500/8 rounded-full blur-3xl animate-pulse delay-500 opacity-40"></div>
					<div class="absolute top-1/6 right-1/3 w-48 h-48 bg-gradient-to-r from-amber-400/6 to-orange-500/6 rounded-full blur-3xl animate-pulse delay-1500 opacity-30"></div>
					<div class="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-r from-violet-400/7 to-indigo-500/7 rounded-full blur-3xl animate-pulse delay-2000 opacity-35"></div>
				</div>
				<div id="settings_sidebar"
				class="min-w-[550px] w-full lg:w-2/3 xl:w-1/3 h-full bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-100/95 backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.3)] border border-white/40 border-l-white/60 flex flex-col relative overflow-hidden transform -translate-x-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
					<div
					class = "absolute inset-0 pointer-events-none">
						<div class="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent via-50% to-purple-500/8"></div>
						<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
						<div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
						<div class="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
						<div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
						<div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					</div>
					${this.createHeaderV2()}
					${this.createContentV2()}
					${this.createFooterV2()}
				</div>
			</div>
		`
	}

	onLoad(): void {
		const settingsContainer = document.getElementById('content-container') as HTMLElement;
		if (!settingsContainer) {
			console.error('Content container not found in show');
			return;
		}
		settingsContainer.innerHTML += this.evaluate();
		const overlay = document.getElementById('settings_main') as HTMLElement;
		const sidebar = document.getElementById('settings_sidebar') as HTMLElement;
		requestAnimationFrame(() => {
			overlay.style.opacity = '1';
			sidebar.style.transform = 'translateX(0)';
		});
		this.isOpen = true;
		this.initializeEventListeners();
		exmp.applyLanguage()
	}

	private initializeEventListeners(): void {

		console.log('Initializing settings event listeners');
		const settingsMain = document.getElementById('settings_main');
		if (!settingsMain) {
			console.error('settings_main not found in initializeEventListeners');
			return;
		}

		// createColorGridV2 nin eventleri
		const grid = document.getElementById('scolor_section');
		if(!grid) console.log('onload da aranan grid bulunamadı');
		else{
			grid.addEventListener('click', (e) => {
				const card = (e.target as HTMLElement).closest('.group\\/card') as HTMLElement;
				if (card) {
					const color = card.getAttribute('data-color');
					if (color) {
						card.style.transform = 'scale(0.95)';
						setTimeout(() => {
							card.style.transform = '';
						}, 150);
						this.selectColor(color, grid, this.colors);
					}
				}
			});
		}

		// createLanguageDropdownV2 eventleri
		const container = document.getElementById('dropdownHTML') as HTMLElement;
		const currentBtn = container.querySelector('#current-lang-btn') as HTMLButtonElement;
		const dropdownMenu = container.querySelector('#dropdown-menu-lang') as HTMLElement;

		currentBtn.addEventListener('click', (e) => {
			this.toggleDropdown(dropdownMenu, currentBtn);
		});

		dropdownMenu.querySelectorAll('button[data-lang]').forEach((btn) => {
			btn.addEventListener('click', () => {
				this.tmpLanguage = (btn as HTMLElement).getAttribute('data-lang')!; // geçici olarak seçilen dili sakla
				this.selectLanguage(this.tmpLanguage, currentBtn, dropdownMenu, this.langFlags, this.langNames, exmp.getLanguageChoises());
			});
		});

		// createFooterV2 eventleri
		const footer = document.getElementById('s-footer');
		if(!footer) console.log('onload da aranan footer bulunamadı');
		else {
			const saveBtn = footer.querySelector('#settings-save-btn') as HTMLButtonElement;
			saveBtn.addEventListener('mousedown', (e) => { // buton üzerindeki dalga efekti için mousedown kullanıyoruz
				const ripple = document.createElement('div');
				const rect = saveBtn.getBoundingClientRect();
				const size = Math.max(rect.width, rect.height);
				const x = e.clientX - rect.left - size / 2;
				const y = e.clientY - rect.top - size / 2;
	
				ripple.style.cssText = `
					position: absolute;
					width: ${size}px;
					height: ${size}px;
					left: ${x}px;
					top: ${y}px;
					background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
					border-radius: 50%;
					transform: scale(0);
					animation: ripple 0.6s ease-out;
					pointer-events: none;
					z-index: 0;
				`;
				saveBtn.appendChild(ripple);
				this.saveSettings(saveBtn);
			});
		}

		const closeBtn = settingsMain.querySelector('[data-action="close"]');
		if (closeBtn) {
			closeBtn.addEventListener('click', (e) => {
				console.log('Close button clicked');
				e.preventDefault();
				e.stopPropagation();
				this.close();
			});
		}

		settingsMain.addEventListener('click', (e) => {
			if (e.target === settingsMain) {
				console.log('Overlay clicked, closing settings');
				this.close();
			}
		});
	}

	private saveSettings(saveBtn: HTMLElement): void {
		this.close();
		exmp.setLanguage(this.selectedLanguage);
		localStorage.setItem('ballColor', this.selectedColor);
		console.log('Settings saved successfully');
	}

	private close(): void {
		if (!this.isOpen) return;
		
		console.log('Closing settings with enhanced animation');
		const settingsMain = document.getElementById('settings_main');
		if (settingsMain) {

			settingsMain.style.opacity = '0';
			settingsMain.style.backdropFilter = 'blur(0px)';

			//! burada bir önceki animasyon bitmesi bekleniyor ama doğru yöntem olmadığını konuşmuştuk
			setTimeout(() => {
				settingsMain.remove();
				this.isOpen = false;
			}, 200);
		}
	}

	private createHeaderV2(): string {
		return`
			<div class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
				px-8 py-8 flex-shrink-0 border-b border-slate-700/50">
				<div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
				<button data-action="close"
					class="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl
					bg-white/10 backdrop-blur-md border border-white/20
					flex items-center justify-center text-white/80
					hover:text-white hover:bg-white/20 hover:scale-110
					transition-all duration-300 ease-out group">
					<svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" 
						fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
				<h1 class="text-3xl font-bold text-white relative z-10
					tracking-tight leading-tight drop-shadow-lg">Ayarlar
				</h1>
			</div>
		`;
	}

	private createContentV2(): string {
		const style = document.createElement('style');
		style.textContent = `
			.custom-scrollbar::-webkit-scrollbar {
				width: 8px;
			}
			.custom-scrollbar::-webkit-scrollbar-track {
				background: rgba(148, 163, 184, 0.1);
				border-radius: 4px;
			}
			.custom-scrollbar::-webkit-scrollbar-thumb {
				background: linear-gradient(to bottom, #64748b, #475569);
				border-radius: 4px;
				border: 1px solid rgba(255, 255, 255, 0.1);
			}
			.custom-scrollbar::-webkit-scrollbar-thumb:hover {
				background: linear-gradient(to bottom, #475569, #334155);
			}
			@keyframes ripple {
				to {
					transform: scale(2);
					opacity: 0;
				}
			}
		`;
		document.head.appendChild(style);
	
		return `
			<div class="flex-1 overflow-y-auto overflow-x-visible custom-scrollbar">
				<div class="bg-gradient-to-b from-transparent via-slate-50/30 to-transparent backdrop-blur-sm p-8 space-y-8 overflow-visible">
					${this.createColorSectionV2()}
					${this.createLanguageSectionV2()}
				</div>
			</div>
		`;
	}

	private createColorSectionV2(): string {
	return `
		<div id="createColorSectionV2-stop" class="group relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
			backdrop-blur-3xl rounded-[2rem] p-12 border-2 border-white/50
			shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.4)]
			hover:shadow-[0_35px_70px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.6)]
			hover:border-white/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
			overflow-hidden hover:scale-[1.02] hover:-translate-y-2
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-purple-500/5 before:to-pink-500/5 
			before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-100">
			<div class="absolute inset-0 pointer-events-none overflow-hidden">
				<div class="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-pink-500/3 group-hover:from-blue-500/8 group-hover:via-purple-500/8 group-hover:to-pink-500/8 transition-all duration-700"></div>
				<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
				<div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
				<div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
				<div class="absolute top-4 right-4 w-3 h-3 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
				<div class="absolute bottom-6 left-6 w-2 h-2 bg-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700 delay-200"></div>
			</div>
			<div class="flex items-center gap-8 mb-12 relative z-10">
				<div class="relative w-20 h-20 rounded-3xl overflow-hidden
					bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600
					flex items-center justify-center shadow-2xl group-hover:shadow-3xl
					transform group-hover:scale-110 group-hover:rotate-6
					transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
					before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent
					after:absolute after:inset-0 after:bg-gradient-to-br after:from-blue-400 after:to-purple-500 
					after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-700">
					<svg class="w-10 h-10 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" 
						fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
							d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
					</svg>
				</div>
				<div class="flex-1">
					<h3 data-langm-key="settings.ball-color" class="text-4xl font-black text-transparent bg-clip-text 
						bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
						tracking-tight leading-tight group-hover:from-gray-900 
						group-hover:via-blue-900 group-hover:to-gray-900
						transition-all duration-700 mb-3">
					</h3>
				</div>
			</div>
			<!-- Color grid burada eklenecek -->
			${this.createColorGridV2()}
		</div>
	`;
}

	private createLanguageSectionV2(): string {
		return `
			<div id="createLanguageSectionV2-stop" class="group relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
				backdrop-blur-3xl rounded-[2rem] p-12 border-2 border-white/50
				shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.4)]
				hover:shadow-[0_35px_70px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.6)]
				hover:border-white/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
				overflow-visible hover:scale-[1.02] hover:-translate-y-2 z-50
				before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/5 before:via-blue-500/5 before:to-purple-500/5 
				before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-100">
				<div class="absolute inset-0 pointer-events-none overflow-hidden">
					<div class="absolute inset-0 bg-gradient-to-br from-green-500/3 via-blue-500/3 to-purple-500/3 group-hover:from-green-500/8 group-hover:via-blue-500/8 group-hover:to-purple-500/8 transition-all duration-700"></div>
					<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
					<div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
					<div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
					<div class="absolute top-4 right-4 w-3 h-3 bg-green-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
					<div class="absolute bottom-6 left-6 w-2 h-2 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700 delay-200"></div>
				</div>
				<div class="flex items-center gap-8 mb-12 relative z-10">
					<div class="relative w-20 h-20 rounded-3xl overflow-hidden
						bg-gradient-to-br from-green-500 via-emerald-600 to-blue-600
						flex items-center justify-center shadow-2xl group-hover:shadow-3xl
						transform group-hover:scale-110 group-hover:rotate-6
						transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
						before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent
						after:absolute after:inset-0 after:bg-gradient-to-br after:from-green-400 after:to-blue-500 
						after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-700">
						<svg class="w-10 h-10 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" 
							fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
								d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
						</svg>
					</div>
					<div class="flex-1">
						<h3 data-langm-key="settings.language-select" class="text-4xl font-black text-transparent bg-clip-text 
							bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
							tracking-tight leading-tight group-hover:from-gray-900 
							group-hover:via-green-900 group-hover:to-gray-900
							transition-all duration-700 mb-3">
						</h3>
					</div>
				</div>
				${this.createLanguageDropdownV2()}
			</div>
		`;
	}

	private createColorGridV2(): string {
		let gridHTML = `<div id="scolor_section" class="grid grid-cols-4 gap-6 relative z-10 max-w-lg mx-auto">`;

		this.colors.forEach((color) => {
			const isSelected = color === this.selectedColor;
			gridHTML += `
				<div class="group/card relative cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl p-4 
					border-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
					hover:bg-white hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] 
					hover:scale-125 hover:-translate-y-4 hover:rotate-2 hover:z-10
					before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent 
					before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700
					after:absolute after:inset-[-2px] after:bg-gradient-to-br after:from-white/30 after:to-transparent
					after:rounded-3xl after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700 after:-z-10
					${isSelected 
						? 'border-gray-900 bg-white shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] scale-110 -translate-y-2 rotate-1 z-10' 
						: 'border-gray-200/60 hover:border-gray-400/80'
					}"
					data-color="${color}"
				>
					<div class="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
						<div class="absolute top-2 left-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover/card:opacity-90 group-hover/card:animate-ping transition-all duration-1000" style="background-color: ${color}; animation-delay: 0ms;"></div>
						<div class="absolute top-3 right-3 w-2 h-2 rounded-full opacity-0 group-hover/card:opacity-70 group-hover/card:animate-pulse transition-all duration-1000" style="background-color: ${color}; animation-delay: 300ms;"></div>
						<div class="absolute bottom-3 left-4 w-1 h-1 rounded-full opacity-0 group-hover/card:opacity-80 group-hover/card:animate-bounce transition-all duration-1000" style="background-color: ${color}; animation-delay: 600ms;"></div>
						<div class="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover/card:opacity-60 group-hover/card:animate-pulse transition-all duration-1000" style="background-color: ${color}; animation-delay: 900ms;"></div>
						<div class="absolute top-1/2 left-1/2 w-0.5 h-0.5 rounded-full opacity-0 group-hover/card:opacity-100 group-hover/card:animate-ping transition-all duration-1000" style="background-color: ${color}; animation-delay: 1200ms; transform: translate(-50%, -50%);"></div>
					</div>
					<div class="w-16 h-16 rounded-2xl mx-auto relative shadow-2xl group-hover/card:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]
						transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
						group-hover/card:scale-125 group-hover/card:rotate-12 border-4 border-white/80
						before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/40 before:to-transparent 
						before:opacity-0 group-hover/card:before:opacity-100 before:transition-opacity before:duration-700
						after:absolute after:inset-[-4px] after:rounded-2xl after:opacity-0 group-hover/card:after:opacity-60 
						after:transition-opacity after:duration-700 after:blur-lg after:-z-10"
						style="background-color: ${color}; box-shadow: 0 12px 32px -8px ${color}60, 0 8px 20px -4px rgba(0,0,0,0.15);"
					>
						<div class="absolute inset-[-4px] rounded-2xl opacity-0 group-hover/card:opacity-60 transition-opacity duration-700 blur-lg -z-10" style="background-color: ${color};"></div>
						<div class="absolute inset-0 rounded-2xl pointer-events-none">
							<div class="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 blur-md scale-110" style="background-color: ${color};"></div>
							<div class="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-80 transition-opacity duration-700 blur-lg scale-125" style="background-color: ${color};"></div>
							<div class="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-60 transition-opacity duration-700 blur-xl scale-150" style="background-color: ${color};"></div>
						</div>
					</div>
					${isSelected ? createEnhancedCheckmarkV2() : ''}
					<div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
						bg-gray-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full
						opacity-0 group-hover/card:opacity-100 transition-all duration-500 
						backdrop-blur-sm border border-white/10 whitespace-nowrap pointer-events-none"
					>${color.toUpperCase()}</div>
				</div>
			`;
		});
		gridHTML += `</div>`;

		return gridHTML;
	}

	private createFooterV2(): string {
		return `
		<div id="s-footer" class="p-10 bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90 
			border-t-2 border-white/60 flex-shrink-0 backdrop-blur-md relative overflow-hidden">
			<div class="absolute inset-0 pointer-events-none">
				<div class="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3"></div>
				<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
			</div>
			<button type="submit"
				class="w-full relative group overflow-hidden 
				bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
				hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 
				text-white font-bold py-6 px-10 rounded-3xl border-2 border-slate-600
				shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-8px_rgba(0,0,0,0.4)]
				transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]
				transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10
				before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-600/20 before:via-purple-600/20 before:to-pink-600/20 
				before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
				after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:to-transparent 
				after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500"
				id="settings-save-btn"
			>
				<div class="relative flex items-center justify-center gap-4 z-10">
					<span data-langm-key="settings.save-button" class="text-xl font-bold tracking-wide"></span>
					<svg class="w-7 h-7 group-hover:translate-x-3 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" 
						fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
			</button>
		</div>
		`;
	}

   private createLanguageDropdownV2(): string {
	   const renderLangOption = (lang: string) => `
		   <button class="w-full p-3 flex items-center gap-3 hover:bg-gray-50/90 hover:backdrop-blur-sm
			   transition-all duration-200 ease-out text-left border-b border-gray-100/60 
			   last:border-b-0 group hover:scale-[1.01] hover:shadow-sm min-h-[48px]
			   ${lang === this.selectedLanguage ? 'bg-blue-50/90 border-blue-200/50' : ''}"
			   data-lang="${lang}"
			   type="button">
			   <div class="text-xl group-hover:scale-110 transition-transform duration-300">${this.langFlags[lang] || "🌐"}</div>
			   <div class="flex-1">
				   <div class="font-bold text-gray-800 text-sm group-hover:text-gray-900">${this.langNames[lang] || lang}</div>
				   <div class="text-xs text-gray-500 font-medium">${lang.toUpperCase()}</div>
			   </div>
			   ${lang === this.selectedLanguage ? `
				   <div class="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 
					   flex items-center justify-center shadow-md">
					   <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
						   <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
					   </svg>
				   </div>
			   ` : ''}
		   </button>
	   `;

	   const optionsHTML = exmp.getLanguageChoises().map(renderLangOption).join('');
	   const dropdownHTML = `
		   <div id="dropdownHTML" class="relative z-[100] dropdown-container">
			   <button type="button"
				   class="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300/80 
				   rounded-3xl p-4 flex items-center justify-between hover:bg-white hover:border-gray-400 
				   hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-out
				   cursor-pointer group shadow-md min-h-[56px] relative z-10"
				   id="current-lang-btn"
			   >
				   ${this.updateLanguageDisplay(this.selectedLanguage, this.langFlags, this.langNames)}
			   </button>
			   <div class="absolute top-full left-0 right-0 mt-3 z-[99999]
				   bg-white/95 backdrop-blur-xl border-2 border-gray-300/50 
				   rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] 
				   max-h-48 overflow-hidden hidden opacity-0 transform translate-y-2 scale-95
				   transition-all duration-300 ease-out dropdown-menu"
				   id="dropdown-menu-lang"
			   >
				   ${optionsHTML}
			   </div>
		   </div>
	   `;
	   return dropdownHTML;
   }
	
	private selectColor(color: string, grid: HTMLElement, colors: string[]): void {
		this.selectedColor = color;
		localStorage.setItem('ballColor', color);

		grid.querySelectorAll('.group\\/card').forEach((card, index) => {
		const isSelected = colors[index] === color;

		card.className = `
			group/card relative cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl p-4 
			border-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
			hover:bg-white hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] 
			hover:scale-125 hover:-translate-y-4 hover:rotate-2 hover:z-10
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent 
			before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700
			after:absolute after:inset-[-2px] after:bg-gradient-to-br after:from-white/30 after:to-transparent
			after:rounded-3xl after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700 after:-z-10
			${	isSelected ? 
				'border-gray-900 bg-white shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] scale-110 -translate-y-2 rotate-1 z-10'
				: 'border-gray-200/60 hover:border-gray-400/80'}`;

		const existingCheck = card.querySelector('.animate-pulse');
		if (existingCheck) existingCheck.remove();
		if (isSelected) card.innerHTML += `${createEnhancedCheckmarkV2()}`;
		});
	}
	
	private toggleDropdown(dropdownMenu: HTMLElement, currentBtn: HTMLElement): void {
		const isHidden = dropdownMenu.classList.contains('hidden');
		const arrow = currentBtn.querySelector('svg');
		
		if (isHidden) {
			dropdownMenu.classList.remove('hidden');
			requestAnimationFrame(() => {
				dropdownMenu.style.opacity = '1';
				dropdownMenu.style.transform = 'translateY(0) scale(1)';
			});
			if (arrow) arrow.style.transform = 'rotate(180deg)';
		} else {
			this.closeDropdown(dropdownMenu, currentBtn);
		}
	}

	//! dil seçiminden sonra dropdown menü aşağı inerken ufak bir atlama oluyor onu düzeltmek lazım
	private closeDropdown(dropdownMenu: HTMLElement, currentBtn: HTMLElement): void {
		const arrow = currentBtn.querySelector('svg');
		dropdownMenu.style.transform = 'translateY(8px) scale(0.00)';
		setTimeout(() => {
			dropdownMenu.classList.add('hidden');
		}, 300);
		if (arrow) arrow.style.transform = 'rotate(90deg)';
	}

   private selectLanguage(lang: string, currentBtn: HTMLElement, dropdownMenu: HTMLElement, flags: any, names: any, langs: string[]): void {
	   this.selectedLanguage = lang;
	   localStorage.setItem('language', lang);
	   currentBtn.innerHTML = this.updateLanguageDisplay(lang, flags, names);
	   let optionsHTML = '';
	   langs.forEach((l) => {
		   optionsHTML += `
			   <button class="w-full p-3 flex items-center gap-3 hover:bg-gray-50/90 hover:backdrop-blur-sm
				   transition-all duration-200 ease-out text-left border-b border-gray-100/60 
				   last:border-b-0 group hover:scale-[1.01] hover:shadow-sm min-h-[48px]
				   ${l === lang ? 'bg-blue-50/90 border-blue-200/50' : ''}"
				   data-lang="${l}"
				   type="button">
				   <div class="text-xl group-hover:scale-110 transition-transform duration-300">${flags[l] || "🌐"}</div>
				   <div class="flex-1">
					   <div class="font-bold text-gray-800 text-sm group-hover:text-gray-900">${names[l] || l}</div>
					   <div class="text-xs text-gray-500 font-medium">${l.toUpperCase()}</div>
				   </div>
				   ${l === lang ? `
					   <div class="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-blue-600 
						   flex items-center justify-center shadow-md">
						   <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
							   <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						   </svg>
					   </div>
				   ` : ''}
			   </button>
		   `;
	   });
	   dropdownMenu.innerHTML = optionsHTML;
	   dropdownMenu.querySelectorAll('button[data-lang]').forEach((btn) => {
		   btn.addEventListener('click', () => {
			   this.tmpLanguage = (btn as HTMLElement).getAttribute('data-lang')!;
			   this.selectLanguage(this.tmpLanguage, currentBtn, dropdownMenu, flags, names, langs);
		   });
	   });
	   this.closeDropdown(dropdownMenu, currentBtn);
   }

	private updateLanguageDisplay(lang: string, flags: any, names: any): string {
		return `
			<div class="flex items-center gap-3">
				<div class="text-xl group-hover:scale-110 transition-transform duration-300">${flags[lang] || "🌐"}</div>
				<div class="text-left">
					<div class="font-bold text-gray-800 text-sm">${names[lang] || lang}</div>
					<div class="text-xs text-gray-500 font-medium">${lang.toUpperCase()}</div>
				</div>
			</div>
			<svg class="w-5 h-5 text-gray-400 transform transition-all duration-300 group-hover:text-gray-600 group-hover:rotate-180" 
				 fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		`;
	}

}

function createEnhancedCheckmarkV2(): string {
	return `
		<div class="absolute -top-3 -right-3 w-8 h-8 rounded-full z-20
			bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
			border-4 border-white shadow-2xl animate-pulse
			flex items-center justify-center overflow-hidden
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/20 before:to-purple-500/20
			hover:scale-110 transition-transform duration-300">
			<svg class="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
			</svg>
		</div>
	`;
}