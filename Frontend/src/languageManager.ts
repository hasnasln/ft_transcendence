const en = {
	"singin": {
	  "register-b": "Register",
	  "email-or-nickname-i": "Email or Nickname",
	  "passwor-i": "Password",
	  "login-b": "Log In",
	  "no-account": "Don’t have an account?"
	},
	"singin-success": "Login successful! Redirecting…",
	"singin-errors": {
	  "required": {
		"email": "Email or nickname required",
		"password": "Password required"
	  },
	  "invalid": {
		"email": "Invalid email format"
	  },
	  "INVALID_CREDENTIALS": "Invalid email/nickname or password",
	  "networkError": "Network error, please check your internet connection"
	},
	"register": {
	  "title": "Register",
	  "singin-b": "Log In",
	  "name": "Enter first name",
	  "surname": "Enter last name",
	  "username": "Enter username",
	  "email": "Enter email",
	  "password": "Enter password",
	  "confirmPassword": "Confirm password",
	  "register": "Register"
	},
	"register-success": "Registration successful! Please log in.",
	"register-errors": {
	  "required": {
		"name": "First name required",
		"surname": "Last name required",
		"username": "Username required",
		"email": "Email required",
		"password": "Password required",
		"confirmPassword": "Please confirm password"
	  },
	  "minlength": {
		"name": "First name must be at least 3 characters",
		"surname": "Last name must be at least 3 characters",
		"username": "Username must be at least 3 characters",
		"password": "Password must be at least 6 characters",
		"confirmPassword": "Confirm password must be at least 6 characters"
	  },
	  "maxlength": {
		"username": "Username must be at most 20 characters",
		"password": "Password must be at most 20 characters"
	  },
	  "invalidCharacters": {
		"username": "Invalid username characters (a‑z A‑Z 0‑9 _ .)",
		"email": "Invalid email format"
	  },
	  "passwordMismatch": "Passwords do not match",
	  "exists": {
		"username": "This username is already taken",
		"email": "This email is already registered"
	  },
	  "USERNAME_ALREADY_EXISTS": "This username is already taken",
	  "EMAIL_ALREADY_EXISTS": "This email is already registered",
	  "WEAK_PASSWORD": "Password too weak, please choose a stronger password",
	  "registerFailed": "Registration failed",
	  "serverError": "Server error, please try again later",
	  "networkError": "Network error, please check your connection"
	},
	"home": {
	  "play-b": "Play Now",
	  "settings-b": "Settings",
	  "profile-b": "Profile",
	  "tournament-b": "Tournament",
	  "logout-b": "Log Out"
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
	  "join-placeholder": "Enter tournament ID",
	  "join-button": "Join Tournament",
	  "create-title": "Create Tournament",
	  "create-placeholder": "Enter tournament name",
	  "create-button": "Create Tournament",
	  "m-title-for-showjoin": "Create Tournament",
	  "m-title-for-showcreate": "Join Tournament",
	  "m-join-button": "--->",
	  "m-create-button": "<---"
	},
	"tournament-second-page": {
	  "DetailsCard": {
		"header": "Tournament Details",
		"header2": "Detailed statistics",
		"button": {
		  "refresh": "--Refresh",
		  "tree": "--Tournament Bracket",
		  "exit": "--Exit"
		},
		"IdCard": "Tournament ID",
		"IdCard-description": "Unique code to join the tournament",
		"Creater": "Tournament creator",
		"Creater-description": "Person organizing the tournament",
		"ActivePlayer": "Active players",
		"ActivePlayer-description": "Current number of participants and capacity",
		"Status": "Status",
		"Status-description": "Current status of the tournament"
	  },
	  "AdminPanel": {
		"title": "--Admin Panel",
		"Button": {
		  "active": "START TOURNAMENT",
		  "deactive-1": "WAITING FOR PLAYERS (1/2)",
		  "deactive-2": "TOURNAMENT FULL (10/10)"
		},
		"Button2": {
		  "active": "Can Start",
		  "deactive-1": "More players needed",
		  "deactive-2": "Tournament full",
		  "description-1": "At least 2 players needed",
		  "description-2": "Maximum 10 players"
		}
	  },
	  "PlayersPanel": {
		"title": "--Participants",
		"title2": "--Tournament players",
		"PlayerCard": {
		  "Role": {
			"Admin": "Admin",
			"Player": "Player"
		  }
		},
		"CapacityIndicator": {
		  "capacity": "Capacity",
		  "min": "Min: 2",
		  "max": "Max: 10"
		},
		"PlayButton": "START GAME"
	  },
	  "title": "Tournament Control Panel",
	  "exit": "Leave Tournament",
	  "tournament-id": "Tournament ID",
	  "tournament-name": "Tournament Name",
	  "tournament-creater": "Tournament Creator",
	  "tournament-total-players": "Total Players",
	  "tournament-joined-players": "Joined Players",
	  "play": "Play"
	},
	"game": {
	  "strat": "Start Game",
	  "continue": "Continue Game",
	  "new": "Start New Game",
	  "goHome": "Return Home"
	},
	"play": {
	  "Menu": {
		"title": "Pong Arena",
		"subTitle": "Select Game Mode",
		"Button": {
		  "AI": "Play vs AI",
		  "Local": "Local Play",
		  "Online": "Online Play"
		}
	  },
	  "Difficulty": {
		"title": "Select Difficulty",
		"Button": {
		  "easy": "Easy",
		  "medium": "Medium",
		  "hard": "Hard"
		}
	  }
	},
	"toast": {
	  "success": {
		"username-updated": "Username updated successfully! ✨",
		"email-updated": "Email updated successfully! 📧",
		"password-updated": "Password updated successfully! 🔒"
	  },
	  "error": {
		"field-required": "Please enter a value!",
		"old-password-field-missing": "Old password field not found!",
		"new-password-field-missing": "New password field not found!",
		"old-password-required": "Please enter your old password!",
		"new-password-required": "Please enter a new password!",
		"password-min-length": "New password must be at least 3 characters!",
		"old-password-incorrect": "Old password is incorrect!",
		"username-update-failed": "Username update failed!",
		"email-update-failed": "Email update failed!",
		"password-update-failed": "Password update failed!",
		"update-error": "Error during update!",
		"password-update-error": "Error during password update!"
	  }
	},
	"auth-messages": {
		"TOKEN_MISSING": "Token missing",
		"INVALID_TOKEN": "Invalid token",
		"TOKEN_VALID": "Token valid",

		"EMAIL_AND_PASSWORD_REQUIRED": "Email and password required",
		"EMAIL_LENGTH_INVALID": "Email length invalid",
		"INVALID_EMAIL_FORMAT": "Invalid email format",
		"INVALID_EMAIL": "Invalid email",
		"INVALID_PASSWORD": "Invalid password",
		"LOGIN_SUCCESS": "Login successful",

		"REGISTRATION_FIELDS_REQUIRED": "Registration fields required",
		"USERNAME_NOT_ALPHANUMERIC": "Username must contain only letters and numbers",
		"USERNAME_LENGTH_INVALID": "Username length invalid",
		"PASSWORD_LENGTH_INVALID": "Password length invalid",
		"USERNAME_EXISTS": "This username already exists",
		"EMAIL_EXISTS": "This email address already exists",
		"USER_REGISTERED": "User registered successfully",

		"USER_NOT_FOUND": "User not found",
		"EMAIL_ALREADY_IN_USE": "Email address already in use",
		"USER_UPDATED": "User updated",
		"NO_CHANGES_MADE": "No changes made",

		"EMAIL_SENT_SUCCESSFULLY": "Email sent successfully",
		"EMAIL_SEND_FAILED": "Failed to send email",
		"USER_NOT_VERIFIED": "User not verified",
		"USER_ALREADY_VERIFIED": "User already verified"
	},
	"tournament-messages": {
	
		"ERR_INVALID_TOKEN": "Invalid token",
		"ERR_INTERNAL_SERVER": "Internal server error",
		"ERR_TOURNAMENT_NAME_REQUIRED": "Tournament name is required",
		"ERR_TOURNAMENT_NAME_EMPTY": "Tournament name cannot be empty",
		"ERR_TOURNAMENT_NAME_INVALID_CHARS": "Tournament name contains invalid characters",
		"ERR_TOURNAMENT_NAME_EXISTS": "This tournament name already exists",
		"ERR_PARTICIPANT_ALREADY_IN_TOURNAMENT": "Participant is already in the tournament",
		"ERR_TOURNAMENT_NAME_TOO_LONG": "Tournament name is too long",
		"SUCCESS_TOURNAMENT_CREATED": "Tournament created successfully",
		"ERR_MAX_10_PARTICIPANTS": "Maximum 10 participants allowed",
		"ERR_TOURNAMENT_NOT_JOINABLE": "Tournament is not joinable",
		"ERR_PARTICIPANT_ALREADY_JOINED": "Participant already joined",
		"ERR_TOURNAMENT_NOT_FOUND": "Tournament not found",
		"ERR_PARTICIPANT_NOT_FOUND": "Participant not found",
		"ERR_ADMIN_CANNOT_LEAVE": "Admin cannot leave the tournament",
		"ERR_NO_ONGOING_ROUNDS": "No ongoing rounds found",
		"ERR_NO_COMPLETED_ROUNDS": "No completed rounds found",
		"ERR_TOURNAMENT_NOT_DELETABLE": "Tournament cannot be deleted",
		"ERR_ONLY_ADMIN_CAN_DELETE": "Only admin can delete the tournament",
		"ERR_TOURNAMENT_NOT_FOUND_UUID": "Tournament not found by UUID",
		"ERR_ONLY_ADMIN_CAN_START": "Only admin can start the tournament",
		"ERR_TOURNAMENT_NOT_STARTABLE": "Tournament cannot be started",
		"ERR_NOT_ENOUGH_PARTICIPANTS": "Not enough participants",
		"ERR_MATCH_NOT_JOINABLE": "Match is not joinable",
		"ERR_PARTICIPANT_DISCONNECTED": "Participant disconnected",
		"SUCCESS_WINNER_ADDED": "Winner added successfully",
		"SUCCESS_TOURNAMENT_COMPLETED": "Tournament completed successfully",
		"SUCCESS_NEXT_ROUND_STARTED": "Next round started successfully",
		"ERR_TOURNAMENT_NOT_MATCH_JOINABLE": "Tournament is not joinable for matches",
		"ERR_ROUND_NOT_FOUND": "Round not found",
		"ERR_ROUND_COMPLETED": "Round already completed",
		"ERR_MATCH_STATE_NOT_JOINABLE": "Match is not joinable in current state",
		"ERR_MATCH_STATE_NOT_LEAVABLE": "Match cannot be left in current state",
		"ERR_PARTICIPANT_NOT_IN_TOURNAMENT": "Participant is not in the tournament",
		"ERR_PARTICIPANT_ALREADY_IN_MATCH": "Participant is already in a match",
		"ERR_PARTICIPANT_ALREADY_DISCONNECTED": "Participant already disconnected",
		"SUCCESS_PARTICIPANT_JOINED": "Participant joined successfully",
		"SUCCESS_PARTICIPANT_LEFT": "Participant left the tournament",
		"SUCCESS_TOURNAMENT_DELETED": "Tournament deleted successfully",
		"SUCCESS_PARTICIPANTS_RETRIEVED": "Participants retrieved successfully",
		"SUCCESS_TOURNAMENT_RETRIEVED_UUID": "Tournament retrieved successfully by UUID",
		"SUCCESS_TOURNAMENT_STARTED": "Tournament started successfully",
		"SUCCESS_PARTICIPANT_JOINED_MATCH": "Participant joined the match",
		"SUCCESS_PARTICIPANT_LEAVED_MATCH": "Participant left the match",
		"ERR_PARTICIPANT_NOT_FOUND_ROUND": "Participant not found in this round",
		"ERR_TOURNAMENT_NOT_ADD_WINNERS": "Cannot add winners to the tournament",
		"ERR_NO_ROUNDS_FOUND": "No rounds found",
		"ERR_ROUND_NUMBER_MISMATCH": "Round number mismatch",
		"ERR_WINNER_NOT_IN_MATCHES": "Winner not found in matches",
		"ERR_RIVAL_ALREADY_WON": "Opponent has already won",
		"ERR_WINNER_ALREADY_ADDED": "Winner already added"
},
};

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
			'Status': "Durum",
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
		"strat": "Oyunu Başlat",
		"continue": "Oyuna Devam Et",
		"new": "Yeni Oyun Başlat",
		"goHome": "Ana Sayfaya Dön"
	},
	"play" :{
		"Menu": {
			"title": "Pong Arena",
			"subTitle" : "Oyun Modunu Seçin",
			"Button": {
				"AI": "Yapay Zekaya Karşı",
				"Local": "Yerel Oyun",
				"Online": "Çevrim İçi Oyun",
				"Home": "Ana Sayfaya Dön"
			},
		},
		"Difficulty":{
			"title": "Zorluk Seviyesini Seçin",
			"Button": {
				"easy": "Kolay",
				"medium": "Orta",
				"hard": "Zor"
			}
		}
	},
	"overlays":{
		"Tournament": {
			"first_page":{
				"create": {
					"success": {
						"title":"İşlem Başarılı !",
						"message":{
							
						}
					},
					"fail": {
						
					}
				}

			},
			"second_page": {

			},
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
	},
		"auth-messages": {

		"TOKEN_MISSING": "Token eksik",
		"INVALID_TOKEN": "Geçersiz token",
		"TOKEN_VALID": "Token geçerli",

		"EMAIL_AND_PASSWORD_REQUIRED": "E-posta ve şifre gerekli",
		"EMAIL_LENGTH_INVALID": "E-posta uzunluğu geçersiz",
		"INVALID_EMAIL_FORMAT": "Geçersiz e-posta formatı",
		"INVALID_EMAIL": "Geçersiz e-posta",
		"INVALID_PASSWORD": "Geçersiz şifre",
		"LOGIN_SUCCESS": "Giriş başarılı",

		"REGISTRATION_FIELDS_REQUIRED": "Kayıt alanları gerekli",
		"USERNAME_NOT_ALPHANUMERIC": "Kullanıcı adı yalnızca harf ve rakam içermelidir",
		"USERNAME_LENGTH_INVALID": "Kullanıcı adı uzunluğu geçersiz",
		"PASSWORD_LENGTH_INVALID": "Şifre uzunluğu geçersiz",
		"USERNAME_EXISTS": "Bu kullanıcı adı zaten mevcut",
		"EMAIL_EXISTS": "Bu e-posta adresi zaten mevcut",
		"USER_REGISTERED": "Kullanıcı başarıyla kaydedildi",

		"USER_NOT_FOUND": "Kullanıcı bulunamadı",
		"EMAIL_ALREADY_IN_USE": "E-posta adresi zaten kullanımda",
		"USER_UPDATED": "Kullanıcı güncellendi",
		"NO_CHANGES_MADE": "Herhangi bir değişiklik yapılmadı",

		"EMAIL_SENT_SUCCESSFULLY": "E-posta başarıyla gönderildi",
		"EMAIL_SEND_FAILED": "E-posta gönderilemedi",
		"USER_NOT_VERIFIED": "Kullanıcı doğrulanmamış",
		"USER_ALREADY_VERIFIED": "Kullanıcı zaten doğrulanmış"
},
	"tournament-messages": {
		"ERR_INVALID_TOKEN": "Geçersiz token",
		"ERR_INTERNAL_SERVER": "Sunucu hatası",
		"ERR_TOURNAMENT_NAME_REQUIRED": "Turnuva adı gerekli",
		"ERR_TOURNAMENT_NAME_EMPTY": "Turnuva adı boş olamaz",
		"ERR_TOURNAMENT_NAME_INVALID_CHARS": "Turnuva adı geçersiz karakterler içeriyor",
		"ERR_TOURNAMENT_NAME_EXISTS": "Bu turnuva adı zaten mevcut",
		"ERR_PARTICIPANT_ALREADY_IN_TOURNAMENT": "Katılımcı zaten turnuvada",
		"ERR_TOURNAMENT_NAME_TOO_LONG": "Turnuva adı çok uzun",
		"SUCCESS_TOURNAMENT_CREATED": "Turnuva başarıyla oluşturuldu",
		"ERR_MAX_10_PARTICIPANTS": "Maksimum 10 katılımcıya izin verilir",
		"ERR_TOURNAMENT_NOT_JOINABLE": "Turnuvaya katılım mümkün değil",
		"ERR_PARTICIPANT_ALREADY_JOINED": "Katılımcı zaten katıldı",
		"ERR_TOURNAMENT_NOT_FOUND": "Turnuva bulunamadı",
		"ERR_PARTICIPANT_NOT_FOUND": "Katılımcı bulunamadı",
		"ERR_ADMIN_CANNOT_LEAVE": "Yönetici turnuvadan ayrılamaz",
		"ERR_NO_ONGOING_ROUNDS": "Devam eden tur bulunmuyor",
		"ERR_NO_COMPLETED_ROUNDS": "Tamamlanan tur bulunmuyor",
		"ERR_TOURNAMENT_NOT_DELETABLE": "Turnuva silinemiyor",
		"ERR_ONLY_ADMIN_CAN_DELETE": "Yalnızca yönetici turnuvayı silebilir",
		"ERR_TOURNAMENT_NOT_FOUND_UUID": "UUID ile turnuva bulunamadı",
		"ERR_ONLY_ADMIN_CAN_START": "Yalnızca yönetici başlatabilir",
		"ERR_TOURNAMENT_NOT_STARTABLE": "Turnuva başlatılamıyor",
		"ERR_NOT_ENOUGH_PARTICIPANTS": "Yeterli katılımcı yok",
		"ERR_MATCH_NOT_JOINABLE": "Maça katılım mümkün değil",
		"ERR_PARTICIPANT_DISCONNECTED": "Katılımcı bağlantıyı kesti",
		"SUCCESS_WINNER_ADDED": "Kazanan başarıyla eklendi",
		"SUCCESS_TOURNAMENT_COMPLETED": "Turnuva başarıyla tamamlandı",
		"SUCCESS_NEXT_ROUND_STARTED": "Sonraki tur başarıyla başlatıldı",
		"ERR_TOURNAMENT_NOT_MATCH_JOINABLE": "Turnuva maça katılım için uygun değil",
		"ERR_ROUND_NOT_FOUND": "Tur bulunamadı",
		"ERR_ROUND_COMPLETED": "Tur zaten tamamlandı",
		"ERR_MATCH_STATE_NOT_JOINABLE": "Mevcut maç durumunda katılım mümkün değil",
		"ERR_MATCH_STATE_NOT_LEAVABLE": "Mevcut maç durumunda ayrılamazsınız",
		"ERR_PARTICIPANT_NOT_IN_TOURNAMENT": "Katılımcı turnuvada değil",
		"ERR_PARTICIPANT_ALREADY_IN_MATCH": "Katılımcı zaten maçta",
		"ERR_PARTICIPANT_ALREADY_DISCONNECTED": "Katılımcı zaten bağlantıyı kesmiş",
		"SUCCESS_PARTICIPANT_JOINED": "Katılımcı başarıyla katıldı",
		"SUCCESS_PARTICIPANT_LEFT": "Katılımcı turnuvadan ayrıldı",
		"SUCCESS_TOURNAMENT_DELETED": "Turnuva başarıyla silindi",
		"SUCCESS_PARTICIPANTS_RETRIEVED": "Katılımcılar başarıyla alındı",
		"SUCCESS_TOURNAMENT_RETRIEVED_UUID": "Turnuva UUID ile başarıyla getirildi",
		"SUCCESS_TOURNAMENT_STARTED": "Turnuva başarıyla başlatıldı",
		"SUCCESS_PARTICIPANT_JOINED_MATCH": "Katılımcı maça katıldı",
		"SUCCESS_PARTICIPANT_LEAVED_MATCH": "Katılımcı maçtan ayrıldı",
		"ERR_PARTICIPANT_NOT_FOUND_ROUND": "Katılımcı bu turda bulunamadı",
		"ERR_TOURNAMENT_NOT_ADD_WINNERS": "Turnuvaya kazanan eklenemiyor",
		"ERR_NO_ROUNDS_FOUND": "Hiç tur bulunamadı",
		"ERR_ROUND_NUMBER_MISMATCH": "Tur numarası uyuşmuyor",
		"ERR_WINNER_NOT_IN_MATCHES": "Kazanan maçlarda bulunmuyor",
		"ERR_RIVAL_ALREADY_WON": "Rakip zaten kazandı",
		"ERR_WINNER_ALREADY_ADDED": "Kazanan zaten eklendi"
	},
}


