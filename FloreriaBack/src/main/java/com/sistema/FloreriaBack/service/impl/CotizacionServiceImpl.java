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
import java.util.UUID;

@Service
public class CotizacionServiceImpl implements CotizacionService {

    private final CotizacionRepository cotizacionRepository;
    private final ProductoRepository productoRepository;
    private final CotizacionMapper mapper;

    public CotizacionServiceImpl(CotizacionRepository cotizacionRepository, 
                                 ProductoRepository productoRepository, 
                                 CotizacionMapper mapper) {
        this.cotizacionRepository = cotizacionRepository;
        this.productoRepository = productoRepository;
        this.mapper = mapper;
    }

    @Override
    public CotizacionResponseDTO generarCotizacion(String mensajeUsuario) {
        Cotizacion cotizacion = new Cotizacion();
        cotizacion.setFechaCreacion(LocalDateTime.now());

        List<ItemCotizacion> items = new ArrayList<>();
        double totalGeneral = 0.0;

        List<Producto> productosDisponibles = productoRepository.findAll();

        for (Producto producto : productosDisponibles) {
            if (mensajeUsuario.toLowerCase().contains(producto.getNombre().toLowerCase())) {

                ItemCotizacion item = new ItemCotizacion();
                item.setProductoNombre(producto.getNombre());
                item.setCantidad(1); // Cantidad por defecto
                item.setPrecioUnitario(producto.getPrecio());
                item.setSubtotal(producto.getPrecio() * item.getCantidad());
                item.setCotizacion(cotizacion);

                items.add(item);
                totalGeneral += item.getSubtotal();
            }
        }

        cotizacion.setItems(items);
        cotizacion.setTotal(totalGeneral);

        Cotizacion guardada = cotizacionRepository.save(cotizacion);
        return mapper.toResponseDTO(guardada);
    }

    @Override
    public CotizacionResponseDTO obtenerPorId(UUID id) {
        Cotizacion cotizacion = cotizacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cotización no encontrada con ID: " + id));
        return mapper.toResponseDTO(cotizacion);
    }

    @Override
    public List<CotizacionResponseDTO> listarTodas() {
        List<Cotizacion> cotizaciones = cotizacionRepository.findAll();
        return cotizaciones.stream()
                .map(mapper::toResponseDTO)
                .toList();
    }
}