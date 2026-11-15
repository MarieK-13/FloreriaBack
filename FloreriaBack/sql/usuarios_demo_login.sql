-- SOLO para una base de datos local/de pruebas. No ejecutar en produccion.
-- PostgreSQL. Reejecutar este archivo actualiza las dos cuentas de prueba y sus claves.
--
-- Login de cliente:
-- POST http://localhost:8080/api/auth/login
--
-- Login de administrador:
-- POST http://localhost:8080/api/auth/login
--
-- La API responde con token y rol (CLIENTE o ADMINISTRADOR). El frontend envia al
-- administrador a /dashboard, pero esa ruta/panel aun no existe; la ruta comodin lo
-- redirige a Inicio hasta que el Dashboard se incorpore.

BEGIN;

INSERT INTO usuarios (
    id,
    nombre,
    apellidos,
    telefono,
    distrito,
    direccion,
    email,
    contrasena,
    rol,
    activo,
    terminos_aceptados_en
)
VALUES
    (
        'b2cf065d-b9a8-47d8-824d-ae527e1e5164',
        'Cliente',
        'Demo',
        '+51987654321',
        'Ica',
        'Direccion de prueba',
        'cliente.demo@example.com',
        '$2a$10$4YZSECg3rB890VAzJtkxNesEuDpHGjulz8Bji17Bhq6js7YgpESd.',
        'CLIENTE',
        TRUE,
        CURRENT_TIMESTAMP
    ),
    (
        'ea2ce862-39aa-48f2-a4a0-5012c4ef6913',
        'Administrador',
        'Demo',
        '+51987654322',
        'Ica',
        'Direccion de prueba',
        'admin.demo@example.com',
        '$2a$10$TuJCe9lvaV6znJ.e6nRAyet.ckpFomhM0pwV583RV0jIOn9saYlQ2',
        'ADMINISTRADOR',
        TRUE,
        CURRENT_TIMESTAMP
    )
ON CONFLICT (email) DO UPDATE
SET nombre = EXCLUDED.nombre,
    apellidos = EXCLUDED.apellidos,
    telefono = EXCLUDED.telefono,
    distrito = EXCLUDED.distrito,
    direccion = EXCLUDED.direccion,
    contrasena = EXCLUDED.contrasena,
    rol = EXCLUDED.rol,
    activo = EXCLUDED.activo,
    terminos_aceptados_en = EXCLUDED.terminos_aceptados_en;

COMMIT;
