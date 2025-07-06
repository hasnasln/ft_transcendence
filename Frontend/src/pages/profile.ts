import { _apiManager } from '../api/APIManeger';
import { exmp } from '../languageMeneger';

const AVAILABLE_AVATARS = [
	'bear.png', 'cat.png', 'chick.png', 'duck.png', 'koala.png',
	'lion.png', 'meerkat.png', 'panda.png', 'penguin.png', 'rabbit.png'
];

const TIMING = {
	INIT_DELAY: 100,
	INIT_RETRY_DELAY: 200,
	CLOSE_ANIMATION: 400,
	PROFILE_REFRESH_DELAY: 500,
	TOAST_DURATION: 4000,
	MODAL_ANIMATION: 300,
	NOTIFICATION_DISPLAY: 3000
};

const VALIDATION = {
	MIN_PASSWORD_LENGTH: 3,
	MAX_TRAVERSAL_ATTEMPTS: 10
};

interface ISection {
	name: string;
	type: string;
	placeholder: string;
	action: string;
}

export class ProfileSettings {
	private username: string;
	private email: string;
	private password: string;
	private isInitialized: boolean = false;
	private static globalEventListenerAdded: boolean = false;

	constructor() {
		this.username = localStorage.getItem('username') || '';
		this.email = localStorage.getItem('email') || '';
		this.password = localStorage.getItem('password') || '';
	}


	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		
		(window as any).currentProfileInstance = this;
		renderProfile(container);
		
