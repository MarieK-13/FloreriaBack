-- SOLO para una base de datos local/de pruebas. No ejecutar en produccion.
-- PostgreSQL. Inicia Spring Boot una vez para que Hibernate cree/actualice las tablas.
-- Se puede ejecutar varias veces: actualiza estas categorias y productos de prueba.

BEGIN;

INSERT INTO categoria (id, nombre, descripcion)
VALUES
    ('80000000-0000-4000-8000-000000000001', 'Ramos', 'Ramos frescos preparados a mano.'),
    ('80000000-0000-4000-8000-000000000002', 'Box florales', 'Arreglos florales en cajas de regalo.'),
    ('80000000-0000-4000-8000-000000000003', 'Plantas', 'Plantas ornamentales para regalar o decorar.')
ON CONFLICT (nombre) DO UPDATE
SET descripcion = EXCLUDED.descripcion;

INSERT INTO producto (
    id,
    nombre,
    descripcion,
    precio,
    stock,
    disponible,
    color,
    tamano,
    imagen_url,
    categoria_id,
    fecha_validez,
    fecha_creacion
)
SELECT
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock,
    p.stock > 0,
    p.color,
    p.tamano,
    p.imagen_url,
    c.id,
    p.fecha_validez,
    CURRENT_TIMESTAMP
FROM (
    VALUES
        (
            '81000000-0000-4000-8000-000000000001'::uuid,
            'Ramo de rosas rojas',
            'Rosas rojas con follaje y tarjeta dedicatoria.',
            85.00::numeric(10, 2),
            12,
            'Rojo',
            'Mediano',
            '/images/ramo-rosas.svg',
            'Ramos',
            NULL::date
        ),
        (
            '81000000-0000-4000-8000-000000000002'::uuid,
            'Ramo de girasoles',
            'Girasoles frescos para iluminar cualquier ocasion.',
            72.50::numeric(10, 2),
            8,
            'Amarillo',
            'Grande',
            '/images/ramo-girasoles.svg',
            'Ramos',
            NULL::date
        ),
        (
            '81000000-0000-4000-8000-000000000003'::uuid,
            'Box floral pastel',
            'Arreglo de flores en tonos suaves dentro de una caja.',
            125.00::numeric(10, 2),
            5,
            'Pastel',
            'Mediano',
            '/images/ramo-rosas.svg',
            'Box florales',
            NULL::date
        ),
        (
            '81000000-0000-4000-8000-000000000004'::uuid,
            'Mini orquidea',
            'Orquidea ornamental en maceta decorativa.',
            95.00::numeric(10, 2),
            4,
            'Morado',
            'Pequeno',
            NULL,
            'Plantas',
            NULL::date
        ),
        (
            '81000000-0000-4000-8000-000000000005'::uuid,
            'Ramo de tulipanes rosados',
            'Tulipanes rosados envueltos con papel decorativo.',
            68.00::numeric(10, 2),
            0,
            'Rosado',
            'Mediano',
            '/images/ramo-rosas.svg',
            'Ramos',
            NULL::date
        )
) AS p(id, nombre, descripcion, precio, stock, color, tamano, imagen_url, categoria_nombre, fecha_validez)
JOIN categoria c ON c.nombre = p.categoria_nombre
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    stock = EXCLUDED.stock,
    disponible = EXCLUDED.disponible,
    color = EXCLUDED.color,
    tamano = EXCLUDED.tamano,
    imagen_url = EXCLUDED.imagen_url,
    categoria_id = EXCLUDED.categoria_id,
    fecha_validez = EXCLUDED.fecha_validez;

DELETE FROM producto_ocasiones
WHERE producto_id IN (
    '81000000-0000-4000-8000-000000000001',
    '81000000-0000-4000-8000-000000000002',
    '81000000-0000-4000-8000-000000000003',
    '81000000-0000-4000-8000-000000000004',
    '81000000-0000-4000-8000-000000000005'
);

INSERT INTO producto_ocasiones (producto_id, ocasion)
VALUES
    ('81000000-0000-4000-8000-000000000001', 'Aniversario'),
    ('81000000-0000-4000-8000-000000000001', 'Cumpleanos'),
    ('81000000-0000-4000-8000-000000000002', 'Agradecimiento'),
    ('81000000-0000-4000-8000-000000000003', 'Aniversario'),
    ('81000000-0000-4000-8000-000000000004', 'Cumpleanos'),
    ('81000000-0000-4000-8000-000000000005', 'Amistad');

