# CoreVisitor

**Enterprise Visitor Management System** - A comprehensive solution for managing visitors, tracking visits, issuing badges, and maintaining security compliance.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18.x-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Printer Setup](#printer-setup)
- [Security](#security)
- [Development](#development)
- [License](#license)

---

## Overview

**CoreVisitor** is a modern, full-stack visitor management system designed for organizations that need to:

- Track and manage external visitors
- Issue visitor badges with QR codes
- Provide self-service kiosks for check-in/check-out
- Maintain compliance with security and privacy regulations (GDPR)
- Generate audit trails and statistics
- Integrate with thermal badge printers

The system consists of three main applications:

1. **Admin Portal** (Next.js) - Web dashboard for receptionists and administrators
2. **Kiosk PWA** (React/Ionic) - Self-service kiosk for visitor check-in/out
3. **Backend API** (NestJS) - RESTful API with authentication and business logic

---

## Features

### Visitor Management
- Complete visitor registry with personal information
- Document upload (ID cards, passports)
- Photo capture and storage
- Company tracking
- Vehicle registration (license plates)
- GDPR compliance with privacy consent tracking

### Visit Management
- Visit scheduling with date/time
- Multiple visit types (Business, Personal, Delivery, Maintenance, Interview, Other)
- Department and host assignment
- Visit status workflow: Pending → Approved → Checked In → Checked Out
- PIN-based self check-in (4-digit PIN)
- Badge QR code generation
- Automatic check-out after inactivity

### Badge System
- Unique badge numbers (format: `VIS-{timestamp}-{random}`)
- QR code generation with high error correction
- Thermal printer support (ESC/POS)
- Automated print queue management
- Configurable badge expiry (default: 24 hours)

### Security & Compliance
- Role-based access control (Admin, Receptionist, Security)
- JWT authentication
- Complete audit logging (login, check-in, badge issuance, etc.)
- IP address and user agent tracking
- Configurable data retention policies

### Self-Service Kiosk
- Touch-optimized interface
- PIN-based check-in
- QR code scanning for check-out
- Real-time visitor dashboard
- Statistics display
- Offline PWA capabilities
- Framer Motion animations for smooth UX

### Search & Discovery
- Full-text search powered by Meilisearch
- Search visitors by name, email, phone, company, document number
- Search visits by visitor, host, department, badge number
- Advanced filtering by status, date range, department
- Real-time indexing

### Administration
- User management with role assignment
- Department management with floor/area mapping
- Printer configuration (USB/Network)
- Print queue monitoring
- Dashboard analytics and statistics
- Export capabilities

---

## Architecture

CoreVisitor follows a **monorepo structure** with three applications:

```
┌─────────────────────────────────────────────────────────────┐
│                        CoreVisitor                          │
│                                                             │
│  ┌────────────┐      ┌────────────┐      ┌───────────┐      │
│  │  Frontend  │      │   Kiosk    │      │  Backend  │      │
│  │  (Next.js) │      │  (React)   │      │ (NestJS)  │      │
│  │  Port 83   │      │  Port 85   │      │ Port 3006 │      │
│  └─────┬──────┘      └─────┬──────┘      └─────┬─────┘      │
│        │                   │                    │           │
│        └───────────────────┴────────────────────┘           │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   CoreServices   │
                    │  (Shared Infra)  │
                    │                  │
                    │  • MySQL         │
                    │  • MinIO         │
                    │  • Meilisearch   │
                    │  • Redis         │
                    │  • Nginx         │
                    └──────────────────┘
```

### Shared Infrastructure (CoreServices)

CoreVisitor integrates with the CoreSuite ecosystem, sharing:

- **MySQL** - Database (port 3306)
- **MinIO** - Object storage for documents and photos (port 9000)
- **Meilisearch** - Full-text search engine (port 7700)
- **Redis** - Caching layer (port 6379)
- **Nginx** - Reverse proxy (ports 80-85)

---

## Technology Stack

### Backend (NestJS)
- **Framework**: NestJS 10.x
- **Runtime**: Node.js 18
- **ORM**: Prisma 5.9 (MySQL)
- **Authentication**: JWT (passport-jwt)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **QR Code**: qrcode library
- **Object Storage**: MinIO SDK
- **Search**: Meilisearch SDK
- **Email**: Nodemailer
- **Thermal Printing**: node-thermal-printer (ESC/POS)

### Frontend (Next.js)
- **Framework**: Next.js 14 (App Router)
- **UI Library**: Material-UI (MUI) v6
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Yup
- **HTTP Client**: Axios
- **Data Grid**: MUI X DataGrid
- **Date Pickers**: MUI X Date Pickers
- **Notifications**: Notistack
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas

### Kiosk (React PWA)
- **Framework**: React 18
- **Mobile Framework**: Ionic React 8
- **Animations**: Framer Motion
- **QR Scanner**: jsqr
- **HTTP Client**: Axios
- **Icons**: Ionicons + React Icons
- **Capacitor**: Native mobile capabilities

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **CI/CD**: Docker multi-stage builds
- **Logging**: JSON file driver with rotation

---

## Getting Started

### Prerequisites

- **Docker** and **Docker Compose** installed
- **CoreServices** infrastructure running (MySQL, MinIO, Meilisearch)
- Node.js 18+ (for local development)

### Quick Start

1. **Start CoreServices infrastructure**:
   ```bash
   cd ../CoreServices
   docker-compose up -d
   ```

2. **Clone and configure CoreVisitor**:
   ```bash
   cd CoreVisitor
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Build and start all services**:
   ```bash
   docker-compose up -d --build
   ```

4. **Run database migrations** (automatic in Docker):
   ```bash
   # Migrations run automatically on backend container start
   # Or run manually:
   docker exec corevisitor-backend npx prisma migrate deploy
   ```

5. **Seed the database**:
   ```bash
   docker exec corevisitor-backend npm run seed
   ```

6. **Access the applications**:
   - **Admin Portal**: http://localhost:83
   - **Kiosk**: http://localhost:85
   - **API**: http://localhost:3006/api

### Default Users (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@corevisitor.com | admin123 |
| Receptionist | reception@corevisitor.com | reception123 |

---

## Project Structure

```
CoreVisitor/
├── apps/
│   ├── backend/                    # NestJS API
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # Database schema
│   │   │   ├── seed.ts            # Seed data
│   │   │   └── migrations/        # DB migrations
│   │   ├── src/
│   │   │   ├── auth/              # JWT authentication
│   │   │   ├── users/             # User management
│   │   │   ├── visitors/          # Visitor CRUD
│   │   │   ├── visits/            # Visit management
│   │   │   ├── departments/       # Department management
│   │   │   ├── badge/             # Badge generation
│   │   │   ├── printer/           # Thermal printer
│   │   │   ├── kiosk/             # Kiosk endpoints
│   │   │   ├── minio/             # Object storage
│   │   │   ├── meilisearch/       # Search engine
│   │   │   ├── notifications/     # Email notifications
│   │   │   └── audit-logs/        # Audit trail
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── frontend/                   # Next.js Admin Portal
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (dashboard)/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── visitors/
│   │   │   │   │   ├── visits/
│   │   │   │   │   ├── departments/
│   │   │   │   │   ├── users/
│   │   │   │   │   ├── printers/
│   │   │   │   │   └── print-jobs/
│   │   │   │   └── login/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   ├── store/
│   │   │   ├── theme/
│   │   │   └── types/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── kiosk/                      # React PWA Kiosk
│       ├── src/
│       │   ├── components/
│       │   │   └── Kiosk/
│       │   │       ├── KioskHome.js
│       │   │       ├── PinEntry.js
│       │   │       └── ScanQR.js
│       │   ├── services/
│       │   ├── config/
│       │   ├── App.js
│       │   └── index.js
│       ├── Dockerfile
│       ├── capacitor.config.ts
│       └── package.json
│
├── .env.example                   # Environment template
├── docker-compose.yml             # Docker orchestration
├── logs.sh                        # Log viewer script
└── README.md                      # This file
```

---

## Environment Configuration

Create a `.env` file based on `.env.example`:

### Application Settings
```bash
NODE_ENV=production
APP_NAME=CoreVisitor
APP_PORT=3006
```

### Database (Shared with CoreServices)
```bash
MYSQL_HOST=core-mysql
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpassword
MYSQL_DATABASE=corevisitor
DATABASE_URL=mysql://root:rootpassword@core-mysql:3306/corevisitor
```

### JWT Authentication
```bash
JWT_SECRET=corevisitor-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Frontend API URL
```bash
NEXT_PUBLIC_API_URL=/api
APP_URL=http://localhost:83
```

### Kiosk API URL
```bash
REACT_APP_API_URL=/api
```

### CORS Configuration
```bash
CORS_ORIGIN=http://localhost:3000,http://localhost:83,http://localhost:85
```

### MinIO Object Storage (Shared)
```bash
MINIO_ENDPOINT=core-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET_NAME=corevisitor-files
```

### Meilisearch (Shared)
```bash
MEILISEARCH_HOST=http://core-meilisearch:7700
MEILISEARCH_API_KEY=masterKeyChangeThis
```

### File Upload
```bash
MAX_FILE_SIZE=5242880  # 5MB
```

### Badge/QR Code
```bash
QR_CODE_EXPIRY_HOURS=24
BADGE_TEMPLATE_PATH=./templates/badge.html
```

### Notifications (Optional)
```bash
NOTIFICATIONS_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

### Visitor Management
```bash
DEFAULT_VISIT_DURATION_HOURS=8
VISIT_HISTORY_RETENTION_DAYS=365
AUTO_CHECKOUT_HOURS=12
```

### Timezone
```bash
TZ=Europe/Rome
```

---

## Docker Deployment

### Services Overview

| Service | Container | Port (Internal) | Port (External) | Description |
|---------|-----------|----------------|-----------------|-------------|
| backend | corevisitor-backend | 3006 | 3006 | NestJS API |
| frontend | corevisitor-frontend | 3000 | 3007 | Next.js Admin Portal |
| kiosk | corevisitor-kiosk | 80 | 3009 | React PWA Kiosk |
| nginx | core-nginx | 83, 85 | 83, 85 | Reverse Proxy |

### Build and Deploy

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Or use the enhanced log viewer
./logs.sh

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up -d --build backend
```

### Health Checks

- **Backend**: Auto-restart on failure
- **Frontend**: Auto-restart on failure
- **Kiosk**: Built-in nginx health check (wget http://localhost/)

### Log Management

Logs are configured with rotation:
- **Max Size**: 10MB
- **Max Files**: 3
- **Driver**: json-file

Use the included `logs.sh` script for enhanced log viewing:
```bash
chmod +x logs.sh
./logs.sh
```

Features:
- View all services or individual containers
- Filter by errors only
- Container statistics
- Color-coded output

---

## Database Schema

### Main Models

#### User
- Roles: `admin`, `receptionist`, `security`, `visitor`
- Authentication with JWT
- Relations: created visits, updated visits, hosted visits, audit logs

#### Visitor
- Personal information (name, email, phone, company)
- Document details (type, number, expiry, photo)
- License plate tracking
- Privacy consent (GDPR)
- Relations: visits, documents

#### Visit
- Visitor + Department + Host assignment
- Types: `business`, `personal`, `delivery`, `maintenance`, `interview`, `other`
- Statuses: `pending`, `approved`, `rejected`, `checked_in`, `checked_out`, `cancelled`
- Scheduled date/time + actual check-in/out timestamps
- Badge number + QR code
- 4-digit PIN for kiosk check-in
- Relations: visitor, department, host, creator, updater

#### Department
- Name, description, floor, area
- Contact person details
- Visual customization (color, icon)
- Relations: visits

#### VisitorDocument
- File metadata (name, path, size, MIME type)
- Stored in MinIO bucket
- Relations: visitor

#### AuditLog
- Actions: `create`, `update`, `delete`, `login`, `logout`, `check_in`, `check_out`, `badge_issued`
- Entity tracking (type, ID, name)
- IP address + user agent tracking
- Relations: user

#### PrintJob
- Types: `badge`, `report`, `label`
- Statuses: `pending`, `printing`, `completed`, `failed`, `cancelled`
- Queue management with priority
- Error tracking and retry mechanism

#### PrinterConfig
- Types: `escpos`, `pdf`
- Connections: `usb`, `network`, `bluetooth`
- Network settings (IP, port)
- JSON configuration for customization

### Migrations

Run migrations manually:
```bash
# Generate new migration
npx prisma migrate dev --name migration_name

# Deploy migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

### Seeding

Seed the database with default data:
```bash
npm run seed
```

This creates:
- Admin user (admin@corevisitor.com)
- Receptionist user (reception@corevisitor.com)
- Sample departments
- Sample printer configuration

---

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@corevisitor.com",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "admin@corevisitor.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {access_token}

Response:
{
  "id": "1",
  "email": "admin@corevisitor.com",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

### Visitors

#### List Visitors
```http
GET /api/visitors?search=john&company=Acme
Authorization: Bearer {access_token}
```

#### Create Visitor
```http
POST /api/visitors
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "documentType": "passport",
  "documentNumber": "AB123456",
  "licensePlate": "ABC-123",
  "privacyConsent": true,
  "photo": [file],
  "document": [file]
}
```

#### Get Visitor
```http
GET /api/visitors/:id
Authorization: Bearer {access_token}
```

#### Update Visitor
```http
PATCH /api/visitors/:id
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "phone": "+9876543210"
}
```

#### Delete Visitor
```http
DELETE /api/visitors/:id
Authorization: Bearer {access_token}
```

### Visits

#### List Visits
```http
GET /api/visits?status=checked_in&departmentId=1&date=2025-11-14
Authorization: Bearer {access_token}
```

#### Get Current Visitors
```http
GET /api/visits/current
Authorization: Bearer {access_token}

Response:
[
  {
    "id": "1",
    "visitor": {...},
    "department": {...},
    "checkInTime": "2025-11-14T09:30:00Z",
    "badgeNumber": "VIS-1731582600-ABC123"
  }
]
```

#### Get Visit Statistics
```http
GET /api/visits/stats
Authorization: Bearer {access_token}

Response:
{
  "today": 15,
  "thisWeek": 87,
  "thisMonth": 342,
  "currentlyCheckedIn": 8
}
```

#### Create Visit
```http
POST /api/visits
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "visitorId": "1",
  "departmentId": "2",
  "hostUserId": "3",
  "visitType": "business",
  "scheduledDate": "2025-11-15T10:00:00Z",
  "purpose": "Project meeting",
  "expectedDuration": 2
}
```

#### Check-In
```http
POST /api/visits/:id/check-in
Authorization: Bearer {access_token}

Response:
{
  "id": "1",
  "checkInTime": "2025-11-14T10:15:00Z",
  "badgeNumber": "VIS-1731582600-ABC123",
  "qrCode": "data:image/png;base64,...",
  "pin": "1234"
}
```

#### Check-Out
```http
POST /api/visits/:id/check-out
Authorization: Bearer {access_token}

Response:
{
  "id": "1",
  "checkOutTime": "2025-11-14T16:30:00Z"
}
```

### Kiosk (Public Endpoints)

#### Verify PIN
```http
POST /api/kiosk/verify-pin
Content-Type: application/json

{
  "pin": "1234"
}

Response:
{
  "valid": true,
  "visit": {
    "id": "1",
    "visitor": {...},
    "department": {...}
  }
}
```

#### Check-In with PIN
```http
POST /api/kiosk/check-in
Content-Type: application/json

{
  "pin": "1234"
}

Response:
{
  "success": true,
  "visit": {
    "id": "1",
    "badgeNumber": "VIS-1731582600-ABC123",
    "checkInTime": "2025-11-14T10:15:00Z"
  }
}
```

#### Verify Badge QR
```http
POST /api/kiosk/verify-badge
Content-Type: application/json

{
  "badgeNumber": "VIS-1731582600-ABC123"
}

Response:
{
  "valid": true,
  "visit": {
    "id": "1",
    "visitor": {...}
  }
}
```

#### Check-Out with Badge
```http
POST /api/kiosk/check-out
Content-Type: application/json

{
  "badgeNumber": "VIS-1731582600-ABC123"
}

Response:
{
  "success": true,
  "visit": {
    "id": "1",
    "checkOutTime": "2025-11-14T16:30:00Z"
  }
}
```

#### Get Kiosk Statistics
```http
GET /api/kiosk/stats

Response:
{
  "today": 15,
  "currentlyCheckedIn": 8,
  "averageVisitDuration": 4.5
}
```

### Departments

#### List Departments
```http
GET /api/departments
Authorization: Bearer {access_token}
```

#### Create Department
```http
POST /api/departments
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "IT Department",
  "description": "Information Technology",
  "floor": "3rd Floor",
  "contactPerson": "John Smith",
  "contactEmail": "it@company.com",
  "contactPhone": "+1234567890",
  "color": "#3f51b5",
  "icon": "computer"
}
```

### Printer

#### Initialize Printer
```http
POST /api/printer/init
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "printerType": "escpos",
  "connection": "network",
  "ipAddress": "192.168.1.100",
  "port": 9100
}
```

#### Print Badge
```http
POST /api/printer/badge/:visitId
Authorization: Bearer {access_token}

