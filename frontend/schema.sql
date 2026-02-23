-- Esquema inicial para PostgreSQL
-- Habilitar extensión para UUIDs si es necesario (PostgreSQL < 13)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla de Usuarios (Personal Municipal y Administradores)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Almacenar hash (bcrypt/argon2), NO texto plano
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(20),
    area VARCHAR(100),
    cargo VARCHAR(100),
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'MESA_ENTRADAS', 'PERSONAL', 'SUPERVISOR')),
    activo BOOLEAN DEFAULT TRUE,
    debe_cambiar_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Solicitantes (Ciudadanos)
CREATE TABLE solicitantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dni VARCHAR(20) UNIQUE NOT NULL,
    nombre_apellido VARCHAR(200) NOT NULL,
    domicilio VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Atenciones (Tickets/Casos)
CREATE TABLE atenciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_atencion VARCHAR(20) UNIQUE NOT NULL, -- Formato: YYYY-XXXX (ej: 2024-0001)
    
    -- Relaciones
    solicitante_id UUID NOT NULL REFERENCES solicitantes(id) ON DELETE RESTRICT,
    creada_por UUID NOT NULL REFERENCES users(id),
    asignada_a UUID REFERENCES users(id), -- Puede ser NULL si aún no se asignó
    
    -- Datos del Trámite
    motivo VARCHAR(255) NOT NULL,
    tipo_tramite VARCHAR(100) NOT NULL,
    descripcion TEXT,
    
    -- Estado y Origen
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ASIGNADO', 'EN_ATENCION', 'ATENDIDO')),
    origen VARCHAR(20) NOT NULL DEFAULT 'MESA_ENTRADAS' CHECK (origen IN ('MESA_ENTRADAS', 'PERSONAL')),
    
    -- Resolución
    atencion_dispensada TEXT, -- Texto de la resolución final
    
    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    fecha_inicio_atencion TIMESTAMP WITH TIME ZONE,
    fecha_atencion_dispensada TIMESTAMP WITH TIME ZONE, -- Fecha de cierre/resolución
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance de búsquedas
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_solicitantes_dni ON solicitantes(dni);
CREATE INDEX idx_solicitantes_nombre ON solicitantes(nombre_apellido);
CREATE INDEX idx_atenciones_numero ON atenciones(numero_atencion);
CREATE INDEX idx_atenciones_estado ON atenciones(estado);
CREATE INDEX idx_atenciones_solicitante ON atenciones(solicitante_id);
CREATE INDEX idx_atenciones_asignada ON atenciones(asignada_a);

-- Trigger para actualizar updated_at automáticamente (Opcional, pero recomendado)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_solicitantes_modtime BEFORE UPDATE ON solicitantes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_atenciones_modtime BEFORE UPDATE ON atenciones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Datos Semilla (Seed Data) - Ejemplo
-- Password '123' hasheada con bcrypt (ejemplo)
INSERT INTO users (username, password_hash, nombre, apellido, rol, area, cargo) VALUES 
('admin', '$2a$12$K/..hash_de_ejemplo..', 'Admin', 'Sistema', 'ADMIN', 'Sistemas', 'Administrador');
