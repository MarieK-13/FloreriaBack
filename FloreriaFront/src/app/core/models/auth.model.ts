/** Roles definidos en el backend (enum RolUsuario). */
export type UserRole = 'ADMINISTRADOR' | 'OPERARIO' | 'CLIENTE';

/** Cuerpo de POST /api/auth/login */
export interface LoginRequest {
  email: string;
  contrasena: string;
}

/** Cuerpo de POST /api/auth/register (el backend siempre crea un CLIENTE). */
export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  contrasena: string;
  aceptaTerminos: boolean;
}

/** Respuesta de login y registro (AuthResponseDTO). */
export interface AuthResponse {
  token: string;
  tipo: string;
  expiraEnMs: number;
  usuarioId: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

/** Datos completos de "Mi cuenta" (GET /api/auth/me, UsuarioResponseDTO). */
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

/** PUT /api/auth/me */
export interface UpdateProfileRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  distrito: string;
  direccion: string;
}

/** PUT /api/auth/me/contrasena */
export interface ChangePasswordRequest {
  contrasenaActual: string;
  nuevaContrasena: string;
  confirmacion: string;
}

/** PUT /api/auth/me/email */
export interface ChangeEmailRequest {
  nuevoEmail: string;
  contrasenaActual: string;
}

/** Usuario con sesión iniciada, tal como lo usa el front. */
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/** Lo que se guarda en el navegador para mantener la sesión al recargar. */
export interface StoredSession {
  token: string;
  expiresAt: number;
  user: SessionUser;
}

/** Error del backend traducido a algo que el formulario puede mostrar. */
export interface AuthError {
  message: string;
  fieldErrors: Record<string, string>;
}
