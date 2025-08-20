import {en} from "./en";
import {tr} from "./tr";
import {fr} from "./fr";

type TranslationObject = {
	[key: string]: string | TranslationObject;
}

export class LanguageManager
{
	private static instance: LanguageManager;
	private language: string;
	private languageData: Map<string, TranslationObject>;
	private languageChoises: string[];

	private constructor() {
		this.language = localStorage.getItem('language') ||'tr'; // Default language
		this.languageChoises = ['tr', 'en', 'fr']; // Available languages
		this.languageData = new Map();
		
		console.log('languageManager instance created');
		localStorage.setItem('language', this.language);
		if (this.language === 'tr')
			this.languageData.set(this.language, tr);
		else if (this.language === 'en')
			this.languageData.set(this.language, en);
		else
			this.languageData.set(this.language, fr);
	}

	public static getInstance(): LanguageManager {
		if (!LanguageManager.instance) { // sadece ilk defa çağırıldığında instance oluştur , tek bir nesne geriye kalan her yerde kullanılacak
			LanguageManager.instance = new LanguageManager();
		}
		return LanguageManager.instance;
	}

	public async setLanguage(language: string): Promise<void> {
		if (this.language === language) return;

		this.language = language;
		// alt kısımı farklı bir fonsiyon içerisine alınabilir
		if (this.language === 'tr')
			this.languageData.set(this.language, tr);
		else if (this.language === 'en')
			this.languageData.set(this.language, en);
		else
			this.languageData.set(this.language, fr);

		localStorage.setItem('language', language); 
		this.applyLanguage();
	}

	public applyLanguage()
	{
		const translateableElements = document.querySelectorAll<HTMLElement>('[data-langm-key]')
		translateableElements.forEach(el => {
			let rawContent =  exmp.getLang(el.getAttribute('data-langm-key')!);
			const path = el.getAttribute("data-langm-path");
			const data = el.getAttribute('data-langm-tmp');
			if (data)
				rawContent = rawContent + " " + data
			if (path=='placeholder' && el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
				el.placeholder = rawContent;
			else if(path =='title')
				el.setAttribute(path, rawContent);
			else
				el.innerHTML = rawContent;
		})
	}
	
	public getLanguage(): string {
		return this.language;
	}

	public getLanguageChoises(): string[] {
		return this.languageChoises;
	}

	public getLang(key: string): string {
		const data = this.languageData.get(this.language);
		if (!data) {
			return key;
		}

		const keys = key.split('.');
		let currentData: any = data;

		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];

			if (currentData[k] === undefined) {
				return key;
			}

			currentData = currentData[k];
			
			if (i === keys.length - 1 && typeof currentData === 'string') {
				return currentData;
			}
		}
		return key;
	}
}

export const exmp = LanguageManager.getInstance();