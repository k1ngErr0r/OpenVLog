SHELL := /bin/sh
PROJECT ?= openvlog

# Helper variables
COMPOSE := docker-compose
BACKEND := backend
FRONTEND := frontend

.PHONY: help bootstrap build up down logs ps migrate backend-shell frontend-shell clean prune restart

help:
	@echo "Common targets:"
	@echo "  make bootstrap      Install node dependencies (frontend & backend)"
	@echo "  make build          Build docker images"
	@echo "  make up             Start stack (detached)"
	@echo "  make down           Stop stack"
	@echo "  make restart        Recreate containers"
	@echo "  make logs           Follow backend logs"
	@echo "  make migrate        Run DB migrations (if script present)"
	@echo "  make backend-shell  Exec /bin/sh into backend container"
	@echo "  make frontend-shell Exec /bin/sh into frontend container"
	@echo "  make clean          Stop & remove containers + named volumes"
	@echo "  make prune          Aggressive docker prune (dangling)"

bootstrap:
	npm --prefix $(BACKEND) install
	npm --prefix $(FRONTEND) install

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

restart: down up
	down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f backend

ps:
	$(COMPOSE) ps

migrate:
	[ -f backend/migrate.js ] && (cd backend && npm run migrate) || echo "No migrate.js script found"

backend-shell:
	$(COMPOSE) exec backend /bin/sh

frontend-shell:
	$(COMPOSE) exec frontend /bin/sh

clean:
	$(COMPOSE) down -v --remove-orphans

prune:
	docker system prune -f
