export const en = {
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
	  "USERNAME_EXISTS": "This username is already taken",
	  "EMAIL_EXISTS": "This email is already registered",
	  "WEAK_PASSWORD": "Password too weak, please choose a stronger password",
	  "registerFailed": "Registration failed",
	  "serverError": "Server error, please try again later",
	  "networkError": "Network error, please check your connection"
	},
	"register-messages": {
        "verifyEmailBeforeLogin": "Please check your inbox and verify your email before logging in."
    },
	"emailVerify": {
        "title": "Email Verification",
        "subtitle": "Enter the verification code sent to your email.",
        "codePlaceholder": "Verification code",
        "confirm": "Confirm",
        "resend": "Resend email",
        "backToLogin": "Back to login",
        "cooldownText": "{s} seconds left to resend",

        "errors": {
            "missingEmail": "Email information not found. Please register again.",
            "missingCode": "Please enter the verification code.",
            "networkError": "Network error. Please try again."
        }
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
	  "title": "Tournament Control Panel",
	  "home-button": "Home",
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
		"TournamentTime": "Tournament Time",
		"TournamentTime-description": "Tournament start time and duration"
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
		  "Online": "Online Play",
		  "Home": "Return Home"
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
	"tournament-loading": {
		"processing": "Processing...",
		"creating-tournament": "Creating Tournament...",
		"joining-tournament": "Joining Tournament...",
		"starting-tournament": "Starting Tournament...",
		"deleting-tournament": "Deleting Tournament...",
		"leaving-tournament": "Leaving Tournament...",
		"updating": "Updating...",
		"fetching-data": "Fetching tournament data",
		"preparing-system": "Preparing tournament system...",
		"please-wait": "Please wait...",
		"starting-button": "STARTING..."
	},
	"tournament-ui": {
		"tournament-started": "Tournament Started!",
		"players-can-join-matches": "Players can join their matches",
		"start-tournament": "START TOURNAMENT",
		"tournament-can-start": "Tournament Can Start",
		"can-start-with-players": "players can start the tournament",
		"tournament-tree": "🏆 Tournament Bracket",
		"close": "Close",
		"tree-tip": "💡 Tip: You can see match results and player pairings in the bracket",
		"refresh": "Refresh",
		"creating-tree": "Creating Tournament Bracket...",
		"preparing-data": "Preparing data...",
		"starting-game": "STARTING GAME...",
		"start-game": "START GAME",
		"tournament-started-button": "TOURNAMENT STARTED"
	},
	"tournament-tree": {
		 "final": "Final",
		"winner": "Winner",
		"round": "ROUND",
		"vs": "VS",
		"refresh": "Refresh",
		"refreshing": "Refreshing..."
	},
	"tournament-confirmation": {
		"start-title": "🏆 Tournament Start Confirmation",
		"start-message-with-players": "players will start the tournament.",
		"start-warning": "⚠️ This action cannot be undone!",
		"start-accept": "Start",
		"exit-admin-title": "🚨 Tournament Deletion Confirmation",
		"exit-admin-message": "If you leave as admin, the tournament will be deleted!",
		"exit-admin-warning": "⚠️ This action cannot be undone!",
		"exit-admin-accept": "Delete",
		"exit-participant-title": "👋 Leave Tournament",
		"exit-participant-message": "Are you sure you want to leave the tournament?",
		"exit-participant-accept": "Leave",
		"cancel": "Cancel"
	},
	"confirmation-dialog": {
		"leave-page-title": "⚠️ Leave Page Confirmation",
		"leave-page-message": "Are you sure you want to leave the page?",
		"accept": "Leave",
		"cancel": "Cancel"
	},
	"tournament-waiting": "Waiting",
	"tournament-ongoing": "Ongoing",
	"tournament-finished": "Finished", 
	"tournament-unknown": "Unknown",
	"tournament-time-subtitle": "Tournament start time and duration"
};