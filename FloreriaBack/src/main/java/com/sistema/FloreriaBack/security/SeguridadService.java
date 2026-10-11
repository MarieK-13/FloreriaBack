package com.sistema.FloreriaBack.security;

import com.sistema.FloreriaBack.repository.CotizacionRepository;
import com.sistema.FloreriaBack.repository.PedidoRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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

    public boolean esPersonal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> ROL_ADMINISTRADOR.equals(a.getAuthority())
                        || ROL_OPERARIO.equals(a.getAuthority()));
    }

    public boolean esUsuarioActual(UUID usuarioId) {
        UsuarioPrincipal actual = usuarioActual();
        return actual != null && usuarioId != null && usuarioId.equals(actual.getId());
    }

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
