/**
 * backend.js — Conector con el backend Flask.
 * Se carga después de los demás scripts. No modifica la lógica existente:
 * sólo agrega la comunicación con la API REST en http://localhost:5000.
 */

var BACKEND_URL = 'http://localhost:5000';

/* ── Utilidad: mostrar mensaje de backend ──────────────────── */

function mostrarMensajeBackend(contenedorId, texto, tipo) {
  var el = document.getElementById(contenedorId);
  if (!el) return;
  el.textContent = texto;
  el.className = 'alerta alerta-' + (tipo === 'exito' ? 'exito' : 'error');
  el.style.display = '';
  el.setAttribute('role', tipo === 'exito' ? 'status' : 'alert');
}

/* ════════════════════════════════════════════════════════════
   registro.html — Selector de región/comuna + envío al backend
   ════════════════════════════════════════════════════════════ */

if (document.body.dataset.pagina === 'registro') {

  var selectRegion = document.getElementById('region');
  var selectComuna = document.getElementById('comuna_id');

  /* Poblar el selector de regiones y comunas */
  if (selectRegion && selectComuna) {
    fetch(BACKEND_URL + '/regiones')
      .then(function (r) { return r.json(); })
      .then(function (regiones) {
        regiones.forEach(function (reg) {
          var opt = document.createElement('option');
          opt.value = reg.id;
          opt.textContent = reg.nombre;
          opt.dataset.comunas = JSON.stringify(reg.comunas);
          selectRegion.appendChild(opt);
        });
      })
      .catch(function () {});

    selectRegion.addEventListener('change', function () {
      while (selectComuna.options.length > 1) selectComuna.remove(1);
      var selOpt = selectRegion.options[selectRegion.selectedIndex];
      if (!selOpt || !selOpt.dataset.comunas) return;
      JSON.parse(selOpt.dataset.comunas).forEach(function (c) {
        var opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.nombre;
        selectComuna.appendChild(opt);
      });
    });
  }

  /*
   * Interceptamos store.members.push — es el momento exacto en que
   * registro.js confirma que la validación pasó y el miembro se aceptó.
   * En ese instante el formulario aún no fue reseteado, así que podemos
   * leer los valores directamente del DOM.
   */
  var pushOriginal = window.dccStore.members.push.bind(window.dccStore.members);
  window.dccStore.members.push = function (miembro) {
    pushOriginal(miembro);
    enviarMiembroAlBackend(miembro);
  };

  function enviarMiembroAlBackend(miembro) {
    var comunaId = selectComuna ? selectComuna.value : '';
    if (!comunaId) {
      mostrarMensajeBackend('mensaje-backend', 'Selecciona una región y comuna antes de registrar.', 'error');
      return;
    }

    var fd = new FormData();
    fd.append('nombre',      miembro.nombre);
    fd.append('rut',         miembro.rut);
    fd.append('tipo-miembro', miembro.tipo);
    fd.append('email',       miembro.email);
    fd.append('telefono',    miembro.telefono || '');
    fd.append('comuna_id',   comunaId);

    /* Campos específicos por tipo */
    if (miembro.tipo === 'pregrado') {
      fd.append('plan-estudio',  miembro.planEstudio || '');
      fd.append('anio-ingreso',  miembro.anioIngreso || '');
    } else if (miembro.tipo === 'postgrado') {
      fd.append('programa',          miembro.programa || '');
      fd.append('anio-ingreso-post', miembro.anioIngreso || '');
      fd.append('profesor-guia',     miembro.profesorGuia || '');
    } else if (miembro.tipo === 'funcionario') {
      fd.append('cargo',         miembro.cargo || '');
      fd.append('unidad',        miembro.unidad || '');
      fd.append('tipo-contrato', miembro.tipoContrato || '');
    } else if (miembro.tipo === 'academico') {
      fd.append('jerarquia',          miembro.jerarquia || '');
      fd.append('area-investigacion', miembro.areaInvestigacion || '');
      fd.append('oficina',            miembro.oficina || '');
    }

    fetch(BACKEND_URL + '/registro', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          var msg = encodeURIComponent('Miembro "' + miembro.nombre + '" registrado exitosamente.');
          window.location.href = 'index.html?mensaje=' + msg;
        } else {
          var textoErr = data.errores ? Object.values(data.errores).join(' ') : 'Error al guardar.';
          mostrarMensajeBackend('mensaje-backend', textoErr, 'error');
        }
      })
      .catch(function () {
        mostrarMensajeBackend('mensaje-backend',
          'No se pudo conectar con el servidor. El registro se guardó sólo en memoria.', 'error');
      });
  }
}

/* ════════════════════════════════════════════════════════════
   actividades.html — Envío al backend
   ════════════════════════════════════════════════════════════ */

