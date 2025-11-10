# 🚀 CoreVisitor Kiosk - Guida Setup

## ✅ Cosa è stato creato

Ho completato la creazione di **CoreVisitor Kiosk**, un'app mobile Capacitor per tablet Android con due modalità operative:

### 📱 Modalità Kiosk (Senza Autenticazione)
- **Scanner QR Code** per check-out rapido visitatori
- Interfaccia minimal e touch-friendly
- Nessun login richiesto
- Ideale per postazione all'uscita

### 🔐 Modalità Completa (Con Autenticazione)
- **Dashboard real-time** con visite in corso
- Gestione completa visitatori e visite
- Check-in/Check-out manuale
- Statistiche e KPI live
- Login obbligatorio (receptionist/security)

---

## 📁 Struttura Creata

```
CoreVisitor/apps/kiosk/
├── src/
│   ├── components/
│   │   ├── Common/              ✅ Componenti riutilizzabili
│   │   │   ├── TopBar.js        - Barra navigazione
│   │   │   ├── PageTransition.js - Animazioni Framer Motion
│   │   │   ├── Alert.js         - Toast/Notifiche
│   │   │   ├── Modal.js         - Modale riutilizzabile
│   │   │   └── UserPopup.js     - Popup info utente
│   │   ├── Kiosk/
│   │   │   └── ScanQR.js        ✅ Scanner QR con ML Kit
│   │   ├── Dashboard/
│   │   │   └── Dashboard.js     ✅ Dashboard modalità completa
│   │   ├── ModeSelection.js     ✅ Schermata scelta modalità
│   │   └── Login.js             ✅ Autenticazione utenti
│   ├── services/
│   │   ├── api.js               ✅ Client HTTP unificato
│   │   ├── capacitorHttp.js     ✅ Wrapper Capacitor (bypass CORS)
│   │   └── scanner.js           ✅ Servizio scanner QR/Barcode
│   ├── config/
│   │   └── api.js               ✅ Configurazione server backend
│   ├── styles/
│   │   └── theme.js             ✅ Design system CoreSuite
│   ├── App.js                   ✅ Navigation state-based
│   ├── index.js
│   └── index.css
├── public/
│   ├── index.html               ✅ HTML template
│   └── manifest.json            ✅ PWA manifest
├── capacitor.config.ts          ✅ Configurazione Capacitor
├── package.json                 ✅ Dipendenze complete
├── tsconfig.json
├── ionic.config.json
├── build-android.bat            ✅ Script build produzione
├── run-mobile-dev.bat           ✅ Script dev con live reload
└── README.md                    ✅ Documentazione completa
```

### Backend API Creati

```
CoreVisitor/apps/backend/src/
├── mobile/                      ✅ API mobile unificata
│   ├── mobile.controller.ts     - POST /api/mobile/login
│   ├── mobile.service.ts        - Login, get users, profile
│   └── mobile.module.ts
├── kiosk/                       ✅ API specifiche kiosk
│   ├── kiosk.controller.ts      - Endpoint kiosk
│   ├── kiosk.service.ts         - Business logic
│   └── kiosk.module.ts
└── app.module.ts                ✅ Moduli registrati
```

---

## 🛠️ Prossimi Passi per Avviare l'App

### 1. Installazione Dipendenze

```bash
cd C:\Users\Stefano\Desktop\CoreSuite\CoreVisitor\apps\kiosk
npm install
```

### 2. Sviluppo in Browser (Opzionale)

