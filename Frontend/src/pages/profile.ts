import { Page } from "../router";
import { exmp } from '../lang/languageManager';	
import { _apiManager } from "../api/APIManager";
import { ToastManager } from "../ToastManager";

interface ISection {
	name: string;
	type: string;
	placeholder: string;
	action: string;
}

export class Profile implements Page {
	private AVAILABLE_AVATARS = [
		'bear.png', 'cat.png', 'chick.png', 'duck.png', 'koala.png',
		'lion.png', 'meerkat.png', 'panda.png', 'penguin.png', 'rabbit.png'
	];
	private TIMING = {
		INIT_DELAY: 100,
		INIT_RETRY_DELAY: 200,
		CLOSE_ANIMATION: 400,
		PROFILE_REFRESH_DELAY: 500,
		TOAST_DURATION: 4000,
		MODAL_ANIMATION: 300,
		NOTIFICATION_DISPLAY: 3000
	};
	private VALIDATION = {
		MIN_PASSWORD_LENGTH: 3,
		MAX_TRAVERSAL_ATTEMPTS: 10
	};
	private username: string;
	private email: string;

	constructor(){
		this.username = localStorage.getItem('username') || '';
		this.email = localStorage.getItem('email') || '';
	}

	evaluate(): string {
		return `
		<div id="profile_main"
		class="fixed inset-0 z-50 flex justify-end
		bg-gradient-to-br from-slate-900/40 via-purple-900/25 to-indigo-900/30 
		backdrop-blur-md backdrop-saturate-120 backdrop-hue-rotate-15
		opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
			<div class="absolute inset-0 overflow-hidden pointer-events-none">
				<div class="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/8 to-cyan-500/8 rounded-full blur-3xl animate-pulse opacity-60"></div>
				<div class="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000 opacity-50"></div>
				<div class="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/8 to-teal-500/8 rounded-full blur-3xl animate-pulse delay-500 opacity-40"></div>
			</div>
			<div id="profile_sidebar"
			class="
			w-full max-w-lg min-w-[320px] h-full 
			bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-100/95
			backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110
			shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.3)]
			border border-white/40 border-l-white/60
			flex flex-col relative overflow-hidden
			transform translate-x-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
				<div class="absolute inset-0 pointer-events-none">
					<div class="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent via-50% to-purple-500/8"></div>
					<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
					<div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
					<div class="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
					<div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
				</div>
				${this.createProfileHeader()}
				${this.createProfileContent()}
			</div>
		</div>
		`;
	}

