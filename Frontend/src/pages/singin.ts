import type { IPages } from "./IPages";
import { exmp } from "../languageMeneger";
import { _apiManager } from "../api/APIManeger";


export class SinginPage implements IPages {

	private languageChangeHandler: (lang: string) => void;

	constructor() {
		this.languageChangeHandler = (lang: string) => {
			console.log("SiningPage -> languageChangeHandler calisti.");
			console.log(`Language changed to: ${lang}`);
			const container = document.getElementById('asd123');
			if (container) {
				container.innerHTML = ''; // Clear the container
				renderSingin(container);
			}
		}
	}

	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}

		exmp.addLanguageChangeListener(this.languageChangeHandler);
		
		exmp.waitForLoad().then(() => {
			renderSingin(container);
			//! hom sayfasındaki sorun burada da var bakalım nasıl ilerleyeceğiz
			requestAnimationFrame(() => {
				this.init();
			});
		});
	}

	destroy(): void {
		// Implement destroy logic if needed
		exmp.removeLanguageChangeListener(this.languageChangeHandler);
		document.body.innerHTML = '';
	}

	init(): void {
		const x = document.getElementById('asd123');
		if (!x)
			return;
		x.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			const action = target.getAttribute('data-action');

			if (!action) return;

			switch (action) {
				case 'register':
					this.handleRegister();
					break;
				case 'singin':
					this.handleLogin();
					break;
				default:
					console.warn(`Unknown action: ${action}`);
			}
		})
	}

	handleRegister(): void {
		console.log('Register button clicked');
		history.pushState({}, '', '/register');
		window.dispatchEvent(new Event('popstate'));
	}

	private showError(message: string): void {
		const errorMessage = document.getElementById('error_message');
		if (!errorMessage) return;
		errorMessage.style.visibility = 'visible';
		errorMessage.textContent = message;
	}

	private getInputValue(id: string): string {
		const input = document.getElementById(id) as HTMLInputElement;
		const value = input ? input.value.trim() : '';
		return value;
	}

	async handleLogin(): Promise<void> {
		const nicnameOrMail = this.getInputValue('nicname_or_mail_input');
		const passwordValue = this.getInputValue('password_input');
		if (!nicnameOrMail || !passwordValue) {
			if (!nicnameOrMail)this.showError(exmp.getLang('singin-errors.required.email'));
			else if (!passwordValue)this.showError(exmp.getLang('singin-errors.required.password'));
			return;
		}
		try{
			const response = await _apiManager.login(nicnameOrMail, passwordValue);
			if (!response.success) {
				this.showError(exmp.getLang("singin-errors." + response.message || 'Mesaj bulunamadı'));
				return;
			}
			history.pushState({}, '', '/');
			window.dispatchEvent(new Event('popstate'));
		} catch (error: any)
		{
			// throw new Error(`Login failed: ${error.message}`);
		}
	}
}



export function renderSingin(container: HTMLElement): void {

	const siginMain = document.createElement('div');
	siginMain.id = 'asd123';
	siginMain.classList.add(
		`absolute`,
		`flex`,
		`flex-col`,
		`items-center`,
		`justify-center`,
		`h-[100vh]`,
		'w-full',
		'bg-gray-300'
	);

	const formContainer = document.createElement('div');
	formContainer.classList.add(
		`bg-`,
		`shadow-lg`,
		'bg-white',
		`px-4`,
		'w-[95%]',
		'h-[60%]',
		'lg:w-[50%]',
		'lg:h-[50%]',
		'rounded-3xl',
		'border-2',
		'border-gray-800',
		'relative',
		'flex',
		'flex-col',
		'items-center',
		'justify-center',
		'gap-4'
	);

	createLangSelect(formContainer, ['tr', 'en', 'fr']);

	const singRegisterbuttonDiv = document.createElement('div'); // en baştaki giriş ve kayıt ol butonları için
	singRegisterbuttonDiv.classList.add(
		'flex',
		'flex-row',
		'justify-center',
		'items-center',
		'w-full',
		// 'bg-red-200',
	);
	const NicNameOrMaildiv = document.createElement('div');
	NicNameOrMaildiv.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'w-full',
		// 'bg-green-200',
	);
	const passworddiv = document.createElement('div');
	passworddiv.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'w-full',
		// 'bg-blue-200',
	);
	const singinWithGogleDiv = document.createElement('div');
	singinWithGogleDiv.classList.add(
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'w-full',
		// 'bg-purple-200',
	);
	const buttonDiv = document.createElement('div');
	buttonDiv.classList.add(
		'flex',
		'flex-row',
		'justify-center',
		'items-center',
		'w-full',
		// 'bg-yellow-200',
	);

//#region Giriş Butonlar kısmı
	//Kayıt Ol butonu

	const registerButton = document.createElement('button');
	registerButton.setAttribute('data-action', 'register');

	registerButton.textContent = exmp.getLang('singin.register-b');
	registerButton.classList.add(
		'bg-blue-500',
		'hover:bg-blue-700',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'w-1/3',
		'rounded-3xl',
	);
	singRegisterbuttonDiv.appendChild(registerButton);
//#endregion
	
