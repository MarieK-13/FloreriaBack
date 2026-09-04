package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CotizacionRepository extends JpaRepository<Cotizacion, UUID> {
    List<Cotizacion> findByUsuarioId(UUID usuarioId);
}