	onLoad(): void {
		const settingsContainer = document.getElementById('content-container') as HTMLElement;
		if (!settingsContainer) {
			console.error('Content container not found in show');
			return;
		}
		settingsContainer.innerHTML += this.evaluate();

		const overlay = document.getElementById('profile_main') as HTMLElement;
		const sidebar = document.getElementById('profile_sidebar') as HTMLElement;
		requestAnimationFrame(() => {
			overlay.style.opacity = '1';
			setTimeout(() => {
				sidebar.style.transform = 'translateX(0)';
			}, 100);
		});
		exmp.applyLanguage();

		// render profile eventlestenırlar
		sidebar.addEventListener('click', (e) => {
			e.stopPropagation();
		});

		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) {
				this.close();
			}
		});

		//create Porfile Header event listeners

		const closeButton = document.querySelector('[data-action="close"]') as HTMLButtonElement;
		closeButton.addEventListener('click', (e) => { this.close(); });

		// create profile info section event listeners
		const profileImageWraper = document.getElementById('profile-image-container') as HTMLDivElement;
		profileImageWraper.addEventListener('click', () => {
			//! buradaki bind a bakılacak
			console.log('Avatar selector opened');
			this.showAvatarSelector();
		});

		const second_part = document.getElementById('second_part') as HTMLDivElement;
		second_part.addEventListener('click', (e) => {
			const target = (e.target as HTMLElement).closest('button[data-action]');
			if (!target) return;
			const action = target.getAttribute('data-action');
			if (!action) return;
			this.handleAction(action);
		});

		// show avatar selector event listener
		this.isInitializeEvetListener();
	}

	private handleAction(action: string): void {
		switch (action) {
			case 'nick-name':
			case 'email':
				this.handleX(action);
				break;
			case 'password':
				this.hendle_password(action);
				break;
			case 'close':
				this.close();
				break;
			default:
				console.warn(`Unknown action: ${action}`);
		}
	}

	private async hendle_password(action: string): Promise<void> {
		const old_pass = document.querySelector('#' + action + '_eski') as HTMLInputElement;
		const new_pass = document.querySelector('#' + action) as HTMLInputElement;
		
		if (!old_pass) {
			ToastManager.ShowToast('error', 'toast.error.old-password-field-missing');
			return;
		}
		if (!new_pass) {
			ToastManager.ShowToast('error', 'toast.error.new-password-field-missin');
			return;
		}
		const oldPassword = old_pass.value.trim();
		const newPassword = new_pass.value.trim();
		if (!oldPassword) {
			ToastManager.ShowToast('error', 'toast.error.old-password-required');
			return;
		}
		if (!newPassword) {
			ToastManager.ShowToast('error', 'toast.error.new-password-required');
			return;
		}
		if (newPassword.length < this.VALIDATION.MIN_PASSWORD_LENGTH) {
			ToastManager.ShowToast('error', 'toast.error.password-min-length');
			return;
		}
		try {
			const response = await _apiManager.updateSomething('password',oldPassword, newPassword);
			
			if (response && response.success !== false) {
				ToastManager.ShowToast('success', 'toast.success.password-updated');
			} else {
				ToastManager.ShowToast('error', 'toast.error.password-update-failed');
			}
		} catch (error) {
			console.error('Error updating password:', error);
			ToastManager.ShowToast('error', 'toast.error.password-update-error');
		}
	}


	async handleX(x: string): Promise<void> {
		const input = document.querySelector('#' + x) as HTMLInputElement;
		if (!input) {
			console.error('Input not found for:', x);
			return;
		}
		
		const value = input.value.trim();
		if (value.length < 1) {
			console.warn('Input value is empty:', x);
		}
		
		try {
			if (x === 'nick-name') {
				this.username = value;
				const response = await _apiManager.updateSomething('username', value);
				
				if (response && response.success !== false) {
					localStorage.setItem('username', value);
					document.getElementById('profile-info-username')!.textContent = value;
					ToastManager.ShowToast('success', exmp.getLang("toast.success.username-updated"));
				} else {
					ToastManager.ShowToast('error', exmp.getLang("toast.error.username-update-failed"));
				}
			} else if (x === 'email') {
				this.email = value;
				const response = await _apiManager.updateSomething('email', value);
				
				if (response && response.success !== false) {
					localStorage.setItem('email', value);
					document.getElementById('profile-info-email')!.textContent = value;
					input.value = '';
					ToastManager.ShowToast('success', exmp.getLang("toast.success.email-updated"));
				} else {
					ToastManager.ShowToast('error', exmp.getLang("toast.error.email-update-failed"));
				}
			} else {
				console.error('Unknown action:', x);
			}
		} catch (error) {
			console.error('Error in handleX:', error);
			ToastManager.ShowToast('error', exmp.getLang("toast.error.update-error"));
		}
		input.value = '';
	}

	private closeModal(): void {
		const modal = document.getElementById('avatar-modal') as HTMLDivElement;
		modal.style.opacity = '0';

		setTimeout(() => {
			modal.remove();
		}, this.TIMING.MODAL_ANIMATION);
	}

	private stringToElement(htmlString: string): HTMLElement {
		const template = document.createElement('template');
		template.innerHTML = htmlString.trim();
		return template.content.firstChild as HTMLElement;
	}

	private onloadAvatarModal(modal: string): void {

		//! aşağıdaki kullanımda öncedek eklenmiş tüm evetler kayboluyor body yeniden yazılıyor
		//! document.body.innerHTML += modal;

		document.body.appendChild(this.stringToElement(modal));
		exmp.applyLanguage();
		const avatar_modal = document.getElementById('avatar-modal') as HTMLDivElement;
		requestAnimationFrame(() => {
			avatar_modal.style.opacity = '1';
		});
		avatar_modal.addEventListener('click', (e) => {
			if (e.target === avatar_modal) {
				this.closeModal();
			}
		});
		const avatarGridClose = document.getElementById('avatar-modal-cancel') as HTMLButtonElement;
		avatarGridClose.addEventListener('click', () => {
			this.closeModal();
		});

		const avatarGridv2 = document.getElementById('avatar-girid-v2') as HTMLDivElement;
		avatarGridv2.addEventListener('click', (e) => {
			const target = (e.target as HTMLElement).closest('button[data-avatar]');
			if (!target) return;

			const avatar = target.getAttribute('data-avatar');
			if (avatar) {
				this.selectAvatar(avatar); // <<== CALLBACK ÇAĞRILIYOR
				this.closeModal();
			}
		});
	}

	private selectAvatar(avatarName: string): void {
		const imageElement = document.getElementById('current-avatar') as HTMLImageElement;
		imageElement.src = `/ICONS/${avatarName}`;
		localStorage.setItem('selectedAvatar', avatarName);
		
		this.closeModal();
		this.showAvatarChangeSuccess();
	}

	private showAvatarChangeSuccess(): void {
		const notification = document.createElement('div');
		notification.className = `
			fixed top-6 right-6 z-[200] 
			bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg
			transform translate-x-full transition-transform duration-300
		`;
		notification.textContent = exmp.getLang("profile-avatar-success");
		notification.id = 'avatar-success-notification';
		
		document.body.appendChild(notification);
		
		requestAnimationFrame(() => {
			notification.style.transform = 'translateX(0)';
		});
		
		setTimeout(() => {
			notification.style.transform = 'translateX(full)';
			setTimeout(() => {
				notification.remove();
			}, this.TIMING.MODAL_ANIMATION);
		}, this.TIMING.NOTIFICATION_DISPLAY);
	}

	private showAvatarSelector(): void {
		let avatarGrid = ``;
		this.AVAILABLE_AVATARS.forEach((avatar) => {
			avatarGrid += `
			<button data-avatar="${avatar}" class="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300
			hover:border-blue-500 hover:scale-110 transition-all duration-300
			focus:outline-none focus:border-blue-500 focus:scale-110">
				<img
				src="/ICONS/${avatar}" alt=${avatar} class="w-full h-full object-cover"></img>
			</button>
			`
		});
		
		
		const modal = `
		<div
		id="avatar-modal"
		class="fixed inset-0 z-[100] flex items-center justify-center
		bg-black/50 backdrop-blur-sm
		opacity-0 transition-opacity duration-300">
			<div class="bg-white/95 backdrop-blur-md rounded-3xl p-8 m-4 max-w-md w-full
			shadow-2xl transform scale-90 transition-all duration-300
			border border-white/50">
				<div class="text-center mb-6">
					<h3
					id="avatar-modal-title"
					data-langm-key="profile-avatar-select-title"
					class="text-2xl font-bold text-gray-800 mb-2"> 
					</h3>
					<p
					id="avatar-modal-subtitle"
					class="text-gray-600"
					data-langm-key="profile-avatar-select-subtitle"> 
					</p>
				</div>
				<div id="avatar-girid-v2"class="grid grid-cols-5 gap-3 mb-6">
					${avatarGrid}
				</div>
				<button
				id="avatar-modal-cancel"
				data-langm-key="profile-avatar-cancel"
				class="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl
				text-gray-700 font-semibold transition-colors duration-200"> 
				</button>
			</div>
		</div>
		`
		this.onloadAvatarModal(modal);
	}

	private close(): void {
		const profileMain = document.getElementById('profile_main');
		if (profileMain) {
			profileMain.style.opacity = '0';
			profileMain.style.backdropFilter = 'blur(0px)';
		
			setTimeout(() => {
				profileMain.remove();
			}, this.TIMING.CLOSE_ANIMATION);
		}
	}


	private isInitializeEvetListener(): void {

	}

	private createProfileHeader(): string {
		return `
		<div
		class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
		px-8 py-8 flex-shrink-0 border-b border-slate-700/50">
			<div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10">
			</div>
			<button
			data-action="close"
			class="absolute top-6 right-6 z-20 w-10 h-10 rounded-xl
			bg-white/10 backdrop-blur-md border border-white/20
			flex items-center justify-center text-white/80
			hover:text-white hover:bg-white/20 hover:scale-110
			transition-all duration-300 ease-out group"
			>
				<svg
				class="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" 
				fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
			<h1
			id="profile-main-title"
			data-langm-key="profile.title"
			class="text-3xl font-bold text-white relative z-10
			tracking-tight leading-tight drop-shadow-lg"> 
			</h1>
		</div>
		`;
	}

	private createProfileContent(): string {
		const style = document.createElement('style');
		style.textContent = `
			.custom-scrollbar-profile::-webkit-scrollbar {
				width: 8px;
			}
			.custom-scrollbar-profile::-webkit-scrollbar-track {
				background: rgba(148, 163, 184, 0.1);
				border-radius: 4px;
			}
			.custom-scrollbar-profile::-webkit-scrollbar-thumb {
				background: linear-gradient(to bottom, #64748b, #475569);
				border-radius: 4px;
				border: 1px solid rgba(255, 255, 255, 0.1);
			}
			.custom-scrollbar-profile::-webkit-scrollbar-thumb:hover {
				background: linear-gradient(to bottom, #475569, #334155);
			}
		`;
		document.head.appendChild(style);
		
		
		return `
		<div class="flex-1 overflow-y-auto overflow-x-visible custom-scrollbar-profile">
			${this.createProfileInfoSection()}
			${this.createProfileSettingsSection()}
		</div>
		`
	}


	private createProfileInfoSection(): string {
		let currentAvatar = localStorage.getItem('selectedAvatar');
		if (!currentAvatar) currentAvatar = this.getUserBasedAvatar(this.username);
		return `
		<div
		class="group relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
		backdrop-blur-3xl  p-12 border-2 border-white/50
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
			</div>
			<div class="flex flex-col items-center mb-8 relative z-10">
				<!-- image container -->
				<div
				id="profile-image-container"
				class="relative w-32 h-32 rounded-full overflow-hidden cursor-pointer
				bg-gradient-to-br from-blue-500 to-purple-600
				flex items-center justify-center shadow-2xl group-hover:shadow-3xl
				transform group-hover:scale-110 transition-all duration-700
				border-4 border-white/80 group-hover:border-white
				hover:scale-125 hover:rotate-6">
					<!-- profileImageWrapper -->
					<img
					id="current-avatar"
					src="/ICONS/${currentAvatar}"
					alt="Profile Avatar"
					class="w-full h-full object-cover rounded-full">
				</div>
				<div>
					<!-- avatarHint -->
					<p 
					id="avatar-hint"
					data-langm-key="profile-avatar-change-hint"
					class="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100
					transition-opacity duration-500 font-medium"
				</div>
			</div>
			<div class="text-center relative z-10" >
				<!-- username container -->
				<h2 id="profile-info-username"class="text-3xl font-black text-transparent bg-clip-text 
				bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
				tracking-tight leading-tight group-hover:from-gray-900 
				group-hover:via-blue-900 group-hover:to-gray-900
				transition-all duration-700 mb-2">
					${this.username}
				</h2>
				<p id="profile-info-email" class="text-gray-600 text-lg font-semibold
				group-hover:text-gray-700 transition-colors duration-500
				opacity-80 group-hover:opacity-100">
					<!-- email container -->
					${this.email}
				</p>
			</div>
		</div>
		`;
	}

	private createProfileSettingsSection(): string {
		return `
		<div>
			<div class="flex items-center gap-8 mb-12 relative z-10">
				<div class="relative w-20 h-20 rounded-3xl overflow-hidden
				bg-gradient-to-br from-green-500 via-emerald-600 to-blue-600
				flex items-center justify-center shadow-2xl group-hover:shadow-3xl
				transform group-hover:scale-110 group-hover:rotate-6
				transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
					<svg class="w-10 h-10 text-white relative z-10 drop-shadow-lg" 
					fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
					</svg>
				</div>
				<div class="flex-1">
					<h3
					id="profile-settings-title"
					data-langm-key="profile-info-settings-title"
					class="text-4xl font-black text-transparent bg-clip-text 
					bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
					tracking-tight leading-tight group-hover:from-gray-900 
					group-hover:via-green-900 group-hover:to-gray-900
					transition-all duration-700 mb-3"
					>
					</h3>
				</div>
			</div>
			<div id="second_part" class="relative z-10 w-full">
				${this.createProfileSettings()}
			</div>
		</div>
		`;
	}

	private createProfileSettings(): string {

		let innerDivs =``
		this.getProfileSettings().forEach(({name, type, placeholder, action}) => {
			innerDivs += `
			<div class="
			w-full
			p-1">
				<div class="absolute inset-0 pointer-events-none">
					<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent  to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
					<div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
				</div>
				<label class="block text-lg font-bold text-gray-800 mb-4 relative z-10
				group-hover:text-gray-900 transition-colors duration-300">${name}
				</label>
				${(():string  => {
					if (type === 'password') {
						return`
						<input
						id="${action}_eski"
						type="${type}"
						data-langm-key="profile-settings.old-password-placeholder"
						data-langm-path="placeholder"
						class="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300/80 
						rounded-3xl p-4 mb-4 text-base font-medium relative z-10
						focus:outline-none focus:border-blue-500 focus:bg-white
						hover:border-gray-400 hover:bg-white transition-all duration-300"
						></input>
						`;
					}
					return ``;
				})()}
				<input
				id="${action}"
				type=${type}
				placeholder=${placeholder}
				class="w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300/80 
				rounded-3xl p-4 mb-6 text-base font-medium relative z-10
				focus:outline-none focus:border-blue-500 focus:bg-white
				hover:border-gray-400 hover:bg-white transition-all duration-300"
				></input>
				<button
				data-action=${action}
				class="w-full relative group/btn overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
				hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-8 
				rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]
				transition-all duration-300 ease-out border border-slate-700 relative z-10">
					<div class="relative flex items-center justify-center gap-3 z-10">
						<span class="text-base font-semibold">${name} ${exmp.getLang("profile-settings.update")}</span>
						<svg class="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" 
							fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
						</svg>
					</div>
					<div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 
							opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
					</div>
				</button>
			</div>
			`
		});
		return `
		<div id="profile-settings-container" class="space-y-6 relative z-10">
			${innerDivs}
		</div>
		`
	}

	private getUserBasedAvatar(username: string): string {
		let hash = 0;
		for (let i = 0; i < username.length; i++) {
			const char = username.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash;
		}
		const index = Math.abs(hash) % this.AVAILABLE_AVATARS.length;
		return this.AVAILABLE_AVATARS[index];
	}

	getProfileSettings(): ISection[] {
		return [
			{name: exmp.getLang("profile-settings.username"), type: 'text', placeholder: exmp.getLang("profile-settings.username-placeholder"), action: 'nick-name'},
			{name: exmp.getLang("profile-settings.password"), type: 'password', placeholder: exmp.getLang("profile-settings.password-placeholder"), action: 'password'},
			{name: exmp.getLang("profile-settings.email"), type: 'email', placeholder: exmp.getLang("profile-settings.email-placeholder"), action: 'email'},
		]
	}
}
