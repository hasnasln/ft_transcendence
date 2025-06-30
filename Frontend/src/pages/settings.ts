import { IApiSetSettings, _apiManager } from "../api/APIManeger";
import { exmp } from "../languageMeneger";

export class Settings {
	private isOpen = false;
	private selectedColor = '#3b82f6';
	private selectedLanguage = 'tr';
	private closeHandler: ((e: Event) => void) | null = null;
	private languageChangeHandler: (lang: string) => void;

	constructor() {
		this.languageChangeHandler = (lang: string) => {
			const container = document.getElementById('settings_main')?.parentElement;
			if (container) {
				container.innerHTML = '';
				this.render(container);
			}
		};
	}

	async render(container: HTMLElement): Promise<void> {
		if (!container) {
			console.error('Container not found');
			return;
		}		
		const storedSettings = localStorage.getItem('settings');
		const currentSettings = JSON.parse(storedSettings || '{}');
		this.selectedColor = currentSettings.ball_color || '#3b82f6';
		this.selectedLanguage = exmp.getLanguage();
		
		this.createSettingsUI(container);
		this.isOpen = true;
		
		requestAnimationFrame(() => {
			this.initializeEventListeners();
		});
		
		_apiManager.settings().catch(error => {
			console.warn('Failed to load settings from API:', error);
		});
	}

	private createSettingsUI(container: HTMLElement): void {
		const overlay = document.createElement('div');
		overlay.id = 'settings_main';
		overlay.className = `
			fixed inset-0 z-50 flex
			bg-gradient-to-br from-slate-900/40 via-purple-900/25 to-indigo-900/30 
			backdrop-blur-md backdrop-saturate-120 backdrop-hue-rotate-15
			opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
		`.replace(/\s+/g, ' ').trim();

		const bgSystem = document.createElement('div');
		bgSystem.className = 'absolute inset-0 overflow-hidden pointer-events-none';
		bgSystem.innerHTML = `
			<div class="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/8 to-cyan-500/8 rounded-full blur-3xl animate-pulse opacity-60"></div>
			<div class="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"></div>
			<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/8 to-teal-500/8 rounded-full blur-3xl animate-pulse delay-500 opacity-40"></div>
			<div class="absolute top-1/6 right-1/3 w-48 h-48 bg-gradient-to-r from-amber-400/6 to-orange-500/6 rounded-full blur-3xl animate-pulse delay-1500 opacity-30"></div>
			<div class="absolute bottom-1/4 left-1/3 w-56 h-56 bg-gradient-to-r from-violet-400/7 to-indigo-500/7 rounded-full blur-3xl animate-pulse delay-2000 opacity-35"></div>
		`;

		const sidebar = document.createElement('div');
		sidebar.className = `
			w-[520px] h-full 
			bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-100/95
			backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110
			shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.3)]
			border border-white/40 border-l-white/60
			flex flex-col relative overflow-hidden
			transform -translate-x-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
		`.replace(/\s+/g, ' ').trim();

		const sidebarEffects = document.createElement('div');
		sidebarEffects.className = 'absolute inset-0 pointer-events-none';
		sidebarEffects.innerHTML = `
			<div class="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent via-50% to-purple-500/8"></div>
			<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
			<div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
			<div class="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
			<div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
			<div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
		`;
		const header = this.createHeader();
		const content = this.createContent();
		const footer = this.createFooter();

		sidebar.appendChild(sidebarEffects);
		sidebar.appendChild(header);
		sidebar.appendChild(content);
		sidebar.appendChild(footer);
		
		sidebar.addEventListener('click', (e) => {
			e.stopPropagation();
		});
		
		overlay.appendChild(bgSystem);
		overlay.appendChild(sidebar);
		container.appendChild(overlay);

		requestAnimationFrame(() => {
			overlay.style.opacity = '1';
			setTimeout(() => {
				sidebar.style.transform = 'translateX(0)';
			}, 100);
		});
	}

