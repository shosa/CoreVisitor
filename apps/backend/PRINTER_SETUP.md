# Stampante ESC/POS - Setup e Configurazione

## Panoramica

Il sistema di stampa badge per CoreVisitor supporta stampanti termiche ESC/POS con tre modalità di connessione:
- **USB**: Collegamento diretto via USB
- **Network**: Stampante di rete (Ethernet/WiFi)
- **File**: Modalità test che scrive su file

## Prerequisiti

### Hardware
- Stampante termica ESC/POS (58mm o 80mm)
- Driver stampante installati (se necessari)

### Software
```bash
npm install node-thermal-printer
```

## Database Migration

Prima di utilizzare il sistema di stampa, esegui la migration del database:

```bash
cd apps/backend
npm run migrate
```

Questo creerà le tabelle:
- `print_jobs`: Coda di stampa
- `printer_configs`: Configurazioni stampanti

## Configurazione Stampante

### 1. Aggiungere configurazione stampante

**Via API:**
```bash
POST /api/printer/configs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Stampante Badge Reception",
  "type": "escpos",
  "connection": "usb",
  "address": "/dev/usb/lp0",  // Linux
  // "address": "USB001",        // Windows (auto-detect)
  "isDefault": true
}
```

**Per stampante di rete:**
```json
{
  "name": "Stampante Badge Rete",
  "type": "escpos",
  "connection": "network",
  "address": "192.168.1.100",
  "port": 9100,
  "isDefault": true
}
```

### 2. Trovare indirizzo stampante

**Windows:**
```cmd
# Le stampanti USB vengono auto-rilevate
# Lascia "address" vuoto o usa "USB001"
```

**Linux:**
```bash
# USB
ls /dev/usb/lp*
# oppure
lsusb

# Network
ping <ip-stampante>
```

**macOS:**
```bash
# USB
ls /dev/cu.usb*

# Network - usa IP della stampante
```

## Inizializzazione Stampante

### Via API

```bash
POST /api/printer/init
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "usb"
  // oppure
  // "type": "network",
  // "address": "192.168.1.100",
  // "port": 9100
}
```

### Via Codice

```typescript
import { PrinterService } from './printer/printer.service';

// Inizializza stampante USB
await printerService.initPrinter({
  type: 'usb',
});

// Inizializza stampante di rete
await printerService.initPrinter({
  type: 'network',
  address: '192.168.1.100',
  port: 9100,
});

// Modalità test (scrive su file)
await printerService.initPrinter({
  type: 'file',
  address: './test-print.txt',
});
```

## Test Stampante

```bash
POST /api/printer/test
Authorization: Bearer <token>
```

Stampa un badge di test per verificare il funzionamento.

## Stampa Badge

### Automatica (con coda)

```bash
POST /api/printer/badge/:visitId
Authorization: Bearer <token>
Content-Type: application/json

{
  "copies": 1,
  "priority": 0,
  "printerName": "Stampante Badge Reception"
}
```

Il badge viene aggiunto alla coda e stampato automaticamente.

### Diretta (senza coda)

```typescript
import { PrintQueueService } from './printer/print-queue.service';

await printQueueService.addBadgePrintJob({
  visitId: 'xxx',
  badgeData: {
    visitorName: 'Mario Rossi',
    company: 'Azienda SRL',
    badgeNumber: 'VIS-ABC123',
    visitDate: '11/11/2025',
    department: 'IT',
    host: 'Giuseppe Verdi',
    qrCode: 'data:image/png;base64,...',
  },
  copies: 1,
});
```

## Gestione Coda di Stampa

### Stato coda

```bash
GET /api/printer/queue/status
```

Risposta:
```json
{
  "pending": 5,
  "printing": 1,
  "completed": 120,
  "failed": 2
}
```

### Lista lavori di stampa

```bash
GET /api/printer/jobs?status=failed&limit=10
```

### Ritenta stampa fallita

```bash
PATCH /api/printer/jobs/:jobId/retry
```

### Annulla stampa

```bash
DELETE /api/printer/jobs/:jobId
```

### Cleanup lavori vecchi

```bash
POST /api/printer/cleanup
```

Elimina lavori completati più vecchi di 7 giorni.

## Template Badge

Il badge stampato include:

```
================================
       VISITOR BADGE
================================

MARIO ROSSI
Company: Azienda SRL

Badge: VIS-ABC123
Date: 11/11/2025
Department: IT
Host: Giuseppe Verdi

    [QR CODE]

================================
Please wear this badge
at all times
================================
```

## Formato Carta

- **58mm**: Carta termica 58mm (scontrini)
- **80mm**: Carta termica 80mm (badge più grandi)

