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

	public applyLanguage2(id: string = "app") 
	{
		const dest = document.getElementById(id);
		if(!dest)
		{
			console.error(`dil kısmı verilen id de: ${id} bir şey bulamadı`);
			return;
		}


		const elemets = dest.querySelectorAll<HTMLElement>('[data-translate-key]');
		if (!elemets || elemets.length === 0) {
			console.warn(`No elements found with data-translate-key in element with id: ${id}`);
			return;
		}
		elemets.forEach(element => {
			const tkey = element.getAttribute('data-translate-key');
			if (!tkey) return;

			let rawContent = this.getLang(tkey);
			
			const placeholders = Array.from(element.attributes)
			.filter((attr) => attr.name.startsWith('data-translate-placeholder-value-'))
			.map((attr) => ({
				key: attr.name.replace('data-translate-placeholder-value-',''),
				value: attr.value,
			}))

			placeholders.forEach(({key,value}) => {
				rawContent = rawContent.replaceAll(`{${key}}`, value);
			})
			element.innerHTML = rawContent;
		});
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
