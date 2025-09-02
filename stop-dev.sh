#!/bin/bash

# ShopMindAI Development Stop Script
# Oprește backend-ul și frontend-ul

echo "🛑 Oprește ShopMindAI..."

# Oprește procesele Node.js
echo "🔧 Oprește procesele backend..."
pkill -f "node.*server" 2>/dev/null

echo "🎨 Oprește procesele frontend..."
pkill -f "vite" 2>/dev/null

# Așteaptă puțin pentru ca procesele să se oprească
sleep 2

# Verifică dacă mai sunt procese active
if pgrep -f "node.*server" > /dev/null || pgrep -f "vite" > /dev/null; then
    echo "⚠️  Unele procese încă rulează. Forțez oprirea..."
    pkill -9 -f "node.*server" 2>/dev/null
    pkill -9 -f "vite" 2>/dev/null
fi

# Verifică dacă portul 3080 este eliberat
if lsof -Pi :3080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Portul 3080 încă este folosit. Forțez eliberarea..."
    lsof -ti :3080 | xargs kill -9 2>/dev/null
fi

# Șterge fișierul cu PID-uri dacă există
rm -f .dev-pids

echo "✅ ShopMindAI a fost oprit cu succes!"
echo "🌐 Portul 3080 este eliberat"
