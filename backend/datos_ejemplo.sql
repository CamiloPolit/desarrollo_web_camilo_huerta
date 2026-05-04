-- datos_ejemplo.sql — Datos de demostración equivalentes a los mockups del frontend.
-- Ejecutar DESPUÉS de schema.sql y region-comuna.sql.
-- Uso: mysql -u cc5002 -p tarea2 < datos_ejemplo.sql

USE `tarea2`;

-- ── Miembros ──────────────────────────────────────────────────

INSERT INTO `miembro` (
  `nombre`, `rut`, `tipo`, `email`, `telefono`, `fecha_registro`, `comuna_id`,
  `plan_estudio`, `anio_ingreso`,
  `programa`, `profesor_guia`,
  `cargo`, `unidad`, `tipo_contrato`,
  `jerarquia`, `area_investigacion`, `oficina`
) VALUES

-- 1. Ana González Pérez — pregrado
(
  'Ana González Pérez', '12345678-5', 'pregrado',
  'ana.gonzalez@dcc.uchile.cl', '+56912345678',
  '2024-03-01 10:00:00', 130208,
  'ing-civil-computacion', 2021,
  NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL
),

-- 2. Carlos Vega Soto — postgrado
(
  'Carlos Vega Soto', '14567890-0', 'postgrado',
  'carlos.vega@uchile.cl', '',
  '2024-03-02 11:00:00', 130207,
  NULL, 2022,
  'doctorado', 'Dra. María López',
  NULL, NULL, NULL,
  NULL, NULL, NULL
),

-- 3. Lucía Fuentes Mora — académico
(
  'Lucía Fuentes Mora', '16789012-1', 'academico',
  'lucia.fuentes@dcc.uchile.cl', '+56222345678',
  '2024-03-03 09:30:00', 130204,
  NULL, NULL,
  NULL, NULL,
  NULL, NULL, NULL,
  'asociado', 'Inteligencia Artificial', '312'
),

-- 4. Pedro Rojas Díaz — funcionario
(
  'Pedro Rojas Díaz', '10234567-3', 'funcionario',
  'pedro.rojas@uchile.cl', '+56933456789',
  '2024-03-04 14:00:00', 130210,
  NULL, NULL,
  NULL, NULL,
  'Técnico en Soporte', 'Dirección de Computación', 'contrata',
  NULL, NULL, NULL
),

-- 5. Sofía Martínez Lagos — pregrado
(
  'Sofía Martínez Lagos', '18901234-9', 'pregrado',
  'sofia.martinez@ing.uchile.cl', '+56945678901',
  '2024-03-05 16:00:00', 130212,
  'ing-civil-computacion', 2022,
  NULL, NULL,
  NULL, NULL, NULL,
  NULL, NULL, NULL
),

-- 6. Tomás Herrera Núñez — postgrado
(
  'Tomás Herrera Núñez', '11345678-7', 'postgrado',
  'tomas.herrera@uchile.cl', '',
  '2024-03-06 08:00:00', 130214,
  NULL, 2023,
  'magister', '',
  NULL, NULL, NULL,
  NULL, NULL, NULL
);

-- ── Actividades ───────────────────────────────────────────────

INSERT INTO `actividad` (
  `miembro_id`, `titulo`, `categoria`, `descripcion`, `lugar`, `enlace`, `fecha_registro`
) VALUES

-- act1 — Ana (id 1)
(
  1, 'Taller de fotografía urbana', 'artistica',
  'Exploración fotográfica por el centro de Santiago los fines de semana.',
  'Centro de Santiago',
  'https://www.instagram.com/fotografia_urbana',
  '2024-03-15 10:00:00'
),

-- act2 — Carlos (id 2)
(
  2, 'Natación competitiva', 'deportiva',
  'Entrenamiento de natación en el estadio universitario.',
  'Estadio Universitario',
  'https://deportes.uchile.cl/natacion',
  '2024-03-17 10:00:00'
),

-- act3 — Lucía (id 3)
(
  3, 'Club de robótica', 'tecnologica',
  'Desarrollo de robots autónomos para competencias nacionales e internacionales.',
  'Laboratorio DCC',
  'https://www.robotica.uchile.cl',
  '2024-03-18 10:00:00'
),

-- act4 — Pedro (id 4)
(
  4, 'Voluntariado en biblioteca', 'social',
  'Apoyo en la biblioteca del barrio para adultos mayores que aprenden a usar computadores.',
  'Biblioteca Barrio Yungay',
  'https://www.bibliotecasyungay.cl',
  '2024-03-19 10:00:00'
),

-- act5 — Sofía (id 5)
(
  5, 'Grupo de senderismo', 'deportiva',
  'Salidas de trekking por los cerros de la Región Metropolitana.',
  'Cerros RM',
  'https://www.instagram.com/senderismo_dcc',
  '2024-03-20 10:00:00'
),

-- act6 — Tomás (id 6)
(
  6, 'Jams de improvisación teatral', 'artistica',
  'Sesiones semanales de impro con el grupo Teatro Espontáneo UChile.',
  'Casa del Deporte',
  'https://www.teatroespontaneo.uchile.cl',
  '2024-03-21 10:00:00'
);

-- ── Horarios ──────────────────────────────────────────────────

INSERT INTO `horario` (`actividad_id`, `dia`, `hora_inicio`, `hora_fin`) VALUES

-- act1: Sábado 10:00–13:00
(1, 'Sábado',    '10:00', '13:00'),

-- act2: Lunes y Miércoles 07:00–08:30
(2, 'Lunes',     '07:00', '08:30'),
(2, 'Miércoles', '07:00', '08:30'),

-- act3: Viernes 15:00–18:00
(3, 'Viernes',   '15:00', '18:00'),

-- act4: Sábado 14:00–17:00
(4, 'Sábado',    '14:00', '17:00'),

-- act5: Domingo 08:00–16:00
(5, 'Domingo',   '08:00', '16:00'),

-- act6: Jueves 19:00–21:00
(6, 'Jueves',    '19:00', '21:00');