	private createHeader(): HTMLElement {
		const header = document.createElement('div');
		header.className = `
			relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
			px-8 py-8 flex-shrink-0 border-b border-slate-700/50
		`.replace(/\s+/g, ' ').trim();

		const overlay = document.createElement('div');
		overlay.className = `
			absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10
		`.replace(/\s+/g, ' ').trim();

		const closeBtn = document.createElement('button');
		closeBtn.setAttribute('data-action', 'close');
		closeBtn.className = `
			absolute top-6 right-6 z-20 w-10 h-10 rounded-xl
			bg-white/10 backdrop-blur-md border border-white/20
			flex items-center justify-center text-white/80
			hover:text-white hover:bg-white/20 hover:scale-110
			transition-all duration-300 ease-out group
		`.replace(/\s+/g, ' ').trim();
		
		closeBtn.innerHTML = `
			<svg class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" 
				 fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		`;

		const title = document.createElement('h1');
		title.textContent = exmp.getLang("settings.title");
		title.className = `
			text-3xl font-bold text-white relative z-10
			tracking-tight leading-tight drop-shadow-lg
		`.replace(/\s+/g, ' ').trim();


		header.appendChild(overlay);
		header.appendChild(closeBtn);
		header.appendChild(title);

		return header;
	}

	private createContent(): HTMLElement {
		const contentWrapper = document.createElement('div');
		contentWrapper.className = 'flex-1 overflow-y-auto overflow-x-visible custom-scrollbar';
		
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
		
		const content = document.createElement('div');
		content.className = `
			bg-gradient-to-b from-transparent via-slate-50/30 to-transparent 
			backdrop-blur-sm p-8 space-y-8 overflow-visible
		`.replace(/\s+/g, ' ').trim();

		const colorSection = this.createColorSection();
		content.appendChild(colorSection);

		const langSection = this.createLanguageSection();
		content.appendChild(langSection);

		contentWrapper.appendChild(content);
		return contentWrapper;
	}

	private createColorSection(): HTMLElement {
		const section = document.createElement('div');
		section.className = `
			group relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
			backdrop-blur-3xl rounded-[2rem] p-12 border-2 border-white/50
			shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.4)]
			hover:shadow-[0_35px_70px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.6)]
			hover:border-white/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
			overflow-hidden hover:scale-[1.02] hover:-translate-y-2
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-purple-500/5 before:to-pink-500/5 
			before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-100
		`.replace(/\s+/g, ' ').trim();

		const bgEffectsSystem = document.createElement('div');
		bgEffectsSystem.className = 'absolute inset-0 pointer-events-none overflow-hidden';
		bgEffectsSystem.innerHTML = `
			<div class="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-pink-500/3 group-hover:from-blue-500/8 group-hover:via-purple-500/8 group-hover:to-pink-500/8 transition-all duration-700"></div>
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
			<div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
			<div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
			<div class="absolute top-4 right-4 w-3 h-3 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
			<div class="absolute bottom-6 left-6 w-2 h-2 bg-purple-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700 delay-200"></div>
		`;

		const header = document.createElement('div');
		header.className = 'flex items-center gap-8 mb-12 relative z-10';
		
		const iconContainer = document.createElement('div');
		iconContainer.className = `
			relative w-20 h-20 rounded-3xl overflow-hidden
			bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600
			flex items-center justify-center shadow-2xl group-hover:shadow-3xl
			transform group-hover:scale-110 group-hover:rotate-6
			transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent
			after:absolute after:inset-0 after:bg-gradient-to-br after:from-blue-400 after:to-purple-500 
			after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-700
		`.replace(/\s+/g, ' ').trim();
		
		iconContainer.innerHTML = `
			<svg class="w-10 h-10 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" 
				 fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
					  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"></path>
			</svg>
		`;

		const labelContainer = document.createElement('div');
		labelContainer.className = 'flex-1';
		
		const label = document.createElement('h3');
		label.textContent = exmp.getLang("settings.ball-color");
		label.className = `
			text-4xl font-black text-transparent bg-clip-text 
			bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
			tracking-tight leading-tight group-hover:from-gray-900 
			group-hover:via-blue-900 group-hover:to-gray-900
			transition-all duration-700 mb-3
		`.replace(/\s+/g, ' ').trim();
	

		labelContainer.appendChild(label);
		header.appendChild(iconContainer);
		header.appendChild(labelContainer);

		const colorGrid = this.createColorGrid();

		section.appendChild(bgEffectsSystem);
		section.appendChild(header);
		section.appendChild(colorGrid);

		section.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		return section;
	}

