package com.sistema.FloreriaBack.integration;

import com.sistema.FloreriaBack.dto.request.DetallePedidoRequestDTO;
import com.sistema.FloreriaBack.dto.request.PedidoRequestDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.model.enums.RolUsuario;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.PedidoService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest 
class PedidoRollbackIntegracionTest {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository; 

    @Test
    @DisplayName("Rollback: Si el segundo producto falla por stock, el descuento del primero debe revertirse por completo")
    void crearPedido_SegundoProductoFalla_EjecutaRollbackYStockSigueIntacto() {
        String sufijo = UUID.randomUUID().toString().substring(0, 8);

        Usuario cliente = usuarioRepository.save(Usuario.builder()
                .nombre("Cliente Rollback")
                .email("rollback." + sufijo + "@test.com")
                .contrasena("Password123!")
                .rol(RolUsuario.CLIENTE)
                .activo(true)
                .build());

        Categoria categoriaTest = categoriaRepository.save(Categoria.builder()
                .nombre("Categoria Rollback " + sufijo)
                .descripcion("Categoria de apoyo para pruebas")
                .build());

        Producto productoA = productoRepository.save(Producto.builder()
                .nombre("Flor A " + sufijo)
                .precio(new BigDecimal("10.00"))
                .stock(5) 
                .disponible(true)
                .categoria(categoriaTest) 
                .color("Rojo")
                .tamano("Mediano")
                .build());

        Producto productoB = productoRepository.save(Producto.builder()
                .nombre("Flor B " + sufijo)
                .precio(new BigDecimal("20.00"))
                .stock(1) // Stock inicial = 1
                .disponible(true)
                .categoria(categoriaTest) 
                .color("Azul")
                .tamano("Mediano")
                .build());

        PedidoRequestDTO requestDTO = new PedidoRequestDTO();
        requestDTO.setUsuarioId(cliente.getId());
        requestDTO.setDireccionEntrega("Calle Falsa 123");
        requestDTO.setDetalles(List.of(
                new DetallePedidoRequestDTO(productoA.getId(), 2), 
                new DetallePedidoRequestDTO(productoB.getId(), 3) 
        ));

        assertThrows(BusinessRuleException.class, () -> {
            pedidoService.crear(requestDTO);
        }, "Debe lanzar BusinessRuleException por stock insuficiente del segundo producto");

        Producto productoAComprobacion = productoRepository.findById(productoA.getId()).orElseThrow();

        assertEquals(5, productoAComprobacion.getStock(), 
                "¡El rollback funcionó! El stock del Producto A regresó a 5 y quedó intacto.");
                
        Producto productoBComprobacion = productoRepository.findById(productoB.getId()).orElseThrow();
        assertEquals(1, productoBComprobacion.getStock());
    }
}