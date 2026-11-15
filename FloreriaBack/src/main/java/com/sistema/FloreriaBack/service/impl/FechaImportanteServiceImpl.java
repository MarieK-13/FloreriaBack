package com.sistema.FloreriaBack.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sistema.FloreriaBack.dto.request.FechaImportanteRequestDTO;
import com.sistema.FloreriaBack.dto.response.FechaImportanteResponseDTO;
import com.sistema.FloreriaBack.mapper.FechaImportanteMapper;
import com.sistema.FloreriaBack.model.FechaImportante;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.repository.FechaImportanteRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.FechaImportanteService;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FechaImportanteServiceImpl implements FechaImportanteService {

    private final FechaImportanteRepository fechaImportanteRepository;
    private final UsuarioRepository usuarioRepository;
    private final FechaImportanteMapper fechaImportanteMapper;

    @Override
    @Transactional(readOnly = true)
    public List<FechaImportanteResponseDTO> listarMisFechas() {
        Usuario usuario = obtenerUsuarioAutenticado();
        return fechaImportanteRepository.findByUsuarioIdOrderByFechaAsc(usuario.getId())
                .stream()
                .map(fechaImportanteMapper::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public FechaImportanteResponseDTO crearFecha(FechaImportanteRequestDTO request) {
        Usuario usuario = obtenerUsuarioAutenticado();
        FechaImportante nuevaFecha = fechaImportanteMapper.toEntity(request, usuario);
        FechaImportante guardada = fechaImportanteRepository.save(nuevaFecha);
        return fechaImportanteMapper.toResponseDTO(guardada);
    }

    @Override
    @Transactional
    public FechaImportanteResponseDTO actualizarFecha(UUID id, FechaImportanteRequestDTO request) {
        Usuario usuario = obtenerUsuarioAutenticado();
        FechaImportante fechaExistente = fechaImportanteRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new EntityNotFoundException("Fecha importante no encontrada o no pertenece al usuario"));

        fechaImportanteMapper.updateEntityFromRequest(fechaExistente, request);
        FechaImportante actualizada = fechaImportanteRepository.save(fechaExistente);
        return fechaImportanteMapper.toResponseDTO(actualizada);
    }

    @Override
    @Transactional
    public FechaImportanteResponseDTO actualizarDiasAnticipacion(UUID id, Integer diasAnticipacion) {
        Usuario usuario = obtenerUsuarioAutenticado();
        FechaImportante fechaExistente = fechaImportanteRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new EntityNotFoundException("Fecha importante no encontrada o no pertenece al usuario"));

        int diasValidos = (diasAnticipacion != null && List.of(1, 3, 7).contains(diasAnticipacion))
                ? diasAnticipacion
                : 7;

        fechaExistente.setDiasAnticipacion(diasValidos);
        FechaImportante actualizada = fechaImportanteRepository.save(fechaExistente);
        return fechaImportanteMapper.toResponseDTO(actualizada);
    }

    @Override
    @Transactional
    public void eliminarFecha(UUID id) {
        Usuario usuario = obtenerUsuarioAutenticado();
        FechaImportante fechaExistente = fechaImportanteRepository.findByIdAndUsuarioId(id, usuario.getId())
                .orElseThrow(() -> new EntityNotFoundException("Fecha importante no encontrada o no pertenece al usuario"));

        fechaImportanteRepository.delete(fechaExistente);
    }

    private Usuario obtenerUsuarioAutenticado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email) // <-- Ajusta si tu método es findByCorreo o findByUsername
                .orElseThrow(() -> new UsernameNotFoundException("Usuario autenticado no encontrado: " + email));
    }
}