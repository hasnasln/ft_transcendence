import { HomePage } from './pages/home';
import { SinginPage } from './pages/singin';
import { RegisterPage } from './pages/register';
import { TournamentPage } from './pages/TournamentPage';
import { PlayPage } from './pages/play';

export function router()
{
	const app = document.getElementById('app') as HTMLElement;
	if (!app) {
		console.error('App element not found');
		return;
	}
	// önceki içeriği temizle 
	const oldContent = app.querySelector('#content-container');
	if (oldContent) {
		oldContent.remove();
	}

	// burada sayfa açıldığında ilk karşılaşılacak sayfaı setliyoruz
	// içeriği koyacağın div oluştur ve id sini belirle

	const path = window.location.pathname;
	const contentContainer = document.createElement('div');
	contentContainer.id = 'content-container';
	contentContainer.classList.add(
		'relative',
		'w-full',
		'h-[100vh]',
		'bg-red-200',
	)
	contentContainer.id = 'content-container';
	switch (path) {
		case '/':
			const homePage = new HomePage();
			homePage.render(contentContainer);
			break;
		case '/singin':
			const singinpage = new SinginPage();
			singinpage.render(contentContainer);
			break;
		case '/register':
			const registerPage = new RegisterPage();
			registerPage.render(contentContainer);
			break;
		case '/play':
			const playPage = new PlayPage();
			playPage.render(contentContainer);
			break;
		case '/tournament':
			const tournamentPage = new TournamentPage();
			tournamentPage.render(contentContainer);
			break;
		default:
			const hsn = new HomePage();
			hsn.render(contentContainer);
			break;
	}
	app.appendChild(contentContainer);
}