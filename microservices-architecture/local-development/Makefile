# 🚀 LibreChat Microservices - Development Makefile
# Comenzi simple pentru development pe laptop

.PHONY: help setup start stop restart logs clean build test

# Default target
help: ## Arată acest help message
	@echo "🚀 LibreChat Microservices - Development Commands"
	@echo "=================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup și configurare
setup: ## Setup complet pentru laptop development
	@echo "🔧 Setting up LibreChat pentru laptop development..."
	@chmod +x setup-laptop.sh
	@./setup-laptop.sh

setup-minimal: ## Setup minimal pentru laptops cu RAM limitat (4GB)
	@echo "💻 Setting up minimal LibreChat pentru low-resource laptops..."
	@export COMPOSE_FILE=docker-compose.minimal.yml && chmod +x setup-laptop.sh && ./setup-laptop.sh

# Service management
start: ## Start all microservices
	@echo "🚀 Starting LibreChat microservices..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} up -d
	@echo "✅ Services started! Check 'make status' pentru details."

start-minimal: ## Start minimal setup (4GB RAM)
	@echo "💻 Starting minimal LibreChat setup..."
	@docker-compose -f docker-compose.minimal.yml up -d
	@echo "✅ Minimal services started!"

stop: ## Stop all microservices
	@echo "🛑 Stopping LibreChat microservices..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} down
	@echo "✅ Services stopped!"

restart: ## Restart all microservices
	@echo "🔄 Restarting LibreChat microservices..."
	@make stop
	@sleep 5
	@make start

restart-service: ## Restart specific service (usage: make restart-service SERVICE=identity-service)
	@echo "🔄 Restarting $(SERVICE)..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} restart $(SERVICE)

# Monitoring și debugging
status: ## Show services status și URLs
	@echo "📊 LibreChat Services Status:"
	@echo "=============================="
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} ps
	@echo ""
	@echo "🌐 Access URLs:"
	@echo "  API Gateway:     http://localhost"
	@echo "  Keycloak Admin:  http://localhost:8080 (admin/admin123)"
	@echo "  Grafana:         http://localhost:3000 (admin/admin123)"
	@echo "  Prometheus:      http://localhost:9090"
	@echo "  Jaeger:          http://localhost:16686"
	@echo "  Kafka UI:        http://localhost:8082"
	@echo "  Redis UI:        http://localhost:8083"

logs: ## View all services logs
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} logs -f

logs-service: ## View specific service logs (usage: make logs-service SERVICE=identity-service)
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} logs -f $(SERVICE)

stats: ## Show Docker resource usage
	@echo "📊 Docker Resource Usage:"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Development
build: ## Build all service images
	@echo "🔨 Building LibreChat service images..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} build --parallel

build-service: ## Build specific service (usage: make build-service SERVICE=identity-service)
	@echo "🔨 Building $(SERVICE)..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} build $(SERVICE)

dev-identity: ## Start identity service în development mode cu hot reload
	@echo "🔥 Starting Identity Service în hot reload mode..."
	@cd ../services/identity-service && dotnet watch run --urls http://localhost:5001

dev-ai-gateway: ## Start AI gateway în development mode cu hot reload
	@echo "🔥 Starting AI Gateway Service în hot reload mode..."
	@cd ../services/ai-gateway-service && air

dev-conversation: ## Start conversation service în development mode cu hot reload
	@echo "🔥 Starting Conversation Service în hot reload mode..."
	@cd ../services/conversation-service && dotnet watch run --urls http://localhost:5002

# Testing
test: ## Run all tests
	@echo "🧪 Running all tests..."
	@make test-dotnet
	@make test-go

test-dotnet: ## Run .NET service tests
	@echo "🧪 Running .NET tests..."
	@cd ../services/identity-service && dotnet test
	@cd ../services/conversation-service && dotnet test

test-go: ## Run Go service tests
	@echo "🧪 Running Go tests..."
	@cd ../services/ai-gateway-service && go test ./...
	@cd ../services/search-service && go test ./...

test-integration: ## Run integration tests
	@echo "🧪 Running integration tests..."
	@cd ../tests && npm test

load-test: ## Run load tests cu k6
	@echo "⚡ Running load tests..."
	@k6 run ../tests/load-tests/identity-service.js
	@k6 run ../tests/load-tests/ai-gateway.js

# Database management
db-migrate: ## Run database migrations
	@echo "🗄️ Running database migrations..."
	@cd ../services/identity-service && dotnet ef database update
	@cd ../services/conversation-service && dotnet ef database update

db-reset: ## Reset all databases (⚠️  destructive!)
	@echo "⚠️  Resetting all databases..."
	@read -p "Are you sure? This will delete all data! (y/N): " confirm && [ "$$confirm" = "y" ]
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} down -v
	@make start

db-backup: ## Backup databases
	@echo "💾 Creating database backup..."
	@mkdir -p ./backups
	@docker exec librechat-postgres pg_dump -U librechat librechat > ./backups/librechat-$(shell date +%Y%m%d-%H%M%S).sql
	@echo "✅ Backup created în ./backups/"

db-restore: ## Restore database from backup (usage: make db-restore BACKUP=filename.sql)
	@echo "📥 Restoring database from $(BACKUP)..."
	@docker exec -i librechat-postgres psql -U librechat -d librechat < ./backups/$(BACKUP)

# Cleanup și maintenance
clean: ## Clean Docker resources (images, volumes, networks)
	@echo "🧹 Cleaning Docker resources..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} down -v
	@docker system prune -f
	@docker volume prune -f
	@echo "✅ Cleanup complete!"