		if (!this.isInitialized) {
			setTimeout(() => this.init(), TIMING.INIT_DELAY);
		}
	}

	init(): void {
		if (this.isInitialized) return;
		
		const profileSettingsContainer = document.getElementById('profile_main');
		if (!profileSettingsContainer) {
			setTimeout(() => {
				if (!this.isInitialized) this.init();
			}, TIMING.INIT_RETRY_DELAY);
			return;
		}

		this.setupEventListener(profileSettingsContainer);
		this.isInitialized = true;
	}
	
	private setupEventListener(container: HTMLElement): void {
		if (ProfileSettings.globalEventListenerAdded) return;
		
		document.addEventListener('languageChanged', () => this.updateLanguage());

		const clickHandler = (event: Event) => {
			const action = this.findActionFromEvent(event);
			if (action) {
				event.preventDefault();
				event.stopPropagation();
				this.handleAction(action);
			}
		};
		
		container.addEventListener('click', clickHandler.bind(this));
		
		const bodyClickHandler = (event: Event) => {
			const target = event.target as HTMLElement;
			if (!target.closest('#profile_main')) return;
			
			const action = this.findActionFromEvent(event);
			if (action) {
				event.preventDefault();
				event.stopPropagation();
				this.handleAction(action);
			}
		};
		
		document.body.addEventListener('click', bodyClickHandler.bind(this));
		ProfileSettings.globalEventListenerAdded = true;
	}

	private findActionFromEvent(event: Event): string | null {
		const target = event.target as HTMLElement;
		let actionElement = target;
		let action = actionElement.getAttribute('data-action');
		
		let attempts = 0;
		while (!action && actionElement.parentElement && attempts < VALIDATION.MAX_TRAVERSAL_ATTEMPTS) {
			actionElement = actionElement.parentElement;
			action = actionElement.getAttribute('data-action');
			attempts++;
		}
		
		return action;
	}
	
	private handleAction(action: string): void {
		switch (action) {
			case 'nick-name':
				this.handleX(action);
				break;
			case 'email':
				this.handleX(action);
				break;
			case 'name':
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
		const eski_sifre = document.querySelector('#' + action + '_eski') as HTMLInputElement;
		const new_pass = document.querySelector('#' + action) as HTMLInputElement;
		
		if (!eski_sifre) {
			ToastNotification.show(exmp.getLang("toast.error.old-password-field-missing"), 'error');
			return;
		}
		
		if (!new_pass) {
			ToastNotification.show(exmp.getLang("toast.error.new-password-field-missing"), 'error');
			return;
		}
		
		const oldPassword = eski_sifre.value.trim();
		const newPassword = new_pass.value.trim();
		
		if (!oldPassword) {
			ToastNotification.show(exmp.getLang("toast.error.old-password-required"), 'error');
			return;
		}
		
		if (!newPassword) {
			ToastNotification.show(exmp.getLang("toast.error.new-password-required"), 'error');
			return;
		}
		
		if (newPassword.length < VALIDATION.MIN_PASSWORD_LENGTH) {
			ToastNotification.show(exmp.getLang("toast.error.password-min-length"), 'error');
			return;
		}
		
		const storedPassword = localStorage.getItem('password');
		
		if (storedPassword === oldPassword) {
			try {
				const response = await _apiManager.updateSomething('password', newPassword);
				
				if (response && response.success !== false) {
					localStorage.setItem('password', newPassword);
					this.password = newPassword;
					eski_sifre.value = '';
					new_pass.value = '';
					ToastNotification.show(exmp.getLang("toast.success.password-updated"), 'success');
				} else {
					ToastNotification.show(exmp.getLang("toast.error.password-update-failed"), 'error');
				}
			} catch (error) {
				console.error('Error updating password:', error);
				ToastNotification.show(exmp.getLang("toast.error.password-update-error"), 'error');
			}
		} else {
			ToastNotification.show(exmp.getLang("toast.error.old-password-incorrect"), 'error');
		}
	}

	close(): void {
		const profileMain = document.getElementById('profile_main');
		if (profileMain) {
			const sidebar = profileMain.querySelector('div:last-child') as HTMLElement;
			
			profileMain.style.opacity = '0';
			profileMain.style.backdropFilter = 'blur(0px)';
			
			if (sidebar) {
				sidebar.style.transform = 'translateX(100%)';
				sidebar.style.opacity = '0.8';
			}
			
			setTimeout(() => {
				profileMain.remove();
			}, TIMING.CLOSE_ANIMATION);
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
			ToastNotification.show(exmp.getLang("toast.error.field-required"), 'error');
			return;
		}
		
		try {
			if (x === 'nick-name') {
				this.username = value;
				const response = await _apiManager.updateSomething('username', value);
				
				if (response && response.success !== false) {
					localStorage.setItem('username', value);
					this.updateUsernameInUI(value);
					input.value = '';
					setTimeout(() => this.refreshProfileInfo(), TIMING.PROFILE_REFRESH_DELAY);
					ToastNotification.show(exmp.getLang("toast.success.username-updated"), 'success');
				} else {
					ToastNotification.show(exmp.getLang("toast.error.username-update-failed"), 'error');
				}
				
			} else if (x === 'email') {
				this.email = value;
				const response = await _apiManager.updateSomething('email', value);
				
				if (response && response.success !== false) {
					localStorage.setItem('email', value);
					this.updateEmailInUI(value);
					input.value = '';
					setTimeout(() => this.refreshProfileInfo(), TIMING.PROFILE_REFRESH_DELAY);
					ToastNotification.show(exmp.getLang("toast.success.email-updated"), 'success');
				} else {
					ToastNotification.show(exmp.getLang("toast.error.email-update-failed"), 'error');
				}
				
			} else {
				console.error('Unknown action:', x);
			}
		} catch (error) {
			console.error('Error in handleX:', error);
			ToastNotification.show(exmp.getLang("toast.error.update-error"), 'error');
		}
	}

	getProfileSettings(): ISection[] {
		return [
			{name: exmp.getLang("profile-settings.username"), type: 'text', placeholder: exmp.getLang("profile-settings.username-placeholder"), action: 'nick-name'},
			{name: exmp.getLang("profile-settings.password"), type: 'password', placeholder: exmp.getLang("profile-settings.password-placeholder"), action: 'password'},
			{name: exmp.getLang("profile-settings.email"), type: 'email', placeholder: exmp.getLang("profile-settings.email-placeholder"), action: 'email'},
		]
	}

	updateLanguage(): void {
		const mainTitle = document.getElementById('profile-main-title');
		if (mainTitle) {
			mainTitle.textContent = exmp.getLang("profile.title");
		}

		const avatarHint = document.getElementById('avatar-hint');
		if (avatarHint) {
			avatarHint.textContent = exmp.getLang("profile-avatar-change-hint");
		}

		const settingsTitle = document.getElementById('profile-settings-title');
		if (settingsTitle) {
			settingsTitle.textContent = exmp.getLang("profile-info-settings-title");
		}

		const settingsSubtitle = document.getElementById('profile-settings-subtitle');
		if (settingsSubtitle) {
			settingsSubtitle.textContent = exmp.getLang("profile-info-settings-subtitle");
		}

		const modalTitle = document.getElementById('avatar-modal-title');
		if (modalTitle) {
			modalTitle.textContent = exmp.getLang("profile-avatar-select-title");
		}

		const modalSubtitle = document.getElementById('avatar-modal-subtitle');
		if (modalSubtitle) {
			modalSubtitle.textContent = exmp.getLang("profile-avatar-select-subtitle");
		}

		const modalCancel = document.getElementById('avatar-modal-cancel');
		if (modalCancel) {
			modalCancel.textContent = exmp.getLang("profile-avatar-cancel");
		}

		this.updateProfileSettingsLanguage();
	}

	private updateProfileSettingsLanguage(): void {
		const profileSettings = this.getProfileSettings();
		const container = document.getElementById('profile-settings-container');
		if (container) {
			container.innerHTML = '';
			createProfileSettings(container, profileSettings);
		}
	}

	private updateUsernameInUI(newUsername: string): void {
		const profileMain = document.getElementById('profile_main');
		if (profileMain) {
			const usernameElement = profileMain.querySelector('h2[class*="text-3xl"][class*="font-black"]');
			if (usernameElement) {
				usernameElement.textContent = newUsername;
			} else {
				const allH2 = profileMain.querySelectorAll('h2');
				allH2.forEach(h2 => {
					const text = h2.textContent;
					if (text && (text.includes('Kullanıcı') || text === this.username || text.length > 2)) {
						h2.textContent = newUsername;
					}
				});
			}
		}
		this.username = newUsername;
	}

	private updateEmailInUI(newEmail: string): void {
		const profileMain = document.getElementById('profile_main');
		if (profileMain) {
			const emailElement = profileMain.querySelector('p[class*="text-gray-600"][class*="text-lg"]');
			if (emailElement) {
				emailElement.textContent = newEmail;
			} else {
				const allP = profileMain.querySelectorAll('p');
				allP.forEach(p => {
					const text = p.textContent;
					if (text && (text.includes('@') || text === this.email)) {
						p.textContent = newEmail;
					}
				});
			}
		}
		this.email = newEmail;
	}

	private refreshProfileInfo(): void {
		const currentUsername = localStorage.getItem('username');
		if (currentUsername) {
			this.updateUsernameInUI(currentUsername);
		}
		
		const currentEmail = localStorage.getItem('email');
		if (currentEmail) {
			this.updateEmailInUI(currentEmail);
		}
	}
}

