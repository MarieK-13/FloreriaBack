package com.sistema.FloreriaBack.repository;

import com.sistema.FloreriaBack.model.Cotizacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;


public interface CotizacionRepository extends JpaRepository<Cotizacion, UUID>  {
 // Si más adelante necesitas buscar cotizaciones por algún filtro específico,
    // aquí añadirás los métodos correspondientes.
}
