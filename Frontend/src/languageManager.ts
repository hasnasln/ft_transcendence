import { Button } from "@babylonjs/gui";

const en = {
	"singin": {
		"register-b": "Register",
		"email-or-nickname-i": "Email or Nickname",
		"passwor-i": "Password",
		"login-b": "Login",
		"no-account": "Don't have an account?"
	},
	"singin-success": "Login successful! Redirecting...",
	"singin-errors": {
		"required": {
			"email": "Email or Nickname is required",
			"password": "Password is required"
		},
		"invalid": {
			"email": "Invalid email format"
		},
		"INVALID_CREDENTIALS": "Invalid email/nickname or password",
		"networkError": "Network connection error, please check your internet connection"
	},
	"register": {
		"title": "Register",
		"signin-b": "Sign In",
		"name": "Enter Name",
		"surname": "Enter Surname",
		"username": "Enter Username",
		"email": "Enter Email",
		"password": "Enter Password",
		"confirmPassword": "Confirm Password",
		"register": "Register"
	},
	"register-success": "Registration successful! Please log in.",
	"register-errors": {
		"required": {
			"name": "Name is required",
			"surname": "Surname is required",
			"username": "Username is required",
			"email": "Email is required",
			"password": "Password is required",
			"confirmPassword": "Confirm Password is required"
		},
		"minlength": {
			"name": "Name must be at least 3 characters",
			"surname": "Surname must be at least 3 characters",
			"username": "Username must be at least 3 characters",
			"password": "Password must be at least 6 characters",
			"confirmPassword": "Confirm Password must be at least 6 characters"
		},
		"maxlength": {
			"username": "Username must be at most 20 characters",
			"password": "Password must be at most 20 characters"
		},
		"invalidCharacters": {
			"username": "Invalid username characters (a-zA-Z0-9_.)",
			"email": "Invalid email format"
		},
		"passwordMismatch": "Passwords do not match",
		"exists": {
			"username": "This username is already taken",
			"email": "This email is already registered"
		},
		"registerFailed": "Registration failed",
		"networkError": "Network connection error, please check your internet connection"
	},
	"home": {
		"play-b": "Play Now",
		"settings-b": "Settings",
		"profile-b": "Profile",
		"tournament-b": "Tournament",
		"logout-b": "Logout"
	},
	"settings": {
		"title": "Settings",
		"ball-color": "Ball Color",
		"language-select": "Language Selection",
		"save-button": "Save Settings"
	},
	"profile": {
		"title": "Profile Settings",
		"username": "Username"
	},
	"profile-avatar-change-hint": "Click to change avatar",
	"profile-avatar-select-title": "Select Avatar",
	"profile-avatar-select-subtitle": "Choose your favorite avatar",
	"profile-avatar-cancel": "Cancel",
	"profile-avatar-success": "Avatar changed successfully!",
	"profile-info-title": "Profile Information",
	"profile-info-settings-title": "Profile Settings",
	"profile-settings": {
		"username": "Username",
		"username-placeholder": "New Username",
		"email": "Email",
		"email-placeholder": "New Email",
		"password": "Password",
		"password-placeholder": "New Password",
		"old-Password": "Old Password",
		"old-password-placeholder": "Old Password",
		"update": "Update"
	},
	"tournament-first-page": {
		"join-title": "Join Tournament",
		"join-placeholder": "Enter Tournament ID",
		"join-button": "Join Tournament",
		"create-title": "Create Tournament",
		"create-placeholder": "Enter Tournament Name",
		"create-button": "Create Tournament",
		"m-title-for-showjoin": "Create Tournament",
		"m-title-for-showcreate": "Join Tournament",
		"m-join-button": "--->",
		"m-create-button": "<---"
	},
	"tournament-second-page": {
		
		"exit": "Exit Tournament",
		"tournament-id": "Tournament ID",
		"tournament-name": "Tournament Name",
		"tournament-creater": "Tournament Creator",
		"tournament-total-players": "Total Players",
		"tournament-joined-players": "Joined Players",
		"play": "Play"
	},
	"game": {
		"loading": "Game Page Loading...",
		"vs-compiter-b": "Play vs Computer",
		"vs-compiter-difficulty-b-easy": "Easy",
		"vs-compiter-difficulty-b-medium": "Medium",
		"vs-compiter-difficulty-b-hard": "Hard",
		"find-reval-b": "Find Opponent",
		"find-reval-waiting": "Waiting for Opponent...",
		"local-game": "Local Game",
		"tournament": "Tournament",
		"stratt-game": "Start Game",
		"continue-game": "Continue Game",
		"new-game": "Start New Game",
		"sets": "SETS!"
	},
	toast: {
		success: {
			"username-updated": "Username updated successfully! ✨",
			"email-updated": "Email updated successfully! 📧",
			"password-updated": "Password updated successfully! 🔒"
		},
		error: {
			"field-required": "Please enter a value!",
			"old-password-field-missing": "Old password field not found!",
			"new-password-field-missing": "New password field not found!",
			"old-password-required": "Please enter your old password!",
			"new-password-required": "Please enter your new password!",
			"password-min-length": "New password must be at least 3 characters!",
			"old-password-incorrect": "Old password is incorrect!",
			"username-update-failed": "Username could not be updated!",
			"email-update-failed": "Email could not be updated!",
			"password-update-failed": "Password could not be updated!",
			"update-error": "An error occurred during update!",
			"password-update-error": "An error occurred while updating password!"
		}
	}
}

