/**
 * graficos.js — Gráficos con Chart.js 4.
 * Obtiene datos desde el backend Flask y renderiza los 3 gráficos requeridos.
 */

var BACKEND_URL = 'http://localhost:5000';

/* ── Paleta ──────────────────────────────────────────────── */

var PALETA = [
  '#1a4a8a', '#e87722', '#27ae60', '#8e44ad',
  '#e74c3c', '#16a085', '#f39c12', '#2980b9'
];

/* ── Labels de categorías ────────────────────────────────── */

var CAT_LABEL = {
  artistica:   'Artística',
  deportiva:   'Deportiva',
  tecnologica: 'Tecnológica',
  social:      'Social',
  recreativa:  'Recreativa',
  otra:        'Otra'
};

/* ── Instancias de Chart (para destruir antes de re-dibujar) */

var instancias = {};

function destruir(id) {
  if (instancias[id]) {
    instancias[id].destroy();
    delete instancias[id];
  }
}

/* ── Opciones comunes ────────────────────────────────────── */

Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
Chart.defaults.color = '#5a6472';

/* ── Manejo de error ─────────────────────────────────────── */

function mostrarError(msg) {
  var el = document.getElementById('metricas-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = '';
}

function ocultarError() {
  var el = document.getElementById('metricas-error');
  if (el) el.style.display = 'none';
}

/* ── Gráfico 1: Líneas — miembros registrados por día ───── */

function graficoMiembrosPorDia(datos) {
  destruir('miembros-dia');

  var labels = datos.map(function (r) { return r.dia; });
  var values = datos.map(function (r) { return r.cantidad; });

  var ctx = document.getElementById('grafico-miembros-por-dia').getContext('2d');
  instancias['miembros-dia'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Miembros registrados',
        data: values,
        borderColor: PALETA[0],
        backgroundColor: 'rgba(26,74,138,0.12)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: PALETA[0],
        tension: 0,
        fill: true
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

/* ── Gráfico 2: Torta — actividades por categoría ───────── */

function graficoActividadesPorCategoria(datos) {
  destruir('act-categoria');

  var labels = datos.map(function (r) { return CAT_LABEL[r.categoria] || r.categoria; });
  var values = datos.map(function (r) { return r.total; });

  var ctx = document.getElementById('grafico-actividades-por-categoria').getContext('2d');
  instancias['act-categoria'] = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: PALETA,
        borderColor: '#fff',
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { padding: 14, font: { size: 12 } }
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

/* ── Gráfico 3: Barras — actividades por comuna ─────────── */

function graficoActividadesPorComuna(datos) {
  destruir('act-comuna');

  var labels = datos.map(function (r) { return r.comuna; });
  var values = datos.map(function (r) { return r.total; });

  var ctx = document.getElementById('grafico-actividades-por-comuna').getContext('2d');
  instancias['act-comuna'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Actividades',
        data: values,
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
          grid: { display: false },
          ticks: { maxRotation: 45 }
        }
      }
    }
  });
}

/* ── Render principal ────────────────────────────────────── */

function renderizarTodo() {
  ocultarError();

  fetch(BACKEND_URL + '/estadisticas')
    .then(function (r) {
      if (!r.ok) throw new Error('Error al obtener estadísticas');
      return r.json();
    })
    .then(function (data) {
      graficoMiembrosPorDia(data.miembros_por_dia || []);
      graficoActividadesPorCategoria(data.actividades_por_categoria || []);
      graficoActividadesPorComuna(data.actividades_por_comuna || []);
    })
    .catch(function () {
      mostrarError('No se pudieron cargar las estadísticas. Asegúrate de que el servidor esté en línea.');
    });
}

/* ── Inicialización ──────────────────────────────────────── */

renderizarTodo();

document.getElementById('btn-actualizar').addEventListener('click', renderizarTodo);
