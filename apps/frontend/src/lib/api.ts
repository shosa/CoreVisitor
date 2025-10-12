import api from './axios';
import type { Visit, Visitor, VisitStats, Department } from '../types/visitor';

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
};

// Users
export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
};
