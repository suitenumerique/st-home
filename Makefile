# -- Docker
# Get the current user ID to use for docker run and docker exec commands
DOCKER_UID          = $(shell id -u)
DOCKER_GID          = $(shell id -g)
DOCKER_USER         = $(DOCKER_UID):$(DOCKER_GID)
COMPOSE             = DOCKER_USER=$(DOCKER_USER) docker compose


# Front
frontend-install: ## install the frontend locally
	@$(COMPOSE) run --rm frontend-tools npm install
.PHONY: frontend-install

frontend-install-frozen: ## install the frontend locally, following the frozen lockfile
	@$(COMPOSE) run --rm frontend-tools npm ci
.PHONY: frontend-install-frozen

frontend-start:
	@$(COMPOSE) up frontend
	@$(COMPOSE) down
.PHONY: frontend-start

# Data
data-sync:
	@$(COMPOSE) run --rm worker python -m tasks.sync
.PHONY: data-sync

db-reset-sample:
	@$(COMPOSE) run --rm frontend sh -c "npm run db:drop && npm run db:push && npm run db:seed:sample"
.PHONY: db-reset-sample

db-browse:
	@$(COMPOSE) up postgresql-web
.PHONY: db-browse