La libreria si adatta automaticamente alla larghezza carta.

## Troubleshooting

### Stampante non connessa

**Errore:** `Printer not connected`

**Soluzioni:**
1. Verifica che la stampante sia accesa
2. Controlla il cavo USB o la connessione di rete
3. Su Linux: verifica permessi `/dev/usb/lp*`
   ```bash
   sudo chmod 666 /dev/usb/lp0
   ```
4. Verifica driver installati

### QR Code non stampato

**Causa:** Immagine QR code non valida o troppo grande

**Soluzione:** Il sistema stampa comunque il badge senza QR code. Verifica che `badgeQRCode` sia un data URL base64 valido.

### Stampa troppo lenta

**Causa:** Coda sovraccarica

**Soluzioni:**
1. Aumenta priorità: `priority: 10`
2. Usa stampanti multiple
3. Monitora coda: `GET /api/printer/queue/status`

### Carta inceppata

1. Spegni stampante
2. Rimuovi carta inceppata
3. Ricarica carta
4. Riaccendi stampante
5. Ritenta stampe fallite:
   ```bash
   GET /api/printer/jobs?status=failed
   PATCH /api/printer/jobs/:jobId/retry
   ```

## Configurazione Avanzata

### Settings stampante

```json
{
  "name": "Stampante Custom",
  "connection": "usb",
  "settings": {
    "paperWidth": 58,
    "characterSet": "PC858_EURO",
    "timeout": 5000,
    "removeSpecialCharacters": false
  }
}
```

### Coda automatica

Il servizio `PrintQueueService` processa la coda automaticamente ogni 5 secondi. Per modificare:

```typescript
// print-queue.service.ts
this.processingInterval = setInterval(() => {
  this.processQueue();
}, 3000); // 3 secondi invece di 5
```

## API Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/printer/init` | POST | Inizializza stampante |
| `/api/printer/test` | POST | Stampa di test |
| `/api/printer/status` | GET | Stato stampante |
| `/api/printer/badge/:visitId` | POST | Stampa badge per visita |
| `/api/printer/queue/status` | GET | Stato coda |
| `/api/printer/jobs` | GET | Lista lavori |
| `/api/printer/jobs/:id/retry` | PATCH | Ritenta stampa |
| `/api/printer/jobs/:id` | DELETE | Annulla stampa |
| `/api/printer/cleanup` | POST | Pulisci lavori vecchi |
| `/api/printer/configs` | GET | Lista configurazioni |
| `/api/printer/configs` | POST | Crea configurazione |
| `/api/printer/configs/:id` | PATCH | Modifica configurazione |
| `/api/printer/configs/:id` | DELETE | Elimina configurazione |

## Log e Monitoring

I log della stampante sono disponibili in console:

```
[PrinterService] Printer initialized successfully: usb
[PrintQueueService] Print job created: xxx for visit: yyy
[PrintQueueService] Processing 3 print jobs
[PrinterService] Badge printed successfully for: Mario Rossi
[PrintQueueService] Print job completed: xxx
```

## Esempio Completo

```typescript
// 1. Inizializza stampante (una volta all'avvio)
await printerService.initPrinter({ type: 'usb' });

// 2. Test stampante
await printerService.testPrint();

// 3. Crea visita e stampa badge
const visit = await prisma.visit.create({
  data: {
    // ... dati visita
  },
  include: {
    visitor: true,
    department: true,
    hostUser: true,
  },
});

// 4. Aggiungi a coda di stampa
const jobId = await printQueueService.addBadgePrintJob({
  visitId: visit.id,
  badgeData: {
    visitorName: `${visit.visitor.firstName} ${visit.visitor.lastName}`,
    company: visit.visitor.company,
    badgeNumber: visit.badgeNumber,
    visitDate: new Date().toLocaleDateString('it-IT'),
    department: visit.department.name,
    host: visit.hostUser
      ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
      : visit.hostName,
    qrCode: visit.badgeQRCode,
  },
  copies: 1,
});

// 5. La coda processerà automaticamente la stampa entro 5 secondi

// 6. Verifica stato
const status = await printQueueService.getQueueStatus();
console.log(status); // { pending: 0, printing: 1, completed: 1, failed: 0 }
```

## Prossimi Passi

1. ✅ Installare libreria: `npm install node-thermal-printer`
2. ✅ Eseguire migration database: `npm run migrate`
3. ⚠️ Collegare stampante ESC/POS
4. ⚠️ Configurare stampante via API
5. ⚠️ Testare stampa: `POST /api/printer/test`
6. ⚠️ Integrare nel frontend kiosk
