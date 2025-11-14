# CoreVisitor Kiosk - Docker Deployment

Guida per il deployment del CoreVisitor Kiosk in container Docker.

## Architettura

Il Kiosk è una Progressive Web App (PWA) basata su React che viene containerizzata usando:
- **Build Stage**: Node 18 Alpine per compilare l'app React
- **Runtime Stage**: Nginx Alpine per servire i file statici

## Accesso

- **Locale (development)**: http://localhost:3009
- **Tramite Nginx (production)**: http://localhost:85

## Prerequisiti

1. Assicurati che i servizi CoreServices siano attivi:
   ```bash
   cd ../CoreServices
   docker-compose up -d
   ```

2. Verifica che il backend di CoreVisitor sia attivo:
   ```bash
   cd CoreVisitor
   docker-compose up -d backend
   ```

## Build e Deploy

### 1. Build del container Kiosk

Dal root di CoreVisitor:

```bash
# Build del solo servizio kiosk
docker-compose build kiosk

# Oppure build forzato senza cache
docker-compose build --no-cache kiosk
```

### 2. Avvio del container

```bash
# Avvia il kiosk
docker-compose up -d kiosk

# Oppure avvia tutti i servizi CoreVisitor (backend, frontend, kiosk)
docker-compose up -d
```

### 3. Verifica che sia attivo

```bash
# Controlla i log
docker-compose logs -f kiosk

# Verifica lo stato
docker ps | grep corevisitor-kiosk
```

### 4. Restart dopo modifiche

```bash
# Rebuild e restart
docker-compose up -d --build kiosk
```

## Configurazione Nginx

Il kiosk è accessibile tramite il reverse proxy centralizzato di CoreServices sulla porta 85.

La configurazione nginx per il kiosk si trova in:
- `CoreServices/nginx/nginx.conf` (sezione CoreVisitor Kiosk - Porta 85)

```nginx
server {
    listen 85;
    server_name _;

    location / {
        proxy_pass http://corevisitor-kiosk:80;
        # ... headers ...
    }
}
```

## Risoluzione Problemi

### Il container non si avvia

```bash
# Controlla i log dettagliati
docker logs corevisitor-kiosk

# Verifica la network
docker network inspect core-network
```

### Il build fallisce

```bash
# Pulisci la cache npm
docker-compose build --no-cache kiosk

# Oppure rimuovi il container e rebuilda
docker rm -f corevisitor-kiosk
docker rmi corevisitor-kiosk
docker-compose up -d --build kiosk
```

### Errori API/CORS

Verifica che:
1. Il backend sia accessibile: http://localhost:3006/api/health
2. La variabile `REACT_APP_API_URL` sia corretta nel `.env`
3. Il CORS nel backend includa `http://localhost:85`

### Ricarica configurazione Nginx

Dopo modifiche a `nginx.conf`:

```bash
cd CoreServices
docker-compose restart nginx
```

## Variabili d'Ambiente

Le variabili sono definite in `CoreVisitor/.env`:

```env
# Kiosk PWA API URL
REACT_APP_API_URL=/api

# CORS Origins (includi porta 85)
CORS_ORIGIN=http://localhost:3000,http://localhost:83,http://localhost:85
```

## Health Check

Il container include un health check che verifica ogni 30s:

```bash
# Verifica manualmente
docker exec corevisitor-kiosk wget --spider http://localhost/
```

## Comandi Utili

```bash
# Stop del kiosk
docker-compose stop kiosk

# Rimozione completa
docker-compose down kiosk
docker rmi corevisitor-kiosk

# Accesso shell nel container
docker exec -it corevisitor-kiosk sh

# Verifica file serviti da nginx
docker exec corevisitor-kiosk ls -la /usr/share/nginx/html
```

## Note Tecniche

### Build Multi-Stage

Il Dockerfile usa 3 stage:
1. **deps**: Installazione dipendenze npm
2. **builder**: Build dell'app React (crea cartella `build/`)
3. **runner**: Nginx che serve i file statici

### Configurazione Nginx Interna

Il container nginx è configurato per:
- Servire SPA React (fallback su `index.html`)
- Proxy delle chiamate `/api` verso il backend
- Gestione corretta di React Router

### Performance

- **Dimensione immagine**: ~25 MB (nginx alpine + build artifacts)
- **Startup time**: ~2-3 secondi
- **RAM usage**: ~10-20 MB

## Deployment in Produzione

Per il deployment su server remoto:

1. **Configura le variabili d'ambiente** per produzione
2. **Usa HTTPS** (configura certificati in `CoreServices/nginx/ssl/`)
3. **Abilita rate limiting** in nginx se necessario
4. **Configura backup automatici** dei volumi Docker

```bash
# Deploy su server remoto
scp -r CoreVisitor stefano@server:/opt/CoreSuite/
ssh stefano@server "cd /opt/CoreSuite/CoreVisitor && docker-compose up -d --build kiosk"
```
