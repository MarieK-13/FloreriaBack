package com.sistema.FloreriaBack.specification;

import com.sistema.FloreriaBack.model.Producto;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ProductoSpecification {

    public static Specification<Producto> conFiltros(
            String nombre,
            UUID categoriaId,
            String ocasion,
            String color,
            String tamano,
            BigDecimal precioMax,
            Boolean soloDisponibles) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Evita duplicados al hacer JOIN con la colección de ocasiones
            if (query != null) {
                query.distinct(true);
            }

            if (nombre != null && !nombre.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("nombre")), "%" + nombre.trim().toLowerCase() + "%"));
            }

            if (categoriaId != null) {
                predicates.add(cb.equal(root.get("categoria").get("id"), categoriaId));
            }

            if (ocasion != null && !ocasion.isBlank()) {
                Join<Producto, String> ocasionesJoin = root.join("ocasiones");
                predicates.add(cb.equal(cb.lower(ocasionesJoin), ocasion.trim().toLowerCase()));
            }

            if (color != null && !color.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("color")), color.trim().toLowerCase()));
            }

            if (tamano != null && !tamano.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("tamano")), tamano.trim().toLowerCase()));
            }

            if (precioMax != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("precio"), precioMax));
            }

            if (Boolean.TRUE.equals(soloDisponibles)) {
                predicates.add(cb.isTrue(root.get("disponible")));
                predicates.add(cb.greaterThan(root.get("stock"), 0));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}