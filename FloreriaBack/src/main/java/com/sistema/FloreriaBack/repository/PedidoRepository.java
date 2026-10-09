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

    /**
     * Reporte: pedidos realizados dentro de un rango de fechas, del más reciente al más antiguo.
     */
    @Query("SELECT DISTINCT p FROM Pedido p " +
           "JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.detalles " +
           "WHERE p.fechaPedido BETWEEN :inicio AND :fin " +
           "ORDER BY p.fechaPedido DESC")
    List<Pedido> buscarPorRangoDeFechas(@Param("inicio") LocalDateTime inicio,
                                        @Param("fin") LocalDateTime fin);

    /**
     * Reporte: suma del total de los pedidos en un rango de fechas, excluyendo un estado
     * (se usa para no contar los pedidos CANCELADOS). Devuelve null si no hay pedidos.
     */
    @Query("SELECT SUM(p.total) FROM Pedido p " +
           "WHERE p.fechaPedido BETWEEN :inicio AND :fin " +
           "AND p.estado <> :estadoExcluido")
    BigDecimal sumarVentasEnRango(@Param("inicio") LocalDateTime inicio,
                                  @Param("fin") LocalDateTime fin,
                                  @Param("estadoExcluido") EstadoPedido estadoExcluido);

    /**
     * Reporte: cantidad de pedidos en un rango de fechas, excluyendo un estado.
     */
    @Query("SELECT COUNT(p) FROM Pedido p " +
           "WHERE p.fechaPedido BETWEEN :inicio AND :fin " +
           "AND p.estado <> :estadoExcluido")
    long contarPedidosEnRango(@Param("inicio") LocalDateTime inicio,
                              @Param("fin") LocalDateTime fin,
                              @Param("estadoExcluido") EstadoPedido estadoExcluido);

    /**
     * Seguridad: devuelve el ID del dueño de un pedido, para verificar que un CLIENTE
     * solo consulte sus propios pedidos.
     */
    @Query("SELECT p.usuario.id FROM Pedido p WHERE p.id = :pedidoId")
    Optional<UUID> buscarIdUsuarioDelPedido(@Param("pedidoId") UUID pedidoId);
}
