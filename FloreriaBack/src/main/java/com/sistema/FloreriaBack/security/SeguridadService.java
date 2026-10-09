package com.sistema.FloreriaBack.security;

import com.sistema.FloreriaBack.repository.CotizacionRepository;
import com.sistema.FloreriaBack.repository.PedidoRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Reglas de "propiedad" que se usan en @PreAuthorize desde los controladores, por ejemplo:
 *   @PreAuthorize("@seguridad.puedeVerPedido(#id)")
 * ADMINISTRADOR y OPERARIO (el personal) pueden ver todo; un CLIENTE solo lo suyo.
 */
@Component("seguridad")
public class SeguridadService {

    private static final String ROL_ADMINISTRADOR = "ROLE_ADMINISTRADOR";
    private static final String ROL_OPERARIO = "ROLE_OPERARIO";

    private final PedidoRepository pedidoRepository;
    private final CotizacionRepository cotizacionRepository;

    public SeguridadService(PedidoRepository pedidoRepository, CotizacionRepository cotizacionRepository) {
        this.pedidoRepository = pedidoRepository;
        this.cotizacionRepository = cotizacionRepository;
    }

    /** true si el usuario autenticado es ADMINISTRADOR u OPERARIO. */
    public boolean esPersonal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> ROL_ADMINISTRADOR.equals(a.getAuthority())
                        || ROL_OPERARIO.equals(a.getAuthority()));
    }

    /** true si el ID indicado es el del usuario autenticado. */
    public boolean esUsuarioActual(UUID usuarioId) {
        UsuarioPrincipal actual = usuarioActual();
        return actual != null && usuarioId != null && usuarioId.equals(actual.getId());
    }

    /** El personal puede actuar por cualquier usuario; un cliente solo por sí mismo. */
    public boolean puedeActuarComo(UUID usuarioId) {
        return esPersonal() || esUsuarioActual(usuarioId);
    }

    @Transactional(readOnly = true)
    public boolean puedeVerPedido(UUID pedidoId) {
        return esPersonal() || pedidoRepository.buscarIdUsuarioDelPedido(pedidoId)
                .map(this::esUsuarioActual)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean puedeVerCotizacion(UUID cotizacionId) {
        return esPersonal() || cotizacionRepository.buscarIdUsuarioDeCotizacion(cotizacionId)
                .map(this::esUsuarioActual)
                .orElse(false);
    }

    private UsuarioPrincipal usuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioPrincipal principal) {
            return principal;
        }
        return null;
    }
}
