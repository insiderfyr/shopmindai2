#!/bin/bash

# ShopMindAI Development Startup Script
# Pornește backend-ul și frontend-ul în modul development

echo "🚀 Pornesc ShopMindAI în modul development..."

# Verifică dacă MongoDB rulează
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB nu rulează! Pornește MongoDB mai întâi:"
    echo "   brew services start mongodb/brew/mongodb-community"
    exit 1
fi

echo "✅ MongoDB rulează"

# Verifică dacă portul 3080 este liber
if lsof -Pi :3080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Portul 3080 este deja folosit. Oprește procesele existente:"
    echo "   pkill -f 'node.*server'"
    echo "   pkill -f 'vite'"
    exit 1
fi

echo "✅ Portul 3080 este liber"

# Pornește backend-ul în background
echo "🔧 Pornesc backend-ul..."
npm run backend:dev &
BACKEND_PID=$!

# Așteaptă ca backend-ul să pornească
echo "⏳ Aștept ca backend-ul să pornească..."
sleep 5

# Verifică dacă backend-ul rulează
if ! curl -s http://localhost:3080/health > /dev/null; then
    echo "❌ Backend-ul nu a pornit corect!"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend-ul rulează pe http://localhost:3080"

# Pornește frontend-ul în background
echo "🎨 Pornesc frontend-ul..."
npm run frontend:dev &
FRONTEND_PID=$!

# Așteaptă ca frontend-ul să pornească
echo "⏳ Aștept ca frontend-ul să pornească..."
sleep 10

# Verifică dacă aplicația este accesibilă
if curl -s http://localhost:3080 > /dev/null; then
    echo ""
    echo "🎉 ShopMindAI rulează cu succes!"
    echo "🌐 Deschide http://localhost:3080 în browser"
    echo ""
    echo "📊 Procese active:"
    echo "   Backend PID: $BACKEND_PID"
    echo "   Frontend PID: $FRONTEND_PID"
    echo ""
    echo "🛑 Pentru a opri aplicația, rulează:"
    echo "   kill $BACKEND_PID $FRONTEND_PID"
    echo "   sau"
    echo "   pkill -f 'node.*server' && pkill -f 'vite'"
    echo ""
    
    # Salvează PID-urile într-un fișier pentru oprire ușoară
    echo "$BACKEND_PID $FRONTEND_PID" > .dev-pids
    
    # Așteaptă semnal de oprire
    trap 'echo ""; echo "🛑 Oprește ShopMindAI..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f .dev-pids; exit 0' INT TERM
    
    # Menține scriptul activ
    while kill -0 $BACKEND_PID 2>/dev/null && kill -0 $FRONTEND_PID 2>/dev/null; do
        sleep 1
    done
else
    echo "❌ Aplicația nu este accesibilă!"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi
