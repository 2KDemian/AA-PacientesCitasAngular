-- Script_BD_PacientesCitaSOAPRest.sql

CREATE DATABASE PacientesCitaSOAPRestDB;
GO
USE PacientesCitaSOAPRestDB;
GO

-- ---------- Tabla Paciente (gestionada por el servicio SOAP) ----------
CREATE TABLE dbo.Paciente (
    IdPaciente  INT IDENTITY(1,1) PRIMARY KEY,
    Cedula      VARCHAR(10)  NOT NULL UNIQUE,
    Nombre      VARCHAR(50)  NOT NULL,
    Apellido    VARCHAR(50)  NOT NULL,
    Telefono    VARCHAR(15)  NULL,
    Estado      BIT          NOT NULL DEFAULT 1
);
GO

-- ---------- Tabla Medico (gestionada por el servicio SOAP) ----------
CREATE TABLE dbo.Medico (
    IdMedico     INT IDENTITY(1,1) PRIMARY KEY,
    Cedula       VARCHAR(10)  NOT NULL UNIQUE,
    Nombre       VARCHAR(50)  NOT NULL,
    Apellido     VARCHAR(50)  NOT NULL,
    Cargo        VARCHAR(50)  NULL,
    Especialidad VARCHAR(50)  NULL
);
GO

-- ---------- Tabla Cita (gestionada por el servicio REST) ----------
CREATE TABLE dbo.Cita (
    IdCita       INT IDENTITY(1,1) PRIMARY KEY,
    Fecha        DATE          NOT NULL,
    Hora         DATETIME      NOT NULL,
    Motivo       VARCHAR(200)  NOT NULL,
    Tratamiento  VARCHAR(200)  NULL,
    Estado       BIT           NOT NULL DEFAULT 1,
    IdPaciente   INT           NOT NULL,
    IdMedico     INT           NOT NULL,

    CONSTRAINT FK_Cita_Paciente FOREIGN KEY (IdPaciente)
        REFERENCES dbo.Paciente(IdPaciente),
    CONSTRAINT FK_Cita_Medico FOREIGN KEY (IdMedico)
        REFERENCES dbo.Medico(IdMedico)
);
GO

-- ---------- Datos de prueba ----------
INSERT INTO dbo.Paciente (Cedula, Nombre, Apellido, Telefono, Estado)
VALUES
    ('1712345678', 'Mateo',  'Salazar',    '0991234567', 1),
    ('1798765432', 'Andrea', 'Chicaiza',   '0987654321', 1),
    ('1723456789', 'Carlos', 'Vintimilla', '0976543210', 1);
GO

INSERT INTO dbo.Medico (Cedula, Nombre, Apellido, Cargo, Especialidad)
VALUES
    ('1701112223', 'Lucia',   'Ramirez',  'Medico Tratante', 'Medicina Interna'),
    ('1702223334', 'Roberto', 'Andrade',  'Medico Tratante', 'Pediatria'),
    ('1703334445', 'Paola',   'Chiluisa', 'Medico Tratante', 'Odontologia');
GO

INSERT INTO dbo.Cita (Fecha, Hora, Motivo, Tratamiento, Estado, IdPaciente, IdMedico)
VALUES
    ('20260910', '20260910 09:00:00', 'Control general',    'Ninguno',        1, 1, 1),
    ('20260911', '20260911 10:30:00', 'Dolor de espalda',   'Fisioterapia',   1, 2, 1),
    ('20260912', '20260912 15:00:00', 'Chequeo dental',     'Limpieza dental',1, 3, 3);
GO

-- ---------- Verificación rápida ----------
SELECT * FROM dbo.Paciente;
SELECT * FROM dbo.Medico;
SELECT * FROM dbo.Cita;
GO
