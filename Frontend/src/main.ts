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

if (app){
	// ilk girişte singin e yönlendir
	window.history.pushState({}, '', '/singin');
	router();
	// Popstate event listener'ını ekleyelim
}

window.addEventListener('popstate', () => {
	router();
});