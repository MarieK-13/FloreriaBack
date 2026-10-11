package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Pedido;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PedidoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PedidoRepository pedidoRepository;

    private Usuario usuarioTest;

    @BeforeEach
    void setUp() {
        usuarioTest = Usuario.builder()
                .nombre("Juan Pérez")
                .email("juan.perez@test.com")
                .contrasena("Password123!")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build();
        entityManager.persist(usuarioTest);
    }

    private Pedido crearPedido(LocalDateTime fecha, BigDecimal total, EstadoPedido estado) {
        return Pedido.builder()
                .fechaPedido(fecha)
                .total(total)
                .direccionEntrega("Av. Las Flores 456")
                .instruccionesEntrega("Dejar en recepción")
                .estado(estado)
                .usuario(usuarioTest)
                .build();
    }

    @Test
    @DisplayName("buscarPorRangoDeFechas - Debe incluir extremos y ordenar del más reciente al más antiguo")
    void buscarPorRangoDeFechas_IncluyeExtremosYOrdenaDescendente() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 10, 23, 59);

        // Extremo inicial
        Pedido pInicio = crearPedido(inicio, new BigDecimal("100.00"), EstadoPedido.PENDIENTE);
        // Intermedio
        Pedido pMedio = crearPedido(LocalDateTime.of(2026, 10, 5, 12, 0), new BigDecimal("150.00"), EstadoPedido.PAGADO);
        // Extremo final
        Pedido pFin = crearPedido(fin, new BigDecimal("200.00"), EstadoPedido.EN_CAMINO);
        // Fuera de rango (anterior y posterior)
        Pedido pFueraAntes = crearPedido(LocalDateTime.of(2026, 9, 30, 23, 59), new BigDecimal("80.00"), EstadoPedido.PENDIENTE);
        Pedido pFueraDespues = crearPedido(LocalDateTime.of(2026, 10, 11, 0, 1), new BigDecimal("90.00"), EstadoPedido.PENDIENTE);

        entityManager.persist(pInicio);
        entityManager.persist(pMedio);
        entityManager.persist(pFin);
        entityManager.persist(pFueraAntes);
        entityManager.persist(pFueraDespues);
        entityManager.flush();

        List<Pedido> resultado = pedidoRepository.buscarPorRangoDeFechas(inicio, fin);

        assertEquals(3, resultado.size());
        // Comprobar orden descendente: pFin, luego pMedio, luego pInicio
        assertEquals(pFin.getId(), resultado.get(0).getId());
        assertEquals(pMedio.getId(), resultado.get(1).getId());
        assertEquals(pInicio.getId(), resultado.get(2).getId());
    }

    @Test
    @DisplayName("sumarVentasEnRango y contarPedidosEnRango - Excluyen pedidos CANCELADOS")
    void sumarVentasYContarPedidos_ExcluyenCancelados() {
        LocalDateTime inicio = LocalDateTime.of(2026, 10, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 10, 5, 23, 59);

        Pedido p1 = crearPedido(LocalDateTime.of(2026, 10, 2, 10, 0), new BigDecimal("100.00"), EstadoPedido.PAGADO);
        Pedido p2 = crearPedido(LocalDateTime.of(2026, 10, 3, 15, 0), new BigDecimal("150.00"), EstadoPedido.ENTREGADO);
        Pedido pCancelado = crearPedido(LocalDateTime.of(2026, 10, 4, 11, 0), new BigDecimal("200.00"), EstadoPedido.CANCELADO);

        entityManager.persist(p1);
        entityManager.persist(p2);
        entityManager.persist(pCancelado);
        entityManager.flush();

        BigDecimal sumaVentas = pedidoRepository.sumarVentasEnRango(inicio, fin, EstadoPedido.CANCELADO);
        long cantidad = pedidoRepository.contarPedidosEnRango(inicio, fin, EstadoPedido.CANCELADO);

        // 100.00 + 150.00 = 250.00 (el de 200 cancelado no se suma)
        assertNotNull(sumaVentas);
        assertEquals(new BigDecimal("250.00"), sumaVentas);
        assertEquals(2, cantidad);
    }

    @Test
    @DisplayName("sumarVentasEnRango y contarPedidosEnRango - Manejo de nulos y ceros cuando no hay ventas")
    void sumarVentasYContarPedidos_SinVentas_RetornaNullYCero() {
        LocalDateTime inicio = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime fin = LocalDateTime.of(2026, 1, 31, 23, 59);

        BigDecimal suma = pedidoRepository.sumarVentasEnRango(inicio, fin, EstadoPedido.CANCELADO);
        long conteo = pedidoRepository.contarPedidosEnRango(inicio, fin, EstadoPedido.CANCELADO);

        assertNull(suma, "La suma en JPQL devuelve null cuando no hay registros coincidentes");
        assertEquals(0, conteo, "El conteo debe ser 0 cuando no hay pedidos");
    }

    @Test
    @DisplayName("buscarIdUsuarioDelPedido - Retorna el ID del usuario dueño del pedido")
    void buscarIdUsuarioDelPedido_PedidoExistente_RetornaIdUsuario() {
        Pedido pedido = crearPedido(LocalDateTime.now(), new BigDecimal("120.00"), EstadoPedido.PENDIENTE);
        entityManager.persist(pedido);
        entityManager.flush();

        Optional<UUID> usuarioIdOpt = pedidoRepository.buscarIdUsuarioDelPedido(pedido.getId());

        assertTrue(usuarioIdOpt.isPresent());
        assertEquals(usuarioTest.getId(), usuarioIdOpt.get());
    }

    @Test
    @DisplayName("buscarIdUsuarioDelPedido - Retorna Optional.empty si el pedido no existe")
    void buscarIdUsuarioDelPedido_PedidoInexistente_RetornaEmpty() {
        Optional<UUID> usuarioIdOpt = pedidoRepository.buscarIdUsuarioDelPedido(UUID.randomUUID());

        assertTrue(usuarioIdOpt.isEmpty());
    }
}
