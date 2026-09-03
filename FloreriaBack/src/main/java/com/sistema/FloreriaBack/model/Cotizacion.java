package com.sistema.FloreriaBack.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "cotizaciones")
public class Cotizacion {
  @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private LocalDateTime fechaCreacion;
    private Double total;

    @OneToMany(mappedBy = "cotizacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCotizacion> items; 
    
    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public List<ItemCotizacion> getItems() { return items; }
    public void setItems(List<ItemCotizacion> items) { this.items = items; }








}