function renderProfile(container: HTMLElement) {
	const overlay = document.createElement('div');
	overlay.id = 'profile_main';
	overlay.className = `
		fixed inset-0 z-50 flex justify-end
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
	`;

	const sidebar = document.createElement('div');
	sidebar.className = `
		w-[520px] h-full 
		bg-gradient-to-br from-white/95 via-slate-50/90 to-gray-100/95
		backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110
		shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.3)]
		border border-white/40 border-l-white/60
		flex flex-col relative overflow-hidden
		transform translate-x-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
	`.replace(/\s+/g, ' ').trim();

	const sidebarEffects = document.createElement('div');
	sidebarEffects.className = 'absolute inset-0 pointer-events-none';
	sidebarEffects.innerHTML = `
		<div class="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent via-50% to-purple-500/8"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent"></div>
		<div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
		<div class="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
		<div class="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>
	`;

	const header = createProfileHeader();
	const content = createProfileContent();

	sidebar.appendChild(sidebarEffects);
	sidebar.appendChild(header);
	sidebar.appendChild(content);
	
	sidebar.addEventListener('click', (e) => {
		e.stopPropagation();
	});
	
	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			const profileInstance = new ProfileSettings();
			profileInstance.close();
		}
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

function createProfileSettings(container: HTMLElement, settings: ISection[]) {
	const profileSettingsContainer = document.createElement('div');
	profileSettingsContainer.id = 'profile-settings-container';
	profileSettingsContainer.className = 'space-y-6 relative z-10';

	settings.forEach(({ name, type, placeholder, action}) => {
		const settingGroup = document.createElement('div');
		settingGroup.className = `
			group bg-white/90 backdrop-blur-md rounded-2xl p-6 border-2 border-gray-200/50
			shadow-lg hover:shadow-xl hover:border-gray-300/70 hover:bg-white
			transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-1
			before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent 
			before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
			relative overflow-hidden
		`.replace(/\s+/g, ' ').trim();

		const groupEffects = document.createElement('div');
		groupEffects.className = 'absolute inset-0 pointer-events-none';
		groupEffects.innerHTML = `
			<div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
			<div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
		`;

		const settingLabel = document.createElement('label');
		settingLabel.textContent = name;
		settingLabel.className = `
			block text-lg font-bold text-gray-800 mb-4 relative z-10
			group-hover:text-gray-900 transition-colors duration-300
		`.replace(/\s+/g, ' ').trim();

		if (type === 'password') {
			const oldPasswordInput = document.createElement('input');
			oldPasswordInput.type = 'password';
			oldPasswordInput.placeholder = exmp.getLang("profile-settings.old-password-placeholder");
			oldPasswordInput.id = action + '_eski';
			oldPasswordInput.className = `
				w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300/80 
				rounded-3xl p-4 mb-4 text-base font-medium relative z-10
				focus:outline-none focus:border-blue-500 focus:bg-white
				hover:border-gray-400 hover:bg-white transition-all duration-300
			`.replace(/\s+/g, ' ').trim();

			settingGroup.appendChild(groupEffects);
			settingGroup.appendChild(settingLabel);
			settingGroup.appendChild(oldPasswordInput);
		} else {
			settingGroup.appendChild(groupEffects);
			settingGroup.appendChild(settingLabel);
		}

		const settingInput = document.createElement('input');
		settingInput.type = type;
		settingInput.placeholder = placeholder;
		settingInput.id = action;
		settingInput.className = `
			w-full bg-white/90 backdrop-blur-sm border-2 border-gray-300/80 
			rounded-3xl p-4 mb-6 text-base font-medium relative z-10
			focus:outline-none focus:border-blue-500 focus:bg-white
			hover:border-gray-400 hover:bg-white transition-all duration-300
		`.replace(/\s+/g, ' ').trim();

		const saveButton = document.createElement('button');
		saveButton.textContent = name + " " + exmp.getLang("profile-settings.update");
		saveButton.setAttribute('data-action', `${action}`);
		saveButton.className = `
			w-full relative group/btn overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900
			hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-8 
			rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 hover:scale-[1.02]
			transition-all duration-300 ease-out border border-slate-700 relative z-10
		`.replace(/\s+/g, ' ').trim();
		
		saveButton.innerHTML = `
			<div class="relative flex items-center justify-center gap-3 z-10">
				<span class="text-base font-semibold">${name} ${exmp.getLang("profile-settings.update")}</span>
				<svg class="w-5 h-5 group-hover/btn:translate-x-2 transition-transform duration-300" 
					 fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
				</svg>
			</div>
			<div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 
						opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
		`;

		saveButton.addEventListener('click', (e) => {
			e.preventDefault();
			e.stopPropagation();
			const profileInstance = (window as any).currentProfileInstance || new ProfileSettings();
			
			if (action === 'password') {
				profileInstance.hendle_password(action);
			} else {
				profileInstance.handleX(action);
			}
		});

		settingGroup.appendChild(settingInput);
		settingGroup.appendChild(saveButton);
		
		profileSettingsContainer.appendChild(settingGroup);
	});

	container.appendChild(profileSettingsContainer);
	return profileSettingsContainer;
}

