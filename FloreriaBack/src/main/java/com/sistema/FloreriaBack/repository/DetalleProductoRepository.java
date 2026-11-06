package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.DetalleProducto;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DetalleProductoRepository extends JpaRepository<DetalleProducto, UUID> {

    @Override
    @EntityGraph(attributePaths = "producto")
    List<DetalleProducto> findAll();

    @Override
    @EntityGraph(attributePaths = "producto")
    Optional<DetalleProducto> findById(UUID id);

    @EntityGraph(attributePaths = "producto")
    Optional<DetalleProducto> findByProductoId(UUID productoId);

    boolean existsByProductoId(UUID productoId);
}