	private createColorGrid(): HTMLElement {
		const colors = [
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

		const grid = document.createElement('div');
		grid.className = 'grid grid-cols-4 gap-6 relative z-10 max-w-lg mx-auto';

		colors.forEach((color, index) => {
			const colorCard = document.createElement('div');
			colorCard.className = `
				group/card relative cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl p-4 
				border-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
				hover:bg-white hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] 
				hover:scale-125 hover:-translate-y-4 hover:rotate-2 hover:z-10
				before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent 
				before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700
				after:absolute after:inset-[-2px] after:bg-gradient-to-br after:from-white/30 after:to-transparent
				after:rounded-3xl after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700 after:-z-10
				${color === this.selectedColor 
					? 'border-gray-900 bg-white shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] scale-110 -translate-y-2 rotate-1 z-10' 
					: 'border-gray-200/60 hover:border-gray-400/80'
				}
			`.replace(/\s+/g, ' ').trim();

			const particleSystem = document.createElement('div');
			particleSystem.className = 'absolute inset-0 pointer-events-none overflow-hidden rounded-3xl';
			particleSystem.innerHTML = `
				<div class="absolute top-2 left-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover/card:opacity-90 group-hover/card:animate-ping transition-all duration-1000" style="background-color: ${color}; animation-delay: 0ms;"></div>
				<div class="absolute top-3 right-3 w-2 h-2 rounded-full opacity-0 group-hover/card:opacity-70 group-hover/card:animate-pulse transition-all duration-1000" style="background-color: ${color}; animation-delay: 300ms;"></div>
				<div class="absolute bottom-3 left-4 w-1 h-1 rounded-full opacity-0 group-hover/card:opacity-80 group-hover/card:animate-bounce transition-all duration-1000" style="background-color: ${color}; animation-delay: 600ms;"></div>
				<div class="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover/card:opacity-60 group-hover/card:animate-pulse transition-all duration-1000" style="background-color: ${color}; animation-delay: 900ms;"></div>
				<div class="absolute top-1/2 left-1/2 w-0.5 h-0.5 rounded-full opacity-0 group-hover/card:opacity-100 group-hover/card:animate-ping transition-all duration-1000" style="background-color: ${color}; animation-delay: 1200ms; transform: translate(-50%, -50%);"></div>
			`;

			const colorPreview = document.createElement('div');
			colorPreview.className = `
				w-16 h-16 rounded-2xl mx-auto relative shadow-2xl group-hover/card:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]
				transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
				group-hover/card:scale-125 group-hover/card:rotate-12 border-4 border-white/80
				before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/40 before:to-transparent 
				before:opacity-0 group-hover/card:before:opacity-100 before:transition-opacity before:duration-700
				after:absolute after:inset-[-4px] after:rounded-2xl after:opacity-0 group-hover/card:after:opacity-60 
				after:transition-opacity after:duration-700 after:blur-lg after:-z-10
			`.replace(/\s+/g, ' ').trim();
			
			colorPreview.style.backgroundColor = color;
			colorPreview.style.boxShadow = `0 12px 32px -8px ${color}60, 0 8px 20px -4px rgba(0, 0, 0, 0.15)`;
			
			const afterElement = document.createElement('div');
			afterElement.className = 'absolute inset-[-4px] rounded-2xl opacity-0 group-hover/card:opacity-60 transition-opacity duration-700 blur-lg -z-10';
			afterElement.style.backgroundColor = color;
			colorPreview.appendChild(afterElement);

			const glowLayers = document.createElement('div');
			glowLayers.className = 'absolute inset-0 rounded-2xl pointer-events-none';
			glowLayers.innerHTML = `
				<div class="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 blur-md scale-110" style="background-color: ${color};"></div>
				<div class="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-80 transition-opacity duration-700 blur-lg scale-125" style="background-color: ${color};"></div>
				<div class="absolute inset-0 rounded-2xl opacity-0 group-hover/card:opacity-60 transition-opacity duration-700 blur-xl scale-150" style="background-color: ${color};"></div>
			`;
			colorPreview.appendChild(glowLayers);

			if (color === this.selectedColor) {
				const checkmark = this.createEnhancedCheckmark();
				colorCard.appendChild(checkmark);
			}

			const colorHint = document.createElement('div');
			colorHint.className = `
				absolute -bottom-8 left-1/2 transform -translate-x-1/2 
				bg-gray-900/90 text-white text-xs font-semibold px-3 py-1 rounded-full
				opacity-0 group-hover/card:opacity-100 transition-all duration-500 
				backdrop-blur-sm border border-white/10 whitespace-nowrap pointer-events-none
			`;
			colorHint.textContent = color.toUpperCase();

			colorCard.appendChild(particleSystem);
			colorCard.appendChild(colorPreview);
			colorCard.appendChild(colorHint);
			
			colorCard.addEventListener('click', (e) => {
				e.stopPropagation();
				
				colorCard.style.transform = 'scale(0.95)';
				setTimeout(() => {
					colorCard.style.transform = '';
				}, 150);
				
				this.selectColor(color, grid, colors);
			});

			grid.appendChild(colorCard);
		});
		grid.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		return grid;
	}

	private createEnhancedCheckmark(): HTMLElement {
		const checkmark = document.createElement('div');
		checkmark.className = `
			absolute -top-3 -right-3 w-8 h-8 rounded-full z-20
			bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900
			border-4 border-white shadow-2xl animate-pulse
			flex items-center justify-center overflow-hidden
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/20 before:to-purple-500/20
			hover:scale-110 transition-transform duration-300
		`.replace(/\s+/g, ' ').trim();
		
		checkmark.innerHTML = `
			<svg class="w-4 h-4 text-white drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
				<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
			</svg>
		`;
		return checkmark;
	}

	private selectColor(color: string, grid: HTMLElement, colors: string[]): void {
		const clickedCard = event?.currentTarget as HTMLElement;
		if (clickedCard) {
			clickedCard.style.transform = 'scale(0.95)';
			setTimeout(() => {
				clickedCard.style.transform = '';
			}, 150);
		}

		this.selectedColor = color;
		
		const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
		currentSettings.ball_color = color;
		localStorage.setItem('settings', JSON.stringify(currentSettings));
		
		console.log(`Ball color selected: ${color}`);
		console.log('Updated settings:', currentSettings);

		grid.querySelectorAll('.group\\/card').forEach((card, index) => {
			const isSelected = colors[index] === color;
			
			const baseClasses = `
				group/card relative cursor-pointer bg-white/95 backdrop-blur-md rounded-3xl p-4 
				border-3 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden
				hover:bg-white hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] 
				hover:scale-125 hover:-translate-y-4 hover:rotate-2 hover:z-10
				before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/60 before:to-transparent 
				before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700
				after:absolute after:inset-[-2px] after:bg-gradient-to-br after:from-white/30 after:to-transparent
				after:rounded-3xl after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-700 after:-z-10
			`.replace(/\s+/g, ' ').trim();
			
			const selectedClasses = isSelected 
				? 'border-gray-900 bg-white shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] scale-110 -translate-y-2 rotate-1 z-10'
				: 'border-gray-200/60 hover:border-gray-400/80';
			
			card.className = baseClasses + ' ' + selectedClasses;
			
			const existingCheck = card.querySelector('.animate-pulse');
			if (existingCheck) existingCheck.remove();
			
			if (isSelected) {
				const checkmark = this.createEnhancedCheckmark();
				card.appendChild(checkmark);
			}
		});
	}

	private createLanguageSection(): HTMLElement {
		const section = document.createElement('div');
		section.className = `
			group relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
			backdrop-blur-3xl rounded-[2rem] p-12 border-2 border-white/50
			shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.4)]
			hover:shadow-[0_35px_70px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.6)]
			hover:border-white/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
			overflow-visible hover:scale-[1.02] hover:-translate-y-2 z-50
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/5 before:via-blue-500/5 before:to-purple-500/5 
			before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-100
		`.replace(/\s+/g, ' ').trim();

		const bgEffectsSystem = document.createElement('div');
		bgEffectsSystem.className = 'absolute inset-0 pointer-events-none overflow-hidden';
		bgEffectsSystem.innerHTML = `
			<div class="absolute inset-0 bg-gradient-to-br from-green-500/3 via-blue-500/3 to-purple-500/3 group-hover:from-green-500/8 group-hover:via-blue-500/8 group-hover:to-purple-500/8 transition-all duration-700"></div>
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
			<div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
			<div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
			<div class="absolute top-4 right-4 w-3 h-3 bg-green-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-700"></div>
			<div class="absolute bottom-6 left-6 w-2 h-2 bg-blue-400/30 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-700 delay-200"></div>
		`;

		const header = document.createElement('div');
		header.className = 'flex items-center gap-8 mb-12 relative z-10';
		
		const iconContainer = document.createElement('div');
		iconContainer.className = `
			relative w-20 h-20 rounded-3xl overflow-hidden
			bg-gradient-to-br from-green-500 via-emerald-600 to-blue-600
			flex items-center justify-center shadow-2xl group-hover:shadow-3xl
			transform group-hover:scale-110 group-hover:rotate-6
			transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:to-transparent
			after:absolute after:inset-0 after:bg-gradient-to-br after:from-green-400 after:to-blue-500 
			after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-700
		`.replace(/\s+/g, ' ').trim();
		
		iconContainer.innerHTML = `
			<svg class="w-10 h-10 text-white relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500" 
				 fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
					  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path>
			</svg>
		`;

		const labelContainer = document.createElement('div');
		labelContainer.className = 'flex-1';
		
		const label = document.createElement('h3');
		label.textContent = exmp.getLang("settings.language-select");
		label.className = `
			text-4xl font-black text-transparent bg-clip-text 
			bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
			tracking-tight leading-tight group-hover:from-gray-900 
			group-hover:via-green-900 group-hover:to-gray-900
			transition-all duration-700 mb-3
		`.replace(/\s+/g, ' ').trim();
	

		labelContainer.appendChild(label);
		header.appendChild(iconContainer);
		header.appendChild(labelContainer);

		const dropdown = this.createLanguageDropdown();

		section.appendChild(bgEffectsSystem);
		section.appendChild(header);
		section.appendChild(dropdown);

		section.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		return section;
	}

	private createLanguageDropdown(): HTMLElement {
		const langFlags: { [key: string]: string } = {
			"tr": "🇹🇷",
			"en": "🇺🇸", 
			"fr": "🇫🇷",
		};

		const langNames: { [key: string]: string } = {
			"tr": "Türkçe",
			"en": "English",
			"fr": "Français",
		};

		const langs = exmp.getLanguageChoises();
		
		const container = document.createElement('div');
		container.className = 'relative z-[100] dropdown-container';

		const currentBtn = document.createElement('button');
		currentBtn.className = `
			w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300/80 
			rounded-3xl p-4
			flex items-center justify-between hover:bg-white hover:border-gray-400 
			hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-out
			cursor-pointer group shadow-md min-h-[56px] relative z-10
		`.replace(/\s+/g, ' ').trim();

		const dropdownMenu = document.createElement('div');
		dropdownMenu.className = `
			absolute top-full left-0 right-0 mt-3 z-[99999]
			bg-white/95 backdrop-blur-xl border-2 border-gray-300/50 
			rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] 
			max-h-48 overflow-hidden hidden opacity-0 transform translate-y-2 scale-95
			transition-all duration-300 ease-out dropdown-menu
		`.replace(/\s+/g, ' ').trim();

		langs.forEach((lang, index) => {
			const option = document.createElement('button');
			option.className = `
				w-full p-3 flex items-center gap-3 hover:bg-gray-50/90 hover:backdrop-blur-sm
				transition-all duration-200 ease-out text-left border-b border-gray-100/60 
				last:border-b-0 group hover:scale-[1.01] hover:shadow-sm min-h-[48px]
				${lang === this.selectedLanguage ? 'bg-blue-50/90 border-blue-200/50' : ''}
			`.replace(/\s+/g, ' ').trim();

			option.innerHTML = `
				<div class="text-xl group-hover:scale-110 transition-transform duration-300">${langFlags[lang] || "🌐"}</div>
				<div class="flex-1">
					<div class="font-bold text-gray-800 text-sm group-hover:text-gray-900">${langNames[lang] || lang}</div>
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
			`;

			option.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.selectLanguage(lang, currentBtn, dropdownMenu, langFlags, langNames, langs);
			});

			dropdownMenu.appendChild(option);
		});

