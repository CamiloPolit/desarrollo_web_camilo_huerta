/**
 * store.js — Almacén central de datos en memoria con persistencia en localStorage.
 * Todos los archivos HTML incluyen este script primero con <script src="js/store.js" defer>.
 */

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/* ── Datos de ejemplo (pre-cargados para demostración) ─── */

var DATOS_EJEMPLO = {
  members: [
    { id: 'demo1', nombre: 'Ana González Pérez', rut: '12345678-9', tipo: 'pregrado',
      email: 'ana.gonzalez@dcc.uchile.cl', telefono: '+56912345678',
      planEstudio: 'ing-civil-computacion', anioIngreso: 2021,
      fechaRegistro: '2024-03-01T10:00:00.000Z' },
    { id: 'demo2', nombre: 'Carlos Vega Soto', rut: '14567890-3', tipo: 'postgrado',
      email: 'carlos.vega@uchile.cl', telefono: '',
      programa: 'doctorado', anioIngreso: 2022, profesorGuia: 'Dra. María López',
      fechaRegistro: '2024-03-02T11:00:00.000Z' },
    { id: 'demo3', nombre: 'Lucía Fuentes Mora', rut: '16789012-5', tipo: 'academico',
      email: 'lucia.fuentes@dcc.uchile.cl', telefono: '+56222345678',
      jerarquia: 'asociado', areaInvestigacion: 'Inteligencia Artificial', oficina: '312',
      fechaRegistro: '2024-03-03T09:30:00.000Z' },
    { id: 'demo4', nombre: 'Pedro Rojas Díaz', rut: '10234567-8', tipo: 'funcionario',
      email: 'pedro.rojas@uchile.cl', telefono: '+56933456789',
      cargo: 'Técnico en Soporte', unidad: 'Dirección de Computación', tipoContrato: 'contrata',
      fechaRegistro: '2024-03-04T14:00:00.000Z' },
    { id: 'demo5', nombre: 'Sofía Martínez Lagos', rut: '18901234-6', tipo: 'pregrado',
      email: 'sofia.martinez@ing.uchile.cl', telefono: '+56945678901',
      planEstudio: 'ing-civil-computacion', anioIngreso: 2022,
      fechaRegistro: '2024-03-05T16:00:00.000Z' },
    { id: 'demo6', nombre: 'Tomás Herrera Núñez', rut: '11345678-0', tipo: 'postgrado',
      email: 'tomas.herrera@uchile.cl', telefono: '',
      programa: 'magister', anioIngreso: 2023, profesorGuia: '',
      fechaRegistro: '2024-03-06T08:00:00.000Z' }
  ],
  activities: [
    { id: 'act1', miembroId: 'demo1', titulo: 'Taller de fotografía urbana',
      categoria: 'artistica', descripcion: 'Exploración fotográfica por el centro de Santiago los fines de semana.',
      lugar: 'Centro de Santiago', horarios: [{ dia: 'Sábado', inicio: '10:00', fin: '13:00' }],
      archivos: ['foto1.jpg'], enlace: 'https://www.instagram.com/fotografia_urbana',
      fechaRegistro: '2024-03-15T10:00:00.000Z' },
    { id: 'act2', miembroId: 'demo2', titulo: 'Natación competitiva',
      categoria: 'deportiva', descripcion: 'Entrenamiento de natación en el estadio universitario.',
      lugar: 'Estadio Universitario', horarios: [{ dia: 'Lunes', inicio: '07:00', fin: '08:30' }, { dia: 'Miércoles', inicio: '07:00', fin: '08:30' }],
      archivos: ['natacion.jpg'], enlace: 'https://deportes.uchile.cl/natacion',
      fechaRegistro: '2024-03-17T10:00:00.000Z' },
    { id: 'act3', miembroId: 'demo3', titulo: 'Club de robótica',
      categoria: 'tecnologica', descripcion: 'Desarrollo de robots autónomos para competencias nacionales e internacionales.',
      lugar: 'Laboratorio DCC', horarios: [{ dia: 'Viernes', inicio: '15:00', fin: '18:00' }],
      archivos: ['robot.jpg'], enlace: 'https://www.robotica.uchile.cl',
      fechaRegistro: '2024-03-18T10:00:00.000Z' },
    { id: 'act4', miembroId: 'demo4', titulo: 'Voluntariado en biblioteca',
      categoria: 'social', descripcion: 'Apoyo en la biblioteca del barrio para adultos mayores que aprenden a usar computadores.',
      lugar: 'Biblioteca Barrio Yungay', horarios: [{ dia: 'Sábado', inicio: '14:00', fin: '17:00' }],
      archivos: ['voluntariado.jpg'], enlace: 'https://www.bibliotecasyungay.cl',
      fechaRegistro: '2024-03-19T10:00:00.000Z' },
    { id: 'act5', miembroId: 'demo5', titulo: 'Grupo de senderismo',
      categoria: 'deportiva', descripcion: 'Salidas de trekking por los cerros de la Región Metropolitana.',
      lugar: 'Cerros RM', horarios: [{ dia: 'Domingo', inicio: '08:00', fin: '16:00' }],
      archivos: ['trekking.jpg'], enlace: 'https://www.instagram.com/senderismo_dcc',
      fechaRegistro: '2024-03-20T10:00:00.000Z' },
    { id: 'act6', miembroId: 'demo6', titulo: 'Jams de improvisación teatral',
      categoria: 'artistica', descripcion: 'Sesiones semanales de impro con el grupo Teatro Espontáneo UChile.',
      lugar: 'Casa del Deporte', horarios: [{ dia: 'Jueves', inicio: '19:00', fin: '21:00' }],
      archivos: ['impro.jpg'], enlace: 'https://www.teatroespontaneo.uchile.cl',
      fechaRegistro: '2024-03-21T10:00:00.000Z' }
  ]
};

window.dccStore = {
  members: DATOS_EJEMPLO.members,
  activities: DATOS_EJEMPLO.activities,
  generateId: generarId
};
