package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.response.CotizacionResponseDTO;
import com.sistema.FloreriaBack.mapper.CotizacionMapper;
import com.sistema.FloreriaBack.model.Cotizacion;
import com.sistema.FloreriaBack.model.ItemCotizacion;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.repository.CotizacionRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.service.CotizacionService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CotizacionServiceImpl implements CotizacionService {

    // 1. Declaramos las dependencias
    private final CotizacionRepository cotizacionRepository;
    private final ProductoRepository productoRepository;
    private final CotizacionMapper mapper;

    // 2. Inyectamos las dependencias en el constructor
    public CotizacionServiceImpl(CotizacionRepository cotizacionRepository, 
                                 ProductoRepository productoRepository, 
                                 CotizacionMapper mapper) {
        this.cotizacionRepository = cotizacionRepository;
        this.productoRepository = productoRepository;
        this.mapper = mapper;
    }

    @Override
    public CotizacionResponseDTO generarCotizacion(String mensajeUsuario) {
        // Instanciamos el objeto principal
        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setFechaCreacion(LocalDateTime.now());

        List<ItemCotizacion> items = new ArrayList<>();
        double totalGeneral = 0.0;

        // Buscamos productos con la variable inyectada en minúscula
        List<Producto> productosDisponibles = productoRepository.findAll();

        for (Producto producto : productosDisponibles) {
            if (mensajeUsuario.toLowerCase().contains(producto.getNombre().toLowerCase())) {

                ItemCotizacion item = new ItemCotizacion();
                item.setProductoNombre(producto.getNombre());
                item.setCantidad(1); // Cantidad base
                item.setPrecioUnitario(producto.getPrecio());
                item.setSubtotal(producto.getPrecio() * item.getCantidad());
                item.setCotizacion(cotizacion);

                items.add(item);
                totalGeneral += item.getSubtotal();
            }
        }

        cotizacion.setItems(items);
        cotizacion.setTotal(totalGeneral);

        // Guardamos con la variable inyectada en minúscula (cotizacionRepository)
        Cotizacion guardada = cotizacionRepository.save(cotizacion);

        return mapper.toResponseDTO(guardada);
    }
}