DELETE FROM producto_componentes
WHERE producto_id IN (
    '81000000-0000-4000-8000-000000000001',
    '81000000-0000-4000-8000-000000000002',
    '81000000-0000-4000-8000-000000000003',
    '81000000-0000-4000-8000-000000000004',
    '81000000-0000-4000-8000-000000000005'
);

INSERT INTO producto_componentes (producto_id, orden, cantidad, descripcion)
VALUES
    ('81000000-0000-4000-8000-000000000001', 0, 12, 'Rosas rojas'),
    ('81000000-0000-4000-8000-000000000001', 1, 3, 'Ramas de follaje'),
    ('81000000-0000-4000-8000-000000000002', 0, 8, 'Girasoles'),
    ('81000000-0000-4000-8000-000000000002', 1, 2, 'Ramas de follaje'),
    ('81000000-0000-4000-8000-000000000003', 0, 10, 'Flores de temporada'),
    ('81000000-0000-4000-8000-000000000003', 1, 1, 'Caja decorativa'),
    ('81000000-0000-4000-8000-000000000004', 0, 1, 'Orquidea'),
    ('81000000-0000-4000-8000-000000000005', 0, 10, 'Tulipanes rosados');

INSERT INTO detalle_producto (
    id,
    producto_id,
    cuidados,
    duracion_dias,
    materiales,
    ocasion,
    instrucciones_entrega
)
VALUES
    (
        '82000000-0000-4000-8000-000000000001',
        '81000000-0000-4000-8000-000000000001',
        'Cambia el agua cada dos dias y corta los tallos en diagonal.',
        7,
        'Rosas, follaje y papel decorativo',
        'Aniversarios y cumpleanos',
        'Mantener el ramo en posicion vertical.'
    ),
    (
        '82000000-0000-4000-8000-000000000002',
        '81000000-0000-4000-8000-000000000002',
        'Colocar en agua limpia y lejos del sol directo.',
        8,
        'Girasoles, follaje y papel decorativo',
        'Agradecimientos y celebraciones',
        'Evitar aplastar los petalos.'
    ),
    (
        '82000000-0000-4000-8000-000000000003',
        '81000000-0000-4000-8000-000000000003',
        'Rociar ligeramente las flores y mantener la caja en un lugar fresco.',
        5,
        'Flores de temporada y caja decorativa',
        'Aniversarios y regalos especiales',
        'Transportar la caja sobre una superficie plana.'
    ),
    (
        '82000000-0000-4000-8000-000000000004',
        '81000000-0000-4000-8000-000000000004',
        'Regar moderadamente y ubicar con luz indirecta.',
        30,
        'Orquidea y maceta decorativa',
        'Cumpleanos y agradecimientos',
        'Mantener la maceta vertical.'
    ),
    (
        '82000000-0000-4000-8000-000000000005',
        '81000000-0000-4000-8000-000000000005',
        'Cambia el agua cada dos dias y recorta los tallos.',
        7,
        'Tulipanes y papel decorativo',
        'Amistad y celebraciones',
        'Mantener el ramo en posicion vertical.'
    )
ON CONFLICT (producto_id) DO UPDATE
SET cuidados = EXCLUDED.cuidados,
    duracion_dias = EXCLUDED.duracion_dias,
    materiales = EXCLUDED.materiales,
    ocasion = EXCLUDED.ocasion,
    instrucciones_entrega = EXCLUDED.instrucciones_entrega;

SELECT p.id, p.nombre, p.precio, p.stock, p.disponible, c.nombre AS categoria
FROM producto p
JOIN categoria c ON c.id = p.categoria_id
WHERE p.id IN (
    '81000000-0000-4000-8000-000000000001',
    '81000000-0000-4000-8000-000000000002',
    '81000000-0000-4000-8000-000000000003',
    '81000000-0000-4000-8000-000000000004',
    '81000000-0000-4000-8000-000000000005'
)
ORDER BY p.nombre;

COMMIT;
