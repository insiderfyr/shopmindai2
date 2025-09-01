# ⚡ QUICK START - LibreChat pe Laptop (2 minute setup!)

## 🚀 Ultra-Fast Setup

```bash
# 1. Clone și navigate
git clone <repo-url>
cd microservices-architecture/local-development

# 2. One-command setup
make setup

# 3. Start everything
make start

# 4. Access aplikația
open http://localhost
```

**That's it! 🎉 Arhitectura genius rulează pe laptop!**

## 💻 Configurații pentru Different Laptops

### 🔋 **Laptop Modest (4GB RAM, 2 cores)**
```bash
make setup-minimal
make start-minimal
```
**Resource usage**: ~1.5GB RAM, 50% CPU

### ⚡ **Laptop Decent (8GB RAM, 4+ cores)**
```bash
make setup
make start
```
**Resource usage**: ~3-4GB RAM, 30% CPU

### 🚀 **Laptop Powerhouse (16GB+ RAM, 8+ cores)**
```bash
make setup
make start
# + Enable all monitoring și development tools
```
**Resource usage**: ~6-8GB RAM, 40% CPU

## 🎯 Ce Rulează pe Laptop?

### **Core Microservices**
- ✅ **Keycloak** - Enterprise Identity Provider
- ✅ **Identity Service** (.NET Core) - Auth API
- ✅ **Conversation Service** (.NET Core) - Messages API  
- ✅ **AI Gateway** (Go) - AI Models Router
- ✅ **Search Service** (Go) - Semantic Search
- ✅ **Event Store** - Event Sourcing Database

### **Infrastructure**
- ✅ **PostgreSQL** - Main Database cu extensions
- ✅ **Redis** - Cache și Sessions
- ✅ **Apache Kafka** - Event Streaming
- ✅ **Elasticsearch** - Search și Logging
- ✅ **Nginx** - API Gateway cu rate limiting

### **Monitoring & Observability**
- ✅ **Prometheus** - Metrics Collection
- ✅ **Grafana** - Dashboards și Visualization
- ✅ **Jaeger** - Distributed Tracing
- ✅ **Kafka UI** - Event Stream Monitoring

## 🌟 Features Disponibile Local

### **🔐 Enterprise Authentication**
```bash
# Login cu Keycloak
curl -X POST http://localhost/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@librechat.local","password":"admin123"}'
```

### **💬 Real-time Conversations**
```bash
# Create conversation
curl -X POST http://localhost/api/v1/conversations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Chat","model":"gpt-3.5-turbo"}'
```

### **🤖 AI Model Integration**
```bash
# Chat completions
curl -X POST http://localhost/api/v1/ai/chat/completions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

### **🔍 Semantic Search**
```bash
# Search conversations
curl -X GET "http://localhost/api/v1/search?q=machine%20learning" \
  -H "Authorization: Bearer <token>"
```

## 📊 Development Workflow

### **Daily Development**
```bash
# Morning startup
make daily

# Development work cu hot reload
make dev-identity     # Terminal 1
make dev-ai-gateway   # Terminal 2  
make dev-conversation # Terminal 3

# Evening cleanup
make evening
```

### **Testing Workflow**
```bash
# Quick tests
make test

# Load testing
make load-test

# Integration testing
make test-integration
```

### **Debugging Workflow**
```bash
# View all logs
make logs

# Debug specific service
make logs-service SERVICE=identity-service

# Check resource usage
make stats

# Health check
make health-check
```

## 🎛️ Management Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `make start` | Start all services | Daily development |
| `make stop` | Stop all services | End of day |
| `make restart` | Restart everything | After config changes |
| `make status` | Show services și URLs | Check what's running |
| `make logs` | View all logs | Debugging |
| `make clean` | Clean Docker resources | Weekly cleanup |
| `make reset` | Complete reset | Fresh start |

## 🔧 Customization

### **Environment Variables** (`.env.local`)
```bash
# API Keys pentru testing
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Resource limits
POSTGRES_MAX_CONNECTIONS=50
REDIS_MAXMEMORY=128mb
KAFKA_HEAP_OPTS=-Xmx256m
```

### **Service Ports** (customize dacă conflicts)
```bash
# În .env.local
KEYCLOAK_PORT=8080
GRAFANA_PORT=3000
PROMETHEUS_PORT=9090
IDENTITY_SERVICE_PORT=5001
AI_GATEWAY_PORT=8080
```

## 🎯 Performance Tips

### **Speed Up Startup**
```bash
# Pre-pull images
docker-compose pull

# Use SSD storage
# Move Docker data directory to SSD
```

### **Reduce Memory Usage**
```bash
# Use minimal setup
make start-minimal

# Adjust Docker Desktop settings:
# - Memory: 2-4GB
# - CPU: 2-4 cores
# - Swap: 1GB
```

### **Development Optimization**
```bash
# Enable BuildKit pentru faster builds
export DOCKER_BUILDKIT=1

# Use Docker layer caching
docker-compose build --parallel
```

## 🆘 Troubleshooting

### **Port Conflicts**
```bash
# Check what's using port
lsof -i :8080

# Change port în docker-compose.yml
```

### **Memory Issues**
```bash
# Check Docker memory usage
docker stats

# Switch to minimal setup
make stop
make start-minimal
```

### **Service Won't Start**
```bash
# Check logs
make logs-service SERVICE=problematic-service

# Restart specific service
make restart-service SERVICE=problematic-service

# Reset if needed
make reset
```

## 🎉 Success Indicators

✅ **All services healthy**: `make health-check` shows all OK  
✅ **Monitoring working**: Grafana dashboards show data  
✅ **Authentication working**: Can login via Keycloak  
✅ **AI integration working**: Can send chat requests  
✅ **Real-time features**: WebSocket connections stable  

## 📱 Mobile Testing

```bash
# Get your laptop's IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Test from phone/tablet
curl http://YOUR-LAPTOP-IP/health
```

---

**🧠 GENIUS ARCHITECTURE running on your laptop! Perfect pentru development, testing și demos! 🚀**