clean-logs: ## Clean service logs
	@echo "🧹 Cleaning service logs..."
	@rm -rf logs/*
	@mkdir -p logs/{identity,conversation,ai-gateway,search}
	@echo "✅ Logs cleaned!"

reset: ## Complete reset (⚠️  destructive!)
	@echo "⚠️  Complete environment reset..."
	@read -p "This will delete ALL data and containers! Continue? (y/N): " confirm && [ "$$confirm" = "y" ]
	@make clean
	@docker image prune -a -f
	@rm -rf data/*
	@echo "✅ Complete reset done! Run 'make setup' to reinitialize."

# Utility commands
shell-postgres: ## Open PostgreSQL shell
	@docker exec -it librechat-postgres psql -U librechat -d librechat

shell-redis: ## Open Redis shell
	@docker exec -it librechat-redis redis-cli

shell-service: ## Open shell în service container (usage: make shell-service SERVICE=identity-service)
	@docker exec -it librechat-$(SERVICE) /bin/bash

# Monitoring și debugging
monitor: ## Open monitoring dashboard în browser
	@echo "📊 Opening monitoring dashboards..."
	@open http://localhost:3000  # Grafana
	@open http://localhost:9090  # Prometheus
	@open http://localhost:16686 # Jaeger

debug-service: ## Debug specific service (usage: make debug-service SERVICE=identity-service)
	@echo "🐛 Debugging $(SERVICE)..."
	@source .env.local && docker-compose -f $${COMPOSE_FILE:-docker-compose.dev.yml} logs -f $(SERVICE)

health-check: ## Check health of all services
	@echo "🏥 Health checking all services..."
	@curl -s http://localhost/health && echo "✅ API Gateway: OK" || echo "❌ API Gateway: FAIL"
	@curl -s http://localhost:5001/health && echo "✅ Identity Service: OK" || echo "❌ Identity Service: FAIL"
	@curl -s http://localhost:5002/health && echo "✅ Conversation Service: OK" || echo "❌ Conversation Service: FAIL"
	@curl -s http://localhost:8080/health && echo "✅ AI Gateway: OK" || echo "❌ AI Gateway: FAIL"
	@curl -s http://localhost:8081/health && echo "✅ Search Service: OK" || echo "❌ Search Service: FAIL"

# Performance și optimization
optimize-laptop: ## Optimize settings pentru laptop performance
	@echo "⚡ Optimizing pentru laptop performance..."
	@docker system df
	@echo "💡 Consider running 'make clean' dacă disk space este low"
	@echo "💡 Use 'make start-minimal' dacă RAM usage este high"

benchmark: ## Run performance benchmarks
	@echo "⚡ Running performance benchmarks..."
	@echo "Testing API Gateway throughput..."
	@ab -n 1000 -c 10 http://localhost/health
	@echo "Testing Identity Service..."
	@ab -n 500 -c 5 http://localhost:5001/health

# Documentation
docs: ## Generate și open documentation
	@echo "📚 Generating documentation..."
	@echo "Opening architecture documentation..."
	@open ../GENIUS-ARCHITECTURE.md

# Quick commands pentru daily development
daily: ## Daily development startup routine
	@echo "☀️  Starting daily development routine..."
	@make start
	@sleep 30
	@make health-check
	@make status
	@echo "🎉 Ready pentru development!"

evening: ## Evening cleanup routine
	@echo "🌙 Evening cleanup routine..."
	@make stop
	@make clean-logs
	@echo "😴 Good night! Environment cleaned for tomorrow."

# Emergency commands
emergency-stop: ## Emergency stop all containers
	@echo "🚨 Emergency stop - killing all LibreChat containers..."
	@docker kill $$(docker ps -q --filter "name=librechat-*") 2>/dev/null || true
	@echo "✅ Emergency stop complete!"

emergency-reset: ## Emergency reset fără confirmation
	@echo "🚨 Emergency reset..."
	@make emergency-stop
	@docker system prune -a -f
	@docker volume rm $$(docker volume ls -q --filter "name=librechat*") 2>/dev/null || true
	@echo "✅ Emergency reset complete!"

# Development helpers
generate-proto: ## Generate protobuf code pentru all services
	@echo "🔧 Generating protobuf code..."
	@cd ../shared/contracts && protoc --go_out=. --go-grpc_out=. *.proto
	@cd ../services/identity-service && dotnet build # Regenerate C# code
	@echo "✅ Protobuf code generated!"

update-deps: ## Update all service dependencies
	@echo "📦 Updating dependencies..."
	@cd ../services/identity-service && dotnet restore
	@cd ../services/conversation-service && dotnet restore
	@cd ../services/ai-gateway-service && go mod tidy
	@cd ../services/search-service && go mod tidy
	@echo "✅ Dependencies updated!"

# Quick development workflow
quick-start: setup start ## Quick setup și start (new laptops)
quick-restart: stop start ## Quick restart all services
quick-test: build test ## Quick build și test all services

# Resource monitoring
memory-usage: ## Show memory usage per service
	@echo "💾 Memory Usage per Service:"
	@docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep librechat

cpu-usage: ## Show CPU usage per service  
	@echo "🖥️  CPU Usage per Service:"
	@docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}" | grep librechat

disk-usage: ## Show disk usage
	@echo "💿 Disk Usage:"
	@docker system df
	@echo ""
	@echo "📊 Volume Usage:"
	@docker volume ls --format "table {{.Name}}\t{{.Driver}}" | grep librechat