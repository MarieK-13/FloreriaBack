package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Pedido;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface PedidoRepository extends JpaRepository<Pedido, UUID> {

    @Override
    @EntityGraph(attributePaths = {"detalles", "usuario"})
    Optional<Pedido> findById(UUID id);

    @Override
    @EntityGraph(attributePaths = {"detalles", "usuario"})
    List<Pedido> findAll();

    @EntityGraph(attributePaths = {"detalles", "usuario"})
    List<Pedido> findByUsuarioId(UUID usuarioId);

    @EntityGraph(attributePaths = {"detalles", "usuario"})
    List<Pedido> findByEstado(EstadoPedido estado);

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.detalles " +
           "WHERE p.fechaPedido >= :inicio AND p.fechaPedido < :fin " + // 🛠️ CORREGIDO
           "ORDER BY p.fechaPedido DESC")
    List<Pedido> buscarPorRangoDeFechas(@Param("inicio") LocalDateTime inicio,
                                        @Param("fin") LocalDateTime fin);

  
    @Query("SELECT SUM(p.total) FROM Pedido p " +
           "WHERE p.fechaPedido >= :inicio AND p.fechaPedido < :fin " + // 🛠️ CORREGIDO
           "AND p.estado IN :estadosPagados")
    BigDecimal sumarVentasPagadasEnRango(@Param("inicio") LocalDateTime inicio,
                                         @Param("fin") LocalDateTime fin,
                                         @Param("estadosPagados") Set<EstadoPedido> estadosPagados);

    @Query("SELECT COUNT(p) FROM Pedido p " +
           "WHERE p.fechaPedido >= :inicio AND p.fechaPedido < :fin " + // 🛠️ CORREGIDO
           "AND p.estado IN :estadosPagados")
    long contarPedidosPagadosEnRango(@Param("inicio") LocalDateTime inicio,
                                     @Param("fin") LocalDateTime fin,
                                     @Param("estadosPagados") Set<EstadoPedido> estadosPagados);

   
    @Query("SELECT p.usuario.id FROM Pedido p WHERE p.id = :pedidoId")
    Optional<UUID> buscarIdUsuarioDelPedido(@Param("pedidoId") UUID pedidoId);
}
