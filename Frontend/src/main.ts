import './style.css';
import { router } from './router';
import { checkPageWidth } from './components/responsive-helper';
import { checkCurrentUser } from './tokenUtils';

const app = document.getElementById('app') as HTMLElement;

async function initApp()
{
  // Sayfa yüklenince hemen token’ı ve payload’u doğrula:
  const currentUser = await checkCurrentUser();

//const isloggedIn = localStorage.getItem('token');
//console.log("isloggedIn:", isloggedIn);

	if (app)
	{
		if (!currentUser) 
			window.history.pushState({}, '', '/singin');
		router();
		// Popstate event listener'ını ekleyelim
	}
}

initApp();

window.addEventListener('popstate', () => {
	router();
});

window.addEventListener('resize', checkPageWidth);