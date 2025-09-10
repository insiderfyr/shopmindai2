# Kong Manual Setup - Auth Microservice Routing

## Verificăm starea actuală Kong

```bash
# Verificăm dacă Kong rulează
curl http://localhost:8001

# Vedem service-urile existente
curl http://localhost:8001/services

# Vedem rutele existente
curl http://localhost:8001/routes
```

## STEP 1: Curățăm configurația existentă

```bash
# Obținem ID-urile rutelor existente
curl -s http://localhost:8001/routes | jq -r '.data[].id'

# Ștergem fiecare rută (înlocuiește {ROUTE_ID} cu ID-ul real)
curl -X DELETE http://localhost:8001/routes/{ROUTE_ID}

# Ștergem service-ul backend dacă există
curl -X DELETE http://localhost:8001/services/backend-service
```

## STEP 2: Creăm AUTH SERVICE

```bash
# Creăm service-ul pentru auth microservice (Go + Keycloak)
curl -X POST http://localhost:8001/services \
  --data name=auth-service \
  --data url='http://host.docker.internal:8080'
```

## STEP 3: Creăm BACKEND SERVICE

```bash
# Creăm service-ul pentru backend API (Node.js)
curl -X POST http://localhost:8001/services \
  --data name=backend-service \
  --data url='http://host.docker.internal:3080'
```

## STEP 4: Creăm ruta AUTH (prioritate înaltă)

```bash
# Rută pentru /api/auth/* → auth-service:8080
curl -X POST http://localhost:8001/services/auth-service/routes \
  --data 'paths[]=/api/auth' \
  --data 'strip_path=false' \
  --data 'preserve_host=false' \
  --data 'regex_priority=10'
```

## STEP 5: Creăm ruta BACKEND

```bash
# Rută pentru /api/* (exclude auth) → backend-service:3080
curl -X POST http://localhost:8001/services/backend-service/routes \
  --data 'paths[]=/api' \
  --data 'strip_path=false' \
  --data 'preserve_host=false' \
  --data 'regex_priority=1'
```

## STEP 6: Configurăm CORS

```bash
# CORS pentru auth-service (obținem route ID mai întâi)
curl -s http://localhost:8001/routes | jq '.data[] | select(.service.name=="auth-service") | .id'

# Adăugăm CORS (înlocuiește {AUTH_ROUTE_ID})
curl -X POST http://localhost:8001/routes/{AUTH_ROUTE_ID}/plugins \
  --data 'name=cors' \
  --data 'config.origins=http://localhost:3000,http://localhost:3080,http://localhost:8000' \
  --data 'config.methods=GET,POST,PUT,DELETE,OPTIONS' \
  --data 'config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization'

# CORS pentru backend-service (obținem route ID)
curl -s http://localhost:8001/routes | jq '.data[] | select(.service.name=="backend-service") | .id'

# Adăugăm CORS (înlocuiește {BACKEND_ROUTE_ID})
curl -X POST http://localhost:8001/routes/{BACKEND_ROUTE_ID}/plugins \
  --data 'name=cors' \
  --data 'config.origins=http://localhost:3000,http://localhost:3080,http://localhost:8000' \
  --data 'config.methods=GET,POST,PUT,DELETE,OPTIONS' \
  --data 'config.headers=Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Auth-Token,Authorization'
```

## STEP 7: Testing

```bash
# Test auth route
curl -i http://localhost:8000/api/auth/health

# Test backend route
curl -i http://localhost:8000/api/config
```

## Verificare finală

```bash
# Configurația finală
curl http://localhost:8001/services | jq '.data[] | {name, url}'
curl http://localhost:8001/routes | jq '.data[] | {paths, service_name: .service.name}'
```
