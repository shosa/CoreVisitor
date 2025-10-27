// User types
export type UserRole = 'admin' | 'receptionist' | 'security' | 'visitor';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  department?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserFormData {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}