function createProfileHeader(): HTMLElement {
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

	closeBtn.addEventListener('click', (e) => {
		e.preventDefault();
		e.stopPropagation();
		const profileInstance = (window as any).currentProfileInstance || new ProfileSettings();
		profileInstance.close();
	});

	const title = document.createElement('h1');
	title.textContent = exmp.getLang("profile.title");
	title.className = `
		text-3xl font-bold text-white relative z-10
		tracking-tight leading-tight drop-shadow-lg
	`.replace(/\s+/g, ' ').trim();
	title.id = 'profile-main-title';

	header.appendChild(overlay);
	header.appendChild(closeBtn);
	header.appendChild(title);

	return header;
}

function createProfileContent(): HTMLElement {
	const contentWrapper = document.createElement('div');
	contentWrapper.className = 'flex-1 overflow-y-auto overflow-x-visible custom-scrollbar-profile';
	
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
	
	const content = document.createElement('div');
	content.className = `
		bg-gradient-to-b from-transparent via-slate-50/30 to-transparent 
		backdrop-blur-sm p-8 space-y-8 overflow-visible
	`.replace(/\s+/g, ' ').trim();

	const profileInfoSection = createProfileInfoSection();
	content.appendChild(profileInfoSection);

	const profileSettingsSection = createProfileSettingsSection();
	content.appendChild(profileSettingsSection);

	contentWrapper.appendChild(content);
	return contentWrapper;
}

