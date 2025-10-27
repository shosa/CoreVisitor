import api from './axios';
import type { Visit, Visitor, VisitStats, Department, User, UserRole } from '../types/visitor';

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Visitors
export const visitorsApi = {
  getAll: (search?: string, company?: string) =>
    api.get<Visitor[]>('/visitors', { params: { search, company } }),
  getOne: (id: string) => api.get<Visitor>(`/visitors/${id}`),
  create: (data: FormData) => api.post<Visitor>('/visitors', data),
  update: (id: string, data: Partial<Visitor>) =>
    api.patch<Visitor>(`/visitors/${id}`, data),
  delete: (id: string) => api.delete(`/visitors/${id}`),
  getDocumentUrl: (id: string) => api.get<{ url: string }>(`/visitors/${id}/document-url`),
  getPhotoUrl: (id: string) => api.get<{ url: string }>(`/visitors/${id}/photo-url`),
};

// Visits
export const visitsApi = {
  getAll: (params?: {
    status?: string;
    hostId?: string;
    date?: string;
    search?: string;
  }) => api.get<Visit[]>('/visits', { params }),
  getCurrent: () => api.get<Visit[]>('/visits/current'),
  getStats: () => api.get<VisitStats>('/visits/stats'),
  getOne: (id: string) => api.get<Visit>(`/visits/${id}`),
  create: (data: any) => api.post<Visit>('/visits', data),
  update: (id: string, data: any) => api.patch<Visit>(`/visits/${id}`, data),
  delete: (id: string) => api.delete(`/visits/${id}`),
  checkIn: (id: string) => api.post<Visit>(`/visits/${id}/check-in`),
  checkOut: (id: string) => api.post<Visit>(`/visits/${id}/check-out`),
  cancel: (id: string) => api.post<Visit>(`/visits/${id}/cancel`),
  getBadge: (id: string) => api.get(`/visits/${id}/badge`),
};

// Departments
export const departmentsApi = {
  getAll: () => api.get<Department[]>('/departments'),
  getOne: (id: string) => api.get<Department>(`/departments/${id}`),
  create: (data: CreateDepartmentDto) => api.post<Department>('/departments', data),
  update: (id: string, data: UpdateDepartmentDto) => api.patch<Department>(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

// DTOs for Department API
export type CreateDepartmentDto = Omit<Department, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;

// DTOs for User API
export type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password?: string };
export type UpdateUserDto = Partial<CreateUserDto>;

// Users
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: CreateUserDto) => api.post<User>('/users', data),
  update: (id: string, data: UpdateUserDto) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Audit Logs
export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const auditLogsApi = {
  getAll: (limit?: number) =>
    api.get<AuditLog[]>('/audit-logs', { params: { limit } }),
  getByUser: (userId: string, limit?: number) =>
    api.get<AuditLog[]>(`/audit-logs/user/${userId}`, { params: { limit } }),
  getByEntity: (entityType: string, entityId: string, limit?: number) =>
    api.get<AuditLog[]>(`/audit-logs/entity/${entityType}/${entityId}`, { params: { limit } }),
};