const tr  = {
	"singin": {
		"register-b": "Kayıt Ol",
		"email-or-nickname-i": "E-posta",
		"passwor-i": "Şifre",
		"login-b": "Giriş Yap",
		"no-account": "Hesabınız yok mu?"
	},
	"singin-success": "Giriş başarılı! Yönlendiriliyorsunuz...",
	"singin-errors": {
		"required": {
			"email": "E-posta veya Nickname gerekli",
			"password": "Şifre gerekli"
		},
		"invalid": {
			"email": "Geçersiz e-posta formatı"
		},
		"INVALID_CREDENTIALS": "Geçersiz e-posta/nickname veya şifre",
		"networkError": "Ağ bağlantı hatası, internet bağlantınızı kontrol edin"
	},
	"register": {
		"title": "Kayıt Ol",
		"singin-b": "Giriş Yap",
		"name": "İsim Giriniz",
		"surname": "Soyisim Giriniz",
		"username": "Kullanıcı Adı Giriniz",
		"email": "E-posta Giriniz",
		"password": "Şifre Giriniz",
		"confirmPassword": "Şifreyi Tekrar Giriniz",
		"register": "Kayıt Ol"
	},
	"register-success": "Kayıt başarılı! Lütfen giriş yapın.",
	"register-errors": {
		"required": {
			"name": "İsim gerekli",
			"surname": "Soyisim gerekli",
			"username": "Kullanıcı adı gerekli",
			"email": "E-posta gerekli",
			"password": "Şifre gerekli",
			"confirmPassword": "Şifreyi onayla gerekli"
		},
		"minlength": {
			"name": "İsim en az 3 karakter olmalıdır",
			"surname": "Soyisim en az 3 karakter olmalıdır",
			"username": "Kullanıcı adı en az 3 karakter olmalıdır",
			"password": "Şifre en az 6 karakter olmalıdır",
			"confirmPassword": "Şifreyi onayla en az 6 karakter olmalıdır"
		},
		"maxlength": {
			"username": "Kullanıcı adı en fazla 20 karakter olmalıdır",
			"password": "Şifre en fazla 20 karakter olmalıdır"
		},
		"invalidCharacters": {
			"username": "Geçersiz username karakterleri (a-zA-Z0-9_.)",
			"email": "Geçersiz e-posta formatı"
		},
		"passwordMismatch": "Şifreler eşleşmiyor",
		"exists": {
			"username": "Bu kullanıcı adı zaten alınmış",
			"email": "Bu e-posta zaten kayıtlı"
		},
		"USERNAME_ALREADY_EXISTS": "Bu kullanıcı adı zaten alınmış",
		"EMAIL_ALREADY_EXISTS": "Bu e-posta zaten kayıtlı",
		"WEAK_PASSWORD": "Şifre çok zayıf, daha güçlü bir şifre seçin",
		"registerFailed": "Kayıt işlemi başarısız",
		"serverError": "Sunucu hatası, lütfen daha sonra tekrar deneyin",
		"networkError": "Ağ bağlantı hatası, internet bağlantınızı kontrol edin"
	},

	"home":{
		"play-b": "Şimdi Oyna",
		"settings-b": "Ayarlar",
		"profile-b": "Profil",
		"tournament-b": "Turnuva",
		"logout-b": "Çıkış Yap"
	},
	"settings": {
		"title": "Ayarlar",
		"ball-color": "Top Rengi",
		"language-select": "Dil Seçimi",
		"save-button": "Ayarları Kaydet"
	},
	"profile": {
		"title": "Profil Ayarları",
		"username": "Kullanıcı Adı"
	},
	"profile-avatar-change-hint": "Avatarı değiştirmek için tıklayın",
	"profile-avatar-select-title": "Avatar Seçin",
	"profile-avatar-select-subtitle": "Favori avatarınızı seçin",
	"profile-avatar-cancel": "İptal",
	"profile-avatar-success": "Avatar başarıyla değiştirildi!",
	"profile-info-title": "Profil Bilgileri",
	"profile-info-settings-title": "Profil Ayarları",
	"profile-settings": {
		"username": "Kullanıcı Adı",
		"username-placeholder": "Yeni Kullanıcı Adı",
		"email": "E-posta",
		"email-placeholder": "Yeni E-posta",
		"password": "Şifre",
		"password-placeholder": "Yeni Şifre",
		"old-Password": "Eski Şifre",
		"old-password-placeholder": "Eski Şifre",
		"update": "Güncelle"
	},
	"tournament-first-page": {
		"join-title": "Turnuvaya Katıl",
		"join-placeholder": "Turnuva ID Giriniz",
		"join-button": "Turnuvaya Katıl",
		"create-title": "Turnuva Oluştur",
		"create-placeholder": "Turnuva Adı Giriniz",
		"create-button": "Turnuva Oluştur",
		"m-title-for-showjoin": "Turnuva Oluştur",
		"m-title-for-showcreate": "Turnuvaya Katıl",
		"m-join-button": "--->",
		"m-create-button": "<---"
	},
	"tournament-second-page":{
		"DetailsCard": {
			"header": "Turnuva Bilgileri",
			"header2": "Detaylı istatistikler",
			"button":{
				"refresh": "--Yenile",
				"tree": "--Turnuva Ağacı",
				"exit": "--Cıkış",
			},
			"IdCard": "Turnuva ID",
			"IdCard-description": "Turnuvaya katılım için benzersiz kod",
			'Creater': "Turnuva oluşturucusu",
			'Creater-description': "Turnuvayı organize eden kişi",
			'ActivePlayer': "Aktif Oyuncu",
			'ActivePlayer-description': "Aktif katılımcı sayısı ve kapasite",
			'Status': "Statu",
			'Status-description' : "Turnuva mevcut durumu",
		},
		"AdminPanel":{
			"title": "--Admin Paneli",
			"Button": {
				"active": "TURNUVAYI BAŞLAT",
				"deactive-1": "OYUNCU BEKLENİYOR (1/2)",
				"deactive-2": "TURNUVA DOLU (10/10)"
			},
			"Button2": {
				"active": "Başlatılabilir",
				"deactive-1": "Daha fazla oyuncu gerekli",
				"deactive-2": "Turnuva dolu",
				"description-1" : "En az 2 oyuncu gerekli",
				"description-2" : "Maksimum 10 oyuncu"
			}

		},
		"PlayersPanel": {
			"title":"--Katılımcılar",
			"title2": "--Turnuva oyuncuları",
			"PlayerCard": {
				"Role":{
					"Admin": "Admin",
					"Player": "Oyuncu"
				} 
			},
			"CapacityIndicator":{
				"capacity": "Kapasite",
				"min": "Min: 2",
				"max": "Max: 10"
			},
			"PlayButton": "OYUNA BAŞLA"
		},
		"title":"Turnuva Kontrol Paneli",
		"exit": "Turnuvadan Çık",
		"tournament-id": "Turnuva ID",
		"tournament-name": "Turnuva Adı",
		"tournament-creater": "Turnuva Oluşturan",
		"tournament-total-players": "Toplam Oyuncu",
		"tournament-joined-players": "Katılan Oyuncular",
		"play": "Oyna"
	},
	"game":{
		"loading": "Oyun Sayfası Yükleniyor...",

		"vs-compiter-b":"Bilgisayara Karşı Oyna",
		"vs-compiter-difficulty-b-easy": "Kolay",
		"vs-compiter-difficulty-b-medium": "Orta",
		"vs-compiter-difficulty-b-hard": "Zor",

		"find-reval-b": "Rakip Bul",
		"find-reval-waiting": "Rakip Bekleniyor...",
		
		"local-game": "Yerel Oyun",
		
		"tournament": "Turnuva",
		//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		"strat": "__Oyunu Başlat",
		"continue": "Oyuna Devam Et",
		"new": "Yeni Oyun Başlat",
		"goHome": "Ana Sayfaya Dön"
	},
	"play" :{
		"Menu": {
			"title": "Pong Arena",
			"subTitle" : "Oyun Modunu Seçin",
			"Play-Button": {
				"AI": "Yapay Zekaya Karşı",
				"Local": "Yerel Oyun",
				"Online": "Çevrim İçi Oyun"
			},
		},
		"Difficulty":{

		}
	},
	"toast": {
		"success": {
			"username-updated": "Kullanıcı adı başarıyla güncellendi! ✨",
			"email-updated": "Email başarıyla güncellendi! 📧",
			"password-updated": "Şifre başarıyla güncellendi! 🔒"
		},
		"error": {
			"field-required": "Lütfen bir değer girin!",
			"old-password-field-missing": "Eski şifre alanı bulunamadı!",
			"new-password-field-missing": "Yeni şifre alanı bulunamadı!",
			"old-password-required": "Lütfen eski şifrenizi girin!",
			"new-password-required": "Lütfen yeni şifrenizi girin!",
			"password-min-length": "Yeni şifre en az 3 karakter olmalıdır!",
			"old-password-incorrect": "Eski şifre hatalı!",
			"username-update-failed": "Kullanıcı adı güncellenemedi!",
			"email-update-failed": "Email güncellenemedi!",
			"password-update-failed": "Şifre güncellenemedi!",
			"update-error": "Güncelleme sırasında hata oluştu!",
			"password-update-error": "Şifre güncelleme sırasında hata oluştu!"
		}
	}
}


