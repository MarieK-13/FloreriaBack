package com.sistema.FloreriaBack.integration;

import com.sistema.FloreriaBack.dto.request.DetallePedidoRequestDTO;
import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.dto.response.PedidoResponseDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.PedidoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.PedidoService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class TransaccionRollbackIntegracionTest {

    @Autowired
    private PedidoService pedidoService;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private CategoriaRepository categoriaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private PedidoRepository pedidoRepository;

    private Usuario usuario;
    private Categoria categoria;
    private final List<UUID> productosCreados = new ArrayList<>();
    private String sufijo;

    @BeforeEach
    void setUp() {
        sufijo = UUID.randomUUID().toString().substring(0, 8);
        productosCreados.clear();

        usuario = usuarioRepository.save(Usuario.builder()
                .nombre("Cliente Transaccional")
                .email("cliente.transaccion." + sufijo + "@test.com")
                .contrasena("HashPass123!")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build());

        categoria = categoriaRepository.save(Categoria.builder()
                .nombre("Flores de Temporada " + sufijo)
                .descripcion("Flores de estación")
                .build());
    }

    @AfterEach
    void limpiar() {
        pedidoRepository.deleteAll(pedidoRepository.findByUsuarioId(usuario.getId()));
        productoRepository.deleteAllById(productosCreados);
        categoriaRepository.delete(categoria);
        usuarioRepository.delete(usuario);
    }

    @Test
    @DisplayName("Rollback: si falla un producto posterior por stock insuficiente, se revierte el descuento del anterior")
    void crearPedido_StockInsuficienteEnSegundoItem_EjecutaRollback() {
        Producto a = guardarProducto("Rosas Rojas", 10);
        Producto b = guardarProducto("Tulipanes Blancos", 10);

        Producto primero = a.getId().compareTo(b.getId()) < 0 ? a : b;
        Producto segundo = primero == a ? b : a;
        segundo.setStock(2);
        productoRepository.save(segundo);

        PedidoRequestDTO solicitud = solicitud(
                new DetallePedidoRequestDTO(primero.getId(), 4),   
                new DetallePedidoRequestDTO(segundo.getId(), 8));  

        BusinessRuleException excepcion = assertThrows(BusinessRuleException.class,
                () -> pedidoService.crear(solicitud));

        assertTrue(excepcion.getMessage().contains("Stock insuficiente"));
        assertEquals(10, stockDe(primero),
                "El stock del primer producto debe seguir en 10: la transacción hizo ROLLBACK");
        assertEquals(2, stockDe(segundo), "El stock del segundo producto no debe cambiar");
        assertTrue(pedidoRepository.findByUsuarioId(usuario.getId()).isEmpty(),
                "No debe haberse guardado ningún pedido");
    }

    @Test
    @DisplayName("Cancelar un pedido devuelve el stock y deja el producto disponible otra vez")
    void cancelarPedido_RestituyeStockYDisponibilidad() {
        Producto producto = guardarProducto("Orquídeas", 3);

        PedidoResponseDTO pedido = pedidoService.crear(solicitud(new DetallePedidoRequestDTO(producto.getId(), 3)));

        Producto agotado = productoRepository.findById(producto.getId()).orElseThrow();
        assertEquals(0, agotado.getStock());
        assertFalse(agotado.getDisponible(), "Al llegar a 0 el producto queda no disponible");

        pedidoService.cambiarEstado(pedido.getId(), EstadoPedido.CANCELADO);

        Producto repuesto = productoRepository.findById(producto.getId()).orElseThrow();
        assertEquals(3, repuesto.getStock());
        assertTrue(repuesto.getDisponible(), "Al cancelar, el producto vuelve a estar disponible");
    }

    @Test
    @DisplayName("Cancelar dos veces el mismo pedido falla la segunda vez y no duplica el stock")
    void cancelarPedidoDosVeces_NoDuplicaStock() {
        Producto producto = guardarProducto("Girasoles", 5);
        PedidoResponseDTO pedido = pedidoService.crear(solicitud(new DetallePedidoRequestDTO(producto.getId(), 2)));

        pedidoService.cambiarEstado(pedido.getId(), EstadoPedido.CANCELADO);

        assertThrows(BusinessRuleException.class,
                () -> pedidoService.cambiarEstado(pedido.getId(), EstadoPedido.CANCELADO));
        assertEquals(5, stockDe(producto), "El stock debe ser el original (5), no 7");
    }

    @Test
    @DisplayName("Concurrencia: dos cancelaciones simultáneas del mismo pedido restituyen el stock una sola vez")
    void cancelarMismoPedidoEnParalelo_RestituyeStockUnaSolaVez() throws Exception {
        Producto producto = guardarProducto("Margaritas", 5);
        UUID pedidoId = pedidoService.crear(solicitud(new DetallePedidoRequestDTO(producto.getId(), 2))).getId();
        assertEquals(3, stockDe(producto));

        int exitosas = ejecutarEnParalelo(2, () -> {
            try {
                pedidoService.cambiarEstado(pedidoId, EstadoPedido.CANCELADO);
                return true;
            } catch (BusinessRuleException e) {
                return false;
            }
        });

        assertEquals(1, exitosas, "Solo una de las dos cancelaciones puede completarse");
        assertEquals(5, stockDe(producto), "El stock debe volver a 5 una sola vez (no a 7)");
    }

    @Test
    @DisplayName("Concurrencia: dos pedidos simultáneos por la última unidad, solo uno se concreta")
    void dosPedidosPorLaUltimaUnidad_SoloUnoSeConcreta() throws Exception {
        Producto producto = guardarProducto("Lirios", 1);

        int exitosas = ejecutarEnParalelo(2, () -> {
            try {
                pedidoService.crear(solicitud(new DetallePedidoRequestDTO(producto.getId(), 1)));
                return true;
            } catch (BusinessRuleException e) {
                return false;
            }
        });

        assertEquals(1, exitosas, "Solo un pedido puede llevarse la última unidad");
        assertEquals(0, stockDe(producto), "El stock nunca puede quedar negativo");
        assertEquals(1, pedidoRepository.findByUsuarioId(usuario.getId()).size());
    }

    // ---------- utilidades ----------

    private Producto guardarProducto(String nombre, int stock) {
        Producto guardado = productoRepository.save(Producto.builder()
                .nombre(nombre + " " + sufijo)
                .descripcion("Producto de prueba")
                .precio(new BigDecimal("50.00"))
                .stock(stock)
                .disponible(stock > 0)
                .categoria(categoria)
                .build());
        productosCreados.add(guardado.getId());
        return guardado;
    }

    private PedidoRequestDTO solicitud(DetallePedidoRequestDTO... items) {
        PedidoRequestDTO solicitud = new PedidoRequestDTO();
        solicitud.setUsuarioId(usuario.getId());
        solicitud.setDireccionEntrega("Av. Principal 789");
        solicitud.setDetalles(List.of(items));
        return solicitud;
    }

    private int stockDe(Producto producto) {
        return productoRepository.findById(producto.getId()).orElseThrow().getStock();
    }

    /** Lanza la misma operación en varios hilos a la vez y devuelve cuántas terminaron con éxito (true). */
    private int ejecutarEnParalelo(int hilos, Callable<Boolean> operacion) throws Exception {
        ExecutorService ejecutor = Executors.newFixedThreadPool(hilos);
        try {
            CountDownLatch salida = new CountDownLatch(1);
            List<Future<Boolean>> resultados = new ArrayList<>();
            for (int i = 0; i < hilos; i++) {
                resultados.add(ejecutor.submit(() -> {
                    salida.await();
                    return operacion.call();
                }));
            }
            salida.countDown();

            int exitosas = 0;
            for (Future<Boolean> resultado : resultados) {
                if (resultado.get(30, TimeUnit.SECONDS)) {
                    exitosas++;
                }
            }
            return exitosas;
        } finally {
            ejecutor.shutdown();
        }
    }
}