Response:
{
  "jobId": "1",
  "status": "pending"
}
```

#### Get Printer Status
```http
GET /api/printer/status
Authorization: Bearer {access_token}

Response:
{
  "connected": true,
  "ready": true,
  "type": "escpos",
  "connection": "network"
}
```

#### Get Print Queue
```http
GET /api/printer/queue/status
Authorization: Bearer {access_token}

Response:
{
  "pending": 2,
  "printing": 1,
  "completed": 45,
  "failed": 0
}
```

### Users

#### List Users
```http
GET /api/users
Authorization: Bearer {access_token}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "email": "newuser@company.com",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "receptionist"
}
```

### Audit Logs

#### List Audit Logs
```http
GET /api/audit-logs?userId=1&action=check_in&startDate=2025-11-01
Authorization: Bearer {access_token}
```

---

## Printer Setup

CoreVisitor supports **ESC/POS thermal printers** for badge printing.

### Supported Printers
- 58mm thermal printers
- 80mm thermal printers
- ESC/POS compatible devices

### Connection Types
- **USB**: Direct USB connection (requires driver)
- **Network**: TCP/IP connection (recommended)
- **Bluetooth**: Bluetooth connection (mobile devices)

### Setup Instructions

See [apps/backend/PRINTER_SETUP.md](apps/backend/PRINTER_SETUP.md) for detailed setup instructions.

**Quick Network Printer Setup:**

1. Connect printer to network
2. Find printer IP address (usually printed on test page)
3. Configure in Admin Portal:
   - Go to **Printers** → **Add Printer**
   - Select **Network** connection
   - Enter IP address and port (default: 9100)
   - Save configuration

4. Test printer:
   - Click **Test Print**
   - Verify badge prints correctly

### Badge Template

Badges include:
- Visitor name
- Company
- Badge number
- QR code for verification
- Check-in date/time
- Department
- Host name
- Expiry time

---

## Security

### Authentication & Authorization
- **JWT tokens** with 7-day expiry
- **Role-based access control** (RBAC): Admin, Receptionist, Security
- **bcrypt password hashing** with salt rounds

### Input Validation
- **class-validator** for DTO validation
- **Sanitization** of user inputs
- **File type validation** for uploads

### Security Headers
- **CORS** protection with configurable origins
- **XSS** protection headers
- **CSRF** token validation (Next.js built-in)

### Data Protection
- **SQL injection** prevention via Prisma ORM
- **Secure file storage** in MinIO with presigned URLs
- **Audit logging** for compliance
- **GDPR compliance** with privacy consent tracking

### Docker Security
- **Non-root containers** (node user)
- **Multi-stage builds** to minimize attack surface
- **Alpine Linux** base images for minimal footprint
- **Health checks** for container monitoring

### Network Security
- **Internal Docker network** for service communication
- **Nginx reverse proxy** for external access
- **Rate limiting** (configurable)
- **TLS/SSL** support (HTTPS ready)

---

## Development

### Local Development Setup

1. **Install dependencies**:
   ```bash
   # Backend
   cd apps/backend
   npm install

   # Frontend
   cd apps/frontend
   npm install

   # Kiosk
   cd apps/kiosk
   npm install
   ```

2. **Run in development mode**:
   ```bash
   # Backend (with hot reload)
   cd apps/backend
   npm run dev

   # Frontend (with hot reload)
   cd apps/frontend
   npm run dev

   # Kiosk
   cd apps/kiosk
   npm start
   ```

3. **Database operations**:
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create migration
   npx prisma migrate dev --name migration_name

   # Open Prisma Studio
   npx prisma studio
   ```

### Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Building for Production

```bash
# Backend
cd apps/backend
npm run build

# Frontend
cd apps/frontend
npm run build

# Kiosk
cd apps/kiosk
npm run build
```

---

## Troubleshooting

### Backend won't start
- Check MySQL is running: `docker ps | grep mysql`
- Verify database credentials in `.env`
- Check migrations: `npx prisma migrate status`

### Frontend/Kiosk can't connect to API
- Verify backend is running: `curl http://localhost:3006/api/auth/me`
- Check CORS settings in `.env`
- Verify nginx routing

### Printer not working
- Check printer is powered on and connected
- Verify IP address/port in printer configuration
- Test connection: `telnet <printer_ip> 9100`
- Check print queue for errors

### MinIO connection failed
- Verify MinIO is running: `docker ps | grep minio`
- Check MinIO credentials in `.env`
- Verify bucket exists: access MinIO console at http://localhost:9001

### Meilisearch indexing issues
- Check Meilisearch is running: `curl http://localhost:7700/health`
- Verify API key in `.env`
- Re-index: delete index and re-create

---

## License

MIT License

Copyright (c) 2025 CoreSuite

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Support

For issues and feature requests, please contact the CoreSuite team.

**Project**: CoreVisitor - Enterprise Visitor Management System
**Version**: 1.0.0
**Last Updated**: November 2025
