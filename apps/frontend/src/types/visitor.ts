export enum DocumentType {
  CARTA_IDENTITA = 'CARTA_IDENTITA',
  PATENTE = 'PATENTE',
  PASSAPORTO = 'PASSAPORTO',
  ALTRO = 'ALTRO',
}

export interface VisitorDocument {
  id: string;
  visitorId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  documentType?: DocumentType;
  documentNumber?: string;
  documentExpiry?: string;
  documentScanPath?: string;
  licensePlate?: string;
  photoPath?: string;
  privacyConsent: boolean;
  privacyConsentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  visits?: Visit[];
  documents?: VisitorDocument[];
}

export enum VisitStatus {
  SCHEDULED = 'SCHEDULED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum VisitPurpose {
  RIUNIONE = 'RIUNIONE',
  CONSEGNA = 'CONSEGNA',
  MANUTENZIONE = 'MANUTENZIONE',
  COLLOQUIO = 'COLLOQUIO',
  FORMAZIONE = 'FORMAZIONE',
  AUDIT = 'AUDIT',
  ALTRO = 'ALTRO',
}

export interface Visit {
  id: string;
  visitorId: string;
  visitor?: Visitor;
  departmentId: string;
  department?: Department;
  hostUserId?: string;
  hostUser?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  hostName?: string;
  visitType: string;
  purpose: string;
  scheduledDate: string;
  scheduledTimeStart: string;
  scheduledTimeEnd?: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  status: string;
  badgeNumber?: string;
  badgeQRCode?: string;
  badgeIssued: boolean;
  badgeIssuedAt?: string;
  qrCode?: string;
  notes?: string;
  createdById: string;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  floor?: number;
  area?: string;
  color?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VisitStats {
  currentVisitors: number;
  todayVisits: number;
  scheduledToday: number;
  totalThisMonth: number;
}

export enum UserRole {
  ADMIN = 'admin',
  RECEPTIONIST = 'receptionist',
  SECURITY = 'security',
  VISITOR = 'visitor',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole | string;
  phone?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