```bash
npm start
```
Apri [http://localhost:3000](http://localhost:3000)

### 3. Build Android Produzione

**Opzione A: Script Automatico** (Consigliato)
```bash
build-android.bat
```

**Opzione B: Manuale**
```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Questo aprirà Android Studio. Da lì:
1. **Build → Generate Signed Bundle / APK**
2. Seleziona **APK**
3. Crea/seleziona keystore per firmare l'APK
4. Build e installa su tablet

### 4. Sviluppo con Live Reload

Per sviluppare con hot reload sul dispositivo:

```bash
run-mobile-dev.bat
```

Questo script:
1. Rileva automaticamente l'IP del PC
2. Avvia React Dev Server
3. Sincronizza con Capacitor
4. Apre Android Studio

Poi in Android Studio:
1. Connetti tablet via USB
2. Clicca **Run** (freccia verde)
3. Ogni modifica al codice si aggiorna automaticamente sul tablet!

---

## 📋 Checklist Pre-Build

### Requisiti Sistema
- [ ] **Node.js** 18+ installato
- [ ] **Java JDK** 17 installato
- [ ] **Android Studio** installato
- [ ] **Android SDK** configurato
- [ ] Tablet Android connesso o emulatore avviato

### Configurazione Android

Quando esegui `npx cap add android`, verrà creata la cartella `/android`. Dovrai:

1. **Creare `network_security_config.xml`**

Crea file: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">192.168.1.0</domain>
        <domain includeSubdomains="true">10.0.0.0</domain>
    </domain-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system"/>
        </trust-anchors>
    </base-config>
</network-security-config>
```

2. **Modificare `AndroidManifest.xml`**

File: `android/app/src/main/AndroidManifest.xml`

Aggiungi:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    android:usesCleartextTraffic="true"
    ...>
```

Aggiungi permessi:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
```

---

## 🔧 Configurazione Backend

### Endpoint Richiesti

L'app necessita dei seguenti endpoint backend (TUTTI CREATI ✅):

#### Mobile API (Unificata)
```
POST /api/mobile/login
Body: {
  "action": "login",
  "username": "user@example.com",
  "password": "password",
  "app_type": "visitor-kiosk"
}
```

#### Kiosk API
```
POST /api/kiosk/verify-badge
Body: { "badge_code": "VIS-123456" }

POST /api/kiosk/check-out
Body: { "visit_id": 1, "badge_code": "VIS-123456" }

GET /api/kiosk/current-visitors
GET /api/kiosk/stats
```

### CORS Backend

Assicurati che il backend NestJS abbia CORS abilitato in `main.ts`:

```typescript
app.enableCors({
  origin: true, // o specifica origin: ['http://192.168.1.100:3000']
  credentials: true,
});
```

---

## 🎨 Features Implementate

### ✅ Componenti UI
- [x] **Framer Motion** per animazioni fluide
- [x] **Ionic React** per componenti mobile-first
- [x] **Design System** CoreSuite (palette colori consistente)
- [x] **PageTransition** con animazioni slide/fade/scale
- [x] **Alert/Toast** system con auto-dismiss
- [x] **Modal** riutilizzabile
- [x] **TopBar** con breadcrumb e user popup

### ✅ Funzionalità Kiosk
- [x] **Scanner QR/Barcode** con ML Kit
- [x] **Feedback tattile** (vibrazione)
- [x] **Torcia** on/off durante scan
- [x] **Check-out automatico** da QR
- [x] **Messaggio successo** animato

### ✅ Funzionalità Full Mode
- [x] **Login** con selezione utente
- [x] **Dashboard real-time** con auto-refresh (30s)
- [x] **KPI Cards** (presenti, oggi, programmate, mensili)
- [x] **Lista visite attive** con check-out rapido
- [x] **Pull-to-refresh**
- [x] **User profile** popup

### ✅ Servizi
- [x] **Dual HTTP Client** (Capacitor mobile + Axios web)
- [x] **Scanner Service** con ML Kit Barcode Scanning
- [x] **API Service** completo con tutti gli endpoint
- [x] **Server configurabile** (auto-discovery + manuale)
- [x] **Persistenza stato** in localStorage

### ✅ Backend
- [x] **Mobile Module** (login unificato)
- [x] **Kiosk Module** (verify badge, check-out, stats)
- [x] **Audit Log** integrato
- [x] **Ruoli e permessi** per app type

---

## 🐛 Troubleshooting

### App non si connette al backend?

1. **Verifica URL server** nella configurazione app
2. **Controlla CORS** nel backend
3. **Firewall Windows**: Permetti porta 3006 (backend) e 3000 (dev server)
4. **Stessa rete**: PC e tablet devono essere sulla stessa rete WiFi

### Scanner QR non funziona?

1. **Permessi camera**: Verifica in AndroidManifest.xml
2. **Plugin ML Kit**: Assicurati sia installato
```bash
npm install @capacitor-mlkit/barcode-scanning
```
3. **Build:** Esegui `npx cap sync android` dopo aver installato plugin

### Build Android fallisce?

1. **Pulisci cache**:
```bash
rm -rf node_modules build android
npm install
```

2. **Verifica Java JDK 17**:
```bash
java -version
```

3. **Gradle sync**: In Android Studio, File → Sync Project with Gradle Files

---

## 📊 API Endpoint Summary

| Endpoint | Metodo | Descrizione | Body |
|----------|--------|-------------|------|
| `/api/mobile/login` | POST | Login/Get Users | `{ action, username, password, app_type }` |
| `/api/kiosk/verify-badge` | POST | Verifica badge | `{ badge_code }` |
| `/api/kiosk/check-out` | POST | Check-out visitatore | `{ visit_id, badge_code }` |
| `/api/kiosk/current-visitors` | GET | Lista presenti | - |
| `/api/kiosk/stats` | GET | Statistiche dashboard | - |
| `/api/visits/current` | GET | Visite in corso | - |
| `/api/visits/:id/check-out` | POST | Check-out manuale | - |

---

## 🎯 Testing Checklist

### Modalità Kiosk
- [ ] Scanner QR si avvia correttamente
- [ ] Badge viene riconosciuto
- [ ] Check-out viene registrato
- [ ] Messaggio successo appare
- [ ] Torna automaticamente a scan dopo 3s
- [ ] Torcia funziona
- [ ] Vibrazione al successo

### Modalità Full
- [ ] Login funziona con credenziali corrette
- [ ] Dashboard carica statistiche
- [ ] Lista visite in corso appare
- [ ] Auto-refresh ogni 30s
- [ ] Check-out manuale funziona
- [ ] Pull-to-refresh aggiorna dati
- [ ] Logout funziona

---

## 📱 Next Steps Consigliati

1. **Personalizzazione UI**
   - Cambia colori in `src/styles/theme.js`
   - Aggiungi logo aziendale in `public/`
   - Modifica icone app

2. **Features Aggiuntive**
   - Implementa schermata impostazioni server
   - Aggiungi support offline mode
   - Implementa sync queue per check-out offline
   - Aggiungi stampa badge (plugin printer)

3. **Sicurezza**
   - Configura modalità kiosk Android (lock app)
   - Implementa PIN per uscire da kiosk mode
   - Aggiungi auto-logout dopo inattività

4. **Produzione**
   - Genera keystore per firma APK
   - Configura ProGuard per offuscamento
   - Setup CI/CD per build automatiche
   - Deploy su Google Play Store (opzionale)

---

## 🎉 Conclusione

L'app **CoreVisitor Kiosk** è pronta per essere builddata e testata!

**Comandi Quick Start:**
```bash
cd C:\Users\Stefano\Desktop\CoreSuite\CoreVisitor\apps\kiosk
npm install
build-android.bat
```

Per qualsiasi domanda o problema, consulta il [README.md](README.md) oppure contattami! 🚀

---

**Creato con** ❤️ **usando:**
- React 18
- Ionic React 8
- Capacitor 6
- Framer Motion 11
- ML Kit Barcode Scanning
- NestJS Backend