const fr = {
	"singin": {
		"register-b": "S'inscrire",
		"email-or-nickname-i": "E-mail ou Pseudo",
		"passwor-i": "Mot de passe",
		"login-b": "Se connecter",
		"no-account": "Vous n'avez pas de compte ?"
	},
	"singin-success": "Connexion réussie ! Redirection...",
	"singin-errors": {
		"required": {
			"email": "E-mail ou Pseudo requis",
			"password": "Mot de passe requis"
		},
		"invalid": {
			"email": "Format d'e-mail invalide"
		},
		"INVALID_CREDENTIALS": "E-mail/pseudo ou mot de passe invalide",
		"networkError": "Erreur de connexion réseau, vérifiez votre connexion internet"
	},
	"register": {
		"title": "S'inscrire",
		"singin-b": "Se connecter",
		"name": "Entrez votre nom",
		"surname": "Entrez votre prénom",
		"username": "Entrez votre nom d'utilisateur",
		"email": "Entrez votre e-mail",
		"password": "Entrez votre mot de passe",
		"confirmPassword": "Confirmez le mot de passe",
		"register": "S'inscrire"
	},
	"register-success": "Inscription réussie ! Veuillez vous connecter.",
	"register-errors": {
		"required": {
			"name": "Le nom est requis",
			"surname": "Le prénom est requis",
			"username": "Le nom d'utilisateur est requis",
			"email": "L'e-mail est requis",
			"password": "Le mot de passe est requis",
			"confirmPassword": "La confirmation du mot de passe est requise"
		},
		"minlength": {
			"name": "Le nom doit contenir au moins 3 caractères",
			"surname": "Le prénom doit contenir au moins 3 caractères",
			"username": "Le nom d'utilisateur doit contenir au moins 3 caractères",
			"password": "Le mot de passe doit contenir au moins 6 caractères",
			"confirmPassword": "La confirmation du mot de passe doit contenir au moins 6 caractères"
		},
		"maxlength": {
			"username": "Le nom d'utilisateur doit contenir au plus 20 caractères",
			"password": "Le mot de passe doit contenir au plus 20 caractères"
		},
		"invalidCharacters": {
			"username": "Caractères invalides pour le nom d'utilisateur (a-zA-Z0-9_.)",
			"email": "Format d'e-mail invalide"
		},
		"passwordMismatch": "Les mots de passe ne correspondent pas",
		"exists": {
			"username": "Ce nom d'utilisateur est déjà pris",
			"email": "Cet e-mail est déjà enregistré"
		},
		"USERNAME_ALREADY_EXISTS": "Ce nom d'utilisateur est déjà pris",
		"EMAIL_ALREADY_EXISTS": "Cet e-mail est déjà enregistré",
		"WEAK_PASSWORD": "Le mot de passe est trop faible, choisissez un mot de passe plus fort",
		"registerFailed": "Échec de l'inscription",
		"serverError": "Erreur serveur, veuillez réessayer plus tard",
		"networkError": "Erreur de connexion réseau, vérifiez votre connexion internet"
	},
	"home": {
		"play-b": "Jouer maintenant",
		"settings-b": "Paramètres",
		"profile-b": "Profil",
		"tournament-b": "Tournoi",
		"logout-b": "Déconnexion"
	},
	"settings": {
		"title": "Paramètres",
		"ball-color": "Couleur de la balle",
		"language-select": "Sélection de la langue",
		"save-button": "Enregistrer les paramètres"
	},
	"profile": {
		"title": "Paramètres de profil",
		"username": "Nom d'utilisateur"
	},
	"profile-avatar-change-hint": "Cliquez pour changer d'avatar",
	"profile-avatar-select-title": "Sélectionner un avatar",
	"profile-avatar-select-subtitle": "Choisissez votre avatar préféré",
	"profile-avatar-cancel": "Annuler",
	"profile-avatar-success": "Avatar changé avec succès!",
	"profile-info-title": "Informations de profil",
	"profile-info-settings-title": "Paramètres de profil",
	"profile-settings": {
		username: "Nom d'utilisateur",
		usernamePlaceholder: "Nouveau nom d'utilisateur",
		email: "E-mail",
		emailPlaceholder: "Nouvel e-mail",
		password: "Mot de passe",
		passwordPlaceholder: "Nouveau mot de passe",
		"old-Password": "Ancien mot de passe",
		"old-password-placeholder": "Ancien mot de passe",
		update: "Mettre à jour"
	},
	"tournament-first-page": {
		"join-title": "Rejoindre un tournoi",
		"join-placeholder": "Entrez l'ID du tournoi",
		"join-button": "Rejoindre le tournoi",
		"create-title": "Créer un tournoi",
		"create-placeholder": "Entrez le nom du tournoi",
		"create-button": "Créer un tournoi",
		"m-title-for-showjoin": "Créer un tournoi",
		"m-title-for-showcreate": "Rejoindre un tournoi",
		"m-join-button": "--->",
		"m-create-button": "<---"
	},
	"tournament-second-page": {
		"exit": "Quitter le tournoi",
		"tournament-id": "ID du tournoi",
		"tournament-name": "Nom du tournoi",
		"tournament-creater": "Créateur du tournoi",
		"tournament-total-players": "Joueurs totaux",
		"tournament-joined-players": "Joueurs inscrits",
		"play": "Jouer"
	},
	"game": {
		"loading": "Chargement de la page de jeu...",
		"vs-compiter-b": "Jouer contre l'ordinateur",
		"vs-compiter-difficulty-b-easy": "Facile",
		"vs-compiter-difficulty-b-medium": "Moyen",
		"vs-compiter-difficulty-b-hard": "Difficile",
		"find-reval-b": "Trouver un adversaire",
		"find-reval-waiting": "En attente d'un adversaire...",
		"local-game": "Jeu local",
		"tournament": "Tournoi",
		"stratt-game": "Démarrer le jeu",
		"continue-game": "Continuer le jeu",
		"new-game": "Démarrer une nouvelle partie",
		"sets": "MANCHES !"
	},
	toast: {
		success: {
			"username-updated": "Nom d'utilisateur mis à jour avec succès ! ✨",
			"email-updated": "E-mail mis à jour avec succès ! 📧",
			"password-updated": "Mot de passe mis à jour avec succès ! 🔒"
		},
		error: {
			"field-required": "Veuillez saisir une valeur !",
			"old-password-field-missing": "Champ de l'ancien mot de passe introuvable !",
			"new-password-field-missing": "Champ du nouveau mot de passe introuvable !",
			"old-password-required": "Veuillez saisir votre ancien mot de passe !",
			"new-password-required": "Veuillez saisir votre nouveau mot de passe !",
			"password-min-length": "Le nouveau mot de passe doit contenir au moins 3 caractères !",
			"old-password-incorrect": "L'ancien mot de passe est incorrect !",
			"username-update-failed": "Le nom d'utilisateur n'a pas pu être mis à jour !",
			"email-update-failed": "L'e-mail n'a pas pu être mis à jour !",
			"password-update-failed": "Le mot de passe n'a pas pu être mis à jour !",
			"update-error": "Une erreur s'est produite lors de la mise à jour !",
			"password-update-error": "Une erreur s'est produite lors de la mise à jour du mot de passe !"
		}
	}
}