function createProfileInfoSection(): HTMLElement {
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

	const bgEffects = document.createElement('div');
	bgEffects.className = 'absolute inset-0 pointer-events-none overflow-hidden';
	bgEffects.innerHTML = `
		<div class="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-purple-500/3 to-pink-500/3 group-hover:from-blue-500/8 group-hover:via-purple-500/8 group-hover:to-pink-500/8 transition-all duration-700"></div>
		<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
		<div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
	`;

	const imageContainer = document.createElement('div');
	imageContainer.className = 'flex flex-col items-center mb-8 relative z-10';
	
	const profileImageWrapper = document.createElement('div');
	profileImageWrapper.className = `
		relative w-32 h-32 rounded-full overflow-hidden cursor-pointer
		bg-gradient-to-br from-blue-500 to-purple-600
		flex items-center justify-center shadow-2xl group-hover:shadow-3xl
		transform group-hover:scale-110 transition-all duration-700
		border-4 border-white/80 group-hover:border-white
		hover:scale-125 hover:rotate-6
	`;
	
	let currentAvatar = localStorage.getItem('selectedAvatar');
	if (!currentAvatar) {
		const username = localStorage.getItem('username') || 'anonymous';
		currentAvatar = getUserBasedAvatar(username);
		localStorage.setItem('selectedAvatar', currentAvatar);
	}
	
	const profileImage = document.createElement('img');
	profileImage.src = `/ICONS/${currentAvatar}`;
	profileImage.alt = 'Profile Avatar';
	profileImage.className = 'w-full h-full object-cover rounded-full';
	profileImage.id = 'current-avatar';
	
	profileImageWrapper.addEventListener('click', () => {
		showAvatarSelector(profileImage);
	});
	
	profileImageWrapper.appendChild(profileImage);
	
	const avatarHint = document.createElement('p');
	avatarHint.textContent = exmp.getLang("profile-avatar-change-hint");
	avatarHint.className = `
		text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100
		transition-opacity duration-500 font-medium
	`;
	avatarHint.id = 'avatar-hint';
	
	imageContainer.appendChild(profileImageWrapper);
	imageContainer.appendChild(avatarHint);

	const usernameContainer = document.createElement('div');
	usernameContainer.className = 'text-center relative z-10';
	
	const username = document.createElement('h2');
	
	const storedUsername = localStorage.getItem('username');
	const storedUser = localStorage.getItem('user');
	const storedName = localStorage.getItem('name');
	
	let displayUsername = storedUsername;
	
	if (!displayUsername && storedUser) {
		try {
			const userObj = JSON.parse(storedUser);
			displayUsername = userObj.username || userObj.name;
		} catch (e) {
			// User object parse hatası
		}
	}
	
	if (!displayUsername) {
		displayUsername = storedName;
	}
	
	if (!displayUsername || displayUsername === 'undefined') {
		displayUsername = 'Kullanıcı Adı Bulunamadı';
	}
	
	username.textContent = displayUsername;
	username.className = `
		text-3xl font-black text-transparent bg-clip-text 
		bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
		tracking-tight leading-tight group-hover:from-gray-900 
		group-hover:via-blue-900 group-hover:to-gray-900
		transition-all duration-700 mb-2
	`.replace(/\s+/g, ' ').trim();

	const userEmail = document.createElement('p');
	
	const storedEmail = localStorage.getItem('email');
	let displayEmail = storedEmail;
	
	if (!displayEmail && storedUser) {
		try {
			const userObj = JSON.parse(storedUser);
			displayEmail = userObj.email;
		} catch (e) {
		}
	}
	
	if (!displayEmail || displayEmail === 'undefined') {
		displayEmail = 'Email bulunamadı';
	}
	
	userEmail.textContent = displayEmail;
	userEmail.className = `
		text-gray-600 text-lg font-semibold
		group-hover:text-gray-700 transition-colors duration-500
		opacity-80 group-hover:opacity-100
	`.replace(/\s+/g, ' ').trim();

	usernameContainer.appendChild(username);
	usernameContainer.appendChild(userEmail);

	section.appendChild(bgEffects);
	section.appendChild(imageContainer);
	section.appendChild(usernameContainer);

	return section;
}

