/**
 * actividades.js — Lógica del formulario de registro de actividades.
 * Maneja el constructor dinámico de horarios, la vista previa de archivos
 * y la validación completa del formulario.
 */

var v = window.validacion;
var store = window.dccStore;

/* ── Referencias al DOM ──────────────────────────────────── */

var form = document.getElementById('form-actividad');
var selectMiembro = document.getElementById('miembro-selector');
var avisaSinMiembros = document.getElementById('aviso-sin-miembros');
var mensajeEstado = document.getElementById('mensaje-estado');
var listaHorarios = document.getElementById('lista-horarios');
var errorHorarios = document.getElementById('error-horarios');
var btnAgregarHorario = document.getElementById('btn-agregar-horario');
var inputArchivos = document.getElementById('archivos-media');
var previewArchivos = document.getElementById('preview-archivos');
var btnLimpiar = document.getElementById('btn-limpiar');

var DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
var horarioCount = 0;

/* ── Poblar selector de miembros ────────────────────────── */

function cargarMiembros() {
  while (selectMiembro.options.length > 1) {
    selectMiembro.remove(1);
  }

  var members = store.members;

  if (members.length === 0) {
    avisaSinMiembros.style.display = '';
    form.style.display = 'none';
    return;
  }

  avisaSinMiembros.style.display = 'none';
  form.style.display = '';

  var tipoLabel = {
    pregrado: 'Pregrado',
    postgrado: 'Postgrado',
    funcionario: 'Funcionario/a',
    academico: 'Académico/a'
  };

  members.forEach(function (m) {
    var opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.nombre + ' (' + (tipoLabel[m.tipo] || m.tipo) + ')';
    selectMiembro.appendChild(opt);
  });
}

cargarMiembros();

/* ── Verificar límite de actividades al cambiar miembro ───── */

selectMiembro.addEventListener('change', function () {
  var miembroId = this.value;
  if (!miembroId) return;
  var limiteResult = v.limiteActividades(miembroId);
  if (!limiteResult.valid) {
    v.mostrarError(selectMiembro, limiteResult);
  } else {
    v.mostrarError(selectMiembro, { valid: true, message: '' });
  }
});

/* ── Constructor de horarios ─────────────────────────────── */

function crearFilaHorario() {
  horarioCount += 1;
  var idx = horarioCount;

  var li = document.createElement('li');
  li.className = 'horario-item';
  li.dataset.idx = idx;

  /* Selector de día */
  var campoDia = document.createElement('div');
  campoDia.className = 'campo';
  var labelDia = document.createElement('label');
  labelDia.htmlFor = 'dia-' + idx;
  labelDia.textContent = 'Día';
  var selectDia = document.createElement('select');
  selectDia.id = 'dia-' + idx;
  selectDia.name = 'dia-' + idx;
  var optDefault = document.createElement('option');
  optDefault.value = '';
  optDefault.textContent = '— Día —';
  selectDia.appendChild(optDefault);
  DIAS.forEach(function (d) {
    var opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    selectDia.appendChild(opt);
  });
  campoDia.appendChild(labelDia);
  campoDia.appendChild(selectDia);

  /* Hora de inicio */
  var campoInicio = document.createElement('div');
  campoInicio.className = 'campo campo-hora';
  var labelInicio = document.createElement('label');
  labelInicio.htmlFor = 'inicio-' + idx;
  labelInicio.textContent = 'Hora inicio';
  var inputInicio = document.createElement('input');
  inputInicio.type = 'time';
  inputInicio.id = 'inicio-' + idx;
  inputInicio.name = 'inicio-' + idx;
  campoInicio.appendChild(labelInicio);
  campoInicio.appendChild(inputInicio);

  /* Hora de fin */
  var campoFin = document.createElement('div');
  campoFin.className = 'campo campo-hora';
  var labelFin = document.createElement('label');
  labelFin.htmlFor = 'fin-' + idx;
  labelFin.textContent = 'Hora fin';
  var inputFin = document.createElement('input');
  inputFin.type = 'time';
  inputFin.id = 'fin-' + idx;
  inputFin.name = 'fin-' + idx;
  campoFin.appendChild(labelFin);
  campoFin.appendChild(inputFin);

  /* Span de error para este horario */
  var spanError = document.createElement('span');
  spanError.className = 'error';
  spanError.id = 'error-horario-' + idx;
  spanError.setAttribute('role', 'alert');

  /* Botón eliminar */
  var btnEliminar = document.createElement('button');
  btnEliminar.type = 'button';
  btnEliminar.className = 'btn-eliminar-horario';
  btnEliminar.textContent = 'Eliminar';
  btnEliminar.setAttribute('aria-label', 'Eliminar este horario');
  btnEliminar.addEventListener('click', function () {
    listaHorarios.removeChild(li);
  });

  li.appendChild(campoDia);
  li.appendChild(campoInicio);
  li.appendChild(campoFin);
  li.appendChild(spanError);
  li.appendChild(btnEliminar);

  return li;
}

