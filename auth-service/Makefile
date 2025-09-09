# ShopMindAI Auth Service Makefile

.PHONY: help build start stop restart logs clean test lint

# Default target
help:
	@echo "🚀 ShopMindAI Auth Service Commands"
	@echo "=================================="
	@echo "build          - Build Docker images"
	@echo "start          - Start all services"
	@echo "stop           - Stop all services"
	@echo "restart        - Restart all services"
	@echo "logs           - Show logs for all services"
	@echo "logs-auth      - Show auth service logs"
	@echo "logs-keycloak  - Show Keycloak logs"
	@echo "logs-postgres  - Show PostgreSQL logs"
	@echo "logs-redis     - Show Redis logs"
	@echo "clean          - Clean up containers and images"
	@echo "test           - Run tests"
	@echo "lint           - Run Go linter"
	@echo "dev            - Start in development mode"
	@echo "prod           - Start with production profile"

# Build Docker images
build:
	@echo "🔨 Building Docker images..."
	docker-compose build --no-cache

# Start all services
start:
	@echo "🚀 Starting all services..."
	chmod +x start.sh
	./start.sh

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	docker-compose down

# Restart all services
restart: stop start

# Show logs for all services
logs:
	docker-compose logs -f

# Show auth service logs
logs-auth:
	docker-compose logs -f auth-service

# Show Keycloak logs
logs-keycloak:
	docker-compose logs -f keycloak

# Show PostgreSQL logs
logs-postgres:
	docker-compose logs -f postgres

# Show Redis logs
logs-redis:
	docker-compose logs -f redis

# Clean up containers and images
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down --volumes --remove-orphans
	docker system prune -af
	docker volume prune -f

# Run tests
test:
	@echo "🧪 Running tests..."
	go test -v ./...

# Run integration tests
test-integration:
	@echo "🔬 Running integration tests..."
	go test -v ./test/...

# Run Go linter
lint:
	@echo "🔍 Running Go linter..."
	golangci-lint run

# Start in development mode
dev:
	@echo "🔧 Starting in development mode..."
	docker-compose up -d postgres redis keycloak
	@echo "⏳ Waiting for dependencies..."
	sleep 30
	go run cmd/main.go

# Start with production profile
prod:
	@echo "🏭 Starting with production profile..."
	docker-compose --profile production up -d

# Start with monitoring
monitoring:
	@echo "📊 Starting with monitoring..."
	docker-compose --profile monitoring up -d

# Health check
health:
	@echo "🏥 Checking service health..."
	@curl -s http://localhost:8080/health | jq . || echo "Auth service not responding"
	@curl -s http://localhost:8081/health/ready | jq . || echo "Keycloak not responding"

# Show service status
status:
	@echo "📊 Service Status:"
	@docker-compose ps

# Database shell
db-shell:
	@echo "🗃️  Connecting to PostgreSQL..."
	docker exec -it shopmind-postgres psql -U keycloak -d keycloak

# Redis shell
redis-shell:
	@echo "🔴 Connecting to Redis..."
	docker exec -it shopmind-redis redis-cli

# Generate API documentation
docs:
	@echo "📚 Generating API documentation..."
	swag init -g cmd/main.go

# Run security scan
security:
	@echo "🔒 Running security scan..."
	gosec ./...

# Format code
fmt:
	@echo "💅 Formatting code..."
	go fmt ./...

# Update dependencies
update:
	@echo "⬆️  Updating dependencies..."
	go get -u ./...
	go mod tidy

# Backup data
backup:
	@echo "💾 Creating backup..."
	mkdir -p backups
	docker exec shopmind-postgres pg_dump -U keycloak keycloak > backups/keycloak-$(date +%Y%m%d-%H%M%S).sql

# Restore data
restore:
	@echo "♻️  Restoring data..."
	@read -p "Enter backup file path: " backup_file; \
	docker exec -i shopmind-postgres psql -U keycloak -d keycloak < $$backup_file
