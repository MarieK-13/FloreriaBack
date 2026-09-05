package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.DetalleProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface DetalleProductoRepository extends JpaRepository<DetalleProducto, UUID> {

    Optional<DetalleProducto> findByProductoId(UUID productoId);

    boolean existsByProductoId(UUID productoId);
}
