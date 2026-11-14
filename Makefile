.PHONY: dev down logs db-migrate db-generate lint typecheck test build

dev:
	@test -f .env || cp .env.example .env
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f

db-generate:
	pnpm --filter @aegis/web prisma generate

db-migrate:
	pnpm --filter @aegis/web prisma migrate deploy

lint:
	pnpm -r lint
	cd services/ai && uv run ruff check .

typecheck:
	pnpm -r typecheck

test:
	pnpm -r test
	cd services/ai && uv run pytest

build:
	pnpm --filter @aegis/shared build
	pnpm --filter @aegis/web build