if (document.body.dataset.pagina === 'actividades') {

  var formActividad = document.getElementById('form-actividad');
  if (formActividad) {
    formActividad.addEventListener('submit', function () {
      setTimeout(function () {
        var mensajeEl = document.getElementById('mensaje-estado');
        if (!mensajeEl || mensajeEl.style.display === 'none') return;
        if (!mensajeEl.classList.contains('alerta-exito')) return;

        /* Construir FormData con la estructura que espera el backend.
           El formulario de actividades maneja UNA actividad por envío;
           la mapeamos a titulo[], categoria[], etc. */
        var fd = new FormData();

        /* Obtener el miembro seleccionado — el backend no usa miembro_id directamente
           en /registro (el miembro se crea allí), pero actividades.html registra
           actividades para miembros ya existentes. Por ahora lo incluimos como referencia. */
        var selectMiembro = document.getElementById('miembro-selector');
        if (selectMiembro) fd.append('miembro_id', selectMiembro.value);

        var titulo = document.getElementById('titulo-actividad-input');
        var categoria = document.getElementById('categoria');
        var descripcion = document.getElementById('descripcion');
        var lugar = document.getElementById('lugar');
        var enlace = document.getElementById('enlace');

        fd.append('titulo[]', titulo ? titulo.value.trim() : '');
        fd.append('categoria[]', categoria ? categoria.value : '');
        fd.append('descripcion[]', descripcion ? descripcion.value.trim() : '');
        fd.append('lugar[]', lugar ? lugar.value.trim() : '');
        fd.append('enlace[]', enlace ? enlace.value.trim() : '');

        /* Horarios: recoger todos los .horario-item */
        var slots = document.querySelectorAll('#lista-horarios .horario-item');
        slots.forEach(function (slot) {
          var idx = slot.dataset.idx;
          var diaEl = document.getElementById('dia-' + idx);
          var inicioEl = document.getElementById('inicio-' + idx);
          var finEl = document.getElementById('fin-' + idx);
          fd.append('dia_0[]', diaEl ? diaEl.value : '');
          fd.append('hora_inicio_0[]', inicioEl ? inicioEl.value : '');
          fd.append('hora_fin_0[]', finEl ? finEl.value : '');
        });

        /* Archivos */
        var inputArchivos = document.getElementById('archivos-media');
        if (inputArchivos && inputArchivos.files) {
          for (var i = 0; i < inputArchivos.files.length; i++) {
            fd.append('fotos_0[]', inputArchivos.files[i]);
          }
        }

        fetch(BACKEND_URL + '/actividad', {
          method: 'POST',
          body: fd
        })
          .then(function (r) { return r.json(); })
          .then(function (data) {
            if (data.ok) {
              mostrarMensajeBackend('mensaje-backend', 'Actividad guardada en la base de datos.', 'exito');
            } else {
              mostrarMensajeBackend('mensaje-backend', 'Error al guardar la actividad en la base de datos.', 'error');
            }
          })
          .catch(function () {
            mostrarMensajeBackend('mensaje-backend',
              'No se pudo conectar con el servidor. La actividad se guardó sólo en memoria.',
              'error');
          });
      }, 50);
    });
  }
}

/* ════════════════════════════════════════════════════════════
   miembros.html — Cargar miembros desde el backend
   ════════════════════════════════════════════════════════════ */

if (document.body.dataset.pagina === 'miembros') {
  /* Vaciar datos de ejemplo antes del fetch para evitar que aparezcan
     brevemente mientras llega la respuesta del backend */
  window.dccStore.members = [];
  fetch(BACKEND_URL + '/miembros?pagina=1')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      /* Reemplazar completamente los datos de ejemplo con los de la BD */
      window.dccStore.members = (data.miembros || []).map(function (m) {
        return {
          id: String(m.id),
          nombre: m.nombre,
          rut: m.rut,
          tipo: m.tipo,
          email: m.email,
          telefono: m.telefono || '',
          fechaRegistro: m.fecha_registro,
          _backendId: m.id
        };
      });
      if (typeof renderizar === 'function') renderizar();
    })
    .catch(function () {
      /* Sin backend, se muestran los datos de ejemplo de store.js */
    });
}

/* ════════════════════════════════════════════════════════════
   index.html — Mostrar últimos miembros registrados
   ════════════════════════════════════════════════════════════ */

if (document.body.dataset.pagina === 'inicio') {
  /* Mostrar mensaje de éxito si viene desde un registro exitoso */
  var params = new URLSearchParams(window.location.search);
  var msgParam = params.get('mensaje');
  if (msgParam) {
    var msgEl = document.getElementById('mensaje-inicio');
    if (msgEl) {
      msgEl.textContent = decodeURIComponent(msgParam);
      msgEl.className = 'alerta alerta-exito';
      msgEl.style.display = '';
    }
    /* Limpiar el parámetro de la URL sin recargar la página */
    history.replaceState(null, '', window.location.pathname);
  }

  var listaUltimos = document.getElementById('lista-ultimos-miembros');
  if (listaUltimos) {
    fetch(BACKEND_URL + '/miembros/ultimos')
      .then(function (r) { return r.json(); })
      .then(function (miembros) {
        listaUltimos.innerHTML = '';
        if (miembros.length === 0) {
          listaUltimos.innerHTML = '<li>No hay miembros registrados aún.</li>';
          return;
        }
        var TIPO_LABEL = {
          pregrado: 'Pregrado', postgrado: 'Postgrado',
          funcionario: 'Funcionario/a', academico: 'Académico/a'
        };
        miembros.forEach(function (m) {
          var li = document.createElement('li');
          li.className = 'ultimo-miembro';
          li.innerHTML =
            '<strong>' + m.nombre + '</strong>' +
            ' <span class="etiqueta-tipo tipo-' + m.tipo + '">' +
            (TIPO_LABEL[m.tipo] || m.tipo) + '</span>' +
            ' <small>— ' + m.fecha_registro + '</small>';
          listaUltimos.appendChild(li);
        });
      })
      .catch(function () {
        /* Sin backend, la sección simplemente no se muestra */
      });
  }
}
