/**
 * graficos.js — Gráficos con Chart.js 4.
 * Requiere que Chart.js esté cargado antes de este script (vía CDN en metricas.html).
 */

var store = window.dccStore;

/* ── Paleta ──────────────────────────────────────────────── */

var PALETA = [
  '#1a4a8a', '#e87722', '#27ae60', '#8e44ad',
  '#e74c3c', '#16a085', '#f39c12', '#2980b9'
];

/* ── Labels ──────────────────────────────────────────────── */

var TIPO_LABEL = {
  pregrado:    'Pregrado',
  postgrado:   'Postgrado',
  funcionario: 'Funcionario/a',
  academico:   'Académico/a'
};

var CAT_LABEL = {
  artistica:   'Artística',
  deportiva:   'Deportiva',
  tecnologica: 'Tecnológica',
  social:      'Social',
  recreativa:  'Recreativa',
  otra:        'Otra'
};

var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

/* ── Instancias de Chart (para destruir antes de re-dibujar) */

var instancias = {};

function destruir(id) {
  if (instancias[id]) {
    instancias[id].destroy();
    delete instancias[id];
  }
}

/* ── Opciones comunes ────────────────────────────────────── */

var FONT_FAMILY = "'Segoe UI', system-ui, sans-serif";

Chart.defaults.font.family = FONT_FAMILY;
Chart.defaults.color = '#5a6472';

/* ── Resumen numérico ────────────────────────────────────── */

function actualizarResumen() {
  var members    = store.members;
  var activities = store.activities;

  document.getElementById('total-miembros').textContent    = members.length;
  document.getElementById('total-actividades').textContent = activities.length;

  var conActividad = {};
  activities.forEach(function (a) { conActividad[a.miembroId] = true; });
  document.getElementById('total-con-actividad').textContent = Object.keys(conActividad).length;

  var promedio = members.length === 0
    ? 0
    : (activities.length / members.length).toFixed(1);
  document.getElementById('promedio-actividades').textContent = promedio;
}

/* ── Gráfico 1: Doughnut — miembros por tipo ─────────────── */

function graficoTipos() {
  destruir('tipos');

  var tipos  = Object.keys(TIPO_LABEL);
  var datos  = tipos.map(function (t) {
    return store.members.filter(function (m) { return m.tipo === t; }).length;
  });
  var labels = tipos.map(function (t) { return TIPO_LABEL[t]; });

  var ctx = document.getElementById('grafico-tipos').getContext('2d');
  instancias['tipos'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: datos,
        backgroundColor: PALETA,
        borderColor: '#fff',
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 16, font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              var total = ctx.dataset.data.reduce(function (s, v) { return s + v; }, 0);
              var pct   = total > 0 ? Math.round(ctx.parsed / total * 100) : 0;
              return ' ' + ctx.label + ': ' + ctx.parsed + ' (' + pct + '%)';
            }
          }
        }
      }
    }
  });
}

/* ── Gráfico 2: Barras verticales — actividades por categoría */

function graficoCategorias() {
  destruir('categorias');

  var cats   = Object.keys(CAT_LABEL);
  var datos  = cats.map(function (c) {
    return store.activities.filter(function (a) { return a.categoria === c; }).length;
  });
  var labels = cats.map(function (c) { return CAT_LABEL[c]; });

  var ctx = document.getElementById('grafico-categorias').getContext('2d');
  instancias['categorias'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Actividades',
        data: datos,
        backgroundColor: PALETA,
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#e8eaed' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

/* ── Gráfico 3: Barras horizontales — top 10 miembros ───── */

function graficoTopMiembros() {
  destruir('top');

  var conteo = {};
  store.activities.forEach(function (a) {
    conteo[a.miembroId] = (conteo[a.miembroId] || 0) + 1;
  });

  var lista = Object.keys(conteo).map(function (id) {
    var m = store.members.filter(function (x) { return x.id === id; })[0];
    return { nombre: m ? m.nombre.split(' ')[0] + ' ' + m.nombre.split(' ')[1] : 'Desconocido', count: conteo[id] };
  });
  lista.sort(function (a, b) { return b.count - a.count; });
  var top = lista.slice(0, 10);

  var ctx = document.getElementById('grafico-top-miembros').getContext('2d');
  instancias['top'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(function (x) { return x.nombre; }),
      datasets: [{
        label: 'Actividades',
        data: top.map(function (x) { return x.count; }),
        backgroundColor: PALETA[0],
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#e8eaed' }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 11 } }
        }
      }
    }
  });
}

/* ── Gráfico 4: Barras — actividades por día de la semana ── */

function graficoDias() {
  destruir('dias');

  var conteo = {};
  DIAS.forEach(function (d) { conteo[d] = 0; });
  store.activities.forEach(function (a) {
    if (a.horarios) {
      a.horarios.forEach(function (h) {
        if (conteo.hasOwnProperty(h.dia)) conteo[h.dia]++;
      });
    }
  });

  var ctx = document.getElementById('grafico-dias').getContext('2d');
  instancias['dias'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DIAS.map(function (d) { return d.slice(0, 3); }),
      datasets: [{
        label: 'Horarios',
        data: DIAS.map(function (d) { return conteo[d]; }),
        backgroundColor: PALETA[2],
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 },
          grid: { color: '#e8eaed' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

/* ── Render principal ────────────────────────────────────── */

function renderizarTodo() {
  actualizarResumen();
  graficoTipos();
  graficoCategorias();
  graficoTopMiembros();
  graficoDias();
}

/* ── Inicialización ──────────────────────────────────────── */

renderizarTodo();

document.getElementById('btn-actualizar').addEventListener('click', renderizarTodo);
