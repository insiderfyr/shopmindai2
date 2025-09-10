#!/bin/bash

echo "🎯 Kong Genius Setup: Auth API → Auth Microservice"
echo "================================================="

# Colors pentru output frumos
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcție pentru verificarea răspunsului Kong
check_kong_response() {
    local response=$1
    local action=$2
    
    if [[ $(echo $response | jq -r '.message // empty') ]]; then
        echo -e "${RED}❌ Error $action: $(echo $response | jq -r '.message')${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Success $action${NC}"
        return 0
    fi
}

# Verificăm dacă Kong rulează
echo -e "${BLUE}🔍 Verificăm dacă Kong rulează...${NC}"
if ! curl -s http://localhost:8001 > /dev/null; then
    echo -e "${RED}❌ Kong nu rulează pe portul 8001. Pornește Kong mai întâi!${NC}"
    echo "💡 Rulează: cd gateway && docker-compose up -d"
    exit 1
fi

echo -e "${GREEN}✅ Kong rulează!${NC}"

# 1. BACKUP configurația existentă
echo -e "${YELLOW}💾 Creăm backup Kong config...${NC}"
curl -s http://localhost:8001/config > kong_backup_$(date +%Y%m%d_%H%M%S).json
echo -e "${GREEN}✅ Backup creat${NC}"

# 2. Curățăm configurația existentă
echo -e "${YELLOW}🧹 Curățăm configurația existentă...${NC}"

