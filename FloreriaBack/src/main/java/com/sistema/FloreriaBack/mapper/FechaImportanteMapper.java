package com.sistema.FloreriaBack.mapper;

import org.springframework.stereotype.Component;

import com.sistema.FloreriaBack.dto.request.FechaImportanteRequestDTO;
import com.sistema.FloreriaBack.dto.response.FechaImportanteResponseDTO;
import com.sistema.FloreriaBack.model.FechaImportante;
import com.sistema.FloreriaBack.model.Usuario;

@Component
public class FechaImportanteMapper {

    public FechaImportante toEntity(FechaImportanteRequestDTO request, Usuario usuario) {
        if (request == null) {
            return null;
        }

        return FechaImportante.builder()
                .ocasion(request.getOcasion().trim())
                .persona(request.getPersona().trim())
                .fecha(request.getFecha())
                .diasAnticipacion(request.getDiasAnticipacion() != null ? request.getDiasAnticipacion() : 7)
                .usuario(usuario)
                .build();
    }

    public FechaImportanteResponseDTO toResponseDTO(FechaImportante entity) {
        if (entity == null) {
            return null;
        }

        return FechaImportanteResponseDTO.builder()
                .id(entity.getId())
                .ocasion(entity.getOcasion())
                .persona(entity.getPersona())
                .fecha(entity.getFecha())
                .diasAnticipacion(entity.getDiasAnticipacion())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }

    public void updateEntityFromRequest(FechaImportante entity, FechaImportanteRequestDTO request) {
        if (entity == null || request == null) {
            return;
        }

        entity.setOcasion(request.getOcasion().trim());
        entity.setPersona(request.getPersona().trim());
        entity.setFecha(request.getFecha());
        if (request.getDiasAnticipacion() != null) {
            entity.setDiasAnticipacion(request.getDiasAnticipacion());
        }
    }
}