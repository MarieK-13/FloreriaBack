package com.sistema.FloreriaBack.service.impl;

import com.sistema.FloreriaBack.dto.response.ProductoResponseDTO;
import com.sistema.FloreriaBack.mapper.ProductoMapper;
import com.sistema.FloreriaBack.model.Favorito;
import com.sistema.FloreriaBack.model.Producto;
import com.sistema.FloreriaBack.model.Usuario;
import com.sistema.FloreriaBack.repository.FavoritoRepository;
import com.sistema.FloreriaBack.repository.ProductoRepository;
import com.sistema.FloreriaBack.repository.UsuarioRepository;
import com.sistema.FloreriaBack.service.FavoritoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FavoritoServiceImpl implements FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final ProductoMapper productoMapper;

    private Usuario obtenerUsuarioPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarMisFavoritos(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        return favoritoRepository.findAllByUsuarioIdWithProducto(usuario.getId())
                .stream()
                .map(favorito -> productoMapper.toResponseDTO(favorito.getProducto()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UUID> listarIdsFavoritos(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        return favoritoRepository.findProductoIdsByUsuarioId(usuario.getId());
    }

    @Override
    @Transactional
    public List<UUID> toggleFavorito(String email, UUID productoId) {
        Usuario usuario = obtenerUsuarioPorEmail(email);

        Optional<Favorito> existente = favoritoRepository.findByUsuarioIdAndProductoId(usuario.getId(), productoId);

        if (existente.isPresent()) {
            favoritoRepository.delete(existente.get());
        } else {
            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

            Favorito nuevo = Favorito.builder()
                    .usuario(usuario)
                    .producto(producto)
                    .build();
            favoritoRepository.save(nuevo);
        }

        return favoritoRepository.findProductoIdsByUsuarioId(usuario.getId());
    }

    @Override
    @Transactional
    public List<UUID> sincronizarFavoritos(String email, List<UUID> productoIds) {
        Usuario usuario = obtenerUsuarioPorEmail(email);

        for (UUID productoId : productoIds) {
            if (favoritoRepository.findByUsuarioIdAndProductoId(usuario.getId(), productoId).isEmpty()) {
                productoRepository.findById(productoId).ifPresent(producto -> {
                    favoritoRepository.save(Favorito.builder()
                            .usuario(usuario)
                            .producto(producto)
                            .build());
                });
            }
        }

        return favoritoRepository.findProductoIdsByUsuarioId(usuario.getId());
    }

    @Override
    @Transactional
    public void vaciarFavoritos(String email) {
        Usuario usuario = obtenerUsuarioPorEmail(email);
        favoritoRepository.deleteAllByUsuarioId(usuario.getId());
    }
}