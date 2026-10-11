package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.ItemCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemCotizacionRepository extends JpaRepository<ItemCotizacion, UUID> {

    boolean existsByProductoId(UUID productoId);
}
