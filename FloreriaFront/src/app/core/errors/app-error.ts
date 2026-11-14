import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';

export interface AppError {
  status: number;
  mensaje: string;
  errores?: Record<string, string>;
}

interface ApiErrorBody {
  status?: number;
  mensaje?: string;
  errores?: Record<string, string>;
}

export const SILENT_ERRORS = new HttpContextToken<boolean>(() => false);

export function traducirError(err: HttpErrorResponse, esAuth: boolean): AppError {
  const cuerpo: ApiErrorBody = typeof err.error === 'object' && err.error !== null ? (err.error as ApiErrorBody) : {};

  switch (err.status) {
    case 0:
      return {
        status: 0,
        mensaje: 'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.',
      };
    case 400:
      if (cuerpo.errores) {
        return { status: 400, mensaje: 'Revisa los campos marcados.', errores: cuerpo.errores };
      }
      return { status: 400, mensaje: cuerpo.mensaje ?? 'La solicitud no es válida.' };
    case 401:
      return {
        status: 401,
        mensaje: esAuth
          ? (cuerpo.mensaje ?? 'Email o contraseña incorrectos.')
          : 'Tu sesión expiró. Inicia sesión nuevamente.',
      };
    case 403:
      return {
        status: 403,
        mensaje:
          cuerpo.mensaje === 'El usuario está inactivo'
            ? 'Tu cuenta está inactiva. Contacta a la florería.'
            : 'No tienes permisos para realizar esta acción.',
      };
    case 404:
      return { status: 404, mensaje: cuerpo.mensaje ?? 'No encontramos lo que buscas.' };
    case 409:
      return {
        status: 409,
        mensaje: 'La operación no se puede completar: el registro está en uso o ya existe.',
      };
    default:
      return {
        status: err.status,
        mensaje: 'Ocurrió un error en el servidor. Inténtalo de nuevo más tarde.',
      };
  }
}
