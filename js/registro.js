/**
 * registro.js — Lógica del formulario de registro de miembros.
 * Maneja los campos dinámicos por tipo y la validación completa del formulario.
 */

var v = window.validacion;
var store = window.dccStore;

/* ── Referencias al DOM ──────────────────────────────────── */

var form = document.getElementById('form-registro');
var selectTipo = document.getElementById('tipo-miembro');
var mensajeEstado = document.getElementById('mensaje-estado');
var btnLimpiar = document.getElementById('btn-limpiar');

/* ── Campos específicos por tipo de miembro ──────────────── */

var TIPOS = ['pregrado', 'postgrado', 'funcionario', 'academico'];

function mostrarCamposTipo(tipo) {
  TIPOS.forEach(function (t) {
    var fs = document.getElementById('campos-' + t);
    if (!fs) return;
    if (t === tipo) {
      fs.classList.remove('oculto');
    } else {
      fs.classList.add('oculto');
    }
  });
}

selectTipo.addEventListener('change', function () {
  mostrarCamposTipo(this.value);
});

/* ── Validación al salir de cada campo (blur) ────────────── */

function validarAlSalir(inputId, fn, args) {
  var el = document.getElementById(inputId);
  if (!el) return;
  el.addEventListener('blur', function () {
    v.validarCampo(el, fn, args);
  });
}

validarAlSalir('nombre', v.onlyLettersSpaces);
validarAlSalir('rut', v.rut);
validarAlSalir('email', v.email);
validarAlSalir('telefono', v.telefono);
validarAlSalir('plan-estudio', v.notEmpty);
validarAlSalir('cargo', v.notEmpty);
validarAlSalir('unidad', v.notEmpty);
validarAlSalir('area-investigacion', v.notEmpty);

/* ── Validación completa al enviar el formulario ─────────── */

form.addEventListener('submit', function (e) {
  e.preventDefault();
  var valid = true;

  /* Campos comunes a todos los tipos */
  valid = v.mostrarError(
    document.getElementById('nombre'),
    v.onlyLettersSpaces(document.getElementById('nombre').value)
  ) && valid;

  valid = v.mostrarError(
    document.getElementById('rut'),
    v.rut(document.getElementById('rut').value)
  ) && valid;

  /* Verificar que el RUT no esté ya registrado */
  var rutVal = document.getElementById('rut').value;
  var rutValid = v.rut(rutVal);
  if (rutValid.valid) {
    valid = v.mostrarError(
      document.getElementById('rut'),
      v.rutUnico(rutVal)
    ) && valid;
  }

  valid = v.mostrarError(
    document.getElementById('tipo-miembro'),
    v.notEmpty(selectTipo.value)
  ) && valid;

  valid = v.mostrarError(
    document.getElementById('email'),
    v.email(document.getElementById('email').value)
  ) && valid;

  valid = v.mostrarError(
    document.getElementById('telefono'),
    v.telefono(document.getElementById('telefono').value)
  ) && valid;

  /* Campos específicos según el tipo seleccionado */
  var tipo = selectTipo.value;

  if (tipo === 'pregrado') {
    valid = v.mostrarError(
      document.getElementById('plan-estudio'),
      v.notEmpty(document.getElementById('plan-estudio').value)
    ) && valid;
    valid = v.mostrarError(
      document.getElementById('anio-ingreso-pre'),
      v.anio(document.getElementById('anio-ingreso-pre').value, 2000, 2026)
    ) && valid;
  }

  if (tipo === 'postgrado') {
    valid = v.mostrarError(
      document.getElementById('programa'),
      v.notEmpty(document.getElementById('programa').value)
    ) && valid;
    valid = v.mostrarError(
      document.getElementById('anio-ingreso-post'),
      v.anio(document.getElementById('anio-ingreso-post').value, 2000, 2026)
    ) && valid;
  }

  if (tipo === 'funcionario') {
    valid = v.mostrarError(
      document.getElementById('cargo'),
      v.notEmpty(document.getElementById('cargo').value)
    ) && valid;
    valid = v.mostrarError(
      document.getElementById('unidad'),
      v.notEmpty(document.getElementById('unidad').value)
    ) && valid;
    valid = v.mostrarError(
      document.getElementById('tipo-contrato'),
      v.notEmpty(document.getElementById('tipo-contrato').value)
    ) && valid;
  }

  if (tipo === 'academico') {
    valid = v.mostrarError(
      document.getElementById('jerarquia'),
      v.notEmpty(document.getElementById('jerarquia').value)
    ) && valid;
    valid = v.mostrarError(
      document.getElementById('area-investigacion'),
      v.notEmpty(document.getElementById('area-investigacion').value)
    ) && valid;
  }

  if (!valid) {
    mostrarMensaje('Por favor, corrija los errores indicados en el formulario.', 'error');
    /* Desplazar hasta el primer campo con error */
    var primerError = form.querySelector('.campo-invalido');
    if (primerError) {
      primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      primerError.focus();
    }
    return;
  }

  /* Construir el objeto miembro con los datos del formulario */
  var member = {
    id: store.generateId(),
    nombre: document.getElementById('nombre').value.trim(),
    rut: document.getElementById('rut').value.trim().toUpperCase(),
    tipo: tipo,
    email: document.getElementById('email').value.trim().toLowerCase(),
    telefono: document.getElementById('telefono').value.trim(),
    fechaRegistro: new Date().toISOString()
  };

  if (tipo === 'pregrado') {
    member.planEstudio = document.getElementById('plan-estudio').value;
    member.anioIngreso = parseInt(document.getElementById('anio-ingreso-pre').value, 10);
  }
  if (tipo === 'postgrado') {
    member.programa = document.getElementById('programa').value;
    member.anioIngreso = parseInt(document.getElementById('anio-ingreso-post').value, 10);
    member.profesorGuia = document.getElementById('profesor-guia').value.trim();
  }
  if (tipo === 'funcionario') {
    member.cargo = document.getElementById('cargo').value.trim();
    member.unidad = document.getElementById('unidad').value.trim();
    member.tipoContrato = document.getElementById('tipo-contrato').value;
  }
  if (tipo === 'academico') {
    member.jerarquia = document.getElementById('jerarquia').value;
    member.areaInvestigacion = document.getElementById('area-investigacion').value.trim();
    member.oficina = document.getElementById('oficina').value.trim();
  }

  store.members.push(member);

  mostrarMensaje(
    'Miembro "' + member.nombre + '" registrado exitosamente. ' +
    'ID: ' + member.id,
    'exito'
  );
  form.reset();
  mostrarCamposTipo('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ── Limpiar formulario ──────────────────────────────────── */

btnLimpiar.addEventListener('click', function () {
  mostrarCamposTipo('');
  /* Eliminar todos los mensajes de error visibles */
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
