import './style.css';
import { router } from './router';

const app = document.getElementById('app') as HTMLElement;

// interface User {
// 	name: string
// 	mail: string
// }

// class FakeApi {
// 	getUser(name: string): User {
// 		return {name: "ahmet", mail: "mustafa@gmail.com"}
// 	}
	
// }

const isloggedIn = localStorage.getItem('token');



console.log("isloggedIn:", isloggedIn);

if (app){
	//! sayfa içerisinde yenileme yaptığında içerideki evetler gidiyor, giriş yapılmış halde tıklama yapamıyorsun
	//! farkında vardığım tek hata burada şimdilik açık bırakıyorum.
	//! çıkış yapamadığın için de localStorage'dan token'ı silemiyorsun  sayfa kitlenip kalıyor
	// if (!isloggedIn) 
		window.history.pushState({}, '', '/singin');
	// else
		// window.history.pushState({}, '', '/home');
	router();
	// Popstate event listener'ını ekleyelim
}

window.addEventListener('popstate', () => {
	router();
});