type TranslationObject = {
	[key: string]: string | TranslationObject;
}

type LanguageChangeListener = (language: string) => void;

export class LanguageManager
{
	private static instance: LanguageManager;
	private language: string;
	private languageData: Map<string, TranslationObject>;
	// private listeners: LanguageChangeListener[];
	private languageChoises: string[];

	private constructor() {
		this.language = localStorage.getItem('language') ||'tr'; // Default language
		this.languageChoises = ['tr', 'en', 'fr']; // Available languages
		this.languageData = new Map();
		// this.listeners = [];
		
		console.log('languageManager instance created');
		localStorage.setItem('language', this.language); // Store the default language in local storage
		if (this.language === 'tr')
			this.languageData.set(this.language, tr); // Set default language data
		else if (this.language === 'en')
			this.languageData.set(this.language, en); // Set default language data
		else
			this.languageData.set(this.language, fr); // Set default language data
	}

	public static getInstance(): LanguageManager {
		if (!LanguageManager.instance) { // sadece ilk defa çağırıldığında instance oluştur , tek bir nesne geriye kalan her yerde kullanılacak
			LanguageManager.instance = new LanguageManager();
		}
		return LanguageManager.instance;
	}

	// /*-----Burada yapmamız gereken eklediğimiz eventleri listeye almak ve her birini sonrasında çağırmak---*/
	// public addLanguageChangeListener(listener: LanguageChangeListener): void {
	// 	this.listeners.push(listener);
	// }

