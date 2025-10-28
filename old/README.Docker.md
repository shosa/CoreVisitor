# CoreVisitor - Docker Setup

## Prerequisiti

1. **Network condivisa** - Assicurati che la network `core-network` esista:
   ```bash
   docker network create core-network
   ```

2. **Servizi condivisi** - Assicurati che i seguenti servizi siano attivi sulla network `core-network`:
   - MySQL (porta 3306)
   - MinIO (porta 9000)
   - Meilisearch (porta 7700)

## Configurazione

Le variabili d'ambiente sono configurate nel file `.env`. Quando usi Docker:
- I servizi usano automaticamente i nomi container (`mysql`, `minio`, `meilisearch`) come hostname
- Il DATABASE_URL viene sovrascritto da docker-compose.yml
- Il MEILISEARCH_HOST viene sovrascritto da docker-compose.yml

## Build & Avvio

### Prima volta (build immagini)
```bash
docker-compose build
```

### Avvio applicazione
```bash
docker-compose up -d
```

### Verifica stato
```bash
docker-compose ps
```

### Log in tempo reale
```bash
docker-compose logs -f
```

### Log specifico servizio
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## Stop & Cleanup

### Stop senza rimuovere volumi
```bash
docker-compose down
```

### Stop e rimuovi volumi
```bash
docker-compose down -v
```

### Rebuild da zero
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Accesso

Dopo l'avvio, l'applicazione sarà accessibile su:
- **Frontend**: http://localhost:82 (via Nginx)
- **Backend API**: http://localhost:82/api (via Nginx)
- **Backend direto**: http://localhost:3004 (se necessario)
- **Frontend diretto**: http://localhost:3005 (se necessario)

## Troubleshooting

### Network non trovata
```
Error: network core-network not found
```
**Soluzione**: Crea la network
```bash
docker network create core-network
```

### Servizi condivisi non raggiungibili
```
Error: Can't connect to MySQL/MinIO/Meilisearch
```
**Soluzione**: Verifica che i servizi siano sulla stessa network
```bash
docker network inspect core-network
```

### Prisma migrations
Le migrations vengono applicate automaticamente all'avvio del backend grazie al comando:
```bash
npx prisma migrate deploy || true
```

Se vuoi applicarle manualmente:
```bash
docker-compose exec backend npx prisma migrate deploy
```

### Rebuild solo un servizio
```bash
docker-compose build backend
docker-compose up -d backend
```

## Sviluppo locale vs Docker

- **Sviluppo locale**: Usa `npm run dev` - i servizi usano `localhost` come hostname
- **Docker**: Usa `docker-compose` - i servizi usano nomi container come hostname (configurati in docker-compose.yml)

## Porte utilizzate

| Servizio | Porta Host | Porta Container |
|----------|------------|-----------------|
| Nginx    | 82         | 80              |
| Backend  | 3004       | 3004            |
| Frontend | 3005       | 3005            |