//#region İnput alanları
	const nicNaneOrMailInput = document.createElement('input');
	nicNaneOrMailInput.type = 'text';
	nicNaneOrMailInput.id = 'nicname_or_mail_input';
	nicNaneOrMailInput.placeholder = exmp.getLang('singin.email-or-nickname-i');
	nicNaneOrMailInput.classList.add(
		'border',
		'border-gray-300',
		'rounded-lg',
		'px-4',
		'py-2',
		'w-[70%]',
	);
	NicNameOrMaildiv.appendChild(nicNaneOrMailInput);

	const showError = document.createElement('div');
	showError.id = 'error_message';
	showError.classList.add(
		'text-red-500',
		'text-sm',
		'font-bold',
		'mt-2',
		'w-[60%]',
	);
	showError.style.height = '1.5rem';
	showError.style.visibility = 'hidden';



	const passwordInput = document.createElement('input');
	passwordInput.type = 'password';
	passwordInput.id = 'password_input';
	passwordInput.placeholder = exmp.getLang('singin.passwor-i');
	passwordInput.classList.add(
		'border',
		'border-gray-300',
		'rounded-lg',
		'px-4',
		'py-2',
		'w-[70%]',
	);
	passworddiv.appendChild(passwordInput);
//#endregion

//#region GOOGLE ile Giriş Yap butonu
	// const singinWithGoogleButton = document.createElement('button');
	// singinWithGoogleButton.setAttribute('data-action', 'singin-with-google');
	// singinWithGoogleButton.textContent = 'Google ile Giriş Yap';
	// singinWithGoogleButton.classList.add(
	// 	'bg-red-500',
	// 	'hover:bg-red-700',
	// 	'text-white',
	// 	'font-bold',
	// 	'py-2',
	// 	'px-4',
	// 	'w-[50%]',
	// 	'rounded-lg',
	// );
	// singinWithGogleDiv.appendChild(singinWithGoogleButton);
//#endregion

//#region Normal Giriş Yap butonu
	const grisButton = document.createElement('button');
	grisButton.setAttribute('data-action', 'singin');
	grisButton.textContent = exmp.getLang('singin.login-b');
	grisButton.classList.add(
		'bg-green-500',
		'hover:bg-green-700',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'w-1/3',
		'rounded-lg',
	);
	buttonDiv.appendChild(grisButton);
//#endregion

	formContainer.appendChild(singRegisterbuttonDiv);
	formContainer.appendChild(NicNameOrMaildiv);
	formContainer.appendChild(passworddiv);
	// formContainer.appendChild(singinWithGogleDiv);
	formContainer.appendChild(showError);
	formContainer.appendChild(buttonDiv);
	siginMain.appendChild(formContainer);
	container.appendChild(siginMain);
}



/*
Verilen divin sol üst köşesinde olacak şekilde çıkacak
verilen string dizi içerisindeki dil seçeneklerini gösterecek.
*/
function createLangSelect(container: HTMLElement ,langs: string[]): void {
	const div = document.createElement('div'); // ana div
	div.id = 'lang_select';
	div.setAttribute('data-action', 'lang_select');
	div.textContent = exmp.getLanguage();
	div.classList.add(
		'absolute',
		'top-4',
		'right-4',
		'flex',
		'items-center',
		'justify-center',
		'w-[120px]',
		'h-[40px]',
		'z-10',
		'rounded-3xl',
		'bg-gray-200',
		'shadow-lg',
		'hover:shadow-xl',
		'hover:bg-gray-300',
		'hover:cursor-pointer',
	);

	const options_div = document.createElement('div'); // seçeneklerin olduğu div
	options_div.classList.add(
		'absolute',
		'top-16',
		'right-4',
		'flex',
		'flex-col',
		'justify-center',
		'items-center',
		'bg-gray-200',
		'gap-2',
		'rounded-3xl',
		'overflow-hidden',
		'shadow-lg',
		'hidden',
	);

	langs.forEach(lang => {
		if(lang === div.textContent) return;
		const option = document.createElement('div');
		option.classList.add(
			'flex',
			'justify-center',
			'items-center',
			'h-[40px]',
			'w-[120px]',
			'bg-gray-300',
			'hover:bg-gray-400',
			'hover:cursor-pointer',
		);
		option.setAttribute('data-action', 'lang_select');
		option.setAttribute('data-lang', lang);
		option.textContent = lang;
		options_div.appendChild(option);
	})

	container.appendChild(options_div);
	container.appendChild(div);

	let isInside = false;

	const showPopup = () => {
		options_div.classList.remove('hidden');
	}

	const hidePopup = () => {
		if (!isInside)
			options_div.classList.add('hidden');
	}

	div.addEventListener('mouseenter', () => {
		isInside = true;
		showPopup();
	})

	div.addEventListener('mouseleave', () => {
		isInside = false;
		setTimeout(hidePopup, 200);
	})

	options_div.addEventListener('mouseenter', () => {
		isInside = true;
	});

	options_div.addEventListener('mouseleave', () => {
		isInside = false;
		setTimeout(hidePopup, 200);
	});
	
	options_div.addEventListener('click', async (event) => {
		// daha öncesinde işlenen ve tıklandığında data-action a göre işlem yapan bir event varsa
		// çıkabilecek sorunlar için, diğer eventlerin işlenmesini engellemek için stopPropagation kullanıyoruz
		// bir alt satırı yorum satırına alırsan, sınıf içerisinde tanımlanana tıklama eventinden aynı veriyi alıp
		// caselaer içerisinde yorumluyor ve doğru case i göremediği için bilinmeyene düşüp erar vermesine neden oluyor
		// consolda görülen eror mesajının nedeni sator -> 71 deki console.warm.
		event.stopPropagation();
		const target = event.target as HTMLElement;
		const action = target.getAttribute('data-action');
		const lang = target.getAttribute('data-lang');

		if (action === 'lang_select' && lang) {
			console.log(`Selected language: ${lang}`);
			// burada dil değişimi yapılacak
			isInside = false;
			hidePopup();
			// sayfa yeniden yükle
			await exmp.setLanguage(lang);
		}
	});
}