	// public removeLanguageChangeListener(listener: LanguageChangeListener): void {
	// 	const index = this.listeners.indexOf(listener);
	// 	if (index !== -1) {
	// 		this.listeners.splice(index, 1);
	// 	}
	// }

	public async setLanguage(language: string): Promise<void> {
		if (this.language === language) return; // No change in language

		this.language = language;
		// alt kısımı farklı bir fonsiyon içerisine alınabilir
		if (this.language === 'tr')
			this.languageData.set(this.language, tr); // Set default language data
		else if (this.language === 'en')
			this.languageData.set(this.language, en); // Set default language data
		else
			this.languageData.set(this.language, fr); // Set default language data

		localStorage.setItem('language', language); // Store the selected language in local storage
		this.applyLanguage();
	}

	public applyLanguage()
	{
		console.log("applyLanguage calisti")
		const translateableElements = document.querySelectorAll<HTMLElement>('[data-langm-key]')

		translateableElements.forEach(el => {
			let rawContent =  exmp.getLang(el.getAttribute('data-langm-key')!);
			const path = el.getAttribute("data-langm-path");
			const data = el.getAttribute('data-langm-tmp');
			if (data)
				rawContent = rawContent + " " + data
			if (path=='palaceholder' && el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
				el.placeholder = rawContent;
			else if(path =='title')
				el.setAttribute(path, rawContent);
			else
				el.innerHTML = rawContent;
		})
	}

	public getLanguage(): string {
		return this.language;
	}

	public getLanguageChoises(): string[] {
		return this.languageChoises;
	}

	public getLang(key: string): string {
		const data = this.languageData.get(this.language);
		if (!data) {
			return key; // Return the key itself if language data is not available
		}

		const keys = key.split('.');
		let currentData: any = data;

		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];

			if (currentData[k] === undefined) {
				return key; // Return the key itself if the translation is not found
			}

			currentData = currentData[k];
			
			if (i === keys.length - 1 && typeof currentData === 'string') {
				return currentData; // Return the translation if it's a string
			}
		}
		return key; // Return the key itself if the translation is not found
	}
}

export const exmp = LanguageManager.getInstance();