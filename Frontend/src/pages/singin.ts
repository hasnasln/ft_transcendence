import type { IPages } from "./IPages";


interface SinginPageData {
	top_button_name: string;
	nicname_or_mail_input_placeholder: string;
	password_input_placeholder: string;
	singin_button_name: string;
	singin_with_google_button_name: string;
}

export class SinginPage implements IPages {
	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		if (localStorage.getItem('lang') === null) {
			localStorage.setItem('lang', 'tr');
		}
		renderSingin(container, this.getLang(localStorage.getItem('lang') || 'tr'));
		//! hom sayfasındaki sorun burada da var bakalım nasıl ilerleyeceğiz
		requestAnimationFrame(() => {
			this.init();
		});
	}

	destroy(): void {
		// Implement destroy logic if needed
		document.body.innerHTML = '';
	}

	getLang(lang: string): SinginPageData {
		if (lang === 'en'){
			return {
				top_button_name: 'Register',
				nicname_or_mail_input_placeholder: 'Username or Email',
				password_input_placeholder: 'Password',
				singin_button_name: 'Login',
				singin_with_google_button_name: 'Login with Google',
			};
		}
		else{
			return {
				top_button_name: 'Kayıt Ol',
				nicname_or_mail_input_placeholder: 'Kullanıcı Adı veya Mail',
				password_input_placeholder: 'Şifre',
				singin_button_name: 'Giriş Yap',
				singin_with_google_button_name: 'Google ile Giriş Yap',
			};
		}
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
				case 'singin-with-google':
					this.handleLoginWithGoogle();
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

	handleLogin(): void {
		console.log('Login button clicked');
		// burada giriş işlemi yapılıp ana sayfaya yönlendirme yapılacak
		history.pushState({}, '', '/');
		window.dispatchEvent(new Event('popstate'));
	}

	handleLoginWithGoogle(): void {
		console.log('Login with Google button clicked');
	}
}



export function renderSingin(container: HTMLElement, data: SinginPageData): void {

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
	);

	const formContainer = document.createElement('div');
	formContainer.classList.add(
		`bg-`,
		`shadow-lg`,
		'bg-white',
		`px-4`,
		'w-[50%]',
		'h-[50%]',
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

	registerButton.textContent = data.top_button_name;
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
	nicNaneOrMailInput.placeholder = data.nicname_or_mail_input_placeholder;
	nicNaneOrMailInput.classList.add(
		'border',
		'border-gray-300',
		'rounded-lg',
		'px-4',
		'py-2',
		'w-[70%]',
	);
	NicNameOrMaildiv.appendChild(nicNaneOrMailInput);

	const passwordInput = document.createElement('input');
	passwordInput.type = 'password';
	passwordInput.id = 'password_input';
	passwordInput.placeholder = data.password_input_placeholder;
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

//#region Giriş Butonları
	const singinWithGoogleButton = document.createElement('button');
	singinWithGoogleButton.setAttribute('data-action', 'singin-with-google');
	singinWithGoogleButton.textContent = 'Google ile Giriş Yap';
	singinWithGoogleButton.classList.add(
		'bg-red-500',
		'hover:bg-red-700',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'w-[50%]',
		'rounded-lg',
	);
	singinWithGogleDiv.appendChild(singinWithGoogleButton);

	const grisButton = document.createElement('button');
	grisButton.setAttribute('data-action', 'singin');
	grisButton.textContent = data.singin_button_name;
	grisButton.classList.add(
		'bg-green-500',
		'hover:bg-green-700',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'w-[25%]',
		'rounded-lg',
	);
	buttonDiv.appendChild(grisButton);
//#endregion

	formContainer.appendChild(singRegisterbuttonDiv);
	formContainer.appendChild(NicNameOrMaildiv);
	formContainer.appendChild(passworddiv);
	formContainer.appendChild(singinWithGogleDiv);
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
	div.textContent = localStorage.getItem('lang');
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
	
	options_div.addEventListener('click', (event) => {
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
			localStorage.setItem('lang', lang);
			location.reload();
		}
	});
}