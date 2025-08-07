
BOLD := \033[1m
RESET := \033[0m
GREEN := \033[1;32m

# -- Docker
# Get the current user ID to use for docker run and docker exec commands
COMPOSE             = docker compose
COMPOSE_RUN         = $(COMPOSE) run --build --rm

# ==============================================================================
# RULES

default: help


bootstrap: ## Prepare the project for local development
	@echo "$(BOLD)"
	@echo "╔══════════════════════════════════════════════════════════════════════════════╗"
	@echo "║                                                                              ║"
	@echo "║  🚀 Welcome to ST Home - Public homepage for La Suite territoriale! 🚀       ║"
	@echo "║                                                                              ║"
	@echo "║  This will set up your development environment with :                        ║"
	@echo "║  • Docker containers for all services                                        ║"
	@echo "║  • Database migrations and static files                                      ║"
	@echo "║  • Frontend dependencies and build                                           ║"
	@echo "║  • Environment configuration files                                           ║"
	@echo "║                                                                              ║"
	@echo "║  Services will be available at:                                              ║"
	@echo "║  • Frontend: http://localhost:8950                                           ║"
	@echo "║                                                                              ║"
	@echo "╚══════════════════════════════════════════════════════════════════════════════╝"
	@echo "$(RESET)"
	@echo "$(GREEN)Starting bootstrap process...$(RESET)"
	@echo ""
	@$(MAKE) update
	@$(MAKE) start
	@echo ""
	@echo "$(GREEN)🎉 Bootstrap completed successfully!$(RESET)"
	@echo ""
	@echo "$(BOLD)Next steps:$(RESET)"
	@echo "  • Visit http://localhost:8950 to access the website"
	@echo "  • Run 'make help' to see all available commands"
	@echo ""
.PHONY: bootstrap

update:  ## Update the project dependencies
update: \
	create-env-files
.PHONY: update

create-env-files:  ## Create the environment configuration files
	touch .env.local
.PHONY: create-env-files

start:  ## Start the development environment
	$(COMPOSE) up -d --build frontend-dev
.PHONY: start

stop:  ## Stop the development environment
	$(COMPOSE) stop
.PHONY: stop

# ==============================================================================
# LINTING AND TESTING

lint:  ## Lint and format code
lint: \
	data-lint \
	front-lint
.PHONY: lint

lint-check:  ## Check code linting without fixing
lint-check: \
	data-lint-check \
	front-lint-check
.PHONY: lint-check


# ==============================================================================
# DATA SERVICES

data-freeze-deps:  ## Lock Poetry dependencies
	$(COMPOSE_RUN) data_poetry poetry lock
.PHONY: data-freeze-deps

data-check-deps:  ## Check Poetry configuration
	$(COMPOSE_RUN) data_poetry poetry check
.PHONY: data-check-deps

data-outdated-deps:  ## Show outdated Poetry dependencies
	$(COMPOSE_RUN) data_poetry poetry show --outdated
.PHONY: data-outdated-deps

data-tree-deps:  ## Show Poetry dependency tree
	$(COMPOSE_RUN) data_poetry poetry show --tree
.PHONY: data-tree-deps

data-shell:  ## Open shell in worker container with local environment
	$(COMPOSE_RUN) worker bash
.PHONY: data-shell

data-sync:  ## Run data synchronization tasks
	$(COMPOSE_RUN) worker python -m tasks.sync
.PHONY: data-sync

data-queue-all:  ## Queue all Celery tasks (website and DNS checks)
	$(COMPOSE_RUN) worker sh -c 'celery -A celery_app call tasks.check_website.queue_all && celery -A celery_app call tasks.check_dns.queue_all'
.PHONY: data-queue-all

data-purge:  ## Purge all Celery queues
	$(COMPOSE_RUN) worker sh -c 'celery -A celery_app purge -Q celery,check_website,check_dns -f'
.PHONY: data-purge

data-purge-staging:  ## Purge all Celery queues in staging environment
	$(COMPOSE_RUN) flower_staging celery -A celery_app purge -Q celery,check_website,check_dns -f
.PHONY: data-purge-staging

data-purge-production:  ## Purge all Celery queues in production environment
	$(COMPOSE_RUN) flower_production celery -A celery_app purge -Q celery,check_website,check_dns -f
.PHONY: data-purge-production

data-historize:  ## Run data historization tasks
	$(COMPOSE_RUN) worker python -m tasks.historize
.PHONY: data-historize

data-test:  ## Run data tests
	$(COMPOSE_RUN) -T data_tests
.PHONY: data-test

data-lint:  ## Lint and format data code
	$(COMPOSE_RUN) -T data_tests sh -c 'ruff check --fix . && ruff format .'
.PHONY: data-lint

data-lint-check:  ## Check data code linting without fixing
	$(COMPOSE_RUN) -T data_tests sh -c 'ruff check . && ruff format --check .'
.PHONY: data-lint-check

# ==============================================================================
# FLOWER MONITORING

flower-staging:  ## Start Flower monitoring for staging environment
	$(COMPOSE_RUN) --service-ports flower_staging
.PHONY: flower-staging

flower-production:  ## Start Flower monitoring for production environment
	$(COMPOSE_RUN) --service-ports flower_production
.PHONY: flower-production


# ==============================================================================
# DATABASE

db-browse:  ## Browse the local database with drizzle-kit
	$(COMPOSE_RUN) -p "8954:8954" frontend-dev npm run db:browse | sed 's/0\.0\.0\.0/localhost/g'
.PHONY: db-browse

db-seed:  ## Seed the local database with data from the worker dumps
	$(COMPOSE_RUN) frontend-dev npm run db:seed
.PHONY: db-seed

db-seed-sample:  ## Seed the local database with data from the worker dumps sample
	$(COMPOSE_RUN) frontend-dev npm run db:seed:sample
.PHONY: db-seed-sample

db-drop:  ## Drop the local database
	$(COMPOSE_RUN) frontend-dev npm run db:drop
.PHONY: db-drop

db-push:  ## Push the local database schema to the remote database
	$(COMPOSE_RUN) frontend-dev npm run db:push
.PHONY: db-push

db-reset:  ## Reset the local database
db-reset: \
	db-drop \
	db-push \
	db-seed
.PHONY: db-reset

db-reset-sample:  ## Reset the local database with sample data
db-reset-sample: \
	db-drop \
	db-push \
	db-seed-sample
.PHONY: db-reset

# ==============================================================================
# FRONTEND DEVELOPMENT

front-shell:  ## Open a shell in the frontend container
	$(COMPOSE_RUN) frontend-dev bash
.PHONY: front-shell

front-install-deps:  ## Install the frontend dependencies with the lockfile
	$(COMPOSE_RUN) frontend-dev npm ci
.PHONY: front-install-deps

front-freeze-deps:  ## Freeze the frontend dependencies
	rm -rf package-lock.json
	$(COMPOSE_RUN) frontend-dev npm install
.PHONY: front-freeze-deps

front-update-deps-check:  ## Check the frontend dependencies for updates
	$(COMPOSE_RUN) frontend-dev npx npm-check-updates
.PHONY: front-update-deps-check

front-update-deps-minor:  ## Update the frontend dependencies to the minor version
	$(COMPOSE_RUN) frontend-dev npx npm-check-updates -t minor -u
	@$(MAKE) front-freeze-deps
.PHONY: front-update-deps-minor

front-update-deps-latest:  ## Update the frontend dependencies to the major version
	$(COMPOSE_RUN) frontend-dev npx npm-check-updates -t latest -u
	@$(MAKE) front-freeze-deps
.PHONY: front-update-deps-latest

front-lint:  ## Lint the frontend code
	$(COMPOSE_RUN) frontend-dev npm run lint
.PHONY: front-lint

front-lint-check:  ## Check the frontend code linting without fixing
	$(COMPOSE_RUN) frontend-dev npm run lint:check
.PHONY: front-lint-check

help:
	@echo "$(BOLD)Makefile help$(RESET)"
	@echo "Please use 'make $(BOLD)target$(RESET)' where $(BOLD)target$(RESET) is one of:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(firstword $(MAKEFILE_LIST)) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-30s$(RESET) %s\n", $$1, $$2}'
.PHONY: help
