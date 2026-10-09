package com.sistema.FloreriaBack.service;

import com.sistema.FloreriaBack.dto.response.ReporteVentasDTO;
import com.sistema.FloreriaBack.exception.BusinessRuleException;
import com.sistema.FloreriaBack.mapper.PedidoMapper;
import com.sistema.FloreriaBack.mapper.ProductoMapper;
import com.sistema.FloreriaBack.model.enums.EstadoPedido;
import com.sistema.FloreriaBack.repository.CategoriaRepository;
import com.sistema.FloreriaBack.repository.PedidoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.impl.PedidoServiceImpl;
import com.sistema.FloreriaBack.service.impl.ProductoServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Pruebas de la lógica de servicio que usa las consultas JPQL (@Query) nuevas.
 */
@ExtendWith(MockitoExtension.class)
class ConsultasJpqlServiceTest {

    @Mock private PedidoRepository pedidoRepository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ProductoRepository productoRepository;
    @Mock private CategoriaRepository categoriaRepository;

    private PedidoServiceImpl pedidoService;
    private ProductoServiceImpl productoService;

    @BeforeEach
    void setUp() {
        pedidoService = new PedidoServiceImpl(pedidoRepository, usuarioRepository, productoRepository, new PedidoMapper());
        productoService = new ProductoServiceImpl(productoRepository, categoriaRepository, new ProductoMapper());
    }

    @Test
    @DisplayName("Reporte de ventas: suma y cuenta excluyendo pedidos cancelados")
    void reporteDeVentas_Exitoso() {
        LocalDate inicio = LocalDate.of(2026, 10, 1);
        LocalDate fin = LocalDate.of(2026, 10, 31);
        when(pedidoRepository.sumarVentasEnRango(any(LocalDateTime.class), any(LocalDateTime.class), eq(EstadoPedido.CANCELADO)))
                .thenReturn(new BigDecimal("350.50"));
        when(pedidoRepository.contarPedidosEnRango(any(LocalDateTime.class), any(LocalDateTime.class), eq(EstadoPedido.CANCELADO)))
                .thenReturn(4L);

        ReporteVentasDTO reporte = pedidoService.reporteDeVentas(inicio, fin);

        assertEquals(4L, reporte.getCantidadPedidos());
        assertEquals(new BigDecimal("350.50"), reporte.getTotalVendido());
        verify(pedidoRepository).sumarVentasEnRango(inicio.atStartOfDay(), fin.atTime(23, 59, 59, 999_999_999), EstadoPedido.CANCELADO);
    }

    @Test
    @DisplayName("Reporte de ventas: sin pedidos devuelve total 0 en lugar de null")
    void reporteDeVentas_SinPedidos_DevuelveCero() {
        when(pedidoRepository.sumarVentasEnRango(any(), any(), any())).thenReturn(null);
        when(pedidoRepository.contarPedidosEnRango(any(), any(), any())).thenReturn(0L);

        ReporteVentasDTO reporte = pedidoService.reporteDeVentas(LocalDate.now(), LocalDate.now());

        assertEquals(BigDecimal.ZERO, reporte.getTotalVendido());
        assertEquals(0L, reporte.getCantidadPedidos());
    }

    @Test
    @DisplayName("Rango de fechas invertido lanza excepción y no consulta la BD")
    void rangoInvertido_LanzaExcepcion() {
        LocalDate inicio = LocalDate.of(2026, 10, 31);
        LocalDate fin = LocalDate.of(2026, 10, 1);

        assertThrows(BusinessRuleException.class, () -> pedidoService.listarPorRangoDeFechas(inicio, fin));
        verifyNoInteractions(pedidoRepository);
    }

    @Test
    @DisplayName("Búsqueda de productos sin precio máximo usa el tope por defecto")
    void buscarProductos_SinPrecioMaximo() {
        when(productoRepository.buscarPorNombreYPrecioMaximo(eq("rosa"), any(BigDecimal.class))).thenReturn(List.of());

        productoService.buscarPorNombreYPrecioMaximo("  rosa ", null);

        verify(productoRepository).buscarPorNombreYPrecioMaximo("rosa", new BigDecimal("99999999.99"));
    }

    @Test
    @DisplayName("Precio máximo negativo lanza excepción")
    void buscarProductos_PrecioNegativo_LanzaExcepcion() {
        assertThrows(BusinessRuleException.class,
                () -> productoService.buscarPorNombreYPrecioMaximo("rosa", new BigDecimal("-1")));
        verifyNoInteractions(productoRepository);
    }

    @Test
    @DisplayName("Stock bajo con límite negativo lanza excepción")
    void stockBajo_LimiteNegativo_LanzaExcepcion() {
        assertThrows(BusinessRuleException.class, () -> productoService.listarConStockBajo(-1));
        verifyNoInteractions(productoRepository);
    }
}
