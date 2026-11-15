import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api/api.config';
import {
  AuthResponse,
  ChangeEmailRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from '../models/auth.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${API_BASE_URL}/auth/me`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.url);
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http
      .put<UserProfile>(this.url, {
        nombre: data.nombre.trim(),
        apellidos: data.apellidos.trim(),
        telefono: data.telefono.trim(),
        distrito: data.distrito.trim(),
        direccion: data.direccion.trim(),
      })
      .pipe(tap((profile) => this.auth.updateSessionName(profile.nombre)));
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/contrasena`, data);
  }

  changeEmail(data: ChangeEmailRequest): Observable<string> {
    return this.http
      .put<AuthResponse>(`${this.url}/email`, {
        nuevoEmail: data.nuevoEmail.trim(),
        contrasenaActual: data.contrasenaActual,
      })
      .pipe(
        tap((response) => this.auth.replaceSession(response)),
        map((response) => response.email),
      );
  }

  deleteAccount(contrasena: string): Observable<void> {
    return this.http
      .delete<void>(this.url, { body: { contrasena } })
      .pipe(tap(() => this.auth.logout(null)));
  }
}
