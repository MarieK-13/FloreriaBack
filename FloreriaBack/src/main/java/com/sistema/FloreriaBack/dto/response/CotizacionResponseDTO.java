package com.sistema.FloreriaBack.dto.response;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
public class CotizacionResponseDTO {
    
private UUID id;
    private LocalDateTime fechaCreacion;
    private Double total;
    private List<ItemCotizacionResponseDTO> items;

    // Getters y Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
    public List<ItemCotizacionResponseDTO> getItems() { return items; }
    public void setItems(List<ItemCotizacionResponseDTO> items) { this.items = items; }

}