const fr = {
	"singin": {
	  "register-b": "S’inscrire",
	  "email-or-nickname-i": "E‑mail ou pseudo",
	  "passwor-i": "Mot de passe",
	  "login-b": "Se connecter",
	  "no-account": "Vous n’avez pas de compte?"
	},
	"singin-success": "Connexion réussie ! Redirection…",
	"singin-errors": {
	  "required": {
		"email": "E‑mail ou pseudo requis",
		"password": "Mot de passe requis"
	  },
	  "invalid": {
		"email": "Format d’e‑mail invalide"
	  },
	  "INVALID_CREDENTIALS": "E‑mail/pseudo ou mot de passe invalide",
	  "networkError": "Erreur réseau, veuillez vérifier votre connexion Internet"
	},
	"register": {
	  "title": "S’inscrire",
	  "singin-b": "Se connecter",
	  "name": "Entrez le prénom",
	  "surname": "Entrez le nom",
	  "username": "Entrez le nom d’utilisateur",
	  "email": "Entrez l’e‑mail",
	  "password": "Entrez le mot de passe",
	  "confirmPassword": "Confirmez le mot de passe",
	  "register": "S’inscrire"
	},
	"register-success": "Inscription réussie ! Veuillez vous connecter.",
	"register-errors": {
	  "required": {
		"name": "Prénom requis",
		"surname": "Nom requis",
		"username": "Nom d’utilisateur requis",
		"email": "E‑mail requis",
		"password": "Mot de passe requis",
		"confirmPassword": "Veuillez confirmer le mot de passe"
	  },
	  "minlength": {
		"name": "Le prénom doit contenir au moins 3 caractères",
		"surname": "Le nom doit contenir au moins 3 caractères",
		"username": "Le nom d’utilisateur doit contenir au moins 3 caractères",
		"password": "Le mot de passe doit contenir au moins 6 caractères",
		"confirmPassword": "La confirmation du mot de passe doit contenir au moins 6 caractères"
	  },
	  "maxlength": {
		"username": "Le nom d’utilisateur doit contenir au maximum 20 caractères",
		"password": "Le mot de passe doit contenir au maximum 20 caractères"
	  },
	  "invalidCharacters": {
		"username": "Caractères invalides pour le nom d’utilisateur (a‑z A‑Z 0‑9 _ .)",
		"email": "Format d’e‑mail invalide"
	  },
	  "passwordMismatch": "Les mots de passe ne correspondent pas",
	  "exists": {
		"username": "Ce nom d’utilisateur est déjà pris",
		"email": "Cet e‑mail est déjà enregistré"
	  },
	  "USERNAME_ALREADY_EXISTS": "Ce nom d’utilisateur est déjà pris",
	  "EMAIL_ALREADY_EXISTS": "Cet e‑mail est déjà enregistré",
	  "WEAK_PASSWORD": "Mot de passe trop faible, veuillez choisir un mot plus sécurisé",
	  "registerFailed": "Échec de l’inscription",
	  "serverError": "Erreur serveur, veuillez réessayer plus tard",
	  "networkError": "Erreur réseau, veuillez vérifier votre connexion"
	},
	"home": {
	  "play-b": "Jouer maintenant",
	  "settings-b": "Paramètres",
	  "profile-b": "Profil",
	  "tournament-b": "Tournoi",
	  "logout-b": "Se déconnecter"
	},
	"settings": {
	  "title": "Paramètres",
	  "ball-color": "Couleur de la balle",
	  "language-select": "Sélection de la langue",
	  "save-button": "Enregistrer les paramètres"
	},
	"profile": {
	  "title": "Paramètres du profil",
	  "username": "Nom d’utilisateur"
	},
	"profile-avatar-change-hint": "Cliquez pour changer l’avatar",
	"profile-avatar-select-title": "Sélectionnez un avatar",
	"profile-avatar-select-subtitle": "Choisissez votre avatar préféré",
	"profile-avatar-cancel": "Annuler",
	"profile-avatar-success": "Avatar changé avec succès !",
	"profile-info-title": "Informations de profil",
	"profile-info-settings-title": "Paramètres du profil",
	"profile-settings": {
	  "username": "Nom d’utilisateur",
	  "username-placeholder": "Nouveau nom d’utilisateur",
	  "email": "E‑mail",
	  "email-placeholder": "Nouvel e‑mail",
	  "password": "Mot de passe",
	  "password-placeholder": "Nouveau mot de passe",
	  "old-Password": "Ancien mot de passe",
	  "old-password-placeholder": "Ancien mot de passe",
	  "update": "Mettre à jour"
	},
	"tournament-first-page": {
	  "join-title": "Rejoindre le tournoi",
	  "join-placeholder": "Entrez l’ID du tournoi",
	  "join-button": "Rejoindre le tournoi",
	  "create-title": "Créer un tournoi",
	  "create-placeholder": "Entrez le nom du tournoi",
	  "create-button": "Créer le tournoi",
	  "m-title-for-showjoin": "Créer un tournoi",
	  "m-title-for-showcreate": "Rejoindre le tournoi",
	  "m-join-button": "--->",
	  "m-create-button": "<---"
	},
	"tournament-second-page": {
	  "DetailsCard": {
		"header": "Détails du tournoi",
		"header2": "Statistiques détaillées",
		"button": {
		  "refresh": "--Rafraîchir",
		  "tree": "--Arbre du tournoi",
		  "exit": "--Quitter"
		},
		"IdCard": "ID du tournoi",
		"IdCard-description": "Code unique pour rejoindre le tournoi",
		"Creater": "Créateur du tournoi",
		"Creater-description": "Personne organisant le tournoi",
		"ActivePlayer": "Joueurs actifs",
		"ActivePlayer-description": "Nombre actuel de participants et capacité",
		"Status": "Statut",
		"Status-description": "Statut actuel du tournoi"
	  },
	  "AdminPanel": {
		"title": "--Panneau Admin",
		"Button": {
		  "active": "DÉMARRER LE TOURNOI",
		  "deactive-1": "EN ATTENTE DE JOUEURS (1/2)",
		  "deactive-2": "TOURNOI COMPLET (10/10)"
		},
		"Button2": {
		  "active": "Peut démarrer",
		  "deactive-1": "Plus de joueurs nécessaires",
		  "deactive-2": "Tournoi complet",
		  "description-1": "Au moins 2 joueurs nécessaires",
		  "description-2": "Maximum 10 joueurs"
		}
	  },
	  "PlayersPanel": {
		"title": "--Participants",
		"title2": "--Joueurs du tournoi",
		"PlayerCard": {
		  "Role": {
			"Admin": "Admin",
			"Player": "Joueur"
		  }
		},
		"CapacityIndicator": {
		  "capacity": "Capacité",
		  "min": "Min : 2",
		  "max": "Max : 10"
		},
		"PlayButton": "DÉMARRER LE JEU"
	  },
	  "title": "Panneau de contrôle du tournoi",
	  "exit": "Quitter le tournoi",
	  "tournament-id": "ID du tournoi",
	  "tournament-name": "Nom du tournoi",
	  "tournament-creater": "Créateur du tournoi",
	  "tournament-total-players": "Nombre total de joueurs",
	  "tournament-joined-players": "Joueurs inscrits",
	  "play": "Jouer"
	},
	"game": {
	  "strat": "Démarrer le jeu",
	  "continue": "Continuer le jeu",
	  "new": "Commencer un nouveau jeu",
	  "goHome": "Retour à l’accueil"
	},
	"play": {
	  "Menu": {
		"title": "Pong Arena",
		"subTitle": "Sélectionnez le mode de jeu",
		"Button": {
		  "AI": "Jouer contre l’IA",
		  "Local": "Jeu local",
		  "Online": "Jeu en ligne"
		}
	  },
	  "Difficulty": {
		"title": "Choisissez la difficulté",
		"Button": {
		  "easy": "Facile",
		  "medium": "Moyen",
		  "hard": "Difficile"
		}
	  }
	},
	"toast": {
	  "success": {
		"username-updated": "Nom d’utilisateur mis à jour avec succès ! ✨",
		"email-updated": "E‑mail mis à jour avec succès ! 📧",
		"password-updated": "Mot de passe mis à jour avec succès ! 🔒"
	  },
	  "error": {
		"field-required": "Veuillez entrer une valeur !",
		"old-password-field-missing": "Champ ancien mot de passe introuvable !",
		"new-password-field-missing": "Champ nouveau mot de passe introuvable !",
		"old-password-required": "Veuillez entrer votre ancien mot de passe !",
		"new-password-required": "Veuillez entrer un nouveau mot de passe !",
		"password-min-length": "Le nouveau mot de passe doit contenir au moins 3 caractères !",
		"old-password-incorrect": "Ancien mot de passe incorrect !",
		"username-update-failed": "Échec de la mise à jour du nom d’utilisateur !",
		"email-update-failed": "Échec de la mise à jour de l’e‑mail !",
		"password-update-failed": "Échec de la mise à jour du mot de passe !",
		"update-error": "Erreur lors de la mise à jour !",
		"password-update-error": "Erreur lors de la mise à jour du mot de passe !"
	  }
	},
	"auth-messages": {
		"TOKEN_MISSING": "Jeton manquant",
		"INVALID_TOKEN": "Jeton invalide",
		"TOKEN_VALID": "Jeton valide",

		"EMAIL_AND_PASSWORD_REQUIRED": "E-mail et mot de passe requis",
		"EMAIL_LENGTH_INVALID": "Longueur de l’e-mail invalide",
		"INVALID_EMAIL_FORMAT": "Format de l’e-mail invalide",
		"INVALID_EMAIL": "E-mail invalide",
		"INVALID_PASSWORD": "Mot de passe invalide",
		"LOGIN_SUCCESS": "Connexion réussie",

		"REGISTRATION_FIELDS_REQUIRED": "Champs d’inscription requis",
		"USERNAME_NOT_ALPHANUMERIC": "Le nom d’utilisateur doit contenir uniquement des lettres et des chiffres",
		"USERNAME_LENGTH_INVALID": "Longueur du nom d’utilisateur invalide",
		"PASSWORD_LENGTH_INVALID": "Longueur du mot de passe invalide",
		"USERNAME_EXISTS": "Ce nom d’utilisateur existe déjà",
		"EMAIL_EXISTS": "Cette adresse e-mail existe déjà",
		"USER_REGISTERED": "Utilisateur enregistré avec succès",

		"USER_NOT_FOUND": "Utilisateur non trouvé",
		"EMAIL_ALREADY_IN_USE": "Adresse e-mail déjà utilisée",
		"USER_UPDATED": "Utilisateur mis à jour",
		"NO_CHANGES_MADE": "Aucun changement effectué",

		"EMAIL_SENT_SUCCESSFULLY": "E-mail envoyé avec succès",
		"EMAIL_SEND_FAILED": "Échec de l’envoi de l’e-mail",
		"USER_NOT_VERIFIED": "Utilisateur non vérifié",
		"USER_ALREADY_VERIFIED": "Utilisateur déjà vérifié"
	},
	"tournament-messages": {
		"ERR_INVALID_TOKEN": "Jeton invalide",
		"ERR_INTERNAL_SERVER": "Erreur interne du serveur",
		"ERR_TOURNAMENT_NAME_REQUIRED": "Le nom du tournoi est requis",
		"ERR_TOURNAMENT_NAME_EMPTY": "Le nom du tournoi ne peut pas être vide",
		"ERR_TOURNAMENT_NAME_INVALID_CHARS": "Le nom du tournoi contient des caractères invalides",
		"ERR_TOURNAMENT_NAME_EXISTS": "Ce nom de tournoi existe déjà",
		"ERR_PARTICIPANT_ALREADY_IN_TOURNAMENT": "Le participant est déjà dans le tournoi",
		"ERR_TOURNAMENT_NAME_TOO_LONG": "Le nom du tournoi est trop long",
		"SUCCESS_TOURNAMENT_CREATED": "Tournoi créé avec succès",
		"ERR_MAX_10_PARTICIPANTS": "Maximum 10 participants autorisés",
		"ERR_TOURNAMENT_NOT_JOINABLE": "Le tournoi n’est pas accessible",
		"ERR_PARTICIPANT_ALREADY_JOINED": "Le participant a déjà rejoint",
		"ERR_TOURNAMENT_NOT_FOUND": "Tournoi introuvable",
		"ERR_PARTICIPANT_NOT_FOUND": "Participant introuvable",
		"ERR_ADMIN_CANNOT_LEAVE": "L’administrateur ne peut pas quitter le tournoi",
		"ERR_NO_ONGOING_ROUNDS": "Aucun tour en cours trouvé",
		"ERR_NO_COMPLETED_ROUNDS": "Aucun tour terminé trouvé",
		"ERR_TOURNAMENT_NOT_DELETABLE": "Le tournoi ne peut pas être supprimé",
		"ERR_ONLY_ADMIN_CAN_DELETE": "Seul l’administrateur peut supprimer le tournoi",
		"ERR_TOURNAMENT_NOT_FOUND_UUID": "Tournoi introuvable par UUID",
		"ERR_ONLY_ADMIN_CAN_START": "Seul l’administrateur peut démarrer le tournoi",
		"ERR_TOURNAMENT_NOT_STARTABLE": "Le tournoi ne peut pas être démarré",
		"ERR_NOT_ENOUGH_PARTICIPANTS": "Pas assez de participants",
		"ERR_MATCH_NOT_JOINABLE": "Le match n’est pas accessible",
		"ERR_PARTICIPANT_DISCONNECTED": "Le participant s’est déconnecté",
		"SUCCESS_WINNER_ADDED": "Vainqueur ajouté avec succès",
		"SUCCESS_TOURNAMENT_COMPLETED": "Tournoi terminé avec succès",
		"SUCCESS_NEXT_ROUND_STARTED": "Prochain tour démarré avec succès",
		"ERR_TOURNAMENT_NOT_MATCH_JOINABLE": "Le tournoi n’est pas accessible pour les matchs",
		"ERR_ROUND_NOT_FOUND": "Tour introuvable",
		"ERR_ROUND_COMPLETED": "Le tour est déjà terminé",
		"ERR_MATCH_STATE_NOT_JOINABLE": "Le match n’est pas accessible dans l’état actuel",
		"ERR_MATCH_STATE_NOT_LEAVABLE": "Impossible de quitter le match dans l’état actuel",
		"ERR_PARTICIPANT_NOT_IN_TOURNAMENT": "Le participant n’est pas dans le tournoi",
		"ERR_PARTICIPANT_ALREADY_IN_MATCH": "Le participant est déjà dans un match",
		"ERR_PARTICIPANT_ALREADY_DISCONNECTED": "Le participant est déjà déconnecté",
		"SUCCESS_PARTICIPANT_JOINED": "Participant rejoint avec succès",
		"SUCCESS_PARTICIPANT_LEFT": "Participant a quitté le tournoi",
		"SUCCESS_TOURNAMENT_DELETED": "Tournoi supprimé avec succès",
		"SUCCESS_PARTICIPANTS_RETRIEVED": "Participants récupérés avec succès",
		"SUCCESS_TOURNAMENT_RETRIEVED_UUID": "Tournoi récupéré avec succès par UUID",
		"SUCCESS_TOURNAMENT_STARTED": "Tournoi démarré avec succès",
		"SUCCESS_PARTICIPANT_JOINED_MATCH": "Participant a rejoint le match",
		"SUCCESS_PARTICIPANT_LEAVED_MATCH": "Participant a quitté le match",
		"ERR_PARTICIPANT_NOT_FOUND_ROUND": "Participant introuvable dans ce tour",
		"ERR_TOURNAMENT_NOT_ADD_WINNERS": "Impossible d’ajouter des vainqueurs au tournoi",
		"ERR_NO_ROUNDS_FOUND": "Aucun tour trouvé",
		"ERR_ROUND_NUMBER_MISMATCH": "Numéro de tour incorrect",
		"ERR_WINNER_NOT_IN_MATCHES": "Vainqueur introuvable dans les matchs",
		"ERR_RIVAL_ALREADY_WON": "L’adversaire a déjà gagné",
		"ERR_WINNER_ALREADY_ADDED": "Vainqueur déjà ajouté"
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
			if (path=='placeholder' && el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement)
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