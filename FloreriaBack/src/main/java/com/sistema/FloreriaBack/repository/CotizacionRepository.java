package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Cotizacion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CotizacionRepository extends JpaRepository<Cotizacion, UUID> {

    @Override
    @EntityGraph(attributePaths = {"items", "usuario"})
    Optional<Cotizacion> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = {"items", "usuario"})
    List<Cotizacion> findAll();

    @EntityGraph(attributePaths = {"items", "usuario"})
    List<Cotizacion> findByUsuarioId(UUID usuarioId);
}
