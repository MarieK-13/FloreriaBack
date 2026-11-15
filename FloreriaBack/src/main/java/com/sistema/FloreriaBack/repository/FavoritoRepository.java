package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, UUID> {

    @Query("SELECT f FROM Favorito f JOIN FETCH f.producto p WHERE f.usuario.id = :usuarioId ORDER BY f.fechaCreacion DESC")
    List<Favorito> findAllByUsuarioIdWithProducto(@Param("usuarioId") UUID usuarioId);

    @Query("SELECT f.producto.id FROM Favorito f WHERE f.usuario.id = :usuarioId")
    List<UUID> findProductoIdsByUsuarioId(@Param("usuarioId") UUID usuarioId);

    Optional<Favorito> findByUsuarioIdAndProductoId(UUID usuarioId, UUID productoId);

    void deleteAllByUsuarioId(UUID usuarioId);
}