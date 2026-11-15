export type UserRole = 'ADMINISTRADOR' | 'OPERARIO' | 'CLIENTE';

export interface LoginRequest {
  email: string;
  contrasena: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  contrasena: string;
  aceptaTerminos: boolean;
}

export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEnMs: number;
  usuarioId: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface UserProfile {
  id: string;
  nombre: string;
  apellidos: string | null;
  email: string;
  telefono: string | null;
  distrito: string | null;
  direccion: string | null;
  rol: UserRole;
  activo: boolean;
}

export interface UpdateProfileRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  distrito: string;
  direccion: string;
}

export interface ChangePasswordRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmacion: string;
}

export interface ChangeEmailRequest {
  nuevoEmail: string;
  contrasenaActual: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface StoredSession {
  token: string;
  expiresAt: number;
  user: SessionUser;
}

export interface AuthError {
  message: string;
  fieldErrors: Record<string, string>;
}