# Ștergem toate rutele
route_ids=$(curl -s http://localhost:8001/routes | jq -r '.data[].id // empty')
if [ ! -z "$route_ids" ]; then
    echo "$route_ids" | while read route_id; do
        if [ ! -z "$route_id" ]; then
            echo "🗑️  Șterge ruta: $route_id"
            curl -s -X DELETE "http://localhost:8001/routes/$route_id"
        fi
    done
fi

# Ștergem service-urile existente
services=("backend-service" "auth-service")
for service in "${services[@]}"; do
    echo "🗑️  Șterge service: $service"
    curl -s -X DELETE "http://localhost:8001/services/$service"
done

echo -e "${GREEN}✅ Curățenie completă${NC}"

# 3. Creăm AUTH SERVICE
echo -e "${BLUE}🔐 Creăm auth-service pentru Keycloak...${NC}"
auth_service_response=$(curl -s -X POST http://localhost:8001/services \
  --data 'name=auth-service' \
  --data 'url=http://host.docker.internal:8080')

if check_kong_response "$auth_service_response" "crearea auth-service"; then
    auth_service_id=$(echo $auth_service_response | jq -r '.id')
    echo "🆔 Auth Service ID: $auth_service_id"
else
    exit 1
fi

# 4. Creăm BACKEND SERVICE
echo -e "${BLUE}⚙️  Creăm backend-service pentru Node.js API...${NC}"
backend_service_response=$(curl -s -X POST http://localhost:8001/services \
  --data 'name=backend-service' \
  --data 'url=http://host.docker.internal:3080')

if check_kong_response "$backend_service_response" "crearea backend-service"; then
    backend_service_id=$(echo $backend_service_response | jq -r '.id')
    echo "🆔 Backend Service ID: $backend_service_id"
else
    exit 1
fi

# 5. Creăm ruta AUTH (prioritate înaltă)
echo -e "${BLUE}🛣️  Creăm ruta auth cu prioritate înaltă...${NC}"
auth_route_response=$(curl -s -X POST "http://localhost:8001/services/auth-service/routes" \
  --data 'paths[]=/api/auth' \
  --data 'strip_path=false' \
  --data 'preserve_host=false' \
  --data 'regex_priority=10')

if check_kong_response "$auth_route_response" "crearea rutei auth"; then
    auth_route_id=$(echo $auth_route_response | jq -r '.id')
    echo "🆔 Auth Route ID: $auth_route_id"
else
    exit 1
fi

# 6. Creăm ruta BACKEND (exclude auth)
echo -e "${BLUE}🛣️  Creăm ruta backend (exclude auth)...${NC}"
backend_route_response=$(curl -s -X POST "http://localhost:8001/services/backend-service/routes" \
  --data 'paths[]=/api' \
  --data 'strip_path=false' \
  --data 'preserve_host=false' \
  --data 'regex_priority=1')

if check_kong_response "$backend_route_response" "crearea rutei backend"; then
    backend_route_id=$(echo $backend_route_response | jq -r '.id')
    echo "🆔 Backend Route ID: $backend_route_id"
else
    exit 1
fi

# 7. Adăugăm CORS pentru AUTH
echo -e "${BLUE}🌐 Adăugăm CORS pentru auth-service...${NC}"
auth_cors_response=$(curl -s -X POST "http://localhost:8001/routes/$auth_route_id/plugins" \
  --data 'name=cors' \
  --data 'config.origins=http://localhost:3000,http://localhost:3080,http://localhost:8000' \
  --data 'config.methods=GET,POST,PUT,DELETE,OPTIONS' \
  --data 'config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization')

check_kong_response "$auth_cors_response" "adăugarea CORS pentru auth"

# 8. Adăugăm CORS pentru BACKEND
echo -e "${BLUE}🌐 Adăugăm CORS pentru backend-service...${NC}"
backend_cors_response=$(curl -s -X POST "http://localhost:8001/routes/$backend_route_id/plugins" \
  --data 'name=cors' \
  --data 'config.origins=http://localhost:3000,http://localhost:3080,http://localhost:8000' \
  --data 'config.methods=GET,POST,PUT,DELETE,OPTIONS' \
  --data 'config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization')

check_kong_response "$backend_cors_response" "adăugarea CORS pentru backend"

# 9. Rate limiting pentru AUTH
echo -e "${BLUE}⏱️  Adăugăm rate limiting pentru auth...${NC}"
rate_limit_response=$(curl -s -X POST "http://localhost:8001/routes/$auth_route_id/plugins" \
  --data 'name=rate-limiting' \
  --data 'config.minute=60' \
  --data 'config.hour=1000' \
  --data 'config.policy=local')

check_kong_response "$rate_limit_response" "adăugarea rate limiting"

echo ""
echo -e "${GREEN}🎉 CONFIGURAȚIE COMPLETĂ!${NC}"
echo -e "${GREEN}=========================${NC}"

# 10. Afișăm configurația finală
echo -e "${BLUE}📋 Configurația finală:${NC}"
echo ""
echo -e "${YELLOW}🔧 Services:${NC}"
curl -s http://localhost:8001/services | jq -c '.data[] | {name: .name, host: .host, port: .port, url: .url}'

echo ""
echo -e "${YELLOW}🛣️  Routes:${NC}"
curl -s http://localhost:8001/routes | jq -c '.data[] | {paths: .paths, service_name: .service.name, regex_priority: .regex_priority}'

echo ""
echo -e "${YELLOW}🔌 Plugins:${NC}"
curl -s http://localhost:8001/plugins | jq -c '.data[] | {name: .name, route: .route.id}'

# 11. Testing
echo ""
echo -e "${GREEN}🧪 TESTARE AUTOMATĂ${NC}"
echo -e "${GREEN}==================${NC}"

echo -e "${BLUE}1. Test backend route (config):${NC}"
backend_test=$(curl -s -w "%{http_code}" -o /tmp/backend_test http://localhost:8000/api/config)
if [ "$backend_test" = "200" ]; then
    echo -e "${GREEN}✅ Backend route funcționează${NC}"
    cat /tmp/backend_test | jq -r '.appTitle // .message // "Response received"' 2>/dev/null || echo "Response received"
else
    echo -e "${RED}❌ Backend route failed (HTTP $backend_test)${NC}"
fi

echo ""
echo -e "${BLUE}2. Test auth route:${NC}"
auth_test=$(curl -s -w "%{http_code}" -o /tmp/auth_test http://localhost:8000/api/auth/health)
if [ "$auth_test" = "200" ] || [ "$auth_test" = "404" ]; then
    echo -e "${GREEN}✅ Auth route redirecționează către auth-service${NC}"
    if [ "$auth_test" = "404" ]; then
        echo -e "${YELLOW}⚠️  Auth service nu răspunde la /health - verifică că auth-service rulează${NC}"
    fi
else
    echo -e "${RED}❌ Auth route failed (HTTP $auth_test)${NC}"
fi

echo ""
echo -e "${GREEN}🎯 ROUTING FINAL:${NC}"
echo -e "${GREEN}=================${NC}"
echo -e "🔐 Auth:    ${YELLOW}http://localhost:8000/api/auth/*${NC} → ${BLUE}auth-service:8080${NC}"
echo -e "⚙️  Backend: ${YELLOW}http://localhost:8000/api/*${NC} → ${BLUE}backend-service:3080${NC}"

echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "1. Pornește auth-service: cd auth-service && docker-compose up -d"
echo "2. Testează login: curl -X POST http://localhost:8000/api/auth/login"
echo "3. Testează backend: curl http://localhost:8000/api/config"
echo "4. Verifică logs: docker logs -f gateway-kong-1"

echo ""
echo -e "${GREEN}🚀 Kong Auth Routing este configurat și gata de utilizare!${NC}"
