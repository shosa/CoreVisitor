# CoreVisitor - Deployment Guide

Guida completa per il deployment di CoreVisitor con Docker.

## Architettura

CoreVisitor è composto da 3 applicazioni containerizzate:

1. **Backend (NestJS)** - API REST su porta 3006
2. **Frontend (Next.js)** - Dashboard amministrativa su porta 3007
3. **Kiosk (React PWA)** - Self-service kiosk su porta 3008

Tutte le app sono accessibili tramite il reverse proxy Nginx centralizzato (CoreServices):
- Frontend: http://localhost:83
- Kiosk: http://localhost:85

## Quick Start

### 1. Avvia i servizi condivisi (CoreServices)

```bash
cd CoreServices
docker-compose up -d
```

Questo avvia:
- MySQL (porta 3306)
- MinIO (porte 9000, 9001)
- Meilisearch (porta 7700)
- Redis (porta 6379)
- Nginx (porte 80-85, 443)

### 2. Configura l'ambiente

Copia e modifica il file `.env` in `CoreVisitor/`:

```bash
cd CoreVisitor
cp .env.example .env
# Modifica le variabili se necessario
```

### 3. Build e avvio di CoreVisitor

```bash
# Build di tutte le app
docker-compose build

# Avvio di tutti i servizi
docker-compose up -d

# Verifica lo stato
docker-compose ps
```

## Accesso alle Applicazioni

| Applicazione | URL | Porta Diretta | Porta Nginx |
|--------------|-----|---------------|-------------|
| Backend API | http://localhost:3006 | 3006 | - |
| Frontend Dashboard | http://localhost:83 | 3007 | 83 |
| Kiosk PWA | http://localhost:85 | 3009 | 85 |

## Build Individuale

### Solo Backend

```bash
docker-compose build backend
docker-compose up -d backend
```

### Solo Frontend

```bash
docker-compose build frontend
docker-compose up -d frontend
```

### Solo Kiosk

```bash
docker-compose build kiosk
docker-compose up -d kiosk
```

## Rebuild Completo

Quando ci sono modifiche significative al codice:

```bash
# Stop di tutti i container
docker-compose down

# Rebuild senza cache
docker-compose build --no-cache

# Avvio
docker-compose up -d
```

## Monitoraggio

### Log in tempo reale

```bash
# Tutti i servizi
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo kiosk
docker-compose logs -f kiosk
```

### Stato dei container

```bash
# Verifica container attivi
docker ps | grep corevisitor

# Dettagli di un container
docker inspect corevisitor-backend
```

### Health Check

```bash
# Backend health
curl http://localhost:3006/health

# Frontend (tramite nginx)
curl http://localhost:83

# Kiosk (tramite nginx)
curl http://localhost:85
```

## Database

### Migrazioni Prisma

Le migrazioni vengono eseguite automaticamente all'avvio del backend.

Per eseguirle manualmente:

```bash
# Accedi al container backend
docker exec -it corevisitor-backend sh

# Esegui le migrazioni
npx prisma migrate deploy

# Verifica lo stato
npx prisma migrate status
```

### Seed del Database

```bash
docker exec -it corevisitor-backend sh
npm run seed
```

### Backup Database

```bash
# Esporta il database
docker exec core-mysql mysqldump -u root -p corevisitor > backup.sql

# Importa il database
docker exec -i core-mysql mysql -u root -p corevisitor < backup.sql
```

## Risoluzione Problemi

### Container non si avvia

```bash
# Controlla i log
docker-compose logs backend

# Verifica la configurazione
docker-compose config

# Ricrea il container
docker-compose up -d --force-recreate backend
```

### Errori di rete tra container

```bash
# Verifica la network core-network
docker network inspect core-network

# Lista container nella network
docker network inspect core-network | grep Name
```

### Problemi di build

```bash
# Pulisci tutto e rebuilda
docker-compose down -v
docker system prune -a
docker-compose build --no-cache
docker-compose up -d
```

### CORS Errors

Verifica che `.env` contenga:
```env
CORS_ORIGIN=http://localhost:3000,http://localhost:83,http://localhost:85
```

E riavvia il backend:
```bash
docker-compose restart backend
```

## Aggiornamento Nginx

Dopo modifiche a `CoreServices/nginx/nginx.conf`:

```bash
cd CoreServices
docker-compose restart nginx
```

## Stop e Pulizia

```bash
# Stop di tutti i servizi CoreVisitor
docker-compose down

# Rimuovi anche i volumi (⚠️ cancella i dati!)
docker-compose down -v

# Rimuovi le immagini
docker-compose down --rmi all
```

## Deployment in Produzione

### Configurazione Produzione

1. **Aggiorna `.env` con credenziali sicure**:
   - JWT_SECRET
   - MYSQL_PASSWORD
   - MINIO_SECRET_KEY
   - MEILISEARCH_API_KEY

2. **Configura HTTPS in nginx**:
   - Aggiungi certificati SSL in `CoreServices/nginx/ssl/`
   - Aggiorna `nginx.conf` per HTTPS

3. **Configura backup automatici**:
   ```bash
   # Cron per backup giornaliero
   0 2 * * * docker exec core-mysql mysqldump -u root -p$MYSQL_PASSWORD corevisitor > /backup/corevisitor_$(date +\%Y\%m\%d).sql
   ```

### Deploy su Server

```bash
# Copia i file sul server
scp -r CoreVisitor stefano@server:/opt/CoreSuite/

# Connettiti al server
ssh stefano@server

# Avvia i servizi
cd /opt/CoreSuite/CoreVisitor
docker-compose up -d --build
```

## Struttura Porte

| Servizio | Porta | Descrizione |
|----------|-------|-------------|
| 80 | Nginx | CoreHub Dashboard |
| 81 | Nginx | CoreMachine |
| 82 | Nginx | CoreDocument |
| 83 | Nginx | CoreVisitor Frontend |
| 84 | Nginx | CoreGre (ERP PHP) |
| 85 | Nginx | CoreVisitor Kiosk |
| 3306 | MySQL | Database |
| 6379 | Redis | Cache |
| 7700 | Meilisearch | Search Engine |
| 9000 | MinIO | Object Storage API |
| 9001 | MinIO | Web Console |
| 8080 | phpMyAdmin | MySQL Web UI |

## Comandi Utili

```bash
# Restart di un singolo servizio
docker-compose restart backend

# Rebuild e restart
docker-compose up -d --build backend

# Accedi alla shell di un container
docker exec -it corevisitor-backend sh

# Copia file da/verso container
docker cp ./file.txt corevisitor-backend:/app/
docker cp corevisitor-backend:/app/file.txt ./

# Statistiche risorse
docker stats corevisitor-backend

# Pulizia immagini non usate
docker image prune -a
```

## Note Tecniche

### Multi-stage Build

Tutti i Dockerfile usano build multi-stage per:
- Ridurre dimensione immagini finali
- Separare dipendenze di build da runtime
- Migliorare sicurezza (no build tools in prod)

### Network Condivisa

Tutti i container CoreVisitor si uniscono alla network `core-network` creata da CoreServices, permettendo comunicazione inter-container usando i nomi dei servizi come hostname.

### Volumi Persistenti

I dati persistenti sono gestiti da CoreServices:
- `core-mysql-data`: Database
- `core-minio-data`: File storage
- `core-meilisearch-data`: Indici di ricerca
- `core-redis-data`: Cache

## Supporto

Per problemi o domande:
- Controlla i log: `docker-compose logs -f`
- Verifica la configurazione: `docker-compose config`
- Consulta la documentazione specifica in `apps/{backend,frontend,kiosk}/`
