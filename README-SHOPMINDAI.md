# ShopMindAI - AI Shopping Assistant

## 🚀 Cum să pornești aplicația

### Cerințe preliminare

1. **Node.js** (v18+) și **npm**
2. **MongoDB** - rulează local sau folosește un serviciu cloud
3. **API Keys** pentru serviciile AI (opțional pentru funcționalități de bază)

### Configurare rapidă

1. **Clonează și instalează dependințele:**
```bash
git clone <repository-url>
cd shopmindai2
npm install
```

2. **Configurează variabilele de mediu:**
```bash
cp librechat.example.yaml librechat.yaml
# Editează librechat.yaml cu configurațiile tale
```

3. **Pornește MongoDB:**
```bash
# Pe macOS cu Homebrew:
brew services start mongodb/brew/mongodb-community

# Sau manual:
mongod --config /opt/homebrew/etc/mongod.conf
```

### Pornire aplicație

#### Metoda 1: Script automat (recomandat)
```bash
./start-dev.sh
```

#### Metoda 2: Manual
```bash
# Terminal 1 - Backend
npm run backend:dev

# Terminal 2 - Frontend  
npm run frontend:dev
```

### Oprire aplicație

#### Metoda 1: Script automat
```bash
./stop-dev.sh
```

#### Metoda 2: Manual
```bash
# Oprește toate procesele Node.js
pkill -f "node.*server"
pkill -f "vite"
```

## 🌐 Acces aplicație

După pornire, aplicația va fi disponibilă la:
- **URL:** http://localhost:3080
- **Health Check:** http://localhost:3080/health

## 🔧 Configurare

### Fișiere de configurare

1. **`.env`** - Variabile de mediu pentru backend
2. **`librechat.yaml`** - Configurare principală aplicație
3. **`docker-compose.yml`** - Pentru deployment cu Docker

### Configurare AI Endpoints

Editează `librechat.yaml` pentru a adăuga endpoint-uri AI:

```yaml
endpoints:
  custom:
    - name: 'OpenAI'
      apiKey: '${OPENAI_API_KEY}'
      baseURL: 'https://api.openai.com/v1'
      models:
        default: ['gpt-4', 'gpt-3.5-turbo']
        fetch: true
```

### Configurare MongoDB

În `.env`:
```bash
MONGO_URI=mongodb://127.0.0.1:27017/LibreChat
```

## 🛠️ Dezvoltare

### Structura proiectului

```
shopmindai2/
├── api/                 # Backend Node.js/Express
│   ├── server/         # Server principal
│   ├── db/             # Conectare MongoDB
│   ├── models/         # Modele de date
│   ├── strategies/     # Autentificare
│   └── cache/          # Sisteme cache
├── client/             # Frontend React
├── packages/           # Pachete interne
└── config/             # Scripturi de configurare
```

### Comenzi utile

```bash
# Testare
npm run test:api        # Teste backend
npm run test:client     # Teste frontend

# Build
npm run frontend        # Build frontend pentru producție
npm run backend         # Pornește backend în producție

# Management utilizatori
npm run create-user     # Creează utilizator nou
npm run list-users      # Listează utilizatori
npm run ban-user        # Banează utilizator

# Management credit
npm run add-balance     # Adaugă credit utilizator
npm run list-balances   # Listează balanțe
```

## 🔍 Debugging

### Loguri

- **Backend:** `api/logs/` - Loguri Winston cu rotație
- **MongoDB:** `/var/log/mongodb/mongod.log` (sau configurația ta)

### Verificare status

```bash
# Verifică procese active
ps aux | grep -E "(node|vite)" | grep -v grep

# Verifică porturi
lsof -i :3080

# Verifică MongoDB
mongo --eval "db.runCommand('ping')"
```

## 🚀 Deployment

### Docker (recomandat)

```bash
# Build și pornire
docker-compose up -d

# Verificare status
docker-compose ps

# Loguri
docker-compose logs -f
```

### Producție

```bash
# Build frontend
npm run frontend

# Pornește backend
npm run backend
```

## 📚 Documentație

- **LibreChat Docs:** https://docs.librechat.ai
- **API Reference:** https://docs.librechat.ai/api
- **Configuration:** https://docs.librechat.ai/configuration

## 🤝 Contribuții

1. Fork repository
2. Creează branch pentru feature: `git checkout -b feature/nume-feature`
3. Commit schimbările: `git commit -am 'Adaugă feature'`
4. Push la branch: `git push origin feature/nume-feature`
5. Creează Pull Request

## 📄 Licență

Acest proiect este bazat pe LibreChat și este sub licență ISC.
