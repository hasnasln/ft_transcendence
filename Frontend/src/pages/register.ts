import type { IPages } from "./IPages";

interface RegisterPageData{
	top_button_name: string;
	name_input_placeholder: string;
	surname_input_placeholder: string;
	username_input_placeholder: string;
	email_input_placeholder: string;
	password_input_placeholder: string;
	repeat_password_input_placeholder: string;
	register_button_name: string;
}

export class RegisterPage implements IPages {
	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderRegister(container, this.getLang('en'));
		this.init();
	}

	destroy(): void {
		// Implement destroy logic if needed
		document.body.innerHTML = '';
	}

	init(): void {
		document.body.addEventListener('click', (event) => {
			const target = event.target as HTMLElement;
			const action = target.getAttribute('data-action');

			if (!action) return;
			switch (action) {
				case 'register':
					this.handleRegister();
					break;
				case 'login':
					this.handleLogin();
					break;
				default:
					console.warn(`Unknown action: ${action}`);
			}
		});
	}

	handleRegister(): void {
		console.log('Register button clicked');
		// Implement register logic here
		// burada kayıt olma isteği atılacak
		// ve kullanıcıya yönlendirme yapılacak
		const name = (document.getElementById('name') as HTMLInputElement)?.value.trim();
		const surname = (document.getElementById('surname') as HTMLInputElement)?.value.trim();
		const username = (document.getElementById('username') as HTMLInputElement)?.value.trim();
		const email = (document.getElementById('email') as HTMLInputElement)?.value.trim();
		const password = (document.getElementById('password') as HTMLInputElement)?.value.trim();
		const repeatPassword = (document.getElementById('repeat_password') as HTMLInputElement)?.value.trim();

		const lang = "tr";

		const body = {
			NAME: name,
			SURNAME: surname,
			USERNAME: username,
			EMAIL: email,
			PASSWORD: password,
			REPEAT_PASSWORD: repeatPassword,
			LANG: lang,
		}

		fetch('http://localhost:8080/api/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		});
	}

	handleLogin(): void {
		// burada login sayfasına yönlendirme yapılacak
		console.log('Login button clicked');
		history.pushState(null, '', '/singin');
		window.dispatchEvent(new PopStateEvent('popstate'));
	}

	getTitle(): string {
		return "Kayıt Ol";
	}

	getPath(): string {
		return "/register";
	}

	
	getLang(languege: string): RegisterPageData {
		if (languege === 'tr')
		{
			const registerPageData: RegisterPageData = {
				top_button_name: 'Giriş Yap',
				name_input_placeholder: 'Ad',
				surname_input_placeholder: 'Soy Ad',
				username_input_placeholder: 'Kullanıcı Adı',
				email_input_placeholder: 'E-posta',
				password_input_placeholder: 'Şifre',
				repeat_password_input_placeholder: 'Şifre Tekrar',
				register_button_name: 'Kayit Ol',
			};
			return registerPageData;
		}
		else //(languege === 'en')
		{
			const registerPageData: RegisterPageData = {
				top_button_name: 'Sing In',
				name_input_placeholder: 'Name',
				surname_input_placeholder: 'Surname',
				username_input_placeholder: 'Username',
				email_input_placeholder: 'Email',
				password_input_placeholder: 'Password',
				repeat_password_input_placeholder: 'Repeat Password',
				register_button_name: 'Register',
			};
			return registerPageData;
		}
	}
}

export function renderRegister(container: HTMLElement, lang: RegisterPageData) {

	container.classList.add(
		`flex`,
		`flex-col`,
		`items-center`,
		`justify-center`,
		`h-[100vh]`,
		'w-full`',
		"bg-cyan-500",
	);
	const formContainer = document.createElement('div');
	formContainer.classList.add(
		`bg-`,
		`shadow-lg`,
		'bg-white',
		`px-4`,
		'w-[50%]',
		'h-[60%]',
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

	const singsinginButtonDiv = document.createElement('div'); // en baştaki giriş ve kayıt ol butonları için
	singsinginButtonDiv.classList.add(
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
	// Giriş ve Kayıt Ol butonları
	const singinButton = document.createElement('button');
	singinButton.setAttribute('data-action', 'login');

	singinButton.textContent = lang.top_button_name;
	singinButton.classList.add(
		'bg-blue-500',
		'hover:bg-blue-700',
		'text-white',
		'font-bold',
		'py-2',
		'px-4',
		'w-1/3',
		'border-gray-800',
		'rounded-3xl',
	);
	singsinginButtonDiv.appendChild(singinButton);
	singsinginButtonDiv.appendChild(singinButton);
//#endregion

formContainer.appendChild(singsinginButtonDiv);
//#region İnput alanları
	createInput("name", lang.name_input_placeholder, 'text', formContainer);
	createInput("surname", lang.surname_input_placeholder, 'text', formContainer);
	createInput("username", lang.username_input_placeholder, 'text', formContainer);
	createInput("email", lang.email_input_placeholder, 'email', formContainer);
	createInput("password", lang.password_input_placeholder, 'password', formContainer);
	createInput("repeat_password", lang.repeat_password_input_placeholder, 'password', formContainer);
//#endregion

//#region Giriş Butonları
	const grisButton = document.createElement('button');
	grisButton.setAttribute('data-action', 'register');
	grisButton.textContent = lang.register_button_name;
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

	formContainer.appendChild(buttonDiv);
	container.appendChild(formContainer);
}

function createInput(id: string, placeholder: string, type: string, container: HTMLElement) {
	const input = document.createElement('input');
	input.type = type;
	input.placeholder = placeholder;
	input.id = id;
	input.classList.add(
		'border',
		'border-gray-300',
		'rounded-lg',
		'px-4',
		'py-2',
		'w-[70%]',
	);
	container.appendChild(input);
}