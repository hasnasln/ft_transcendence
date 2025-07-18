import './style.css';
import { Router, ServerErrorPage } from './router';
import { HomePage } from './pages/home';
import { TournamentPage } from './pages/TournamentPagev2';
import { PlayPage } from './pages/play-page';
import { RegisterPage } from './pages/register';
import { LoginPage } from './pages/login';

function bootstrap() {
	const routerV2 = Router.getInstance();

	routerV2.registerGuard({
		canGo: (path: string) => {
			if (["/register", "/login", "/500"].includes(path)) {
				return true;
			}

			const isLoggedIn = !!localStorage.getItem('token');
			if (!isLoggedIn) {
				routerV2.go('/login', true);
				return false;
			}
			return true;
		}
	});

	routerV2.registerPage("/", new HomePage());
	routerV2.registerPage("/tournament", new TournamentPage());
	routerV2.registerPage("/play", new PlayPage());
	routerV2.registerPage("/register", new RegisterPage());
	routerV2.registerPage("/login", new LoginPage());
	routerV2.registerPage("/500", new ServerErrorPage());
	routerV2.go(window.location.pathname, true);
}

bootstrap();