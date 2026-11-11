# Serve the NotesMD stack (PostgreSQL + API) with Docker Compose.
# Run `make` or `make help` for the target list. Configuration lives in notes-app/.env.

APP_DIR     := notes-app
ENV_FILE    := $(APP_DIR)/.env
ENV_EXAMPLE := $(APP_DIR)/.env.example
COMPOSE     := docker compose -f $(APP_DIR)/docker-compose.yml
BACKUP_DIR  := backups

.DEFAULT_GOAL := help
.PHONY: help env check-env up down restart logs ps health backup db dev test

help: ## List targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  %-10s %s\n", $$1, $$2}'

env: ## Create notes-app/.env from .env.example with generated secrets (never overwrites)
	@if [ -f $(ENV_FILE) ]; then echo "$(ENV_FILE) already exists; not overwriting."; exit 0; fi; \
	db_password=$$(openssl rand -hex 24); \
	jwt_secret=$$(openssl rand -base64 48 | tr -d '\n'); \
	sed -e "s|CHANGE_ME_local_postgres_password|$$db_password|g" \
	    -e "s|^JWT_SECRET=.*|JWT_SECRET=$$jwt_secret|" $(ENV_EXAMPLE) > $(ENV_FILE); \
	chmod 600 $(ENV_FILE); \
	echo "Created $(ENV_FILE) with generated database password and JWT secret."

check-env:
	@if [ ! -f $(ENV_FILE) ]; then echo "Missing $(ENV_FILE). Run 'make env' first."; exit 1; fi
	@if grep -q '^[A-Z_]*=CHANGE_ME' $(ENV_FILE); then \
		echo "$(ENV_FILE) still has CHANGE_ME placeholders:"; grep -o '^[A-Z_]*=CHANGE_ME' $(ENV_FILE) | cut -d= -f1 | sed 's/^/  /'; \
		echo "Replace them (openssl rand -base64 48 for JWT_SECRET) before serving."; exit 1; fi

up: check-env ## Build and start the stack, then wait until it is healthy
	$(COMPOSE) up -d --build --wait
	@$(MAKE) --no-print-directory health

down: ## Stop the stack (notes and accounts are kept in the postgres_data volume)
	$(COMPOSE) down

restart: check-env ## Recreate the API so it reloads notes-app/.env
	$(COMPOSE) up -d --force-recreate --wait api

logs: ## Follow API logs
	$(COMPOSE) logs -f api

ps: ## Show container status
	$(COMPOSE) ps

health: ## Query the API health endpoint
	@address=$$($(COMPOSE) port api 8080 2>/dev/null | sed 's/^0\.0\.0\.0:/localhost:/'); \
	if [ -z "$$address" ]; then echo "API is not running. Start it with 'make up'."; exit 1; fi; \
	echo "GET http://$$address/actuator/health"; \
	curl -fsS "http://$$address/actuator/health" && echo

backup: ## Dump the database to backups/notesmd-<timestamp>.sql
	@mkdir -p $(BACKUP_DIR)
	@file=$(BACKUP_DIR)/notesmd-$$(date +%Y%m%d-%H%M%S).sql; \
	$(COMPOSE) exec -T postgres sh -c 'pg_dump -U "$$POSTGRES_USER" "$$POSTGRES_DB"' > $$file \
		&& echo "Wrote $$file" || { rm -f $$file; exit 1; }

db: check-env ## Start only PostgreSQL (for running the API on the host)
	$(COMPOSE) up -d --wait postgres

dev: db ## Run the API on the host with Gradle against the Compose database
	cd $(APP_DIR)/backend && ./run.sh

test: ## Run the API test suite
	cd $(APP_DIR)/backend && ./gradlew test