btnAgregarHorario.addEventListener('click', function () {
  listaHorarios.appendChild(crearFilaHorario());
  errorHorarios.textContent = '';
});

/* Agregar un horario por defecto al cargar */
listaHorarios.appendChild(crearFilaHorario());

/* ── Vista previa de archivos ────────────────────────────── */

inputArchivos.addEventListener('change', function () {
  previewArchivos.innerHTML = '';
  var files = this.files;
  if (!files || files.length === 0) return;

  var result = v.archivoMediaObligatorio(files);
  v.mostrarError(inputArchivos, result);

  if (result.valid) {
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      var div = document.createElement('div');
      div.className = 'miniatura-archivo';

      if (f.type.indexOf('image/') === 0) {
        var img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        img.alt = 'Vista previa de ' + f.name;
        div.appendChild(img);
      } else {
        var iconoVideo = document.createElement('div');
        iconoVideo.className = 'icono-video';
        iconoVideo.textContent = '▶';
        div.appendChild(iconoVideo);
      }

      div.appendChild(document.createTextNode(f.name));
      previewArchivos.appendChild(div);
    }
  }
});

/* ── Validación al salir de los campos de texto ──────────── */

document.getElementById('titulo-actividad-input').addEventListener('blur', function () {
  v.validarCampo(this, v.minLength, [5]);
});
document.getElementById('descripcion').addEventListener('blur', function () {
  v.validarCampo(this, v.minLength, [20]);
});
document.getElementById('enlace').addEventListener('blur', function () {
  v.validarCampo(this, v.url);
});

