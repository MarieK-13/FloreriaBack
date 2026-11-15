import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface FechaImportanteRequest {
  ocasion: string;
  persona: string;
  fecha: string; 
  diasAnticipacion?: number;
}

export interface FechaImportanteResponse {
  id: string;
  ocasion: string;
  persona: string;
  fecha: string;
  diasAnticipacion: number;
  fechaCreacion: string;
}

@Injectable({
  providedIn: 'root',
})
export class MisFechasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/mis-fechas';

  listarMisFechas(): Observable<FechaImportanteResponse[]> {
    return this.http.get<FechaImportanteResponse[]>(this.apiUrl);
  }

  crearFecha(request: FechaImportanteRequest): Observable<FechaImportanteResponse> {
    return this.http.post<FechaImportanteResponse>(this.apiUrl, request);
  }

  actualizarAnticipacion(id: string, dias: number): Observable<FechaImportanteResponse> {
    return this.http.patch<FechaImportanteResponse>(
      `${this.apiUrl}/${id}/anticipacion`,
      {},
      { params: { dias: dias.toString() } },
    );
  }

  eliminarFecha(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  descargarArchivoIcs(fechas: FechaImportanteResponse[], diasAnticipacion: number): void {
    if (!fechas.length) return;

    const eventos = fechas
      .map((item) => {
        const fechaLimpia = item.fecha.replace(/-/g, '');
        const uid = `${item.id}@floriasmart.ica`;
        return [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${this.formatearFechaUtc(new Date())}`,
          `DTSTART;VALUE=DATE:${fechaLimpia}`,
          `SUMMARY:${item.ocasion} - ${item.persona} (FloriaSmart)`,
          `DESCRIPTION:Recordatorio de FloriaSmart: ${item.ocasion} con ${item.persona}. ¡Prepara tu arreglo floral!`,
          'BEGIN:VALARM',
          'ACTION:DISPLAY',
          `DESCRIPTION:Recordatorio: ${item.ocasion} con ${item.persona}`,
          `TRIGGER:-P${diasAnticipacion}D`,
          'END:VALARM',
          'END:VEVENT',
        ].join('\r\n');
      })
      .join('\r\n');

    const contenidoIcs = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//FloriaSmart//Mis Fechas Importantes//ES',
      'CALSCALE:GREGORIAN',
      eventos,
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([contenidoIcs], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'mis-fechas-floriasmart.ics';
    enlace.click();
    URL.revokeObjectURL(url);
  }

  private formatearFechaUtc(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
}
