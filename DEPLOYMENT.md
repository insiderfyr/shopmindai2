# 🚀 Deployment Guide - ShopMindAI

## GitHub Actions Setup

### 1. Configure Docker Hub Secrets

În repository-ul tău GitHub, mergi la **Settings > Secrets and variables > Actions** și adaugă:

```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_access_token
```

### 2. Configure Cloud Platform Secrets (Optional)

Pentru deployment automat pe platforme cloud:

**Railway:**
```
RAILWAY_TOKEN=your_railway_token
```

**Render:**
```
RENDER_SERVICE_ID=your_service_id
RENDER_API_KEY=your_api_key
```

### 3. Workflows Disponibile

#### 🔨 Build Docker Image
- **Trigger:** Push la `main` sau `develop`
- **Action:** Construiește și push-ează imaginea Docker
- **Output:** `docker.io/your-username/shopmindai:latest`

#### 🧪 Test and Deploy
- **Trigger:** Push la `main`
- **Action:** Rulează teste și deployează pe platforme cloud
- **Output:** Aplicație live pe Railway/Render

### 4. Manual Trigger

Poți porni build-ul manual:
1. Mergi la **Actions** în GitHub
2. Selectează workflow-ul dorit
3. Click **Run workflow**

### 5. Verificare Status

```bash
# Verifică imaginile disponibile
docker images | grep shopmindai

# Rulează din cloud
docker run -d -p 3080:3080 your-username/shopmindai:latest

# Sau folosește docker-compose
docker-compose up -d
```

### 6. Acces Aplicație

După deployment:
- **Local:** http://localhost:3080
- **Cloud:** URL-ul furnizat de platforma de hosting

## 🎯 Beneficii

✅ **Build automat în cloud** - Nu mai consumi resurse locale
✅ **Multi-platform** - AMD64 și ARM64
✅ **Cache inteligent** - Build-uri mai rapide
✅ **Deployment automat** - Live după fiecare push
✅ **Testare automată** - Calitate garantată

## 🔧 Troubleshooting

**Problema:** Build eșuează
**Soluția:** Verifică logurile în GitHub Actions

**Problema:** Imaginea nu pornește
**Soluția:** Verifică variabilele de mediu în docker-compose.yml

**Problema:** Dependențe lipsă
**Soluția:** Adaugă în package.json și rebuild
