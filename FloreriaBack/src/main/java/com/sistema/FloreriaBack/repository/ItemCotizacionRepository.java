package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.ItemCotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemCotizacionRepository extends JpaRepository<ItemCotizacion, UUID> {

    /** true si el producto aparece en alguna cotización (se usa para bloquear su eliminación). */
    boolean existsByProductoId(UUID productoId);
}
