export interface Page {
	onButtonClick?(buttonId: string): void;
	evaluate(): string;
	onLoad?(): void;
	onUnload?(): void;
	onUnHide?(): void;
}

export interface RouterGuard {
	canGo(path: string): boolean;
}

export class FallBackPage implements Page {

	evaluate(): string {
		return '<h1>You are in limbo.</h1>';
	}
}

export class Router {

	private static readonly CONTENT_CONTAINER_ID: string = 'content-container';
	private currentPath: string;
	private pages = new Map<string, Page>();
	private activePages = new Map<string, Page>();
	private currentPage: Page | null = null;
	private guards = new Set<RouterGuard>();

	private lazyPages = new Map<string, {path: string, pageName: string}>();
	private static instance: Router;

	private constructor() {
		this.currentPath = window.location.pathname;
		window.addEventListener('popstate', async (event) => {
			if (this.currentPath === "/game") {
				const gamePage = this.currentPage as unknown as any;
				if (gamePage.getGameInstance().gameStatus.currentGameStarted) {
					const target = window.location.pathname;
					history.replaceState({blocked:true}, '', '/game');
					
					const { exmp } = await import('./lang/languageManager');
					const confirmMessage = exmp.getLang("confirmation-dialog.leave-page-message");
					
					askUser(confirmMessage)
						.then((result) => {
							if (result) {
								this.invalidatePage("/game");
								this.go(target, true, true);
							}
						});
					return;
				}
			}
			this.go(event.state.path ?? window.location.pathname, true, true);
		});
	}

	public static getInstance(): Router {
		if (!Router.instance) {
			Router.instance = new Router();
		}
		return Router.instance;
	}

	public getCurrentPath(): string {
		return this.currentPath;
	}

	public registerGuard(guard: RouterGuard): void {
		if (this.guards.has(guard)) {
			console.warn('Guard already registered.');
			return;
		}
		this.guards.add(guard);
	}

	public rootContainer(): HTMLElement {
		return document.getElementById(Router.CONTENT_CONTAINER_ID)!;
	}

	public lazyRegisterPage(path: string, pageMeta: {path: string, pageName: string}): void {
		if (this.lazyPages.has(path)) {
			console.warn(`Page already registered for path: ${path}`);
			return;
		}
		this.lazyPages.set(path, pageMeta);
	}

	public registerPage(path: string, page: Page): void {
		if (this.pages.has(path)) {
			console.warn(`Page already registered for path: ${path}`);
			return;
		}
		this.pages.set(path, page);
	}

	private injectButtonListener(): void {
		this.rootContainer().addEventListener('click', (e) => buttonAgent(e, this.currentPage!));
	}

	public async preloadLazyPage(path: string): Promise<void> {
		const lazyPageMeta = this.lazyPages.get(path);
		if (!lazyPageMeta) {
			console.warn(`No lazy page registered for path: ${path}`);
			return;
		}
		return await import(`./pages/${lazyPageMeta.path}.ts`).then((module) => {
			const LazyPage = module[lazyPageMeta.pageName];
			const lazyPageInstance = new LazyPage();
			this.registerPage(path, lazyPageInstance);
			return lazyPageInstance;
		}).catch((error) => {
			console.error(`Failed to load page for path: ${path}`, error);
		});
	}

	public async getPageByPath(path: string): Promise<Page> {
		const foundPage = this.pages.get(path);
		if (foundPage) {
			console.log("Found page in cache for path:", path);
			return foundPage;
		}

		if (this.lazyPages.has(path)) {
			await this.preloadLazyPage(path);
			const loadedPage = this.pages.get(path);
			if (loadedPage) return loadedPage;
		}

		if (path !== "404") return await this.getPageByPath("404");
		return new FallBackPage();
	}

	private setContent(content: string): void {
		let contentContainer = document.getElementById(Router.CONTENT_CONTAINER_ID);
		contentContainer?.remove();
		contentContainer = document.createElement('div');
		contentContainer.id = 'content-container';
		contentContainer.innerHTML = content;
		document.getElementById('app')?.appendChild(contentContainer);
	}

	private savePageInfo(path: string, page: Page, popstate: boolean): void {
		if (!popstate)
			window.history.pushState({path: path}, '', path);
		console.log(`Router saved page info for path: ${path}`);
		this.currentPath = path;
		this.currentPage = page;
	}

	private async createNewPage(path: string, popstate: boolean) {
		const oldContentContainer = document.getElementById(Router.CONTENT_CONTAINER_ID);
		if (oldContentContainer) {
			oldContentContainer.id = 'hidden-page-' + this.currentPath;
			oldContentContainer.classList.add('hidden');
		}

		return this.getPageByPath(path).then((page) => {
			const pageContent = page.evaluate();

			this.activePages.set(path, page);
			this.setContent(pageContent);
			this.savePageInfo(path, page, popstate);

			// bu sizi rahatsız ediyorsa iyi developersınız demektir.
			requestAnimationFrame(() => {
				this.injectButtonListener();
				page.onLoad?.();
			});
			console.log(`Router created new page for path: ${path}`);
		});
	}

