#!/bin/bash

echo "🧠 Geniu Kong Fix Script - Rezolvăm path-urile!"
echo "================================================"

# 1. Ștergem service-ul actual
echo "🗑️  Ștergem service-ul actual..."
curl -s -X DELETE http://localhost:8001/services/backend-service
echo "✅ Service șters"

# 2. Creăm service-ul fără path=/api (doar host + port)
echo "🔧 Creăm service-ul nou fără path..."
curl -s -X POST http://localhost:8001/services \
  --data name=backend-service \
  --data url='http://host.docker.internal:3080'
echo "✅ Service creat"

# 3. Adăugăm ruta cu /api
echo "🛣️  Adăugăm ruta cu /api..."
curl -s -X POST http://localhost:8001/services/backend-service/routes \
  --data 'paths[]=/api'
echo "✅ Rută adăugată"

# 4. Testăm configurația
echo "🧪 Testăm configurația..."
echo "curl http://localhost:8000/api/config"
curl -i http://localhost:8000/api/config

echo ""
echo "🎉 Script complet! Kong acum trimite:"
echo "   http://localhost:8000/api/config → http://host.docker.internal:3080/api/config"