function createProfileSettingsSection(): HTMLElement {
	const section = document.createElement('div');
	section.className = `
		group relative bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95
		backdrop-blur-3xl rounded-[2rem] p-12 border-2 border-white/50
		shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.4)]
		hover:shadow-[0_35px_70px_-12px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.6)]
		hover:border-white/70 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] 
		overflow-hidden hover:scale-[1.02] hover:-translate-y-2
		before:absolute before:inset-0 before:bg-gradient-to-br before:from-green-500/5 before:via-blue-500/5 before:to-purple-500/5 
		before:opacity-0 before:transition-opacity before:duration-700 hover:before:opacity-100
	`.replace(/\s+/g, ' ').trim();

	const bgEffects = document.createElement('div');
	bgEffects.className = 'absolute inset-0 pointer-events-none overflow-hidden';
	bgEffects.innerHTML = `
		<div class="absolute inset-0 bg-gradient-to-br from-green-500/3 via-blue-500/3 to-purple-500/3 group-hover:from-green-500/8 group-hover:via-blue-500/8 group-hover:to-purple-500/8 transition-all duration-700"></div>
		<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
		<div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-700"></div>
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
	`;
	
	iconContainer.innerHTML = `
		<svg class="w-10 h-10 text-white relative z-10 drop-shadow-lg" 
			 fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
				  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
		</svg>
	`;

	const labelContainer = document.createElement('div');
	labelContainer.className = 'flex-1';
	
	const label = document.createElement('h3');
	label.textContent = exmp.getLang("profile-info-settings-title");
	label.className = `
		text-4xl font-black text-transparent bg-clip-text 
		bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
		tracking-tight leading-tight group-hover:from-gray-900 
		group-hover:via-green-900 group-hover:to-gray-900
		transition-all duration-700 mb-3
	`.replace(/\s+/g, ' ').trim();
	label.id = 'profile-settings-title';
	

	labelContainer.appendChild(label);
	header.appendChild(iconContainer);
	header.appendChild(labelContainer);

	const settingsContainer = document.createElement('div');
	settingsContainer.id = 'second_part';
	settingsContainer.className = 'relative z-10';
	
	section.appendChild(bgEffects);
	section.appendChild(header);
	section.appendChild(settingsContainer);

	createProfileSettings(settingsContainer, new ProfileSettings().getProfileSettings());

	return section;
}

