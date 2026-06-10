-- datos_ejemplo.sql — Datos de demostración para Tarea 3.
-- Ejecutar DESPUÉS de schema.sql, region-comuna.sql y tabla-comentario.sql.
-- Uso: mysql -u cc5002 -pprogramacionweb tarea2 < backend/datos_ejemplo.sql
--
-- Diseñado para que los 3 gráficos de métricas muestren variedad:
--
--   Gráfico de líneas (miembros por día):
--     2026-03-01 → 2   2026-03-05 → 2   2026-03-10 → 3
--     2026-03-03 → 1   2026-03-07 → 2
--
--   Gráfico de barras (actividades por comuna):
--     Santiago     → 5   Ñuñoa        → 3
--     Providencia  → 3   Las Condes   → 2   Macul → 1
--
--   Gráfico de torta (actividades por categoría):
--     social:4  artística:3  tecnológica:2  deportiva:2  recreativa:2  otra:1

USE `tarea2`;

-- ── Purga de datos (orden de FK) ──────────────────────────────
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `foto`;
TRUNCATE TABLE `horario`;
TRUNCATE TABLE `comentario`;
TRUNCATE TABLE `actividad`;
TRUNCATE TABLE `miembro`;
SET FOREIGN_KEY_CHECKS = 1;

-- ── Miembros (10) ─────────────────────────────────────────────

INSERT INTO `miembro` (
  `nombre`, `rut`, `tipo`, `email`, `telefono`, `fecha_registro`, `comuna_id`,
  `plan_estudio`, `anio_ingreso`,
  `programa`, `profesor_guia`,
  `cargo`, `unidad`, `tipo_contrato`,
  `jerarquia`, `area_investigacion`, `oficina`
) VALUES

-- 1. Ana González — pregrado — Santiago (130208) — 2026-03-01
(
  'Ana González Pérez', '12345678-5', 'pregrado',
  'ana.gonzalez@dcc.uchile.cl', '+56912345678',
  '2026-03-01 09:00:00', 130208,
  'ing-civil-computacion', 2021,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
),

