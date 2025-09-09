#!/bin/bash

echo "🧹 Curățăm totul și refacem Kong corect!"
echo "======================================="

# 1. Ștergem toate rutele
echo "🗑️  Ștergem toate rutele..."
curl -s http://localhost:8001/routes | jq -r '.data[].id' | while read route_id; do
    echo "Șterg ruta: $route_id"
    curl -s -X DELETE http://localhost:8001/routes/$route_id
done

# 2. Ștergem service-ul
echo "🗑️  Ștergem service-ul..."
curl -s -X DELETE http://localhost:8001/services/backend-service

# 3. Creăm service-ul corect (fără path, cu host.docker.internal)
echo "🔧 Creăm service-ul corect..."
curl -s -X POST http://localhost:8001/services \
  --data name=backend-service \
  --data url='http://host.docker.internal:3080'

# 4. Adăugăm ruta cu /api
echo "🛣️  Adăugăm ruta cu /api..."
curl -s -X POST http://localhost:8001/services/backend-service/routes \
  --data 'paths[]=/api'

# 5. Verificăm configurația
echo "🔍 Verificăm configurația..."
echo "Service:"
curl -s http://localhost:8001/services | jq '.data[0] | {name, host, port, path, url}'
echo ""
echo "Routes:"
curl -s http://localhost:8001/routes | jq '.data[] | {paths, strip_path, service}'

# 6. Testăm
echo "🧪 Testăm..."
echo "curl http://localhost:8000/api/config"
curl -i http://localhost:8000/api/config

echo ""
echo "🎯 Kong acum ar trebui să trimită:"
echo "   http://localhost:8000/api/config → http://host.docker.internal:3080/api/config"