function getUserBasedAvatar(username: string): string {
	let hash = 0;
	for (let i = 0; i < username.length; i++) {
		const char = username.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	const index = Math.abs(hash) % AVAILABLE_AVATARS.length;
	return AVAILABLE_AVATARS[index];
}

function showAvatarSelector(currentImageElement: HTMLImageElement): void {
	const modal = document.createElement('div');
	modal.className = `
		fixed inset-0 z-[100] flex items-center justify-center
		bg-black/50 backdrop-blur-sm
		opacity-0 transition-opacity duration-300
	`;
	
	const modalContent = document.createElement('div');
	modalContent.className = `
		bg-white/95 backdrop-blur-md rounded-3xl p-8 m-4 max-w-md w-full
		shadow-2xl transform scale-90 transition-all duration-300
		border border-white/50
	`;
	
	const modalHeader = document.createElement('div');
	modalHeader.className = 'text-center mb-6';
	
	const modalTitle = document.createElement('h3');
	modalTitle.className = 'text-2xl font-bold text-gray-800 mb-2';
	modalTitle.id = 'avatar-modal-title';
	modalTitle.textContent = exmp.getLang("profile-avatar-select-title");
	
	const modalSubtitle = document.createElement('p');
	modalSubtitle.className = 'text-gray-600';
	modalSubtitle.id = 'avatar-modal-subtitle';
	modalSubtitle.textContent = exmp.getLang("profile-avatar-select-subtitle");
	
	modalHeader.appendChild(modalTitle);
	modalHeader.appendChild(modalSubtitle);
	
	const avatarGrid = document.createElement('div');
	avatarGrid.className = 'grid grid-cols-5 gap-3 mb-6';
	
	AVAILABLE_AVATARS.forEach((avatar) => {
		const avatarButton = document.createElement('button');
		avatarButton.className = `
			w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300
			hover:border-blue-500 hover:scale-110 transition-all duration-300
			focus:outline-none focus:border-blue-500 focus:scale-110
		`;
		
		const avatarImg = document.createElement('img');
		avatarImg.src = `/ICONS/${avatar}`;
		avatarImg.alt = avatar;
		avatarImg.className = 'w-full h-full object-cover';
		
		avatarButton.appendChild(avatarImg);
		avatarButton.addEventListener('click', () => {
			selectAvatar(avatar, currentImageElement, modal);
		});
		
		avatarGrid.appendChild(avatarButton);
	});
	
	const closeButton = document.createElement('button');
	closeButton.className = `
		w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-xl
		text-gray-700 font-semibold transition-colors duration-200
	`;
	closeButton.textContent = exmp.getLang("profile-avatar-cancel");
	closeButton.id = 'avatar-modal-cancel';
	closeButton.addEventListener('click', () => {
		closeModal(modal);
	});
	
	modalContent.appendChild(modalHeader);
	modalContent.appendChild(avatarGrid);
	modalContent.appendChild(closeButton);
	modal.appendChild(modalContent);
	document.body.appendChild(modal);
	
	requestAnimationFrame(() => {
		modal.style.opacity = '1';
		modalContent.style.transform = 'scale(1)';
	});
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			closeModal(modal);
		}
	});
}

function selectAvatar(avatarName: string, imageElement: HTMLImageElement, modal: HTMLElement): void {
	imageElement.src = `/ICONS/${avatarName}`;
	localStorage.setItem('selectedAvatar', avatarName);
	
	closeModal(modal);
	showAvatarChangeSuccess();
}

function closeModal(modal: HTMLElement): void {
	modal.style.opacity = '0';
	const modalContent = modal.querySelector('div') as HTMLElement;
	if (modalContent) {
		modalContent.style.transform = 'scale(0.9)';
	}
	
	setTimeout(() => {
		modal.remove();
	}, TIMING.MODAL_ANIMATION);
}

