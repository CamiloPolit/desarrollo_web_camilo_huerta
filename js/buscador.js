/**
 * buscador.js — Buscador de actividades + notas (1-7).
 * Llama al backend Spring Boot (puerto 8080), independiente del backend Flask (5000).
 */

var JAVA_BACKEND_URL = 'http://localhost:8080';

var CAT_LABEL = {
  artistica: 'Artística', deportiva: 'Deportiva', tecnologica: 'Tecnológica',
  social: 'Social', recreativa: 'Recreativa', otra: 'Otra'
};

var input          = document.getElementById('texto-busqueda');
var lista          = document.getElementById('lista-resultados');
var elSinResultados = document.getElementById('busqueda-sin-resultados');
var elError         = document.getElementById('busqueda-error');

function escapeRegExp(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* Construye nodos DOM con el texto buscado resaltado en <mark>, sin usar innerHTML. */
function resaltar(contenedor, texto, termino) {
  if (!texto) return;
  if (!termino) {
    contenedor.appendChild(document.createTextNode(texto));
    return;
  }
  var regex = new RegExp('(' + escapeRegExp(termino) + ')', 'ig');
  var partes = texto.split(regex);
  partes.forEach(function (parte) {
    if (parte.toLowerCase() === termino.toLowerCase()) {
      var mark = document.createElement('mark');
      mark.textContent = parte;
      contenedor.appendChild(mark);
    } else if (parte) {
      contenedor.appendChild(document.createTextNode(parte));
    }
  });
}

function mostrarError(texto) {
  elError.textContent = texto;
  elError.style.display = '';
}

function ocultarError() {
  elError.style.display = 'none';
}

function actualizarNotaEnDOM(li, promedio, conteo) {
  var spanNota = li.querySelector('.nota-valor');
  spanNota.textContent = (promedio === null || promedio === undefined) ? '-' : promedio;
  var spanConteo = li.querySelector('.nota-conteo');
  spanConteo.textContent = '(' + conteo + (conteo === 1 ? ' evaluación' : ' evaluaciones') + ')';
}

function evaluarActividad(actividadId, li) {
  var entrada = window.prompt('Ingresa una nota entre 1 y 7 (entero):');
  if (entrada === null) return; // usuario canceló

  var valor = Number(entrada);
  if (!Number.isInteger(valor) || valor < 1 || valor > 7) {
    window.alert('La nota debe ser un número entero entre 1 y 7.');
    return;
  }

  fetch(JAVA_BACKEND_URL + '/api/actividades/' + actividadId + '/notas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nota: valor })
  })
    .then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); })
    .then(function (res) {
      if (res.status === 201) {
        actualizarNotaEnDOM(li, res.data.promedio, res.data.conteo);
      } else {
        var errs = res.data.errores || {};
        var msg = Object.values(errs).join(' ') || res.data.error || 'No se pudo guardar la nota.';
        window.alert(msg);
      }
    })
    .catch(function () {
      window.alert('No se pudo conectar con el servidor.');
    });
}

function construirResultado(actividad, termino) {
  var li = document.createElement('li');
  li.className = 'actividad-detalle resultado-busqueda';
  li.dataset.actividadId = actividad.id;

  var h4 = document.createElement('h4');
  h4.className = 'actividad-titulo';
  resaltar(h4, actividad.titulo, termino);
  var spanCat = document.createElement('span');
  spanCat.className = 'etiqueta-categoria';
  spanCat.textContent = CAT_LABEL[actividad.categoria] || actividad.categoria;
  h4.appendChild(spanCat);
  li.appendChild(h4);

  var pDesc = document.createElement('p');
  pDesc.className = 'actividad-descripcion';
  resaltar(pDesc, actividad.descripcion, termino);
  li.appendChild(pDesc);

  var pMiembro = document.createElement('p');
  pMiembro.className = 'actividad-meta';
  pMiembro.innerHTML = '<strong>Miembro:</strong> ';
  pMiembro.appendChild(document.createTextNode(actividad.miembroNombre));
  li.appendChild(pMiembro);

  var pComuna = document.createElement('p');
  pComuna.className = 'actividad-meta';
  pComuna.innerHTML = '<strong>Comuna:</strong> ';
  resaltar(pComuna, actividad.comuna, termino);
  li.appendChild(pComuna);

  if (actividad.dias && actividad.dias.length > 0) {
    var pDias = document.createElement('p');
    pDias.className = 'actividad-meta';
    pDias.innerHTML = '<strong>Día:</strong> ' + actividad.dias.join(', ');
    li.appendChild(pDias);
  }

  var divNota = document.createElement('div');
  divNota.className = 'nota-actividad';

  var spanNota = document.createElement('span');
  spanNota.className = 'nota-valor';
  spanNota.textContent = (actividad.notaPromedio === null || actividad.notaPromedio === undefined)
    ? '-' : actividad.notaPromedio;
  divNota.appendChild(spanNota);

  var spanConteo = document.createElement('span');
  spanConteo.className = 'nota-conteo';
  var conteo = actividad.notaConteo || 0;
  spanConteo.textContent = '(' + conteo + (conteo === 1 ? ' evaluación' : ' evaluaciones') + ')';
  divNota.appendChild(spanConteo);

  var btnEvaluar = document.createElement('button');
  btnEvaluar.type = 'button';
  btnEvaluar.className = 'btn btn-secundario btn-evaluar';
  btnEvaluar.textContent = 'Evaluar';
  btnEvaluar.addEventListener('click', function () {
    evaluarActividad(actividad.id, li);
  });
  divNota.appendChild(btnEvaluar);

  li.appendChild(divNota);

  return li;
}

function renderizarResultados(actividades, termino) {
  lista.innerHTML = '';
  ocultarError();

  if (actividades.length === 0) {
    elSinResultados.style.display = '';
    return;
  }
  elSinResultados.style.display = 'none';

  actividades.forEach(function (actividad) {
    lista.appendChild(construirResultado(actividad, termino));
  });
}

function buscar(termino) {
  fetch(JAVA_BACKEND_URL + '/api/actividades/buscar?q=' + encodeURIComponent(termino))
    .then(function (r) {
      if (!r.ok) throw new Error('Error en la búsqueda');
      return r.json();
    })
    .then(function (actividades) {
      renderizarResultados(actividades, termino);
    })
    .catch(function () {
      lista.innerHTML = '';
      elSinResultados.style.display = 'none';
      mostrarError('No se pudo conectar con el servidor de búsqueda.');
    });
}

var timerBusqueda;
input.addEventListener('input', function () {
  clearTimeout(timerBusqueda);
  var valor = this.value.trim();

  if (valor.length < 3) {
    lista.innerHTML = '';
    elSinResultados.style.display = 'none';
    ocultarError();
    return;
  }

  timerBusqueda = setTimeout(function () {
    buscar(valor);
  }, 280);
});
