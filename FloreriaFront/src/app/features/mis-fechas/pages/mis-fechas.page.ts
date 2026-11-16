import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  FechaImportanteResponse,
  MisFechasService,
} from '../../../core/services/mis-fechas.service';
import { CatalogService } from '../../../features/catalogo/services/catalog.service';
import { AuthService } from '../../../core/services/auth.service';

interface FechaCalculada extends FechaImportanteResponse {
  diaNumero: string;
  mesCorto: string;
  mesIndex: number;
  diaInt: number;
  diasRestantes: number;
}

interface CeldaCalendario {
  dia: number | null;
  fechaIso: string | null;
  eventos: FechaCalculada[];
  esHoy: boolean;
}

interface IdeaProducto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number;
  imagenUrl: string;
  esReal: boolean;
}

@Component({
  selector: 'app-mis-fechas-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="dates-page full-bounds">
      <!-- 1. Cabecera editorial -->
      <header class="dates-header">
        <div>
          <span class="eyebrow-tag">AGENDA FLORAL PERSONAL</span>
          <h1>Mis fechas importantes</h1>
          <p>
            Organiza cumpleaños, aniversarios y ocasiones especiales en tu calendario y recibe
            sugerencias listas para regalar.
          </p>
        </div>

        <div class="header-actions">
          @if (!estaLogueado()) {
            <a
              routerLink="/ingresar"
              [queryParams]="{ redirect: '/mis-fechas' }"
              class="btn-brand-pill"
            >
              Iniciar sesión para guardar
            </a>
          } @else {
            <button type="button" class="btn-outline-pill" (click)="exportarCalendario()">
              Exportar todo (.ics)
            </button>
          }
        </div>
      </header>

      <!-- 2. Guía rápida: 3 pasos -->
      <section class="steps-strip" aria-label="Cómo funciona tu agenda">
        <article class="step-card">
          <span class="step-num">01</span>
          <div>
            <h3>Registra tus fechas clave</h3>
            <p>Guarda aniversarios, cumpleaños o fechas familiares en un solo lugar.</p>
          </div>
        </article>

        <article class="step-card">
          <span class="step-num">02</span>
          <div>
            <h3>Sincroniza con tu calendario</h3>
            <p>Envía recordatorios a Google Calendar o descarga el archivo .ics con alarma.</p>
          </div>
        </article>

        <article class="step-card">
          <span class="step-num">03</span>
          <div>
            <h3>Elige el arreglo ideal</h3>
            <p>Mira sugerencias personalizadas según cada ocasión antes de que llegue el día.</p>
          </div>
        </article>
      </section>

      <!-- Aviso centrado sin botón duplicado -->
      @if (!estaLogueado()) {
        <div class="guest-banner">
          <span>
            ✿ <strong>Vista previa interactiva:</strong> Explora el calendario y las sugerencias. Al
            guardar una fecha o sincronizarla te pediremos iniciar sesión.
          </span>
        </div>
      }

      <!-- 3. BLOQUE SUPERIOR: BANNER DE PRÓXIMA OCASIÓN -->
      @if (proximaFecha(); as proxima) {
        <section class="highlight-banner" aria-label="Próxima ocasión">
          <div class="highlight-banner__copy">
            <span class="banner-badge">PRÓXIMA OCASIÓN</span>
            <h2>
              Tu {{ proxima.ocasion.toLowerCase() }} es en
              {{ proxima.diasRestantes === 0 ? 'hoy' : proxima.diasRestantes + ' días' }}
            </h2>
            <p>
              Para <strong>{{ proxima.persona }}</strong> ({{ proxima.diaNumero }}
              {{ proxima.mesCorto }}). Prepara tu arreglo con anticipación y sorprende a tiempo.
            </p>
          </div>
          <a routerLink="/catalogo" class="btn-white-pill">Explorar arreglos →</a>
        </section>
      }

      <!-- 4. FILA CENTRAL: CALENDARIO (IZQUIERDA) + AGREGAR NUEVA FECHA (DERECHA) -->
      <div class="top-workspace-grid">
        <!-- Izquierda: Calendario Visual Estético -->
        <section class="calendar-card" aria-label="Calendario de fechas importantes">
          <div class="calendar-top">
            <div>
              <span class="card-kicker">CALENDARIO DE OCASIONES</span>
              <h2>{{ nombreMesActual() }} {{ anioCalendario() }}</h2>
            </div>

            <div class="calendar-nav">
              <button
                type="button"
                class="nav-circle"
                aria-label="Mes anterior"
                (click)="cambiarMes(-1)"
              >
                ‹
              </button>
              <button type="button" class="today-chip" (click)="irAHoy()">Hoy</button>
              <button
                type="button"
                class="nav-circle"
                aria-label="Mes siguiente"
                (click)="cambiarMes(1)"
              >
                ›
              </button>
            </div>
          </div>

          <div class="calendar-weekdays" aria-hidden="true">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          <div class="calendar-grid">
            @for (celda of celdasCalendario(); track $index) {
              @if (celda.dia === null) {
                <div class="cal-cell cal-cell--empty"></div>
              } @else {
                <button
                  type="button"
                  class="cal-cell"
                  [class.is-today]="celda.esHoy"
                  [class.has-event]="celda.eventos.length > 0"
                  [class.is-selected]="
                    celda.eventos.length > 0 && fechaActiva()?.id === celda.eventos[0].id
                  "
                  (click)="alHacerClicEnDia(celda)"
                >
                  <span class="cal-day-num">{{ celda.dia }}</span>
                  @if (celda.eventos.length > 0) {
                    <span class="cal-event-pill" [title]="celda.eventos[0].ocasion">
                      {{ celda.eventos[0].ocasion }}
                    </span>
                  }
                </button>
              }
            }
          </div>

          <div class="calendar-legend">
            <span><i class="dot dot--event"></i> Fecha especial</span>
            <span><i class="dot dot--today"></i> Hoy</span>
            <span class="legend-hint">Haz clic en cualquier día para seleccionarlo</span>
          </div>
        </section>

        <!-- Derecha: Formulario Agregar Fecha Importante -->
        <section class="add-date-card" aria-labelledby="add-date-title">
          <div class="add-card-intro">
            <span class="card-kicker">NUEVO RECORDATORIO</span>
            <h2 id="add-date-title">Agregar fecha importante</h2>
            <p>
              Registra una nueva fecha o haz clic en un día libre del calendario para
              autocompletarla.
            </p>
          </div>

          <form [formGroup]="fechaForm" (ngSubmit)="guardarFecha()" class="add-date-form">
            <label class="field-group">
              <span>Ocasión</span>
              <input
                type="text"
                formControlName="ocasion"
                placeholder="Ej. Aniversario, Cumpleaños, Graduación"
              />
            </label>

            <label class="field-group">
              <span>¿Para quién es?</span>
              <input
                type="text"
                formControlName="persona"
                placeholder="Ej. María, Mamá, Mi mejor amiga"
              />
            </label>

            <label class="field-group">
              <span>Fecha del evento</span>
              <input type="date" formControlName="fecha" />
            </label>

            @if (errorMensaje()) {
              <p class="form-error">{{ errorMensaje() }}</p>
            }

            <button type="submit" class="btn-brand-pill btn-full btn-lg" [disabled]="guardando()">
              {{
                !estaLogueado()
                  ? 'Inicia sesión para guardar fecha'
                  : guardando()
                    ? 'Guardando...'
                    : '+ Guardar en mi agenda'
              }}
            </button>
          </form>
        </section>
      </div>

      <!-- 5. FILA INFERIOR: FECHAS GUARDADAS + RECORDATORIOS + IDEAS ESTILO PINTEREST -->
      <div class="bottom-workspace-grid">
        <!-- Columna 1: Lista de Fechas Guardadas -->
        <section class="dates-list-panel" aria-label="Tus fechas registradas">
          <div class="panel-toolbar">
            <div>
              <span class="card-kicker">TU LISTA PERSONAL</span>
              <h2>Fechas guardadas ({{ fechasCalculadas().length }})</h2>
            </div>

            <div class="filter-pills">
              <button
                type="button"
                class="filter-chip"
                [class.is-active]="filtroLista() === 'todas'"
                (click)="filtroLista.set('todas')"
              >
                Todas
              </button>
              <button
                type="button"
                class="filter-chip"
                [class.is-active]="filtroLista() === 'proximas'"
                (click)="filtroLista.set('proximas')"
              >
                Próx. 30 días
              </button>
            </div>
          </div>

          @if (cargando()) {
            <div class="empty-card">Cargando tus fechas guardadas...</div>
          } @else if (fechasFiltradas().length === 0) {
            <div class="empty-card">
              No hay fechas en esta vista. Usa el calendario o el formulario para agregar una.
            </div>
          } @else {
            <div class="dates-scroll-list">
              @for (item of fechasFiltradas(); track item.id) {
                <article
                  class="date-card"
                  [class.is-selected]="fechaActiva()?.id === item.id"
                  (click)="seleccionarFecha(item)"
                >
                  <div class="date-box" aria-hidden="true">
                    <span class="date-box__day">{{ item.diaNumero }}</span>
                    <span class="date-box__month">{{ item.mesCorto }}</span>
                  </div>

                  <div class="date-info">
                    <h3>{{ item.ocasion }}</h3>
                    <p>{{ item.persona }}</p>
                  </div>

                  <div class="date-actions">
                    <span class="days-badge" [class.days-badge--urgent]="item.diasRestantes <= 10">
                      {{
                        item.diasRestantes === 0 ? '¡Es hoy!' : 'En ' + item.diasRestantes + ' días'
                      }}
                    </span>

                    @if (estaLogueado()) {
                      <button
                        type="button"
                        class="delete-btn"
                        title="Eliminar fecha"
                        aria-label="Eliminar fecha"
                        (click)="eliminarFecha(item.id, $event)"
                      >
                        ✕
                      </button>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </section>

        <!-- Columna 2: Recordatorios y Sincronización -->
        <section class="sync-card" aria-labelledby="sync-title">
          <span class="card-kicker">NO OLVIDES NINGUNA FECHA</span>
          <h2 id="sync-title">Recordatorios y sincronización</h2>
          <p class="sync-desc">
            Lleva <strong>{{ fechaActiva()?.ocasion || 'tus fechas' }}</strong> directamente a la
            app de calendario de tu celular o computadora:
          </p>

          <div class="anticipation-block">
            <span class="anticipation-label">¿Con cuánta anticipación te avisamos?</span>
            <div class="anticipation-pills">
              @for (dias of [7, 3, 1]; track dias) {
                <button
                  type="button"
                  class="day-chip"
                  [class.is-active]="diasAnticipacion() === dias"
                  (click)="cambiarAnticipacion(dias)"
                >
                  {{ dias }} {{ dias === 1 ? 'día antes' : 'días antes' }}
                </button>
              }
            </div>
          </div>

          <div class="sync-buttons">
            <button
              type="button"
              class="btn-brand-pill btn-full"
              (click)="conectarGoogleCalendar()"
            >
              Guardar en Google Calendar
            </button>
            <button type="button" class="btn-outline-pill btn-full" (click)="exportarCalendario()">
              Descargar archivo .ics (Calendario móvil)
            </button>
          </div>

          <p class="ics-helper">
            <strong>¿Qué es el archivo .ics?</strong> Es una tarjeta de calendario universal: al
            abrirla en iPhone, Android u Outlook, guarda todas tus fechas con alarma automática.
          </p>

          @if (avisoSync()) {
            <p class="sync-feedback">{{ avisoSync() }}</p>
          }
        </section>

        <!-- Columna 3: Selección Recomendada estilo Pinterest -->
        <section class="suggestions-card" aria-labelledby="ideas-title">
          <div class="suggestions-head">
            <div>
              <span class="card-kicker card-kicker--brand">INSPIRACIÓN CURADA</span>
              <h2 id="ideas-title">
                Ideas para tu {{ (fechaActiva()?.ocasion || 'ocasión').toLowerCase() }}
              </h2>
            </div>
          </div>

          <div class="pinterest-grid">
            @for (prod of ideasMostradas(); track prod.id) {
              <article class="pin-card">
                <div class="pin-image-wrap">
                  <img [src]="prod.imagenUrl" [alt]="prod.nombre" loading="lazy" />
                  <span class="pin-tag">{{ prod.categoria }}</span>
                </div>
                <div class="pin-body">
                  <h3>{{ prod.nombre }}</h3>
                  <div class="pin-footer">
                    <span class="pin-price">S/ {{ prod.precio | number: '1.2-2' }}</span>
                    <a
                      [routerLink]="prod.esReal ? ['/catalogo', prod.id] : ['/catalogo']"
                      class="pin-btn"
                    >
                      Ver arreglo
                    </a>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- Botón directo hacia tu Chatbot de FloriaSmart (ajusta /cotizar si tu ruta tiene otro nombre) -->
          <a routerLink="/cotizar" class="chatbot-cta-card">
            <div>
              <strong>¿Buscas un diseño personalizado?</strong>
              <span>Habla con nuestro asistente floral para armarlo a tu medida</span>
            </div>
            <span class="chatbot-arrow">Ir al chat →</span>
          </a>
        </section>
      </div>
    </div>
  `,
  styleUrl: './mis-fechas.page.scss',
})
export class MisFechasPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly misFechasService = inject(MisFechasService);
  private readonly catalogService = inject(CatalogService);

  protected readonly fechas = signal<FechaImportanteResponse[]>([]);
  protected readonly productos = signal<any[]>([]);
  protected readonly cargando = signal<boolean>(false);
  protected readonly guardando = signal<boolean>(false);
  protected readonly errorMensaje = signal<string>('');
  protected readonly avisoSync = signal<string>('');
  protected readonly diasAnticipacion = signal<number>(7);
  protected readonly fechaSeleccionada = signal<FechaCalculada | null>(null);
  protected readonly filtroLista = signal<'todas' | 'proximas'>('todas');

  private readonly hoy = new Date();
  protected readonly mesCalendario = signal<number>(this.hoy.getMonth());
  protected readonly anioCalendario = signal<number>(this.hoy.getFullYear());

  private readonly auth = inject(AuthService);

  protected estaLogueado(): boolean {
    return !!this.auth.getToken();
  }

  protected readonly fechaForm = this.fb.nonNullable.group({
    ocasion: ['', [Validators.required, Validators.maxLength(80)]],
    persona: ['', [Validators.required, Validators.maxLength(80)]],
    fecha: ['', [Validators.required]],
  });

  private readonly mesesCortos = [
    'ENE',
    'FEB',
    'MAR',
    'ABR',
    'MAY',
    'JUN',
    'JUL',
    'AGO',
    'SEP',
    'OCT',
    'NOV',
    'DIC',
  ];

  private readonly mesesCompletos = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  private readonly fechasDemo: FechaImportanteResponse[] = [
    {
      id: 'demo-1',
      ocasion: 'Aniversario',
      persona: 'Con María',
      fecha: '2026-11-21',
      diasAnticipacion: 7,
      fechaCreacion: '',
    },
    {
      id: 'demo-2',
      ocasion: 'Cumpleaños',
      persona: 'Mamá',
      fecha: '2026-12-02',
      diasAnticipacion: 7,
      fechaCreacion: '',
    },
    {
      id: 'demo-3',
      ocasion: 'Navidad',
      persona: 'Familia',
      fecha: '2026-12-25',
      diasAnticipacion: 7,
      fechaCreacion: '',
    },
  ];

  // Respaldo editorial para que la galería nunca aparezca vacía mientras carga o si no hay conexión
  private readonly ideasRespaldo: IdeaProducto[] = [
    {
      id: 'idea-1',
      nombre: 'Box Imperial 24 Rosas Rojas',
      categoria: 'Romántico',
      precio: 145,
      imagenUrl:
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      esReal: false,
    },
    {
      id: 'idea-2',
      nombre: 'Bouquet Tulipanes & Eucalipto',
      categoria: 'Tendencia',
      precio: 120,
      imagenUrl:
        'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80',
      esReal: false,
    },
  ];

  protected readonly nombreMesActual = computed(
    () => this.mesesCompletos[this.mesCalendario()] ?? '',
  );

  protected readonly fechasCalculadas = computed<FechaCalculada[]>(() => {
    const baseHoy = new Date();
    baseHoy.setHours(0, 0, 0, 0);

    return this.fechas()
      .map((item) => {
        const [, mesStr, diaStr] = item.fecha.split('-');
        const mes = Number(mesStr) - 1;
        const dia = Number(diaStr);

        let proxima = new Date(baseHoy.getFullYear(), mes, dia);
        if (proxima < baseHoy) {
          proxima = new Date(baseHoy.getFullYear() + 1, mes, dia);
        }

        const diffMs = proxima.getTime() - baseHoy.getTime();
        const diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));

        return {
          ...item,
          diaNumero: diaStr.padStart(2, '0'),
          mesCorto: this.mesesCortos[mes] ?? 'MES',
          mesIndex: mes,
          diaInt: dia,
          diasRestantes,
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  });

  protected readonly fechasFiltradas = computed(() => {
    const todas = this.fechasCalculadas();
    if (this.filtroLista() === 'proximas') {
      return todas.filter((f) => f.diasRestantes <= 30);
    }
    return todas;
  });

  protected readonly proximaFecha = computed(() => this.fechasCalculadas()[0] ?? null);

  protected readonly fechaActiva = computed(() => this.fechaSeleccionada() ?? this.proximaFecha());

  protected readonly celdasCalendario = computed<CeldaCalendario[]>(() => {
    const anio = this.anioCalendario();
    const mes = this.mesCalendario();
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    const todasFechas = this.fechasCalculadas();

    const celdas: CeldaCalendario[] = [];

    for (let i = 0; i < primerDiaSemana; i++) {
      celdas.push({ dia: null, fechaIso: null, eventos: [], esHoy: false });
    }

    for (let d = 1; d <= diasEnMes; d++) {
      const eventosDelDia = todasFechas.filter((f) => f.mesIndex === mes && f.diaInt === d);
      const esHoy =
        d === this.hoy.getDate() && mes === this.hoy.getMonth() && anio === this.hoy.getFullYear();

      const fechaIso = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      celdas.push({
        dia: d,
        fechaIso,
        eventos: eventosDelDia,
        esHoy,
      });
    }

    return celdas;
  });

  protected readonly ideasMostradas = computed<IdeaProducto[]>(() => {
    const reales = this.productos();
    if (reales.length > 0) {
      return reales.slice(0, 2).map((p: any) => ({
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria?.nombre || 'Arreglo floral',
        precio: p.precio,
        imagenUrl:
          p.imagenUrl ||
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        esReal: true,
      }));
    }
    return this.ideasRespaldo;
  });

  ngOnInit(): void {
    if (this.estaLogueado()) {
      this.cargarFechasReales();
    } else {
      this.fechas.set(this.fechasDemo);
    }
    this.cargarSugerencias();
  }

  protected cambiarMes(delta: number): void {
    let nuevoMes = this.mesCalendario() + delta;
    let nuevoAnio = this.anioCalendario();
    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio--;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio++;
    }
    this.mesCalendario.set(nuevoMes);
    this.anioCalendario.set(nuevoAnio);
  }

  protected irAHoy(): void {
    this.mesCalendario.set(this.hoy.getMonth());
    this.anioCalendario.set(this.hoy.getFullYear());
  }

  protected alHacerClicEnDia(celda: CeldaCalendario): void {
    if (celda.eventos.length > 0) {
      this.seleccionarFecha(celda.eventos[0]);
    } else if (celda.fechaIso) {
      this.fechaForm.patchValue({ fecha: celda.fechaIso });
    }
  }

  private irALogin(): void {
    this.router.navigate(['/ingresar'], { queryParams: { redirect: '/mis-fechas' } });
  }

  private cargarFechasReales(): void {
    this.cargando.set(true);
    this.misFechasService.listarMisFechas().subscribe({
      next: (data) => {
        this.fechas.set(data);
        if (data.length > 0 && data[0].diasAnticipacion) {
          this.diasAnticipacion.set(data[0].diasAnticipacion);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  private cargarSugerencias(): void {
    const svc = this.catalogService as any;
    if (typeof svc.loadCatalog === 'function') {
      svc.loadCatalog().subscribe({
        next: (res: any) => this.productos.set(res?.products ?? res ?? []),
      });
    } else if (typeof svc.getProducts === 'function') {
      svc.getProducts().subscribe({
        next: (res: any) => this.productos.set(res?.products ?? res ?? []),
      });
    } else if (typeof svc.listar === 'function') {
      svc.listar().subscribe({
        next: (res: any) => this.productos.set(res ?? []),
      });
    }
  }

  protected guardarFecha(): void {
    if (!this.estaLogueado()) {
      this.irALogin();
      return;
    }

    if (this.fechaForm.invalid) {
      this.fechaForm.markAllAsTouched();
      this.errorMensaje.set('Completa ocasión, persona y fecha para guardar.');
      return;
    }

    this.guardando.set(true);
    this.errorMensaje.set('');

    const payload = {
      ...this.fechaForm.getRawValue(),
      diasAnticipacion: this.diasAnticipacion(),
    };

    this.misFechasService.crearFecha(payload).subscribe({
      next: (creada) => {
        this.fechas.update((prev) => [...prev, creada]);
        this.fechaForm.reset();
        this.guardando.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.mensaje ||
          err?.error?.message ||
          'No se pudo guardar la fecha. Intenta nuevamente.';
        this.errorMensaje.set(msg);
        this.guardando.set(false);
      },
    });
  }

  protected eliminarFecha(id: string, event: Event): void {
    event.stopPropagation();
    if (!this.estaLogueado()) {
      this.irALogin();
      return;
    }
    this.misFechasService.eliminarFecha(id).subscribe({
      next: () => {
        this.fechas.update((prev) => prev.filter((item) => item.id !== id));
        if (this.fechaSeleccionada()?.id === id) {
          this.fechaSeleccionada.set(null);
        }
      },
    });
  }

  protected seleccionarFecha(item: FechaCalculada): void {
    this.fechaSeleccionada.set(item);
    this.mesCalendario.set(item.mesIndex);
  }

  protected cambiarAnticipacion(dias: number): void {
    this.diasAnticipacion.set(dias);
    if (!this.estaLogueado()) return;

    const activa = this.fechaActiva();
    if (activa) {
      this.misFechasService.actualizarAnticipacion(activa.id, dias).subscribe({
        next: (actualizada) => {
          this.fechas.update((prev) =>
            prev.map((f) => (f.id === actualizada.id ? actualizada : f)),
          );
        },
      });
    }
  }

  protected exportarCalendario(): void {
    if (!this.estaLogueado()) {
      this.irALogin();
      return;
    }

    if (this.fechasCalculadas().length === 0) {
      this.avisoSync.set('Agrega primero una fecha para poder exportarla.');
      return;
    }

    this.misFechasService.descargarArchivoIcs(this.fechasCalculadas(), this.diasAnticipacion());
    this.avisoSync.set('Archivo .ics descargado. Ábrelo en tu celular para activar los avisos.');
  }

  protected conectarGoogleCalendar(): void {
    if (!this.estaLogueado()) {
      this.irALogin();
      return;
    }

    const proxima = this.fechaActiva();
    if (!proxima) {
      this.avisoSync.set('Agrega primero una fecha para crear el recordatorio en Google Calendar.');
      return;
    }

    const fechaCompacta = proxima.fecha.replace(/-/g, '');
    const titulo = encodeURIComponent(`${proxima.ocasion} - ${proxima.persona} (FloriaSmart)`);
    const detalles = encodeURIComponent(
      'Recordatorio de ocasión especial creado desde FloriaSmart Ica.',
    );

    const urlGoogle = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${fechaCompacta}/${fechaCompacta}&details=${detalles}`;
    window.open(urlGoogle, '_blank', 'noopener,noreferrer');
  }
}
