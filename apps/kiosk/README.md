# CoreVisitor Kiosk

App mobile Capacitor per tablet Android - Gestione visitatori esterni

## 🎯 Modalità

### 1. **Modalità Kiosk** (senza autenticazione)
- Scanner QR code per check-out rapido
- Nessun login richiesto
- Interfaccia semplificata
- Ideale per postazione all'uscita

### 2. **Modalità Completa** (con autenticazione)
- Dashboard visite in tempo reale
- Gestione completa visitatori
- Check-in/check-out manuale
- Statistiche e reports
- Login obbligatorio (receptionist/security)

## 🚀 Quick Start

### Installazione Dipendenze
```bash
npm install
```

### Sviluppo Web (Browser)
```bash
npm start
```
Apri [http://localhost:3000](http://localhost:3000)

### Build Production Android
```bash
# Esegui script automatico
build-android.bat

# Oppure manualmente:
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

### Sviluppo Mobile con Live Reload
```bash
# Esegui script automatico
run-mobile-dev.bat

# Oppure manualmente:
npm start  # In una finestra
npx cap sync android  # In un'altra finestra
npx cap open android
```

## 📱 Configurazione Android

### Permessi Richiesti
- **CAMERA**: Scanner QR code
- **INTERNET**: Comunicazione con backend
- **VIBRATE**: Feedback tattile

### Network Security
L'app è configurata per accettare connessioni HTTP da:
- `localhost`
- `192.168.*` (rete locale)
- `10.*` (rete aziendale)
- `172.*` (rete Docker)

## 🔧 Configurazione Server Backend

All'avvio dell'app puoi configurare l'URL del server CoreVisitor:
- **Auto-discovery**: Scansione automatica rete locale
- **Manuale**: Inserimento IP/URL custom

URL salvato in: `localStorage.corevisitor_server_url`

## 📡 API Backend Richieste

L'app necessita dei seguenti endpoint backend:

### Mobile API (Unificata)
```
POST /api/mobile/login
  - action: "login" | "get_users" | "profile"
  - username, password, app_type: "visitor-kiosk"
```

### Kiosk API (Specifica)
```
POST /api/kiosk/verify-badge
  - badge_code: string

POST /api/kiosk/check-out
  - visit_id: number
  - badge_code: string

GET /api/kiosk/current-visitors
GET /api/kiosk/stats
```

### Visits API
```
GET /api/visits
GET /api/visits/current
GET /api/visits/stats
POST /api/visits/:id/check-in
POST /api/visits/:id/check-out
```

## 🏗️ Struttura Progetto

```
src/
├── components/
│   ├── Common/          # Componenti riutilizzabili
│   │   ├── TopBar.js
│   │   ├── PageTransition.js
│   │   ├── Alert.js
│   │   ├── Modal.js
│   │   └── UserPopup.js
│   ├── Kiosk/          # Modalità Kiosk
│   │   └── ScanQR.js
│   ├── Dashboard/      # Modalità Completa
│   │   └── Dashboard.js
│   ├── ModeSelection.js
│   └── Login.js
├── services/
│   ├── api.js          # Client HTTP unificato
│   ├── capacitorHttp.js
│   └── scanner.js      # Scanner QR/Barcode
├── config/
│   └── api.js          # Configurazione server
├── styles/
│   └── theme.js        # Palette colori CoreSuite
└── App.js              # Navigation state-based
```

## 🎨 Design System

### Palette Colori
- **Primary**: `#1a1a1a` (Nero CoreSuite)
- **Accent**: `#3b82f6` (Blu azioni)
- **Success**: `#10b981` (Verde conferme)
- **Warning**: `#f59e0b` (Arancione attenzioni)
- **Danger**: `#ef4444` (Rosso errori)

### Animazioni
- **Framer Motion** per transizioni fluide
- **Feedback tattile** con Haptics API
- **Page transitions** tra schermate

## 📦 Plugin Capacitor Utilizzati

- `@capacitor/core` - Core Capacitor
- `@capacitor/android` - Piattaforma Android
- `@capacitor/camera` - Accesso fotocamera
- `@capacitor/haptics` - Feedback tattile
- `@capacitor/browser` - Apertura URL esterni
- `@capacitor/filesystem` - File system
- `@capacitor-mlkit/barcode-scanning` - Scanner QR/Barcode ML Kit

## 🔐 Sicurezza

- JWT authentication per modalità completa
- HTTPS scheme per Android
- Network security config per HTTP interno
- Validazione badge server-side
- Audit log di tutte le operazioni

## 🐛 Debug

### Logs
```bash
# Android Logcat
adb logcat | findstr "CoreVisitor"

# Chrome DevTools
chrome://inspect
```

### Common Issues

**Scanner non funziona?**
- Verifica permessi camera in AndroidManifest.xml
- Controlla che il plugin ML Kit sia installato

**Impossibile connettersi al server?**
- Verifica che PC e tablet siano sulla stessa rete
- Controlla firewall Windows
- Usa IP statico invece di localhost

**Build fallisce?**
- Pulisci cache: `rm -rf node_modules build android`
- Reinstalla: `npm install`
- Verifica Java JDK 17

## 📄 License

MIT © CoreSuite 2025
