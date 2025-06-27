import type { IPages } from "./IPages";
import { exmp } from "../languageMeneger";
import {_apiManager } from "../api/APIManeger";
import type { IApiRegister } from "../api/APIManeger";

export class RegisterPage implements IPages {
	render(container: HTMLElement): void {
		if (!container) {
			console.error('Container not found');
			return;
		}
		renderRegister(container);
		requestAnimationFrame(() => {
			this.init();
		});
	}

	destroy(): void {
		// Implement destroy logic if needed
		document.getElementById("register_main")?.removeEventListener('click', this.mainClikHandler); // sayfa değişince eventleri temizler
	}

	init(): void {
		document.getElementById("register_main")?.addEventListener('click', this.mainClikHandler);
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

	private showError(message: string): void {
		const errorDiv = document.getElementById('error-message');
		if (errorDiv) {
			errorDiv.textContent = message;
			errorDiv.style.visibility = 'visible';
		} else {
			console.error('Error message div not found');
		}
	}

	private getInputValue(id: string): string | null {
		const inout = document.getElementById(id) as HTMLInputElement | null;
		// const result = inout ? inout.value.trim() : null;
		// return result ? result === "" ? null : result : null;
		return inout ? inout.value.trim() : null;
	}

	async handleRegister(): Promise	<void> {
		console.log('Register button clicked');
		// Implement register logic here
		// burada kayıt olma isteği atılacak
		// ve kullanıcıya yönlendirme yapılacak
		const username = this.getInputValue("username");
		const email = this.getInputValue("email");
		const password = this.getInputValue("password");
		const repeatPassword = this.getInputValue("repeat_password");
		if (!username || !email || !password || !repeatPassword) {
			if (!username) this.showError(exmp.getLang('register-errors.required.username'));
			else if (!email) this.showError(exmp.getLang('register-errors.required.email'));
			else if (!password) this.showError(exmp.getLang('register-errors.required.password'));
			else if (!repeatPassword) this.showError(exmp.getLang('register-errors.required.confirmPassword')); 
			return;
		} 
		else if (username.length < 3 || password.length < 6) {
			if (username.length < 3) this.showError(exmp.getLang('register-errors.minlength.username'));
			else if (password.length < 6) this.showError(exmp.getLang('register-errors.minlength.password'));
			return;
		} else if (username.length > 20 || password.length > 20) {
			if (username.length > 20) this.showError(exmp.getLang('register-errors.maxlength.username'));
			else if (password.length > 20) this.showError(exmp.getLang('register-errors.maxlength.password'));
			return;
		} else if (!/^[a-zA-Z0-9_.]+@[a-zA-Z0-9_.]+\.[a-zA-Z]{2,}$/.test(email)) {
			this.showError(exmp.getLang('register-errors.invalidCharacters.email'));
			return;
		} else if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
			this.showError(exmp.getLang('register-errors.invalidCharacters.username'));
			return;
		} else if (password !== repeatPassword) {
			this.showError(exmp.getLang('register-errors.passwordMismatch'));
			return;
		}
		// else {
		// 	console.log('name: ', name);
		// 	console.log('surname: ', surname);
		// 	console.log('username: ', username);
		// 	console.log('email: ', email);
		// 	console.log('password: ', password);
		// }
		const x: IApiRegister = 
		{
			username : username,
			email : email,
			password : password,
		}
		try{
			const response = await _apiManager.register(x);
			if (!response.success)
			{
				this.showError(response.message || exmp.getLang('register.registerFailed'));
				return;
			}
			// console.log('Registration successful:', response.data);
			history.pushState(null, '', '/singin');
			window.dispatchEvent(new PopStateEvent('popstate'));
		} catch (error: any) {
			console.error('Error during registration:', error);
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
		"bg-gray-300",
	);
	const formContainer = document.createElement('div');
	formContainer.id = 'register_main';
	formContainer.classList.add(
		`bg-`,
		`shadow-lg`,
		'bg-white',
		`px-4`,
		'w-[95%]',
		'h-[85%]',
		'lg:w-[50%]',
		'lg:h-[70%]',
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

	singinButton.textContent = exmp.getLang('register.singin-b');
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
		'w-1/3',
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