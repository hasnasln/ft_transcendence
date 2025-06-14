import './style.css';
import { router } from './router';
import { checkPageWidth } from './components/responsive-helper';

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
	if (!isloggedIn) 
		window.history.pushState({}, '', '/singin');
	router();
	// Popstate event listener'ını ekleyelim
}

window.addEventListener('popstate', () => {
	router();
});

window.addEventListener('resize', checkPageWidth);