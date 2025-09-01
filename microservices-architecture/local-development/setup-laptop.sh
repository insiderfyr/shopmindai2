#!/bin/bash

# 🚀 LibreChat Microservices - Laptop Setup Script
# Optimized pentru development local cu resource usage minimal

set -e

echo "🚀 Starting LibreChat Microservices Setup pentru Laptop..."

# Colors pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function pentru logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check available RAM
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        TOTAL_RAM=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        TOTAL_RAM=$(sysctl -n hw.memsize | awk '{printf "%.0f", $1/1024/1024/1024}')
    else
        TOTAL_RAM=8 # Default assumption
    fi
    
    log_info "Detected RAM: ${TOTAL_RAM}GB"
    
    if [ $TOTAL_RAM -lt 4 ]; then
        log_error "Minimum 4GB RAM required. Consider upgrading your system."
        exit 1
    elif [ $TOTAL_RAM -lt 8 ]; then
        log_warning "8GB+ RAM recommended pentru best experience."
        export COMPOSE_FILE="docker-compose.minimal.yml"
    else
        log_success "RAM sufficient pentru full microservices setup."
        export COMPOSE_FILE="docker-compose.dev.yml"
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker nu este instalat. Please install Docker Desktop."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose nu este instalat."
        exit 1
    fi
    
    log_success "System requirements check passed!"
}

# Setup environment variables
setup_environment() {
    log_info "Setting up environment variables..."
    
    if [ ! -f .env.local ]; then
        cat > .env.local << EOF
# LibreChat Microservices - Local Development Environment

# Database
POSTGRES_DB=librechat
POSTGRES_USER=librechat
POSTGRES_PASSWORD=librechat123

# Redis
REDIS_PASSWORD=

# Keycloak
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=admin123

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_ISSUER=librechat-local
JWT_AUDIENCE=librechat

# API Keys (Optional - for testing)
OPENAI_API_KEY=${OPENAI_API_KEY:-}
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-}
GOOGLE_API_KEY=${GOOGLE_API_KEY:-}

# Development
ASPNETCORE_ENVIRONMENT=Development
NODE_ENV=development
LOG_LEVEL=debug

# Ports
KEYCLOAK_PORT=8080
POSTGRES_PORT=5432
REDIS_PORT=6379
KAFKA_PORT=9092
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
JAEGER_PORT=16686

# Services
IDENTITY_SERVICE_PORT=5001
CONVERSATION_SERVICE_PORT=5002
AI_GATEWAY_SERVICE_PORT=8080
SEARCH_SERVICE_PORT=8081
EOF
        log_success "Created .env.local file"
    else
        log_info ".env.local already exists, skipping..."
    fi
}

# Create necessary directories
create_directories() {
    log_info "Creating project directories..."
    
    mkdir -p {
        logs/{identity,conversation,ai-gateway,search},
        data/{postgres,redis,kafka,elasticsearch,eventstore,prometheus,grafana},
        config/{keycloak,nginx,monitoring},
        scripts,
        tests
    }
    
    log_success "Directories created successfully!"
}

# Generate development certificates
generate_certificates() {
    log_info "Generating development SSL certificates..."
    
    if [ ! -f "./gateway/ssl/localhost.crt" ]; then
        mkdir -p ./gateway/ssl
        
        # Generate self-signed certificate pentru localhost
        openssl req -x509 -newkey rsa:4096 -keyout ./gateway/ssl/localhost.key \
            -out ./gateway/ssl/localhost.crt -days 365 -nodes \
            -subj "/C=US/ST=CA/L=San Francisco/O=LibreChat/CN=localhost" \
            -extensions SAN \
            -config <(cat /etc/ssl/openssl.cnf <(printf "\n[SAN]\nsubjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"))
        
        log_success "SSL certificates generated!"
    else
        log_info "SSL certificates already exist, skipping..."
    fi
}