-- 2. Carlos Vega — postgrado — Santiago (130208) — 2026-03-01
(
  'Carlos Vega Soto', '14567890-0', 'postgrado',
  'carlos.vega@uchile.cl', '',
  '2026-03-01 15:00:00', 130208,
  NULL, 2022, 'Doctorado en Ciencias de la Computación', 'Dra. María López',
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- 3. Lucía Fuentes — académico — Providencia (130204) — 2026-03-03
(
  'Lucía Fuentes Mora', '16789012-1', 'academico',
  'lucia.fuentes@dcc.uchile.cl', '+56222345678',
  '2026-03-03 10:00:00', 130204,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  'asociado', 'Inteligencia Artificial', '312'
),

-- 4. Pedro Rojas — funcionario — Ñuñoa (130210) — 2026-03-05
(
  'Pedro Rojas Díaz', '10234567-3', 'funcionario',
  'pedro.rojas@uchile.cl', '+56933456789',
  '2026-03-05 08:00:00', 130210,
  NULL, NULL, NULL, NULL,
  'Técnico en Soporte', 'Dirección de Computación', 'contrata',
  NULL, NULL, NULL
),

-- 5. Sofía Martínez — pregrado — Las Condes (130212) — 2026-03-05
(
  'Sofía Martínez Lagos', '18901234-9', 'pregrado',
  'sofia.martinez@ing.uchile.cl', '+56945678901',
  '2026-03-05 11:30:00', 130212,
  'ing-civil-computacion', 2022,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
),

-- 6. Tomás Herrera — postgrado — Macul (130207) — 2026-03-07
(
  'Tomás Herrera Núñez', '11345678-7', 'postgrado',
  'tomas.herrera@uchile.cl', '',
  '2026-03-07 09:00:00', 130207,
  NULL, 2023, 'Magíster en Ciencias de la Computación', '',
  NULL, NULL, NULL, NULL, NULL, NULL
),

-- 7. Valentina Ríos — académico — Ñuñoa (130210) — 2026-03-07
(
  'Valentina Ríos Castillo', '13456789-9', 'academico',
  'valentina.rios@dcc.uchile.cl', '+56222456789',
  '2026-03-07 14:00:00', 130210,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  'titular', 'Sistemas Distribuidos', '215'
),

-- 8. Diego Morales — funcionario — Providencia (130204) — 2026-03-10
(
  'Diego Morales Salas', '15987654-3', 'funcionario',
  'diego.morales@uchile.cl', '+56966543210',
  '2026-03-10 08:30:00', 130204,
  NULL, NULL, NULL, NULL,
  'Coordinador Académico', 'Secretaría de Estudios', 'planta',
  NULL, NULL, NULL
),

-- 9. Camila Pinto — pregrado — Las Condes (130212) — 2026-03-10
(
  'Camila Pinto Vargas', '19345678-2', 'pregrado',
  'camila.pinto@ing.uchile.cl', '+56977889900',
  '2026-03-10 10:00:00', 130212,
  'ing-civil-computacion', 2023,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL
),

-- 10. Felipe Castro — postgrado — Santiago (130208) — 2026-03-10
(
  'Felipe Castro Medina', '20456789-1', 'postgrado',
  'felipe.castro@uchile.cl', '',
  '2026-03-10 16:00:00', 130208,
  NULL, 2022, 'Doctorado en Ingeniería Eléctrica', 'Dr. Roberto Soto',
  NULL, NULL, NULL, NULL, NULL, NULL
);

-- ── Actividades (14) ──────────────────────────────────────────

INSERT INTO `actividad` (
  `miembro_id`, `titulo`, `categoria`, `descripcion`, `lugar`, `enlace`, `fecha_registro`
) VALUES

-- Ana (1) — 2 actividades → Santiago suma 2
(1, 'Taller de fotografía urbana', 'artistica',
 'Exploración fotográfica por el centro de Santiago los fines de semana.',
 'Centro de Santiago', 'https://www.instagram.com/fotografia_dcc',
 '2026-03-15 10:00:00'),

(1, 'Club de robótica estudiantil', 'tecnologica',
 'Desarrollo de robots autónomos para competencias nacionales e internacionales del DCC.',
 'Laboratorio DCC', 'https://www.robotica.uchile.cl',
 '2026-03-20 10:00:00'),

-- Carlos (2) — 1 actividad → Santiago suma 3
(2, 'Natación competitiva', 'deportiva',
 'Entrenamiento de natación en el estadio universitario para los juegos internos.',
 'Estadio Universitario', 'https://deportes.uchile.cl/natacion',
 '2026-03-17 10:00:00'),

-- Lucía (3) — 2 actividades → Providencia suma 2
(3, 'Coro universitario DCC', 'artistica',
 'Ensayos semanales del coro del departamento con presentaciones en eventos institucionales.',
 'Sala de Actos DCC', 'https://www.coro.uchile.cl',
 '2026-03-18 10:00:00'),

(3, 'Mentorías para estudiantes nuevos', 'social',
 'Programa de acompañamiento académico para alumnos de primer año del DCC.',
 'Sala B13 DCC', 'https://www.dcc.uchile.cl/mentorias',
 '2026-03-25 10:00:00'),

-- Pedro (4) — 1 actividad → Ñuñoa suma 1
(4, 'Voluntariado en biblioteca comunitaria', 'social',
 'Apoyo en la biblioteca del barrio Yungay para adultos mayores que aprenden computación.',
 'Biblioteca Barrio Yungay', 'https://www.bibliotecasyungay.cl',
 '2026-03-19 10:00:00'),

-- Sofía (5) — 1 actividad → Las Condes suma 1
(5, 'Grupo de senderismo universitario', 'deportiva',
 'Salidas de trekking mensuales por cerros de la Región Metropolitana.',
 'Cerros RM', 'https://www.instagram.com/senderismo_dcc',
 '2026-03-20 10:00:00'),

-- Tomás (6) — 1 actividad → Macul suma 1
(6, 'Jams de improvisación teatral', 'artistica',
 'Sesiones semanales de impro con el grupo Teatro Espontáneo UChile.',
 'Casa del Deporte', 'https://www.teatroespontaneo.uchile.cl',
 '2026-03-21 10:00:00'),

-- Valentina (7) — 2 actividades → Ñuñoa suma 3
(7, 'Taller de meditación y mindfulness', 'recreativa',
 'Sesiones de meditación guiada para la comunidad universitaria, presencial y online.',
 'Sala Multiuso DCC', 'https://www.bienestar.uchile.cl/mindfulness',
 '2026-03-22 10:00:00'),

(7, 'Huerto comunitario universitario', 'social',
 'Mantención del huerto orgánico del campus con talleres de agricultura urbana.',
 'Campus Beauchef', 'https://www.sustentabilidad.uchile.cl/huerto',
 '2026-04-01 10:00:00'),

-- Diego (8) — 1 actividad → Providencia suma 3
(8, 'Soporte informático vecinal', 'social',
 'Ayuda gratuita a vecinos del barrio con problemas de computadores y celulares.',
 'Junta de Vecinos Providencia', 'https://www.juntas.cl/providencia',
 '2026-04-02 10:00:00'),

-- Camila (9) — 1 actividad → Las Condes suma 2
(9, 'Club de lectura latinoamericana', 'recreativa',
 'Lectura y discusión mensual de libros de autoras latinoamericanas en el DCC.',
 'Sala de Reuniones DCC', 'https://www.lecturas.dcc.uchile.cl',
 '2026-04-03 10:00:00'),

-- Felipe (10) — 2 actividades → Santiago suma 5
(10, 'Desarrollo de videojuegos indie', 'tecnologica',
 'Grupo de desarrollo de videojuegos educativos con Unity, con lanzamiento en itch.io.',
 'Laboratorio 101 DCC', 'https://www.videojuegos.dcc.uchile.cl',
 '2026-04-05 10:00:00'),

(10, 'Podcast universitario de tecnología', 'otra',
 'Producción y conducción del podcast mensual sobre tendencias tecnológicas y vida universitaria.',
 'Estudio de Radio U. de Chile', 'https://www.podcast.uchile.cl/tecnologia',
 '2026-04-10 10:00:00');

-- ── Horarios ──────────────────────────────────────────────────

INSERT INTO `horario` (`actividad_id`, `dia`, `hora_inicio`, `hora_fin`) VALUES
(1,  'Sábado',    '10:00', '13:00'),
(2,  'Viernes',   '15:00', '18:00'),
(3,  'Lunes',     '07:00', '08:30'),
(3,  'Miércoles', '07:00', '08:30'),
(4,  'Martes',    '18:00', '20:00'),
(5,  'Jueves',    '15:00', '17:00'),
(6,  'Sábado',    '10:00', '13:00'),
(7,  'Domingo',   '08:00', '16:00'),
(8,  'Jueves',    '19:00', '21:00'),
(9,  'Miércoles', '13:00', '14:00'),
(10, 'Sábado',    '09:00', '12:00'),
(11, 'Sábado',    '14:00', '17:00'),
(12, 'Viernes',   '17:00', '19:00'),
(13, 'Lunes',     '16:00', '18:00'),
(13, 'Miércoles', '16:00', '18:00'),
(14, 'Martes',    '14:00', '16:00');
