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

  /* Reemplazar datos de ejemplo con los miembros de la BD y repoblar el selector.
     Trae todas las páginas para que el selector muestre todos los miembros. */
  window.dccStore.members = [];

  function convertirMiembro(m) {
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
  }

  function cargarPagina(pagina, acumulados) {
    fetch(BACKEND_URL + '/miembros?pagina=' + pagina)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var todos = acumulados.concat((data.miembros || []).map(convertirMiembro));
        if (pagina < (data.total_paginas || 1)) {
          cargarPagina(pagina + 1, todos);
        } else {
          window.dccStore.members = todos;
          if (typeof cargarMiembros === 'function') cargarMiembros();
        }
      })
      .catch(function () {
        if (typeof cargarMiembros === 'function') cargarMiembros();
      });
  }

  cargarPagina(1, []);

  /*
   * Interceptamos store.activities.push — momento exacto en que actividades.js
   * confirma que la validación pasó. El formulario aún no fue reseteado,
   * así que podemos leer todos los valores del DOM en ese instante.
   */
  var pushActividadOriginal = window.dccStore.activities.push.bind(window.dccStore.activities);
  window.dccStore.activities.push = function (actividad) {
    pushActividadOriginal(actividad);
    enviarActividadAlBackend(actividad);
  };

  function enviarActividadAlBackend(actividad) {
    var selectMiembro = document.getElementById('miembro-selector');
    var miembroId = selectMiembro ? selectMiembro.value : '';

    var fd = new FormData();
    fd.append('miembro_id', miembroId);
    fd.append('titulo[]',      actividad.titulo);
    fd.append('categoria[]',   actividad.categoria);
    fd.append('descripcion[]', actividad.descripcion);
    fd.append('lugar[]',       actividad.lugar || '');
    fd.append('enlace[]',      actividad.enlace);

    /* Horarios — leer del DOM antes del reset */
    var slots = document.querySelectorAll('#lista-horarios .horario-item');
    slots.forEach(function (slot) {
      var idx = slot.dataset.idx;
      var dia    = document.getElementById('dia-'    + idx);
      var inicio = document.getElementById('inicio-' + idx);
      var fin    = document.getElementById('fin-'    + idx);
      fd.append('dia_0[]',         dia    ? dia.value    : '');
      fd.append('hora_inicio_0[]', inicio ? inicio.value : '');
      fd.append('hora_fin_0[]',    fin    ? fin.value    : '');
    });

    /* Archivos */
    var inputArchivos = document.getElementById('archivos-media');
    if (inputArchivos && inputArchivos.files) {
      for (var i = 0; i < inputArchivos.files.length; i++) {
        fd.append('fotos_0[]', inputArchivos.files[i]);
      }
    }

    fetch(BACKEND_URL + '/actividad', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.ok) {
          var msg = encodeURIComponent('Actividad "' + actividad.titulo + '" registrada exitosamente.');
          window.location.href = 'index.html?mensaje=' + msg;
        } else {
          var textoErr = data.errores ? Object.values(data.errores).join(' ') : 'Error al guardar.';
          if (data.act_errores && data.act_errores[0]) {
            textoErr += ' ' + Object.values(data.act_errores[0]).join(' ');
          }
          mostrarMensajeBackend('mensaje-backend', textoErr, 'error');
        }
      })
      .catch(function () {
        mostrarMensajeBackend('mensaje-backend',
          'No se pudo conectar con el servidor. La actividad se guardó sólo en memoria.', 'error');
      });
  }
}

/* ════════════════════════════════════════════════════════════
   miembros.html — Cargar miembros desde el backend
   ════════════════════════════════════════════════════════════ */

if (document.body.dataset.pagina === 'miembros') {
  /* Vaciar datos de ejemplo antes del fetch */
  window.dccStore.members = [];

  /*
   * Parcheamos abrirModal una vez que miembros.js la haya declarado.
   * Cuando el miembro viene del backend (_backendId), pedimos el detalle
   * completo (incluye actividades) antes de abrir el modal.
   */
  setTimeout(function () {
    var abrirModalOriginal = abrirModal;

    abrirModal = function (m) {
      if (!m._backendId) {
        abrirModalOriginal(m);
        return;
      }

      fetch(BACKEND_URL + '/miembros/' + m._backendId)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          /* Construir objeto con los campos que espera miembros.js */
          var mCompleto = {
            id:                String(d.id),
            _backendId:        d.id,
            nombre:            d.nombre,
            rut:               d.rut,
            tipo:              d.tipo,
            email:             d.email,
            telefono:          d.telefono || '',
            fechaRegistro:     d.fecha_registro,
            planEstudio:       d.plan_estudio,
            anioIngreso:       d.anio_ingreso,
            programa:          d.programa,
            profesorGuia:      d.profesor_guia,
            cargo:             d.cargo,
            unidad:            d.unidad,
            tipoContrato:      d.tipo_contrato,
            jerarquia:         d.jerarquia,
            areaInvestigacion: d.area_investigacion,
            oficina:           d.oficina
          };

          /* Inyectar las actividades en store para que la lógica
             original de abrirModal las encuentre al filtrar */
          store.activities = (d.actividades || []).map(function (a) {
            return {
              id:        String(a.id),
              miembroId: String(d.id),
              titulo:    a.titulo,
              categoria: a.categoria
            };
          });

          abrirModalOriginal(mCompleto);
        })
        .catch(function () {
          abrirModalOriginal(m);
        });
    };
  }, 0);

  fetch(BACKEND_URL + '/miembros?pagina=1')
    .then(function (r) { return r.json(); })
    .then(function (data) {
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