/* ── Envío del formulario ────────────────────────────────── */

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var valid = true;

  /* Miembro */
  var memberNotEmpty = v.notEmpty(selectMiembro.value);
  valid = v.mostrarError(selectMiembro, memberNotEmpty) && valid;

  /* Límite de actividades por miembro */
  if (memberNotEmpty.valid) {
    valid = v.mostrarError(
      selectMiembro,
      v.limiteActividades(selectMiembro.value)
    ) && valid;
  }

  /* Título */
  valid = v.mostrarError(
    document.getElementById('titulo-actividad-input'),
    v.minLength(document.getElementById('titulo-actividad-input').value, 5)
  ) && valid;

  /* Categoría */
  valid = v.mostrarError(
    document.getElementById('categoria'),
    v.notEmpty(document.getElementById('categoria').value)
  ) && valid;

  /* Descripción */
  valid = v.mostrarError(
    document.getElementById('descripcion'),
    v.minLength(document.getElementById('descripcion').value, 20)
  ) && valid;

  /* Horarios */
  var slots = listaHorarios.querySelectorAll('.horario-item');
  if (slots.length === 0) {
    errorHorarios.textContent = 'Debes agregar al menos un horario.';
    valid = false;
  } else {
    errorHorarios.textContent = '';
    var horariosValidos = true;
    slots.forEach(function (slot) {
      var idx = slot.dataset.idx;
      var dia = document.getElementById('dia-' + idx);
      var inicio = document.getElementById('inicio-' + idx);
      var fin = document.getElementById('fin-' + idx);
      var spanErr = document.getElementById('error-horario-' + idx);

      var diaResult = v.notEmpty(dia ? dia.value : '');
      if (!diaResult.valid) {
        if (spanErr) spanErr.textContent = 'Seleccione un día.';
        horariosValidos = false;
      } else {
        var slotResult = v.horarioSlot(
          inicio ? inicio.value : '',
          fin ? fin.value : ''
        );
        if (!slotResult.valid) {
          if (spanErr) spanErr.textContent = slotResult.message;
          horariosValidos = false;
        } else {
          if (spanErr) spanErr.textContent = '';
        }
      }
    });
    if (!horariosValidos) {
      valid = false;
    } else {
      /* Verificar traslape — solo si todos los horarios individuales son válidos */
      var slotsData = [];
      slots.forEach(function (slot) {
        var idx = slot.dataset.idx;
        slotsData.push({
          dia: document.getElementById('dia-' + idx).value,
          inicio: document.getElementById('inicio-' + idx).value,
          fin: document.getElementById('fin-' + idx).value
        });
      });
      var traslapeResult = v.sinTraslape(slotsData);
      if (!traslapeResult.valid) {
        errorHorarios.textContent = traslapeResult.message;
        valid = false;
      }
    }
  }

  /* Archivos */
  valid = v.mostrarError(
    inputArchivos,
    v.archivoMediaObligatorio(inputArchivos.files)
  ) && valid;

  /* Enlace (obligatorio) */
  var enlaceVal = document.getElementById('enlace').value.trim();
  var enlaceResult = v.notEmpty(enlaceVal);
  if (enlaceResult.valid) {
    enlaceResult = v.url(enlaceVal);
  }
  valid = v.mostrarError(document.getElementById('enlace'), enlaceResult) && valid;

  if (!valid) {
    mostrarMensaje('Por favor, corrija los errores indicados.', 'error');
    var primerError = form.querySelector('.campo-invalido');
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primerError.focus();
    }
    return;
  }

  /* Recopilar datos de horarios */
  var horarios = [];
  slots.forEach(function (slot) {
    var idx = slot.dataset.idx;
    horarios.push({
      dia: document.getElementById('dia-' + idx).value,
      inicio: document.getElementById('inicio-' + idx).value,
      fin: document.getElementById('fin-' + idx).value
    });
  });

  /* Recopilar nombres de archivos (los archivos no se almacenan, solo los nombres como referencia) */
  var archivos = [];
  for (var i = 0; i < inputArchivos.files.length; i++) {
    archivos.push(inputArchivos.files[i].name);
  }

  var activity = {
    id: store.generateId(),
    miembroId: selectMiembro.value,
    titulo: document.getElementById('titulo-actividad-input').value.trim(),
    categoria: document.getElementById('categoria').value,
    descripcion: document.getElementById('descripcion').value.trim(),
    lugar: document.getElementById('lugar').value.trim(),
    horarios: horarios,
    archivos: archivos,
    enlace: document.getElementById('enlace').value.trim(),
    fechaRegistro: new Date().toISOString()
  };

  store.activities.push(activity);

  mostrarMensaje(
    'Actividad "' + activity.titulo + '" registrada exitosamente.',
    'exito'
  );
  form.reset();
  listaHorarios.innerHTML = '';
  horarioCount = 0;
  listaHorarios.appendChild(crearFilaHorario());
  previewArchivos.innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Limpiar formulario ──────────────────────────────────── */

btnLimpiar.addEventListener('click', function () {
  listaHorarios.innerHTML = '';
  horarioCount = 0;
  listaHorarios.appendChild(crearFilaHorario());
  previewArchivos.innerHTML = '';
  errorHorarios.textContent = '';
  form.querySelectorAll('.campo-invalido').forEach(function (el) {
    el.classList.remove('campo-invalido');
    el.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('span.error').forEach(function (el) {
    el.textContent = '';
  });
  mensajeEstado.style.display = 'none';
});

/* ── Mensaje de estado (éxito o error) ───────────────────── */

function mostrarMensaje(texto, tipo) {
  mensajeEstado.textContent = texto;
  mensajeEstado.className = 'alerta alerta-' + (tipo === 'exito' ? 'exito' : 'error');
  mensajeEstado.style.display = '';
  mensajeEstado.setAttribute('role', tipo === 'exito' ? 'status' : 'alert');
}
