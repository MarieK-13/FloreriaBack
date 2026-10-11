package com.sistema.FloreriaBack.model.enums;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

public enum EstadoPedido {
    PENDIENTE,
    PAGADO,
    EN_PREPARACION,
    EN_CAMINO,
    ENTREGADO,
    CANCELADO;

    private static final Map<EstadoPedido, Set<EstadoPedido>> TRANSICIONES_VALIDAS = Map.of(
        PENDIENTE, EnumSet.of(PAGADO, CANCELADO),
        PAGADO, EnumSet.of(EN_PREPARACION, CANCELADO),
        EN_PREPARACION, EnumSet.of(EN_CAMINO, CANCELADO),
        EN_CAMINO, EnumSet.of(ENTREGADO),
        ENTREGADO, EnumSet.noneOf(EstadoPedido.class),
        CANCELADO, EnumSet.noneOf(EstadoPedido.class)
    );

    public boolean puedePasarA(EstadoPedido destino) {
        return TRANSICIONES_VALIDAS.getOrDefault(this, EnumSet.noneOf(EstadoPedido.class)).contains(destino);
    }
}