# Setup Keycloak realm configuration
setup_keycloak_config() {
    log_info "Setting up Keycloak realm configuration..."
    
    cat > ./keycloak/realm-export.json << 'EOF'
{
  "realm": "librechat",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": true,
  "loginWithEmailAllowed": true,
  "duplicateEmailsAllowed": false,
  "resetPasswordAllowed": true,
  "editUsernameAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "waitIncrementSeconds": 60,
  "quickLoginCheckMilliSeconds": 1000,
  "maxDeltaTimeSeconds": 43200,
  "failureFactor": 30,
  "defaultRoles": ["default-roles-librechat", "offline_access", "uma_authorization"],
  "requiredCredentials": ["password"],
  "passwordPolicy": "length(8) and digits(1) and lowerCase(1) and upperCase(1)",
  "otpPolicyType": "totp",
  "otpPolicyAlgorithm": "HmacSHA256",
  "otpPolicyDigits": 6,
  "otpPolicyLookAheadWindow": 1,
  "otpPolicyPeriod": 30,
  "clients": [
    {
      "clientId": "librechat-frontend",
      "enabled": true,
      "publicClient": true,
      "redirectUris": ["http://localhost:3000/*"],
      "webOrigins": ["http://localhost:3000"],
      "protocol": "openid-connect",
      "fullScopeAllowed": true
    },
    {
      "clientId": "librechat-backend",
      "enabled": true,
      "serviceAccountsEnabled": true,
      "secret": "librechat-backend-secret",
      "protocol": "openid-connect",
      "fullScopeAllowed": true,
      "attributes": {
        "access.token.lifespan": "3600"
      }
    }
  ],
  "roles": {
    "realm": [
      {
        "name": "user",
        "description": "Standard user role"
      },
      {
        "name": "admin",
        "description": "Administrator role"
      },
      {
        "name": "moderator",
        "description": "Moderator role"
      }
    ]
  },
  "users": [
    {
      "username": "admin",
      "email": "admin@librechat.local",
      "firstName": "Admin",
      "lastName": "User",
      "enabled": true,
      "emailVerified": true,
      "credentials": [
        {
          "type": "password",
          "value": "admin123",
          "temporary": false
        }
      ],
      "realmRoles": ["admin", "user"]
    }
  ]
}
EOF
    
    log_success "Keycloak realm configuration created!"
}

# Setup monitoring configuration
setup_monitoring() {
    log_info "Setting up monitoring configuration..."
    
    mkdir -p ./monitoring/grafana/{provisioning/dashboards,provisioning/datasources,dashboards}
    
    # Prometheus configuration
    cat > ./monitoring/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'identity-service'
    static_configs:
      - targets: ['identity-service:80']
    scrape_interval: 5s
    metrics_path: '/metrics'

  - job_name: 'conversation-service'
    static_configs:
      - targets: ['conversation-service:80']
    scrape_interval: 5s
    metrics_path: '/metrics'

  - job_name: 'ai-gateway-service'
    static_configs:
      - targets: ['ai-gateway-service:8080']
    scrape_interval: 5s
    metrics_path: '/metrics'

  - job_name: 'search-service'
    static_configs:
      - targets: ['search-service:8081']
    scrape_interval: 5s
    metrics_path: '/metrics'

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']
EOF

    # Grafana datasource
    cat > ./monitoring/grafana/provisioning/datasources/prometheus.yml << 'EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: true
  
  - name: Jaeger
    type: jaeger
    access: proxy
    url: http://jaeger:16686
    editable: true
EOF

    # Grafana dashboard provisioning
    cat > ./monitoring/grafana/provisioning/dashboards/dashboard.yml << 'EOF'
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

    log_success "Monitoring configuration created!"
}

