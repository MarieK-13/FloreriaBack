package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {
    List<Producto> findByCategoriaId(UUID categoriaId);
    boolean existsByCategoriaId(UUID categoriaId);
}
