import './style.css';
import { Router, ServerErrorPage } from './router';
import { HomePage } from './pages/home';
import { TournamentPage } from './pages/TournamentPagev2';
import { PlayPage } from './pages/play-page';
import { RegisterPage } from './pages/register';
import { LoginPage } from './pages/login';
import { GamePage } from './pages/game';
import { listenGameBusEvents } from './pages/game-section/gameEventBus';

function bootstrap() {
	const router = Router.getInstance();

	router.registerGuard({
		canGo: (path: string) => {
			if (["/register", "/login", "/500"].includes(path)) {
				return true;
			}

			const isLoggedIn = !!localStorage.getItem('token');
			if (!isLoggedIn) {
				router.go('/login', true);
				return false;
			}
			return true;
		}
	});

	router.registerPage("/", new HomePage());
	router.registerPage("/tournament", new TournamentPage());
	router.registerPage("/play", new PlayPage());
	router.registerPage("/game", new GamePage());
	router.registerPage("/register", new RegisterPage());
	router.registerPage("/login", new LoginPage());
	router.registerPage("/500", new ServerErrorPage());
	router.go(window.location.pathname, true);
	listenGameBusEvents();
}

bootstrap();