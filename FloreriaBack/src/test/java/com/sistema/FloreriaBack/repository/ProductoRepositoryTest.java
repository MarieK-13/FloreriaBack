package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Categoria;
import com.sistema.FloreriaBack.model.Producto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProductoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ProductoRepository productoRepository;

    private Categoria categoriaBase;

    @BeforeEach
    void setUp() {
        categoriaBase = Categoria.builder()
                .nombre("Flores Premium")
                .descripcion("Categoría de flores frescas de exportación")
                .build();
        entityManager.persist(categoriaBase);
    }

    private Producto crearProducto(String nombre, BigDecimal precio, Integer stock, Boolean disponible) {
        return Producto.builder()
                .nombre(nombre)
                .descripcion("Descripción de " + nombre)
                .precio(precio)
                .stock(stock)
                .disponible(disponible)
                .categoria(categoriaBase)
                .color("Rojo")
                .tamano("Mediano")
                .build();
    }

    @Test
    @DisplayName("buscarPorNombreYPrecioMaximo - Debe ignorar mayúsculas y minúsculas")
    void buscarPorNombreYPrecioMaximo_IgnoraMayusculasYMinusculas() {
        Producto p1 = crearProducto("Ramo de Rosas Rojas", new BigDecimal("50.00"), 10, true);
        entityManager.persist(p1);
        entityManager.flush();

        List<Producto> resultado = productoRepository.buscarPorNombreYPrecioMaximo("rosas", new BigDecimal("100.00"));

        assertFalse(resultado.isEmpty());
        assertEquals("Ramo de Rosas Rojas", resultado.get(0).getNombre());
    }

    @Test
    @DisplayName("buscarPorNombreYPrecioMaximo - Debe respetar el precio máximo indicado")
    void buscarPorNombreYPrecioMaximo_RespetaPrecioMaximo() {
        Producto economico = crearProducto("Rosas Económicas", new BigDecimal("45.00"), 10, true);
        Producto caro = crearProducto("Rosas Importadas", new BigDecimal("120.00"), 10, true);
        entityManager.persist(economico);
        entityManager.persist(caro);
        entityManager.flush();

        List<Producto> resultado = productoRepository.buscarPorNombreYPrecioMaximo("Rosas", new BigDecimal("80.00"));

        assertEquals(1, resultado.size());
        assertEquals("Rosas Económicas", resultado.get(0).getNombre());
    }

    @Test
    @DisplayName("buscarPorNombreYPrecioMaximo - Debe excluir productos no disponibles")
    void buscarPorNombreYPrecioMaximo_ExcluyeNoDisponibles() {
        Producto disponible = crearProducto("Tulipanes Amarillos", new BigDecimal("60.00"), 10, true);
        Producto noDisponible = crearProducto("Tulipanes Azules", new BigDecimal("60.00"), 0, false);
        entityManager.persist(disponible);
        entityManager.persist(noDisponible);
        entityManager.flush();

        List<Producto> resultado = productoRepository.buscarPorNombreYPrecioMaximo("Tulipanes", new BigDecimal("100.00"));

        assertEquals(1, resultado.size());
        assertEquals("Tulipanes Amarillos", resultado.get(0).getNombre());
    }

    @Test
    @DisplayName("buscarPorNombreYPrecioMaximo - Debe ordenar resultados por precio ascendente")
    void buscarPorNombreYPrecioMaximo_OrdenaPorPrecioAscendente() {
        Producto p1 = crearProducto("Orquídea Deluxe", new BigDecimal("95.00"), 5, true);
        Producto p2 = crearProducto("Orquídea Clásica", new BigDecimal("35.00"), 8, true);
        Producto p3 = crearProducto("Orquídea Especial", new BigDecimal("65.00"), 4, true);

        entityManager.persist(p1);
        entityManager.persist(p2);
        entityManager.persist(p3);
        entityManager.flush();

        List<Producto> resultado = productoRepository.buscarPorNombreYPrecioMaximo("Orquídea", new BigDecimal("100.00"));

        assertEquals(3, resultado.size());
        assertEquals(new BigDecimal("35.00"), resultado.get(0).getPrecio());
        assertEquals(new BigDecimal("65.00"), resultado.get(1).getPrecio());
        assertEquals(new BigDecimal("95.00"), resultado.get(2).getPrecio());
    }

    @Test
    @DisplayName("buscarConStockBajo - Debe incluir el límite y ordenar de forma ascendente (más crítico primero)")
    void buscarConStockBajo_IncluyeLimiteYOrdenaCritico() {
        Producto critico = crearProducto("Girasol Crítico", new BigDecimal("25.00"), 1, true);
        Producto moderado = crearProducto("Girasol Moderado", new BigDecimal("25.00"), 3, true);
        Producto enLimite = crearProducto("Girasol En Límite", new BigDecimal("25.00"), 5, true);
        Producto conStock = crearProducto("Girasol Con Stock", new BigDecimal("25.00"), 12, true);

        entityManager.persist(critico);
        entityManager.persist(moderado);
        entityManager.persist(enLimite);
        entityManager.persist(conStock);
        entityManager.flush();

        List<Producto> resultado = productoRepository.buscarConStockBajo(5);

        assertEquals(3, resultado.size());
        assertEquals(1, resultado.get(0).getStock());
        assertEquals(3, resultado.get(1).getStock());
        assertEquals(5, resultado.get(2).getStock());
    }

    @Test
    @DisplayName("buscarConStockBajo - Ante igualdad de stock debe ordenar por nombre alfabéticamente")
    void buscarConStockBajo_MismoStock_OrdenaPorNombreAscendente() {
        Producto pZ = crearProducto("Zinnia Elegante", new BigDecimal("15.00"), 2, true);
        Producto pA = crearProducto("Azucena Silvestre", new BigDecimal("15.00"), 2, true);

        entityManager.persist(pZ);
        entityManager.persist(pA);
        entityManager.flush();

        List<Producto> resultado = productoRepository.buscarConStockBajo(5);

        assertEquals(2, resultado.size());
        assertEquals("Azucena Silvestre", resultado.get(0).getNombre());
        assertEquals("Zinnia Elegante", resultado.get(1).getNombre());
    }
}
