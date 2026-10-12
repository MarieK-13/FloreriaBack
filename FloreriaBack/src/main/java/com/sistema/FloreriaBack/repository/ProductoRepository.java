package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductoRepository extends JpaRepository<Producto, UUID> {
    List<Producto> findByCategoriaId(UUID categoriaId);
    boolean existsByCategoriaId(UUID categoriaId);

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria " +
           "WHERE LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')) " +
           "AND p.precio <= :precioMax " +
           "AND p.disponible = true " +
           "ORDER BY p.precio ASC")
    List<Producto> buscarPorNombreYPrecioMaximo(@Param("nombre") String nombre,
                                                @Param("precioMax") BigDecimal precioMax);

    @Query("SELECT p FROM Producto p JOIN FETCH p.categoria " +
           "WHERE p.stock <= :limite " +
           "ORDER BY p.stock ASC, p.nombre ASC")
    List<Producto> buscarConStockBajo(@Param("limite") Integer limite);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Producto p WHERE p.id = :id")
    Optional<Producto> buscarPorIdParaActualizar(@Param("id") UUID id);
}
