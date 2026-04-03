-- =============================================================
-- mIAPlatform — PostgreSQL setup
-- Ejecutar como usuario master en 192.168.100.254
--
-- Uso:
--   psql -h 192.168.100.254 -U master -f scripts/db_setup.sql
-- =============================================================

-- 1. Crear base de datos (conectado a postgres por defecto)
CREATE DATABASE miaplatform
    ENCODING 'UTF8'
    LC_COLLATE 'en_US.UTF-8'
    LC_CTYPE 'en_US.UTF-8'
    TEMPLATE template0;

-- 2. Conectar a la base de datos recién creada
\connect miaplatform

-- 3. Usuario de aplicación
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'miaplatform') THEN
        CREATE ROLE miaplatform WITH LOGIN PASSWORD 'changeme';
        RAISE NOTICE 'Role miaplatform creado';
    ELSE
        RAISE NOTICE 'Role miaplatform ya existe';
    END IF;
END
$$;

-- 4. Schema de aplicación
CREATE SCHEMA IF NOT EXISTS mia AUTHORIZATION miaplatform;

-- 5. Permisos para el usuario de aplicación
GRANT CONNECT ON DATABASE miaplatform TO miaplatform;
GRANT CREATE, USAGE ON SCHEMA mia TO miaplatform;
ALTER ROLE miaplatform SET search_path TO mia, public;
ALTER DEFAULT PRIVILEGES IN SCHEMA mia GRANT ALL ON TABLES TO miaplatform;
ALTER DEFAULT PRIVILEGES IN SCHEMA mia GRANT ALL ON SEQUENCES TO miaplatform;

\echo ''
\echo '=== Setup completado ==='
\echo 'Ahora ejecuta: alembic upgrade head'