		dropdownMenu.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		this.updateLanguageDisplay(currentBtn, this.selectedLanguage, langFlags, langNames);

		currentBtn.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggleDropdown(dropdownMenu, currentBtn);
		});

		container.appendChild(currentBtn);
		container.appendChild(dropdownMenu);

		container.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		return container;
	}

	private updateLanguageDisplay(button: HTMLElement, lang: string, flags: any, names: any): void {
		button.innerHTML = `
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

	private selectLanguage(lang: string, currentBtn: HTMLElement, dropdownMenu: HTMLElement, flags: any, names: any, langs: string[]): void {
		const clickedOption = event?.currentTarget as HTMLElement;
		if (clickedOption) {
			clickedOption.style.transform = 'scale(0.98)';
			setTimeout(() => {
				clickedOption.style.transform = '';
			}, 100);
		}

		this.selectedLanguage = lang;
		
		exmp.setLanguage(lang);
		localStorage.setItem('language', lang);
		
		document.dispatchEvent(new CustomEvent('languageChanged', { 
			detail: { language: lang } 
		}));
		
		this.updateLanguageDisplay(currentBtn, lang, flags, names);
		
		dropdownMenu.querySelectorAll('button').forEach((btn, i) => {
			const isSelected = langs[i] === lang;
			btn.className = btn.className.replace(/bg-gray-50\/80/g, '');
			if (isSelected) {
				btn.className += ' bg-gray-50/80';
			}
			
			const indicator = btn.querySelector('.w-8.h-8');
			if (indicator && !isSelected) {
				indicator.remove();
			} else if (!indicator && isSelected) {
				const indicatorHTML = `
					<div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 
						     flex items-center justify-center shadow-lg">
						<svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
						</svg>
					</div>
				`;
				btn.insertAdjacentHTML('beforeend', indicatorHTML);
			}
		});
		
		this.closeDropdown(dropdownMenu, currentBtn);
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

	private closeDropdown(dropdownMenu: HTMLElement, currentBtn: HTMLElement): void {
		const arrow = currentBtn.querySelector('svg');
		dropdownMenu.style.opacity = '0';
		dropdownMenu.style.transform = 'translateY(8px) scale(0.95)';
		setTimeout(() => {
			dropdownMenu.classList.add('hidden');
		}, 300);
		if (arrow) arrow.style.transform = 'rotate(0deg)';
	}

	private createFooter(): HTMLElement {
		const footer = document.createElement('div');
		footer.className = `
			p-10 bg-gradient-to-br from-white/90 via-slate-50/80 to-white/90 
			border-t-2 border-white/60 flex-shrink-0 backdrop-blur-md relative overflow-hidden
		`.replace(/\s+/g, ' ').trim();

		const bgEffects = document.createElement('div');
		bgEffects.className = 'absolute inset-0 pointer-events-none';
		bgEffects.innerHTML = `
			<div class="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3"></div>
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
		`;

		const saveBtn = document.createElement('button');
		saveBtn.type = 'submit';
		saveBtn.className = `
			w-full relative group overflow-hidden 
			bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
			hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 
			text-white font-bold py-6 px-10 rounded-3xl border-2 border-slate-600
			shadow-[0_20px_40px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-8px_rgba(0,0,0,0.4)]
			transform hover:-translate-y-2 hover:scale-[1.02] active:scale-[0.98]
			transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-10
			before:absolute before:inset-0 before:bg-gradient-to-r before:from-blue-600/20 before:via-purple-600/20 before:to-pink-600/20 
			before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
			after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/10 after:to-transparent 
			after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-500
		`.replace(/\s+/g, ' ').trim();
		
		saveBtn.innerHTML = `
			<div class="relative flex items-center justify-center gap-4 z-10">
				<span class="text-xl font-bold tracking-wide">${exmp.getLang("settings.save-button")}</span>
				<svg class="w-7 h-7 group-hover:translate-x-3 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" 
					 fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
				</svg>
			</div>
		`;

		saveBtn.addEventListener('mousedown', (e) => {
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
			
			setTimeout(() => {
				ripple.remove();
			}, 600);
		});

		saveBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			this.saveSettings(saveBtn);
		});

		footer.appendChild(bgEffects);
		footer.appendChild(saveBtn);
		return footer;
	}

	private initializeEventListeners(): void {
		console.log('Initializing settings event listeners');
		
		const settingsMain = document.getElementById('settings_main');
		if (!settingsMain) {
			console.error('settings_main not found in initializeEventListeners');
			return;
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

		this.closeHandler = (e: Event) => {
			const target = e.target as Element;
			
			if (settingsMain.contains(target)) {
				const dropdowns = settingsMain.querySelectorAll('.dropdown-container');
				dropdowns.forEach(dropdown => {
					if (!dropdown.contains(target)) {
						const menu = dropdown.querySelector('.dropdown-menu');
						const btn = dropdown.querySelector('button');
						if (menu && !menu.classList.contains('hidden')) {
							this.closeDropdown(menu as HTMLElement, btn as HTMLElement);
						}
					}
				});
				return;
			}
			
			const dropdowns = settingsMain.querySelectorAll('.dropdown-container');
			dropdowns.forEach(dropdown => {
				const menu = dropdown.querySelector('.dropdown-menu');
				const btn = dropdown.querySelector('button');
				if (menu && !menu.classList.contains('hidden')) {
					this.closeDropdown(menu as HTMLElement, btn as HTMLElement);
				}
			});
		};

		document.addEventListener('click', this.closeHandler);
	}

	async saveSettings(saveBtn: HTMLElement): Promise<void> {
		const originalHTML = saveBtn.innerHTML;
		saveBtn.setAttribute('disabled', 'true');
		saveBtn.innerHTML = `
			<div class="flex items-center justify-center gap-3">
				<svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<span class="text-lg font-semibold">${exmp.getLang("settings.saving") || "Kaydediliyor..."}</span>
			</div>
		`;
		
		try {
			this.close();
			
			if (this.selectedLanguage !== exmp.getLanguage()) {
				await new Promise(resolve => setTimeout(resolve, 300));
				await exmp.setLanguage(this.selectedLanguage);
				
				document.dispatchEvent(new CustomEvent('languageChanged', { 
					detail: { language: this.selectedLanguage } 
				}));
			}
			
			const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
			currentSettings.ball_color = this.selectedColor;
			localStorage.setItem('settings', JSON.stringify(currentSettings));

			const settingsData: IApiSetSettings = {
				ball_color: this.selectedColor,
				language: this.selectedLanguage
			};
			await _apiManager.set_settings(settingsData);
			
			console.log('Settings saved successfully');
		} catch (error) {
			console.error('Error saving settings:', error);
			saveBtn.removeAttribute('disabled');
			saveBtn.innerHTML = originalHTML;
		}
	}

	close(): void {
		if (!this.isOpen) return;
		
		console.log('Closing settings with enhanced animation');
		const settingsMain = document.getElementById('settings_main');
		if (settingsMain) {
			const sidebar = settingsMain.querySelector('div:last-child') as HTMLElement;
			
			settingsMain.style.opacity = '0';
			settingsMain.style.backdropFilter = 'blur(0px)';
			
			if (sidebar) {
				sidebar.style.transform = 'translateX(-100%) scale(0.95)';
				sidebar.style.opacity = '0.8';
			}
			
			setTimeout(() => {
				settingsMain.remove();
				this.isOpen = false;
				
				if (this.closeHandler) {
					document.removeEventListener('click', this.closeHandler);
					this.closeHandler = null;
				}
			}, 400);
		}
	}

	destroy(): void {
		exmp.removeLanguageChangeListener(this.languageChangeHandler);
		this.close();
	}
}
