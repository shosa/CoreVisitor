export enum DocumentType {
  CARTA_IDENTITA = 'CARTA_IDENTITA',
  PATENTE = 'PATENTE',
  PASSAPORTO = 'PASSAPORTO',
  ALTRO = 'ALTRO',
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
  documentScanPath?: string;
  licensePlate?: string;
  photoPath?: string;
  privacyConsent: boolean;
  privacyConsentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  visits?: Visit[];
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
  hostId: string;
  host?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  purpose: VisitPurpose;
  purposeNotes?: string;
  department?: string;
  area?: string;
  scheduledDate: string;
  scheduledEndDate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: VisitStatus;
  badgeNumber?: string;
  badgeQRCode?: string;
  badgeIssued: boolean;
  badgeIssuedAt?: string;
  notificationSent: boolean;
  notificationSentAt?: string;
  notes?: string;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
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
  ADMIN = 'ADMIN',
  RECEPTIONIST = 'RECEPTIONIST',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
