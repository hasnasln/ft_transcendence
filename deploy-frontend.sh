cd /root/project/frontend/ft_trancendence/
git pull
cd /root/project
make build-frontend
docker compose -f docker-compose.game.yml down
docker compose -f docker-compose.game.yml build
docker compose -f docker-compose.game.yml up -d
