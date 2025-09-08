# ShopMindAI Backend Microservices

A scalable microservices architecture built with Go for the ShopMindAI e-commerce platform.

## Architecture

This backend consists of 5 microservices:

- **Gateway Service** - API gateway with HTTPS/HTTP support
- **Auth Service** - Authentication and authorization
- **User Service** - User management and profiles
- **Chat Service** - AI chat functionality with gRPC
- **LLM Proxy Service** - Proxy for LLM providers (OpenAI, Anthropic, etc.)

## Project Structure

```
backend/
├── cmd/                    # Entry points for each microservice
│   ├── gateway-service/
│   ├── auth-service/
│   ├── user-service/
│   ├── chat-service/
│   └── llm-proxy-service/
├── internal/              # Service-specific code
│   ├── gateway-service/
│   │   ├── api/rest/      # REST API configuration
│   │   ├── app/           # Application lifecycle
│   │   ├── repository/    # Data access layer
│   │   └── service/       # Business logic
│   └── [other services]/
├── pkg/                   # Shared code
│   ├── models/           # Shared data models
│   ├── utils/            # Utility functions
│   ├── database/         # Database connections
│   ├── config/           # Configuration management
│   ├── middleware/       # HTTP middleware
│   └── logger/           # Logging utilities
├── scripts/              # Automation scripts
│   ├── migration/        # Database migrations
│   ├── deployment/       # Deployment scripts
│   └── testing/          # Test utilities
├── go.mod                # Go module definition
├── Makefile              # Build automation
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Go 1.21 or later
- PostgreSQL
- Redis
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   make deps
   ```

3. Set up environment variables (create `.env` files for each service)

4. Run database migrations:
   ```bash
   make migrate
   ```

### Running the Services

#### Run all services:
```bash
make run-all
```

#### Run individual services:
```bash
make run-gateway    # HTTPS/HTTP on :8080
make run-auth       # HTTP on :7000
make run-user       # User management
make run-chat       # gRPC on :7001
make run-llm-proxy  # HTTP on :7002
```

### Building

```bash
make build
```

### Testing

```bash
make test
```

### Docker

```bash
make docker-build
make docker-run
```

## Service Endpoints

- **Gateway Service**: `https://localhost:8080` (Main entry point - HTTPS/HTTP)
- **Auth Service**: `http://localhost:7000` (HTTP)
- **User Service**: `http://localhost:8002` (HTTP)
- **Chat Service**: `grpc://localhost:7001` (gRPC + /healthz)
- **LLM Proxy Service**: `http://localhost:7002` (HTTP)

## External Services

- **PostgreSQL**: `localhost:5432`
- **Redis**: `localhost:6379`

## Development

Each microservice follows the same internal structure:

- `api/rest/` - HTTP handlers and routing
- `app/` - Application initialization and lifecycle
- `repository/` - Data access layer
- `service/` - Business logic

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
