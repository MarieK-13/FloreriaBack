package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Cotizacion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * Seguridad: devuelve el ID del dueño de una cotización, para verificar que un CLIENTE
     * solo consulte sus propias cotizaciones.
     */
    @Query("SELECT c.usuario.id FROM Cotizacion c WHERE c.id = :cotizacionId")
    Optional<UUID> buscarIdUsuarioDeCotizacion(@Param("cotizacionId") UUID cotizacionId);
}
