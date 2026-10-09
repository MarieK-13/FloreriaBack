package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {
    List<Producto> findByCategoriaId(UUID categoriaId);
    boolean existsByCategoriaId(UUID categoriaId);

    /**
     * Catálogo: busca productos disponibles cuyo nombre contenga el texto indicado
     * (sin distinguir mayúsculas) y cuyo precio no supere el máximo.
     * JOIN FETCH trae la categoría en la misma consulta (evita el problema N+1).
     */
    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria " +
           "WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) " +
           "AND p.precio <= :precioMax " +
           "AND p.disponible = true " +
           "ORDER BY p.precio ASC")
    List<Producto> buscarPorNombreYPrecioMaximo(@Param("nombre") String nombre,
                                                @Param("precioMax") BigDecimal precioMax);

    /**
     * Inventario: productos cuyo stock es menor o igual al límite indicado,
     * ordenados del más crítico al menos crítico. Sirve para alertas de reposición.
     */
    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria " +
           "WHERE p.stock <= :limite " +
           "ORDER BY p.stock ASC, p.nombre ASC")
    List<Producto> buscarConStockBajo(@Param("limite") Integer limite);
}
