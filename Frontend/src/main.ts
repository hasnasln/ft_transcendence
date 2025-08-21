import './global.css';
import { Router } from './router';
import {_apiManager} from "./api/APIManager";

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

	router.lazyRegisterPage("/tournament", {path: "TournamentPage", pageName: "TournamentPage"});
	router.lazyRegisterPage("/login", {path: "login", pageName: "LoginPage"});
	router.lazyRegisterPage("/register", {path: "register", pageName: "RegisterPage"});
	router.lazyRegisterPage("/play", {path: "PlayPage", pageName: "PlayPage"});
	router.lazyRegisterPage("/game", {path: "game", pageName: "GamePage"});
	router.lazyRegisterPage("/", {path: "home", pageName: "HomePage"});
	router.lazyRegisterPage("/500", {path: "ServerErrorPage", pageName: "ServerErrorPage"});
	router.lazyRegisterPage("/404", {path: "NotFoundPage", pageName: "NotFoundPage"});

	router.go(window.location.pathname, true);
	if (_apiManager.isTokenExpired()) {
		_apiManager.logout();
		if (window.location.pathname == '/register')
			router.go('/register');
		else if (window.location.pathname == '/login')
			router.go('/login');
	}
}

bootstrap();