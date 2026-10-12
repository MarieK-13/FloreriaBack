package com.sistema.FloreriaBack.integration;

import com.sistema.FloreriaBack.dto.request.DetallePedidoRequestDTO;
import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.PedidoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.PedidoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

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

    @BeforeEach
    void setUp() {
        pedidoRepository.deleteAll();
        productoRepository.deleteAll();
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();

        usuario = usuarioRepository.save(Usuario.builder()
                .nombre("Cliente Transaccional")
                .email("cliente.transaccion@test.com")
                .contrasena("HashPass123!")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build());

        categoria = categoriaRepository.save(Categoria.builder()
                .nombre("Flores de Temporada")
                .descripcion("Flores de estación")
                .build());
    }

    @Test
    @DisplayName("Debe revertir (rollback) el descuento de stock si falla un producto posterior por stock insuficiente")
    void crearPedido_StockInsuficienteEnSegundoItem_EjecutaRollback() {
        // 1. Producto 1 con stock suficiente (10 unidades)
        Producto p1 = productoRepository.save(Producto.builder()
                .nombre("Rosas Rojas")
                .descripcion("Docena de rosas")
                .precio(new BigDecimal("50.00"))
                .stock(10)
                .disponible(true)
                .categoria(categoria)
                .build());

        // 2. Producto 2 con stock crítico insuficiente (solo 2 unidades)
        Producto p2 = productoRepository.save(Producto.builder()
                .nombre("Tulipanes Blancos")
                .descripcion("Ramo de tulipanes")
                .precio(new BigDecimal("70.00"))
                .stock(2)
                .disponible(true)
                .categoria(categoria)
                .build());

        // 3. Preparar solicitud donde:
        //    - Ítem 1 pide 4 unidades de Producto 1 (disponible: 10 -> el servicio descontaría temporalmente a 6)
        //    - Ítem 2 pide 8 unidades de Producto 2 (disponible: solo 2 -> lanza BusinessRuleException)
        DetallePedidoRequestDTO item1 = new DetallePedidoRequestDTO();
        item1.setProductoId(p1.getId());
        item1.setCantidad(4);

        DetallePedidoRequestDTO item2 = new DetallePedidoRequestDTO();
        item2.setProductoId(p2.getId());
        item2.setCantidad(8);

        PedidoRequestDTO request = new PedidoRequestDTO();
        request.setUsuarioId(usuario.getId());
        request.setDireccionEntrega("Av. Principal 789");
        request.setDetalles(List.of(item1, item2));

        long totalPedidosAntes = pedidoRepository.count();

        // 4. Ejecutar la llamada al servicio esperando la excepción de regla de negocio
        BusinessRuleException excepcion = assertThrows(BusinessRuleException.class, () ->
                pedidoService.crear(request)
        );

        assertTrue(excepcion.getMessage().contains("Stock insuficiente"));

        // 5. VERIFICACIÓN DEL ROLLBACK:
        // El producto 1 fue procesado y guardado antes en el bucle, pero la transacción debió revertir ese cambio
        Producto p1Recuperado = productoRepository.findById(p1.getId()).orElseThrow();
        assertEquals(10, p1Recuperado.getStock(),
                "El stock del Producto 1 debe permanecer en 10 porque la transacción hizo ROLLBACK al fallar el Producto 2");
        assertTrue(p1Recuperado.getDisponible());

        // El producto 2 no debe haber cambiado
        Producto p2Recuperado = productoRepository.findById(p2.getId()).orElseThrow();
        assertEquals(2, p2Recuperado.getStock(), "El stock del Producto 2 debe permanecer intacto en 2");

        // No se debe haber creado ningún pedido en la base de datos
        long totalPedidosDespues = pedidoRepository.count();
        assertEquals(totalPedidosAntes, totalPedidosDespues,
                "No debe haberse persistido ningún pedido en la base de datos");
    }
}
