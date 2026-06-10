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

  function cargarComentarios(actividadId, ulEl) {
    fetch(BACKEND_URL + '/actividades/' + actividadId + '/comentarios')
      .then(function (r) { return r.json(); })
      .then(function (comentarios) {
        ulEl.innerHTML = '';
        if (comentarios.length === 0) {
          var liVacio = document.createElement('li');
          liVacio.className = 'comentario-vacio';
          liVacio.textContent = 'Aún no hay comentarios.';
          ulEl.appendChild(liVacio);
          return;
        }
        comentarios.forEach(function (c) {
          var li = document.createElement('li');
          li.className = 'comentario-item';

          var spanFecha = document.createElement('span');
          spanFecha.className = 'comentario-fecha';
          spanFecha.textContent = c.fecha;

          var spanNombre = document.createElement('span');
          spanNombre.className = 'comentario-nombre';
          spanNombre.textContent = c.nombre;

          var pTexto = document.createElement('p');
          pTexto.className = 'comentario-texto';
          pTexto.textContent = c.texto;

          li.appendChild(spanFecha);
          li.appendChild(spanNombre);
          li.appendChild(pTexto);
          ulEl.appendChild(li);
        });
      })
      .catch(function () {
        ulEl.innerHTML = '<li>No se pudieron cargar los comentarios.</li>';
      });
  }

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

          /* Inyectar actividades mínimas en store para que abrirModal
             no muestre "No ha registrado actividades aún" */
          store.activities = (d.actividades || []).map(function (a) {
            return { id: String(a.id), miembroId: String(d.id), titulo: a.titulo, categoria: a.categoria };
          });

          abrirModalOriginal(mCompleto);

          /* Reemplazar la lista de actividades con el detalle completo */
          var lista = document.getElementById('lista-actividades-modal');
          if (!lista) return;
          lista.innerHTML = '';

          var CAT_LABEL = {
            artistica: 'Artística', deportiva: 'Deportiva', tecnologica: 'Tecnológica',
            social: 'Social', recreativa: 'Recreativa', otra: 'Otra'
          };

          if (!d.actividades || d.actividades.length === 0) {
            var liVacio = document.createElement('li');
            liVacio.textContent = 'No ha registrado actividades aún.';
            lista.appendChild(liVacio);
            return;
          }

          d.actividades.forEach(function (a) {
            var li = document.createElement('li');
            li.className = 'actividad-detalle';

            /* Encabezado: título + categoría */
            var h4 = document.createElement('h4');
            h4.className = 'actividad-titulo';
            h4.textContent = a.titulo;
            var spanCat = document.createElement('span');
            spanCat.className = 'etiqueta-categoria';
            spanCat.textContent = CAT_LABEL[a.categoria] || a.categoria;
            h4.appendChild(spanCat);
            li.appendChild(h4);

            /* Descripción */
            if (a.descripcion) {
              var p = document.createElement('p');
              p.className = 'actividad-descripcion';
              p.textContent = a.descripcion;
              li.appendChild(p);
            }

            /* Lugar */
            if (a.lugar) {
              var pLugar = document.createElement('p');
              pLugar.className = 'actividad-meta';
              pLugar.innerHTML = '<strong>Lugar:</strong> ' + a.lugar;
              li.appendChild(pLugar);
            }

            /* Horarios */
            if (a.horarios && a.horarios.length > 0) {
              var pHor = document.createElement('p');
              pHor.className = 'actividad-meta';
              var horTexto = a.horarios.map(function (h) {
                return h.dia + ' ' + h.hora_inicio + '–' + h.hora_fin;
              }).join(', ');
              pHor.innerHTML = '<strong>Horario:</strong> ' + horTexto;
              li.appendChild(pHor);
            }

            /* Enlace */
            if (a.enlace) {
              var pEnlace = document.createElement('p');
              pEnlace.className = 'actividad-meta';
              var anchor = document.createElement('a');
              anchor.href = a.enlace;
              anchor.target = '_blank';
              anchor.rel = 'noopener noreferrer';
              anchor.textContent = a.enlace;
              pEnlace.innerHTML = '<strong>Enlace:</strong> ';
              pEnlace.appendChild(anchor);
              li.appendChild(pEnlace);
            }

            /* Fotos */
            if (a.fotos && a.fotos.length > 0) {
              var divFotos = document.createElement('div');
              divFotos.className = 'actividad-fotos';
              a.fotos.forEach(function (f) {
                var img = document.createElement('img');
                img.src = BACKEND_URL + '/static/' + f.ruta;
                img.alt = f.nombre;
                img.className = 'actividad-foto-miniatura';
                divFotos.appendChild(img);
              });
              li.appendChild(divFotos);
            }

            /* Sección de comentarios */
            var secCom = document.createElement('section');
            secCom.className = 'comentarios-seccion';
            secCom.id = 'comentarios-' + a.id;

            var h5Com = document.createElement('h5');
            h5Com.textContent = 'Comentarios';
            secCom.appendChild(h5Com);

            var ulCom = document.createElement('ul');
            ulCom.className = 'lista-comentarios';
            secCom.appendChild(ulCom);

            /* Formulario de nuevo comentario */
            var formCom = document.createElement('form');
            formCom.className = 'form-comentario';
            formCom.dataset.actividadId = a.id;
            formCom.innerHTML =
              '<div class="form-group">' +
                '<label>Nombre del comentarista</label>' +
                '<input type="text" name="nombre" minlength="3" maxlength="80" required>' +
              '</div>' +
              '<div class="form-group">' +
                '<label>Comentario</label>' +
                '<textarea name="texto" rows="4" cols="50" minlength="5" required></textarea>' +
              '</div>' +
              '<button type="submit" class="btn btn-primario">Agregar comentario</button>' +
              '<div class="comentario-errores" role="alert"></div>';
            secCom.appendChild(formCom);

            li.appendChild(secCom);
            lista.appendChild(li);

            /* Cargar comentarios existentes */
            cargarComentarios(a.id, ulCom);

            /* Manejar envío del formulario */
            formCom.addEventListener('submit', function (e) {
              e.preventDefault();
              var nombreInput = formCom.querySelector('[name="nombre"]');
              var textoInput  = formCom.querySelector('[name="texto"]');
              var errDiv      = formCom.querySelector('.comentario-errores');
              var nombre = nombreInput.value.trim();
              var texto  = textoInput.value.trim();

              errDiv.textContent = '';

              /* Validación cliente */
              var msgs = [];
              if (nombre.length < 3) msgs.push('El nombre debe tener al menos 3 caracteres.');
              if (texto.length < 5)  msgs.push('El comentario debe tener al menos 5 caracteres.');
              if (msgs.length > 0) {
                errDiv.textContent = msgs.join(' ');
                return;
              }

              var btn = formCom.querySelector('button[type="submit"]');
              btn.disabled = true;

              fetch(BACKEND_URL + '/actividades/' + formCom.dataset.actividadId + '/comentarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombre, texto: texto })
              })
                .then(function (r) { return r.json().then(function (d) { return { status: r.status, data: d }; }); })
                .then(function (res) {
                  if (res.status === 201) {
                    nombreInput.value = '';
                    textoInput.value  = '';
                    cargarComentarios(formCom.dataset.actividadId, ulCom);
                  } else {
                    var errs = res.data.errores || {};
                    errDiv.textContent = Object.values(errs).join(' ') || 'Error al guardar el comentario.';
                  }
                })
                .catch(function () {
                  errDiv.textContent = 'No se pudo conectar con el servidor.';
                })
                .finally(function () {
                  btn.disabled = false;
                });
            });
          });
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
