import type { IPages } from "./IPages";
import { exmp } from "../languageMeneger";
import {_apiManager } from "../APIManeger";
import type { IApiRegister } from "../APIManeger";

export class RegisterPage implements IPages {
	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderRegister(container);
		this.init();
	}

	destroy(): void {
		// Implement destroy logic if needed
		document.body.removeEventListener('click', this.mainClikHandler); // sayfa değişince eventleri temizler
	}

	init(): void {
		document.body.addEventListener('click', this.mainClikHandler);
	}

	private mainClikHandler = (event: MouseEvent) => {
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
	}

	async handleRegister(): Promise	<void> {
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

		console.log('name: ', name);
		console.log('surname: ', surname);
		console.log('username: ', username);
		console.log('email: ', email);
		console.log('password: ', password);

		const x: IApiRegister = 
		{
			name : name,
			surname : surname,
			username : username,
			email : email,
			password : password,
		}

		if (password !== repeatPassword) {
			alert(exmp.getLang('register.passwordNotMatch'));
			return;
		}

		try{
			await _apiManager.register(x);
		} catch (error: any) {
			const erorrdiv = document.getElementById('error-message');
			if (error.status === 409) {
				// erorrdiv!.textContent = exmp.getLang('register.usernameAlreadyExists');
				erorrdiv!.textContent = "Kullanıcı adı zaten mevcut !";
				erorrdiv!.style.visibility = 'visible';
			} else if(error.status === 400) {
				// erorrdiv!.textContent = exmp.getLang('register.emailAlreadyExists');
				erorrdiv!.textContent = "E-posta adresi zaten mevcut !";
				erorrdiv!.style.visibility = 'visible';
			}
			else{
				alert(exmp.getLang('register.registerFailed'));
			}
		}
	}

	handleLogin(): void {
		// burada login sayfasına yönlendirme yapılacak
		console.log('Login button clicked');
		history.pushState(null, '', '/singin');
		window.dispatchEvent(new PopStateEvent('popstate'));
		this.destroy();
	}

	getTitle(): string {
		return "Kayıt Ol";
	}

	getPath(): string {
		return "/register";
	}
}

export function renderRegister(container: HTMLElement) {

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

	singinButton.textContent = exmp.getLang('register.singin');
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
	createInput("name", exmp.getLang("register.name"), 'text', formContainer);
	createInput("surname", exmp.getLang("register.surname"), 'text', formContainer);
	createInput("username", exmp.getLang("register.username"), 'text', formContainer);
	createInput("email", exmp.getLang("register.email"), 'email', formContainer);
	createInput("password", exmp.getLang("register.password"), 'password', formContainer);
	createInput("repeat_password", exmp.getLang("register.confirmPassword"), 'password', formContainer);
//#endregion

 //! burada hata kısmını yazdırmak için bir p oluşturacağım
	const errorDiv = document.createElement('div');
	errorDiv.classList.add(
		'border-gray-300',
		'rounded-lg',
		'px-4',
		'py-2',
		'w-[70%]',
		'text-red-500',
		'text-sm',
		'font-bold',
	);
	errorDiv.id = 'error-message';
	errorDiv.style.height = '1.5rem'; // Set a fixed height for the error message div
	errorDiv.style.visibility = 'hidden'; // Initially hidden
	formContainer.appendChild(errorDiv);

//#region Giriş Butonları
	const grisButton = document.createElement('button');
	grisButton.setAttribute('data-action', 'register');
	grisButton.textContent = exmp.getLang("register.register");
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

/*
@param id : string -> id of the input
@param placeholder : string -> placeholder of the input
@param type : string -> type of the input
@param container : HTMLElement -> container of the input
*/
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