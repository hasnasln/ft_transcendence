
up: build-frontend proxy game auth tournament logging monitoring

down:
	docker compose -f docker-compose.proxy.yml down
	docker compose -f docker-compose.game.yml down
	docker compose -f docker-compose.auth.yml down
	docker compose -f docker-compose.tournament.yml down
	docker compose -f docker-compose.logging.yml down
	docker compose -f docker-compose.monitoring.yml down

build-frontend:
	npm install --prefix frontend/ft_trancendence/Frontend
	npm run build --prefix frontend/ft_trancendence/Frontend

proxy:
	docker compose -f docker-compose.proxy.yml up -d

game:
	docker compose -f docker-compose.game.yml up -d

auth:
	docker compose -f docker-compose.auth.yml up -d

tournament:
	docker compose -f docker-compose.tournament.yml up -d

logging:
	docker compose -f docker-compose.logging.yml up -d

monitoring:
	docker compose -f docker-compose.monitoring.yml up -d

.PHONY: all build-frontend proxy game auth tournament logging monitoring