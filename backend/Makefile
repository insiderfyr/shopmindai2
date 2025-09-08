# ShopMindAI Backend Microservices Makefile

.PHONY: build test clean run-all run-gateway run-auth run-user run-chat run-llm-proxy docker-build docker-run migrate

# Build all services
build:
	@echo "Building all microservices..."
	@go build -o bin/gateway-service ./cmd/gateway-service
	@go build -o bin/auth-service ./cmd/auth-service
	@go build -o bin/user-service ./cmd/user-service
	@go build -o bin/chat-service ./cmd/chat-service
	@go build -o bin/llm-proxy-service ./cmd/llm-proxy-service

# Run tests
test:
	@echo "Running tests..."
	@go test ./...

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf bin/

# Run all services
run-all: build
	@echo "Starting all microservices..."
	@./scripts/run-all.sh

# Run individual services
run-gateway:
	@echo "Starting gateway service (HTTPS/HTTP on :8080)..."
	@go run ./cmd/gateway-service

run-auth:
	@echo "Starting auth service (HTTP on :7000)..."
	@go run ./cmd/auth-service

run-user:
	@echo "Starting user service..."
	@go run ./cmd/user-service

run-chat:
	@echo "Starting chat service (gRPC on :7001)..."
	@go run ./cmd/chat-service

run-llm-proxy:
	@echo "Starting LLM proxy service (HTTP on :7002)..."
	@go run ./cmd/llm-proxy-service

# Docker commands
docker-build:
	@echo "Building Docker images..."
	@docker build -t shopmindai/gateway-service ./cmd/gateway-service
	@docker build -t shopmindai/auth-service ./cmd/auth-service
	@docker build -t shopmindai/user-service ./cmd/user-service
	@docker build -t shopmindai/chat-service ./cmd/chat-service
	@docker build -t shopmindai/llm-proxy-service ./cmd/llm-proxy-service

docker-run:
	@echo "Running services with Docker Compose..."
	@docker-compose up -d

# Database migration
migrate:
	@echo "Running database migrations..."
	@go run ./scripts/migration/migrate.go

# Install dependencies
deps:
	@echo "Installing dependencies..."
	@go mod download
	@go mod tidy