function showAvatarChangeSuccess(): void {
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
		}, TIMING.MODAL_ANIMATION);
	}, TIMING.NOTIFICATION_DISPLAY);
}

class ToastNotification {
	private static container: HTMLElement | null = null;

	private static createContainer(): HTMLElement {
		if (!this.container) {
			this.container = document.createElement('div');
			this.container.id = 'toast-container';
			this.container.className = `
				fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none
			`.replace(/\s+/g, ' ').trim();
			document.body.appendChild(this.container);
		}
		return this.container;
	}

	static show(message: string, type: 'success' | 'error' | 'info' = 'success', duration: number = TIMING.TOAST_DURATION): void {
		const container = this.createContainer();
		
		const toast = document.createElement('div');
		toast.className = `
			relative overflow-hidden pointer-events-auto transform translate-x-full
			bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50
			px-6 py-4 min-w-[320px] max-w-[400px]
			transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
		`.replace(/\s+/g, ' ').trim();

		let iconSvg = '';
		let accentColor = '';
		let bgGradient = '';
		
		switch (type) {
			case 'success':
				accentColor = 'from-emerald-500 to-green-600';
				bgGradient = 'from-emerald-50/90 to-green-50/90';
				iconSvg = `
					<svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				`;
				break;
			case 'error':
				accentColor = 'from-red-500 to-rose-600';
				bgGradient = 'from-red-50/90 to-rose-50/90';
				iconSvg = `
					<svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				`;
				break;
			case 'info':
				accentColor = 'from-blue-500 to-indigo-600';
				bgGradient = 'from-blue-50/90 to-indigo-50/90';
				iconSvg = `
					<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				`;
				break;
		}

		toast.innerHTML = `
			<!-- Accent bar -->
			<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${accentColor}"></div>
			
			<!-- Background overlay -->
			<div class="absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-60"></div>
			
			<!-- Content -->
			<div class="relative flex items-start gap-4">
				<!-- Icon -->
				<div class="flex-shrink-0 w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
					${iconSvg}
				</div>
				
				<!-- Message -->
				<div class="flex-1 pt-1">
					<p class="text-gray-800 font-semibold text-sm leading-relaxed">${message}</p>
				</div>
				
				<!-- Close button -->
				<button class="flex-shrink-0 w-8 h-8 rounded-lg bg-white/60 hover:bg-white/80 flex items-center justify-center transition-colors duration-200 text-gray-500 hover:text-gray-700">
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Progress bar -->
			<div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r ${accentColor} transform scale-x-0 origin-left transition-transform duration-${duration} ease-linear"></div>
		`;

		const closeBtn = toast.querySelector('button');
		closeBtn?.addEventListener('click', () => {
			this.remove(toast);
		});

		container.appendChild(toast);

		requestAnimationFrame(() => {
			toast.style.transform = 'translateX(0)';
			
			const progressBar = toast.querySelector('.absolute.bottom-0') as HTMLElement;
			if (progressBar) {
				setTimeout(() => {
					progressBar.style.transform = 'scaleX(1)';
				}, 100);
			}
		});

		setTimeout(() => {
			this.remove(toast);
		}, duration);
	}

	private static remove(toast: HTMLElement): void {
		toast.style.transform = 'translateX(full)';
		toast.style.opacity = '0';
		
		setTimeout(() => {
			if (toast.parentNode) {
				toast.parentNode.removeChild(toast);
			}
			
			if (this.container && this.container.children.length === 0) {
				this.container.remove();
				this.container = null;
			}
		}, TIMING.MODAL_ANIMATION);
	}
}

const toastStyles = document.createElement('style');
toastStyles.textContent = `
	@keyframes toast-slide-in {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
	
	@keyframes toast-slide-out {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(100%);
			opacity: 0;
		}
	}
	
	#toast-container::-webkit-scrollbar {
		width: 0px;
		background: transparent;
	}
		transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}
`;
document.head.appendChild(toastStyles);