	public loadExistingPage(newPagePath: string, popstate: boolean) {
		let contentContainer = document.getElementById(Router.CONTENT_CONTAINER_ID);
		const legacyPage = this.currentPage;
		const newPage = this.activePages.get(newPagePath);

		if (!newPage) {
			console.error(`New page not found for path: ${newPagePath}`);
			return;
		}

		if (!legacyPage) {
			console.error(`Legacy page not found for path: ${this.currentPath}`);
			return;
		}

		// page'in url'ini reverse index'le bulur.
		const legacyPagePath = this.pages.entries().find(([_, page]) => page === legacyPage)?.[0];

		if (legacyPagePath) {
			if (contentContainer) {
				contentContainer.id = 'hidden-page-' + legacyPagePath;
				contentContainer.classList.add('hidden');
			}
		} else {
			// non-indexed page, do not cache.
			this.activePages.delete(this.currentPath);
			contentContainer?.remove();
		}

		const newPageElement = document.getElementById('hidden-page-' + newPagePath);
		if (newPageElement == undefined) {
			console.error(`New page element not found for path: ${newPagePath}`);
			return;
		}

		newPageElement.id = Router.CONTENT_CONTAINER_ID;
		newPageElement.classList.remove('hidden');
		newPage.onUnHide?.();
		this.savePageInfo(newPagePath, newPage, popstate);
	}

	public invalidatePage(path: string): void {
		const page = this.activePages.get(path);
		if (!page) {
			console.warn(`No active page found for path: ${path}`);
			return;
		}

		this.activePages.delete(path);

		page.onUnload?.();

		const container = document.getElementById('hidden-page-' + path);
		container?.remove();
	}

	public invalidateAllPages(): void {
		this.activePages.clear();
	}

	public async go(path: string, force: boolean = false, popstate:boolean=false): Promise<void> {
		if (!force && this.currentPath === path && this.currentPage !== null) {
			console.warn(`Router skipped routing because already on ${path} and page is loaded.`);
			return;
		}

		const canGo = Array.from(this.guards).every(guard => guard.canGo(path));
		if (!canGo) {
			console.warn(`Router blocked routing to ${path} by guards.`);
			return;
		}

		if (!this.activePages.has(this.currentPath)) {
			this.rootContainer()?.remove();
		}

		if (this.activePages.has(path)) {
			this.loadExistingPage(path, popstate);
		} else {
			await this.createNewPage(path, popstate);
		}
	}
}

/** Routes button clicks and delegates
 * them to the page instance */
function buttonAgent(e: MouseEvent, page: Page): void {
	if (!page.onButtonClick) return;
	if (!(e.target instanceof Element)) return;

	const buttonId = e.target.closest('button')?.id;
	if (!buttonId)
		return;

	page.onButtonClick(buttonId);
}


export async function askUser(message: string, acceptText?: string, cancelText?: string): Promise<boolean> {
	const { exmp } = await import('./lang/languageManager');
	
	const defaultAcceptText = acceptText || exmp.getLang("confirmation-dialog.accept");
	const defaultCancelText = cancelText || exmp.getLang("confirmation-dialog.cancel");

	const html = `
    <div id="confirmation-dialog" class="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm" style="z-index:10000;">
      <div class="rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-8 text-center transform transition-all duration-300 scale-105"
		   style="
			background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
			border: 2px solid rgba(59, 130, 246, 0.4);
			box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(59, 130, 246, 0.3);
			backdrop-filter: blur(20px);
		   ">
        <h3 class="text-xl font-bold text-white mb-6 leading-relaxed" style="white-space: pre-line;">
          ${message}
        </h3>
        <div class="flex gap-4 justify-center">
          <button id="confirmation-dialog-accept" 
				  class="px-6 py-3 text-sm font-semibold text-white rounded-2xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden"
				  style="
					background: linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9));
					border: 2px solid rgba(239, 68, 68, 0.6);
					box-shadow: 0 4px 20px rgba(239, 68, 68, 0.4);
				  ">
            <div class="absolute inset-0 bg-gradient-to-r from-red-400/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span class="relative z-10">${defaultAcceptText}</span>
          </button>
          <button id="confirmation-dialog-cancel" 
				  class="px-6 py-3 text-sm font-semibold text-white rounded-2xl transition-all duration-300 transform hover:scale-105 group relative overflow-hidden"
				  style="
					background: linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.9));
					border: 2px solid rgba(75, 85, 99, 0.6);
					box-shadow: 0 4px 20px rgba(75, 85, 99, 0.4);
				  ">
            <div class="absolute inset-0 bg-gradient-to-r from-gray-400/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span class="relative z-10">${defaultCancelText}</span>
          </button>
        </div>
      </div>
    </div>`;

	Router.getInstance().rootContainer().insertAdjacentHTML('beforeend', html);

	const cleanup = () => {
		const dialog = document.getElementById('confirmation-dialog');
		dialog?.remove();
	};

	return new Promise<boolean>((resolve) => {
		const accept = document.querySelector('#confirmation-dialog-accept') as HTMLButtonElement;
		const cancel = document.querySelector('#confirmation-dialog-cancel') as HTMLButtonElement;

		accept.addEventListener('click', () => {
			cleanup();
			resolve(true);
		});

		cancel.addEventListener('click', () => {
			cleanup();
			resolve(false);
		});
	});
}