# Setup nginx gateway configuration
setup_gateway() {
    log_info "Setting up API Gateway configuration..."
    
    mkdir -p ./gateway/lua
    
    cat > ./gateway/nginx.conf << 'EOF'
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                   '$status $body_bytes_sent "$http_referer" '
                   '"$http_user_agent" "$http_x_forwarded_for" '
                   'rt=$request_time uct="$upstream_connect_time" '
                   'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # Performance settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    # Upstream services
    upstream identity_service {
        least_conn;
        server identity-service:80 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream conversation_service {
        least_conn;
        server conversation-service:80 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream ai_gateway_service {
        least_conn;
        server ai-gateway-service:8080 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    upstream search_service {
        least_conn;
        server search-service:8081 max_fails=3 fail_timeout=30s;
        keepalive 32;
    }

    # Main server block
    server {
        listen 80;
        server_name localhost;

        # Security headers
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options DENY;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "OK\n";
            add_header Content-Type text/plain;
        }

        # Identity service routes
        location /api/v1/auth {
            limit_req zone=auth burst=20 nodelay;
            
            proxy_pass http://identity_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 5s;
            proxy_send_timeout 10s;
            proxy_read_timeout 10s;
        }

        # Conversation service routes
        location /api/v1/conversations {
            limit_req zone=api burst=50 nodelay;
            
            proxy_pass http://conversation_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts pentru long-running requests
            proxy_connect_timeout 5s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # AI Gateway routes
        location /api/v1/ai {
            limit_req zone=api burst=30 nodelay;
            
            proxy_pass http://ai_gateway_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Extended timeouts pentru AI processing
            proxy_connect_timeout 10s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            proxy_buffering off; # Important pentru streaming
        }

        # Search service routes
        location /api/v1/search {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://search_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 5s;
            proxy_send_timeout 15s;
            proxy_read_timeout 15s;
        }

        # WebSocket support pentru real-time features
        location /ws {
            proxy_pass http://ai_gateway_service;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket timeouts
            proxy_connect_timeout 7d;
            proxy_send_timeout 7d;
            proxy_read_timeout 7d;
        }

        # Development tools (doar pentru local)
        location /kafka-ui {
            proxy_pass http://kafka-ui:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /redis-ui {
            proxy_pass http://redis-commander:8081;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Monitoring endpoints
        location /prometheus {
            proxy_pass http://prometheus:9090;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /grafana {
            proxy_pass http://grafana:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /jaeger {
            proxy_pass http://jaeger:16686;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

    log_success "API Gateway configuration created!"
}

# Create development Dockerfiles
create_dev_dockerfiles() {
    log_info "Creating development Dockerfiles..."
    
    # Identity Service Dockerfile.dev
    cat > ../services/identity-service/Dockerfile.dev << 'EOF'
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS base
WORKDIR /app
EXPOSE 80

# Install hot reload tools
RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

# Copy project files
COPY *.csproj .
RUN dotnet restore

# Copy source code
COPY . .

# Development mode cu hot reload
ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:80"]
EOF

    # AI Gateway Service Dockerfile.dev
    cat > ../services/ai-gateway-service/Dockerfile.dev << 'EOF'
FROM golang:1.21-alpine AS base
WORKDIR /app

# Install development tools
RUN go install github.com/cosmtrek/air@latest

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build pentru development
RUN go build -o main .

# Development mode cu hot reload
CMD ["air", "-c", ".air.toml"]
EOF

    # Conversation Service Dockerfile.dev
    cat > ../services/conversation-service/Dockerfile.dev << 'EOF'
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS base
WORKDIR /app
EXPOSE 80

RUN dotnet tool install --global dotnet-ef
ENV PATH="${PATH}:/root/.dotnet/tools"

COPY *.csproj .
RUN dotnet restore

COPY . .

ENTRYPOINT ["dotnet", "watch", "run", "--urls", "http://0.0.0.0:80"]
EOF

    log_success "Development Dockerfiles created!"
}

# Create minimal version pentru laptops cu RAM limitat
create_minimal_compose() {
    log_info "Creating minimal Docker Compose pentru laptops cu RAM limitat..."
    
    cat > docker-compose.minimal.yml << 'EOF'
version: '3.8'

# 💻 LibreChat Microservices - Minimal Setup (2-4GB RAM)
# Core services only cu resource limits aggressive

services:
  # Lightweight PostgreSQL
  postgres:
    image: postgres:16-alpine
    container_name: librechat-postgres-mini
    environment:
      POSTGRES_DB: librechat
      POSTGRES_USER: librechat
      POSTGRES_PASSWORD: librechat123
    ports:
      - "5432:5432"
    volumes:
      - postgres_mini_data:/var/lib/postgresql/data
    networks:
      - librechat-mini
    restart: unless-stopped
    mem_limit: 128m
    cpus: 0.2

  # Redis cu memory limit strict
  redis:
    image: redis:7-alpine
    container_name: librechat-redis-mini
    command: redis-server --maxmemory 64mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    networks:
      - librechat-mini
    restart: unless-stopped
    mem_limit: 64m
    cpus: 0.1

  # Keycloak minimal
  keycloak:
    image: quay.io/keycloak/keycloak:26.0.0
    container_name: librechat-keycloak-mini
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin123
      KC_DB: h2-file  # H2 database pentru development
      KC_HTTP_ENABLED: "true"
      KC_HOSTNAME_STRICT: "false"
      JAVA_OPTS: "-Xms128m -Xmx256m"
    command: start-dev
    ports:
      - "8080:8080"
    networks:
      - librechat-mini
    restart: unless-stopped
    mem_limit: 256m
    cpus: 0.3

  # Core services only
  identity-service:
    build:
      context: ../services/identity-service
      dockerfile: Dockerfile.dev
    container_name: librechat-identity-mini
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=librechat;Username=librechat;Password=librechat123"
      ConnectionStrings__Redis: "redis:6379"
    ports:
      - "5001:80"
    depends_on:
      - postgres
      - redis
      - keycloak
    networks:
      - librechat-mini
    restart: unless-stopped
    mem_limit: 192m
    cpus: 0.25

  # AI Gateway minimal
  ai-gateway-service:
    build:
      context: ../services/ai-gateway-service
      dockerfile: Dockerfile.dev
    container_name: librechat-ai-gateway-mini
    environment:
      ENVIRONMENT: development
      HTTP_PORT: 8080
      REDIS_ADDR: redis:6379
      DATABASE_URL: "postgres://librechat:librechat123@postgres:5432/librechat?sslmode=disable"
    ports:
      - "8080:8080"
    depends_on:
      - postgres
      - redis
    networks:
      - librechat-mini
    restart: unless-stopped
    mem_limit: 128m
    cpus: 0.2

volumes:
  postgres_mini_data:

networks:
  librechat-mini:
    driver: bridge
EOF

    log_success "Minimal Docker Compose created!"
}

# Build and start services
build_and_start() {
    log_info "Building and starting LibreChat microservices..."
    
    # Load environment
    source .env.local
    
    # Build custom images
    log_info "Building service images..."
    docker-compose -f $COMPOSE_FILE build --parallel
    
    # Start infrastructure services first
    log_info "Starting infrastructure services..."
    docker-compose -f $COMPOSE_FILE up -d postgres redis zookeeper kafka elasticsearch eventstore keycloak
    
    # Wait pentru services să fie ready
    log_info "Waiting pentru infrastructure services..."
    sleep 30
    
    # Start application services
    log_info "Starting application services..."
    docker-compose -f $COMPOSE_FILE up -d
    
    # Wait pentru all services
    sleep 15
    
    log_success "All services started successfully!"
}

# Setup development scripts
create_dev_scripts() {
    log_info "Creating development helper scripts..."
    
    # Start script
    cat > ./scripts/start-dev.sh << 'EOF'
#!/bin/bash
source .env.local
docker-compose -f ${COMPOSE_FILE} up -d
echo "🚀 LibreChat Microservices started!"
echo "📊 Grafana: http://localhost:3000 (admin/admin123)"
echo "🔐 Keycloak: http://localhost:8080 (admin/admin123)"
echo "📈 Prometheus: http://localhost:9090"
echo "🔍 Jaeger: http://localhost:16686"
echo "📨 Kafka UI: http://localhost:8082"
echo "🗃️ Redis UI: http://localhost:8083"
EOF

    # Stop script
    cat > ./scripts/stop-dev.sh << 'EOF'
#!/bin/bash
source .env.local
docker-compose -f ${COMPOSE_FILE} down
echo "🛑 LibreChat Microservices stopped!"
EOF

    # Logs script
    cat > ./scripts/logs.sh << 'EOF'
#!/bin/bash
source .env.local
if [ $# -eq 0 ]; then
    docker-compose -f ${COMPOSE_FILE} logs -f
else
    docker-compose -f ${COMPOSE_FILE} logs -f $1
fi
EOF

    # Reset script
    cat > ./scripts/reset-dev.sh << 'EOF'
#!/bin/bash
source .env.local
echo "🧹 Resetting LibreChat development environment..."
docker-compose -f ${COMPOSE_FILE} down -v
docker system prune -f
docker volume prune -f
echo "✅ Environment reset complete!"
EOF

    # Make scripts executable
    chmod +x ./scripts/*.sh
    
    log_success "Development scripts created!"
}

# Display final information
show_completion_info() {
    echo ""
    echo "🎉 ${GREEN}LibreChat Microservices Setup Complete!${NC}"
    echo ""
    echo "📋 ${BLUE}Quick Start Commands:${NC}"
    echo "   ./scripts/start-dev.sh    # Start all services"
    echo "   ./scripts/stop-dev.sh     # Stop all services"
    echo "   ./scripts/logs.sh         # View all logs"
    echo "   ./scripts/logs.sh <service>  # View specific service logs"
    echo "   ./scripts/reset-dev.sh    # Reset environment"
    echo ""
    echo "🌐 ${BLUE}Access URLs:${NC}"
    echo "   API Gateway:     http://localhost"
    echo "   Keycloak Admin:  http://localhost:8080 (admin/admin123)"
    echo "   Grafana:         http://localhost:3000 (admin/admin123)"
    echo "   Prometheus:      http://localhost:9090"
    echo "   Jaeger Tracing:  http://localhost:16686"
    echo "   Kafka UI:        http://localhost:8082"
    echo "   Redis Commander: http://localhost:8083"
    echo ""
    echo "🔧 ${BLUE}Development Services:${NC}"
    echo "   Identity Service:     http://localhost:5001"
    echo "   Conversation Service: http://localhost:5002"
    echo "   AI Gateway Service:   http://localhost:8080"
    echo "   Search Service:       http://localhost:8081"
    echo ""
    echo "💡 ${YELLOW}Tips:${NC}"
    echo "   - Use 'docker-compose logs -f <service>' pentru debugging"
    echo "   - Hot reload este enabled pentru .NET și Go services"
    echo "   - Keycloak realm 'librechat' este pre-configured"
    echo "   - PostgreSQL și Redis data sunt persistent"
    echo ""
    echo "📊 ${BLUE}Resource Usage:${NC}"
    if [ "$COMPOSE_FILE" = "docker-compose.minimal.yml" ]; then
        echo "   Minimal setup: ~1.5GB RAM, 2 CPU cores"
    else
        echo "   Full setup: ~3-4GB RAM, 4 CPU cores"
    fi
    echo ""
    echo "🚀 ${GREEN}Ready pentru development!${NC}"
}

# Main execution
main() {
    echo "🚀 LibreChat Microservices - Laptop Setup"
    echo "=========================================="
    
    check_requirements
    setup_environment
    create_directories
    generate_certificates
    setup_keycloak_config
    setup_monitoring
    setup_gateway
    create_dev_dockerfiles
    create_minimal_compose
    create_dev_scripts
    
    # Ask user if they want to start services now
    read -p "🚀 Start LibreChat microservices now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        build_and_start
    fi
    
    show_completion_info
}

# Run main function
main "$@"