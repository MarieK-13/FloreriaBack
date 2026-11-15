import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import {
  AuthError,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SessionUser,
  StoredSession,
  UserRole,
} from '../models/auth.model';

const STORAGE_KEY = 'floriasmart.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<StoredSession | null>(this.readStoredSession());
  /** Si la sesión actual se guardó con "Recordarme" (localStorage) o no (sessionStorage). */
  private remember = this.isRememberedSession();

  /** Usuario con sesión iniciada, o null si nadie ha ingresado. */
  readonly user = computed<SessionUser | null>(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  /**
   * @param remember "Recordarme": si es true la sesión sigue al cerrar el navegador (localStorage);
   * si es false se borra al cerrarlo (sessionStorage).
   */
  login(credentials: LoginRequest, remember = true): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
        email: credentials.email.trim(),
        contrasena: credentials.contrasena,
      })
      .pipe(tap((response) => this.startSession(response, remember)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
        nombre: data.nombre.trim(),
        apellidos: data.apellidos.trim(),
        email: data.email.trim(),
        telefono: data.telefono.trim(),
        contrasena: data.contrasena,
        aceptaTerminos: data.aceptaTerminos,
      })
      .pipe(tap((response) => this.startSession(response, true)));
  }

  /** Cierra la sesión. Si se indica, lleva al usuario a otra página (por defecto, al inicio). */
  logout(redirectTo: string | null = '/'): void {
    this.session.set(null);
    this.removeStoredSession();
    if (redirectTo !== null) {
      void this.router.navigateByUrl(redirectTo);
    }
  }

  /** Token vigente para la cabecera Authorization, o null si no hay sesión o ya expiró. */
  getToken(): string | null {
    const current = this.session();
    if (!current) {
      return null;
    }
    if (Date.now() >= current.expiresAt) {
      this.logout(null);
      return null;
    }
    return current.token;
  }

  /** Reemplaza la sesión con un token nuevo (por ejemplo, después de cambiar el correo). */
  replaceSession(response: AuthResponse): void {
    this.startSession(response, this.remember);
  }

  /** Actualiza el nombre que muestra el encabezado después de editar "Mi cuenta". */
  updateSessionName(name: string): void {
    const current = this.session();
    if (!current) {
      return;
    }
    const updated: StoredSession = { ...current, user: { ...current.user, name } };
    this.session.set(updated);
    this.writeStoredSession(updated, this.remember);
  }

  hasRole(...roles: UserRole[]): boolean {
    const role = this.user()?.role;
    return role !== undefined && roles.includes(role);
  }

  /** Convierte la respuesta de error del backend en un mensaje general y errores por campo. */
  toAuthError(error: unknown): AuthError {
    if (!(error instanceof HttpErrorResponse)) {
      return { message: 'Ocurrió un error inesperado. Inténtalo otra vez.', fieldErrors: {} };
    }
    if (error.status === 0) {
      return {
        message: 'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo otra vez.',
        fieldErrors: {},
      };
    }

    const body = (error.error ?? {}) as { mensaje?: string; errores?: Record<string, string> };
    const fieldErrors = body.errores ?? {};

    if (body.mensaje) {
      return { message: body.mensaje, fieldErrors };
    }
    if (Object.keys(fieldErrors).length > 0) {
      return { message: 'Revisa los datos marcados.', fieldErrors };
    }
    if (error.status >= 500) {
      return {
        message: 'El servidor tuvo un problema. Inténtalo en unos minutos.',
        fieldErrors: {},
      };
    }
    return { message: 'No se pudo completar la solicitud.', fieldErrors: {} };
  }

  private startSession(response: AuthResponse, remember: boolean): void {
    this.remember = remember;
    const session: StoredSession = {
      token: response.token,
      expiresAt: Date.now() + response.expiraEnMs,
      user: {
        id: response.usuarioId,
        name: response.nombre,
        email: response.email,
        role: response.rol,
      },
    };
    this.session.set(session);
    this.writeStoredSession(session, remember);
  }

  private readStoredSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const session = JSON.parse(raw) as StoredSession;
      if (!session?.token || !session.user || Date.now() >= session.expiresAt) {
        this.removeStoredSession();
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private isRememberedSession(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
      return false;
    }
  }

  private writeStoredSession(session: StoredSession, remember: boolean): void {
    try {
      this.removeStoredSession();
      (remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Si el navegador no permite guardar (modo privado, etc.), la sesión dura hasta recargar.
    }
  }

  private removeStoredSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada que limpiar.
    }
  }
}
