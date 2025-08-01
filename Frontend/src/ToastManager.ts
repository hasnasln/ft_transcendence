import { exmp } from "./languageManager";

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

export class ToastManager {
	private static container: HTMLElement | null = null;

	private static CreateContainer() {
		if(!this.container)
		{
			this.container = document.createElement('div');
			this.container.id = 'toast-container';
			this.container.className = `fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none`;
			document.body.appendChild(this.container);
		}
	}

	static ShowToast(type:string, langm_key:string, position: string = "right", duration: number = 3000) {
		this.CreateContainer();
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
		
		const toast = `
			<div class="relative overflow-hidden pointer-events-auto transform translate-x-full
			bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50
			px-6 py-4 min-w-[320px] max-w-[400px]
			transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
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
						<p
						data-langm-key="${langm_key}"
						class="text-gray-800 font-semibold text-sm leading-relaxed">!_!</p>
					</div>
					<!-- Close button -->
				</div>
				<!-- Progress bar -->
				<div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r ${accentColor} transform scale-x-0 origin-left transition-transform duration-${duration} ease-linear"></div>
			</div>
		`;
		this.onloadToast(toast, duration);
	}

	private static onloadToast(toast: string, duration: number): void {
		const toastElemet = this.stringToHtml(toast);
		this.container?.appendChild(toastElemet);

		exmp.applyLanguage();

		requestAnimationFrame(() => {
			toastElemet.style.transform = 'translateX(0)';
			
			const progressBar = toastElemet.querySelector('.absolute.bottom-0') as HTMLElement;
			if (progressBar) {
				setTimeout(() => {
					progressBar.style.transform = 'scaleX(1)';
				}, 100);
			}
		});

		if (this.container) {

			setTimeout(() => {
				this.hideToast(toastElemet);
			}, duration); // Duration for auto-hide
		}
	}

	private static hideToast(toastElemet: HTMLElement) {
		toastElemet.style.transform = 'translateX(full)';
		toastElemet.style.opacity = '0';

		setTimeout(() => {
			if (this.container!) {
				this.container!.removeChild(toastElemet);
			}

			if (this.container!.children.length === 0) {
				this.container!.remove();
				this.container = null;
			}
		}, 300); // Match the transition duration
	}

	private static stringToHtml(str: string): HTMLElement {
		const template = document.createElement('template');
		template.innerHTML = str.trim();
		return template.content.firstChild as HTMLElement;
	}
}