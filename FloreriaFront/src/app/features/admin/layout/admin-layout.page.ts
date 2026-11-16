import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout-page',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar" aria-label="Navegación administrativa">
        <a class="admin-brand" routerLink="/">
          <span class="brand-mark" aria-hidden="true">✿</span>
          <span>
            <strong>FloriaSmart</strong>
            <small>Administración</small>
          </span>
        </a>

        <p class="sidebar-label">MENÚ PRINCIPAL</p>
        <nav class="admin-nav">
          <a
            routerLink="/admin"
            routerLinkActive="is-active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <span aria-hidden="true">▦</span> Resumen
          </a>
          <a routerLink="/admin/productos" routerLinkActive="is-active">
            <span aria-hidden="true">✿</span> Productos
          </a>
          <a routerLink="/admin/pedidos" routerLinkActive="is-active">
            <span aria-hidden="true">▤</span> Pedidos
          </a>
          <a routerLink="/admin/categorias" routerLinkActive="is-active">
            <span aria-hidden="true">◈</span> Categorías
          </a>
          @if (isAdministrator()) {
            <a routerLink="/admin/usuarios" routerLinkActive="is-active">
              <span aria-hidden="true">♙</span> Usuarios y roles
            </a>
          }
        </nav>

        <div class="sidebar-bottom">
          <div class="admin-account">
            <span class="account-avatar" aria-hidden="true">
              {{ userInitial() }}
            </span>
            <span class="account-copy">
              <strong>{{ auth.user()?.name }}</strong>
              <small>{{ auth.user()?.role }}</small>
            </span>
          </div>
          <button type="button" class="logout-button" (click)="auth.logout()">Cerrar sesión</button>
          <a class="store-link" routerLink="/">← Volver a la tienda</a>
        </div>
      </aside>

      <div class="admin-workspace">
        <header class="workspace-header">
          <span>Panel administrativo</span>
          <span class="role-badge">{{ auth.user()?.role }}</span>
        </header>
        <div class="admin-page">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styleUrl: './admin-layout.page.scss',
})
export class AdminLayoutPage {
  protected readonly auth = inject(AuthService);

  protected readonly isAdministrator = computed(() => this.auth.hasRole('ADMINISTRADOR'));
  protected readonly userInitial = computed(
    () => this.auth.user()?.name.trim().charAt(0).toLocaleUpperCase() ?? 'A',
  );
}
