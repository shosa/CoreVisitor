# CoreVisitor - Docker Deployment Guide

## Architettura

CoreVisitor fa parte della **CoreSuite** e utilizza i servizi condivisi gestiti da **CoreServices**:

- **Backend API**: Porta 3006 (NestJS)
- **Frontend**: Porta 3005 (Next.js)
- **Nginx**: Porta 83 (gestito da CoreServices)
- **Database**: MySQL condiviso (core-mysql)
- **Object Storage**: MinIO condiviso (core-minio)
- **Search Engine**: Meilisearch condiviso (core-meilisearch)

## Prerequisiti

1. **CoreServices** deve essere avviato PRIMA di CoreVisitor:
   ```bash
   cd ../CoreServices
   docker-compose up -d
   ```

2. La network `core-network` deve esistere (creata automaticamente da CoreServices)

## Configurazione

### 1. Prepara l'ambiente

Per l'ambiente Docker, usa il file `.env.docker`:

```bash
cp .env.docker .env
```

**IMPORTANTE**: Il file `.env.docker` contiene le configurazioni corrette per Docker:
- `MYSQL_HOST=core-mysql` (non localhost)
- `MINIO_ENDPOINT=core-minio` (non localhost)
- `MEILISEARCH_HOST=http://core-meilisearch:7700` (non localhost)

### 2. Verifica le porte

Assicurati che le porte siano libere:
- **3005**: Frontend CoreVisitor
- **3006**: Backend CoreVisitor
- **83**: Nginx (accesso web)

```bash
# Windows
netstat -ano | findstr ":3005 :3006 :83"

# Linux/Mac
lsof -i :3005 -i :3006 -i :83
```

## Build e Avvio

### Primo avvio (con build)

```bash
# Build e avvio
docker-compose up -d --build

# Verifica i log
docker-compose logs -f
```

### Avvii successivi

```bash
# Avvio normale
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart
```

## Verifica Deployment

### 1. Controlla lo stato dei container

```bash
docker ps --filter "name=corevisitor"
```

Dovresti vedere:
- `corevisitor-backend` (running)
- `corevisitor-frontend` (running)

### 2. Controlla i log

```bash
# Tutti i log
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend
```

### 3. Test di connettività

```bash
# Test backend API
curl http://localhost:3006/api

# Test frontend
curl http://localhost:3005

# Test Nginx (accesso completo)
curl http://localhost:83
```

### 4. Accedi all'applicazione

Apri il browser: **http://localhost:83**

## Database

### Migrazioni

Le migrazioni Prisma vengono eseguite automaticamente all'avvio del backend:

```bash
npx prisma migrate deploy
```

### Verifica database

```bash
# Accedi al container MySQL
docker exec -it core-mysql mysql -u root -prootpassword

# Seleziona il database
USE corevisitor;

# Verifica le tabelle
SHOW TABLES;

# Esci
EXIT;
```

## Troubleshooting

### I container non si avviano

1. **Verifica CoreServices**:
   ```bash
   cd ../CoreServices
   docker-compose ps
   ```

2. **Verifica la network**:
   ```bash
   docker network ls | findstr core-network
   ```

3. **Ricrea la network** (se necessario):
   ```bash
   docker network create core-network
   ```

### Errori di connessione al database

1. Verifica che MySQL sia attivo:
   ```bash
   docker ps | findstr core-mysql
   ```

2. Testa la connessione:
   ```bash
   docker exec -it corevisitor-backend sh
   nc -zv core-mysql 3306
   exit
   ```

### Errori Prisma

1. **Rigenera Prisma Client**:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

2. **Esegui manualmente le migrazioni**:
   ```bash
   docker exec -it corevisitor-backend sh
   npx prisma migrate deploy
   exit
   ```

### Frontend non raggiunge il backend

1. Verifica l'env var `NEXT_PUBLIC_API_URL`:
   ```bash
   docker exec -it corevisitor-frontend env | grep NEXT_PUBLIC_API_URL
   ```
   Dovrebbe essere: `NEXT_PUBLIC_API_URL=/api`

2. Rebuild del frontend:
   ```bash
   docker-compose up -d --build frontend
   ```

### Nginx non raggiunge i container

1. Verifica che nginx sia nella stessa network:
   ```bash
   docker network inspect core-network
   ```

2. Riavvia nginx:
   ```bash
   cd ../CoreServices
   docker-compose restart core-nginx
   ```

## Comandi Utili

### Rebuild completo

```bash
# Stop e rimuovi tutto
docker-compose down -v

# Rebuild da zero
docker-compose up -d --build
```

### Verifica network

```bash
# Ispeziona la network condivisa
docker network inspect core-network
```

### Accedi ai container

```bash
# Backend
docker exec -it corevisitor-backend sh

# Frontend
docker exec -it corevisitor-frontend sh
```

### Pulisci tutto

```bash
# Stop e rimuovi container
docker-compose down

# Rimuovi anche i volumi (ATTENZIONE: cancella i dati)
docker-compose down -v

# Rimuovi le immagini
docker rmi corevisitor-backend corevisitor-frontend
```

## Porte Utilizzate

| Servizio | Porta Host | Porta Container | Descrizione |
|----------|------------|-----------------|-------------|
| Frontend | 3005 | 3000 | Next.js app |
| Backend | 3006 | 3006 | NestJS API |
| Nginx | 83 | 80 | Reverse proxy |

## Architettura dei Servizi Condivisi

```
CoreServices (core-network)
├── core-mysql:3306         → Database condiviso
├── core-minio:9000         → Object storage condiviso
├── core-meilisearch:7700   → Search engine condiviso
└── core-nginx:80,81,82,83  → Reverse proxy centralizzato
    ├── :80  → CoreHub
    ├── :81  → CoreMachine
    ├── :82  → CoreDocument
    └── :83  → CoreVisitor (questo progetto)
```

## Monitoring

### Health checks

```bash
# Backend health
curl http://localhost:3006/api/health

# Frontend health
curl http://localhost:3005/api/health
```

### Logs in tempo reale

```bash
# Tutti i servizi
docker-compose logs -f --tail=100

# Solo errori
docker-compose logs -f | grep -i error
```

## Backup e Restore

### Backup database

```bash
# Backup completo
docker exec core-mysql mysqldump -u root -prootpassword corevisitor > backup_corevisitor_$(date +%Y%m%d).sql
```

### Restore database

```bash
# Restore
docker exec -i core-mysql mysql -u root -prootpassword corevisitor < backup_corevisitor_20250127.sql
```

## Note di Sicurezza

⚠️ **IMPORTANTE PER PRODUZIONE**:

1. Cambia le password di default nel file `.env`:
   - `MYSQL_PASSWORD`
   - `JWT_SECRET`
   - `MINIO_SECRET_KEY`
   - `MEILISEARCH_API_KEY`

2. Usa HTTPS in produzione (configura SSL su nginx)

3. Limita l'accesso alle porte esterne (usa firewall)

4. Abilita i backup automatici del database

## Supporto

Per problemi o domande:
1. Controlla i log: `docker-compose logs -f`
2. Verifica la configurazione: `docker-compose config`
3. Controlla lo stato: `docker-compose ps`
