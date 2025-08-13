rm src/styles/*
PAGE_GLOBS="src/pages/home.ts,src/pages/Settings.ts,src/pages/profile.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/home.css --minify
PAGE_GLOBS="src/pages/game.ts,src/pages/game-section/*.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/game.css --minify
PAGE_GLOBS="src/pages/play.ts,src/pages/play-page.ts," npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/play.css --minify
PAGE_GLOBS="src/pages/login.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/login.css --minify
PAGE_GLOBS="src/pages/register.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/register.css --minify
PAGE_GLOBS="src/pages/ServerErrorPage.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/500.css --minify
PAGE_GLOBS="src/pages/NotFoundPage.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/404.css --minify
PAGE_GLOBS="src/pages/TournamentPage.ts,src/pages/tournament/*.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/tournament.css --minify
PAGE_GLOBS="src/pages/tournament/BracketRenderer.ts" npx tailwindcss -c tailwind.page.config.js -i src/bracket.css -o src/styles/bracket.css --minify
PAGE_GLOBS="src/ToastManager.ts,src/router.ts,src/main.ts,src/languageManager.ts,src/components/*.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/others.css --minify
PAGE_GLOBS="src/**/*.ts" npx tailwindcss -c tailwind.page.config.js -i src/style.css -o src/styles/all.css --minify