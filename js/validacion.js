/**
 * validacion.js — Funciones de validación de campos y formularios.
 * Retorna { valid: bool, message: string }.
 * NO se usa el atributo `required` de HTML — toda la validación se realiza aquí.
 */

var validacion = {};

/* ── Validaciones básicas ────────────────────────────────── */

validacion.notEmpty = function (value) {
  if (!value || value.trim().length === 0) {
    return { valid: false, message: 'Este campo es obligatorio.' };
  }
  return { valid: true, message: '' };
};

validacion.minLength = function (value, min) {
  var result = validacion.notEmpty(value);
  if (!result.valid) return result;
  if (value.trim().length < min) {
    return { valid: false, message: 'Debe tener al menos ' + min + ' caracteres.' };
  }
  return { valid: true, message: '' };
};

validacion.onlyLettersSpaces = function (value) {
  var result = validacion.notEmpty(value);
  if (!result.valid) return result;
  if (!/^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value.trim())) {
    return { valid: false, message: 'Solo se permiten letras y espacios.' };
  }
  return { valid: true, message: '' };
};

/* ── RUT chileno ─────────────────────────────────────────── */

validacion.rut = function (value) {
  var result = validacion.notEmpty(value);
  if (!result.valid) return result;

  var clean = value.trim().replace(/\./g, '').toUpperCase();
  if (!/^\d{6,8}-[\dK]$/.test(clean)) {
    return { valid: false, message: 'Formato de RUT inválido (ej: 12345678-9).' };
  }

  var parts = clean.split('-');
  var body = parts[0];
  var dv = parts[1];

  /* Cálculo del dígito verificador */
  var sum = 0;
  var mul = 2;
  for (var i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  var expected = 11 - (sum % 11);
  var expectedStr = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);

  if (dv !== expectedStr) {
    return { valid: false, message: 'El dígito verificador del RUT es incorrecto.' };
  }
  return { valid: true, message: '' };
};

/* ── Correo electrónico ──────────────────────────────────── */

validacion.email = function (value) {
  var result = validacion.notEmpty(value);
  if (!result.valid) return result;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())) {
    return { valid: false, message: 'Correo electrónico inválido.' };
  }
  return { valid: true, message: '' };
};

/* ── Teléfono (opcional, pero si se ingresa debe ser válido) */

validacion.telefono = function (value) {
  if (!value || value.trim().length === 0) return { valid: true, message: '' };
  if (!/^(\+?56)?[\s-]?[2-9]\d{7,8}$/.test(value.trim().replace(/\s/g, ''))) {
    return { valid: false, message: 'Teléfono inválido (ej: +56912345678 o 22345678).' };
  }
  return { valid: true, message: '' };
};

/* ── Año ─────────────────────────────────────────────────── */

validacion.anio = function (value, min, max) {
  var result = validacion.notEmpty(value);
  if (!result.valid) return result;
  var n = parseInt(value, 10);
  if (isNaN(n) || n < min || n > max) {
    return { valid: false, message: 'Año debe estar entre ' + min + ' y ' + max + '.' };
  }
  return { valid: true, message: '' };
};

/* ── URL (opcional, pero si se ingresa debe ser válida) ──── */

validacion.url = function (value) {
  if (!value || value.trim().length === 0) return { valid: true, message: '' };
  if (!/^https?:\/\/.{3,}/.test(value.trim())) {
    return { valid: false, message: 'URL inválida (debe comenzar con http:// o https://).' };
  }
  return { valid: true, message: '' };
};

/* ── Archivos multimedia ─────────────────────────────────── */

validacion.archivoMediaObligatorio = function (files) {
  if (!files || files.length === 0) {
    return { valid: false, message: 'Debe adjuntar al menos un archivo (foto o video).' };
  }
  var permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp',
                    'video/mp4', 'video/webm', 'video/ogg'];
  var maxBytes = 50 * 1024 * 1024;
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    if (permitidos.indexOf(f.type) === -1) {
      return { valid: false, message: 'Archivo "' + f.name + '" no es una imagen o video válido.' };
    }
    if (f.size > maxBytes) {
      return { valid: false, message: 'Archivo "' + f.name + '" supera los 50 MB.' };
    }
  }
  return { valid: true, message: '' };
};

validacion.fotoPerfilOpcional = function (files) {
  if (!files || files.length === 0) return { valid: true, message: '' };
  var permitidos = ['image/jpeg', 'image/png', 'image/webp'];
  var f = files[0];
  if (permitidos.indexOf(f.type) === -1) {
    return { valid: false, message: 'La foto debe ser JPG, PNG o WEBP.' };
  }
  if (f.size > 5 * 1024 * 1024) {
    return { valid: false, message: 'La foto no debe superar los 5 MB.' };
  }
  return { valid: true, message: '' };
};

/* ── Horario individual ──────────────────────────────────── */

validacion.horarioSlot = function (horaInicio, horaFin) {
  var result = validacion.notEmpty(horaInicio);
  if (!result.valid) return { valid: false, message: 'Debe ingresar hora de inicio.' };
  result = validacion.notEmpty(horaFin);
  if (!result.valid) return { valid: false, message: 'Debe ingresar hora de fin.' };
  if (horaInicio >= horaFin) {
    return { valid: false, message: 'La hora de fin debe ser posterior a la de inicio.' };
  }
  return { valid: true, message: '' };
};

/* ── RUT único en el sistema ─────────────────────────────── */

validacion.rutUnico = function (rut, excludeId) {
  var members = window.dccStore ? window.dccStore.members : [];
  var clean = rut.trim().replace(/\./g, '').toUpperCase();
  for (var i = 0; i < members.length; i++) {
    if (members[i].id !== excludeId &&
        members[i].rut.replace(/\./g, '').toUpperCase() === clean) {
      return { valid: false, message: 'Este RUT ya está registrado en el sistema.' };
    }
  }
  return { valid: true, message: '' };
};

/* ── Límite de actividades por miembro ──────────────────── */

/**
 * Máximo de actividades por miembro: 10.
 * Justificación: un número mayor indicaría datos poco confiables
 * o un uso indebido del sistema; 10 es un límite razonable para
 * actividades extracurriculares reales.
 */
validacion.LIMITE_ACTIVIDADES = 10;

validacion.limiteActividades = function (miembroId) {
  var activities = window.dccStore ? window.dccStore.activities : [];
  var count = 0;
  for (var i = 0; i < activities.length; i++) {
    if (activities[i].miembroId === miembroId) count++;
  }
  if (count >= validacion.LIMITE_ACTIVIDADES) {
    return {
      valid: false,
      message: 'Este miembro ya tiene ' + validacion.LIMITE_ACTIVIDADES +
               ' actividades registradas (límite máximo).'
    };
  }
  return { valid: true, message: '' };
};

/* ── Traslape de horarios dentro de una actividad ────────── */

/**
 * Verifica que los bloques horarios de una actividad no se superpongan.
 * @param {Array} slots  - [{ dia, inicio, fin }, ...]
 */
validacion.sinTraslape = function (slots) {
  for (var i = 0; i < slots.length; i++) {
    for (var j = i + 1; j < slots.length; j++) {
      if (slots[i].dia === slots[j].dia) {
        /* Hay superposición si [a.inicio, a.fin) intersecta con [b.inicio, b.fin) */
        if (slots[i].inicio < slots[j].fin && slots[j].inicio < slots[i].fin) {
          return {
            valid: false,
            message: 'Los horarios del día ' + slots[i].dia +
                     ' se solapan (' + slots[i].inicio + '\u2013' + slots[i].fin +
                     ' y ' + slots[j].inicio + '\u2013' + slots[j].fin + ').'
          };
        }
      }
    }
  }
  return { valid: true, message: '' };
};

/* ── Utilidades de interfaz ──────────────────────────────── */

/**
 * Muestra o limpia el mensaje de error asociado a un campo.
 * @param {HTMLElement} input  - El elemento input/select/textarea
 * @param {object}      result - { valid, message }
 */
validacion.mostrarError = function (input, result) {
  var errorId = input.id + '-error';
  var errorEl = document.getElementById(errorId);

  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.id = errorId;
    errorEl.setAttribute('role', 'alert');
    errorEl.className = 'error';
    input.parentNode.insertBefore(errorEl, input.nextSibling);
  }

  if (result.valid) {
    errorEl.textContent = '';
    input.classList.remove('campo-invalido');
    input.removeAttribute('aria-invalid');
  } else {
    errorEl.textContent = result.message;
    input.classList.add('campo-invalido');
    input.setAttribute('aria-invalid', 'true');
  }
  return result.valid;
};

/**
 * Valida un campo individual y muestra su error.
 * @param {HTMLElement} input
 * @param {function}    fn    - función de validacion.*
 * @param {Array}       args  - argumentos adicionales para fn (después del valor)
 */
validacion.validarCampo = function (input, fn, args) {
  var value = input.value;
  var extraArgs = args || [];
  var result = fn.apply(null, [value].concat(extraArgs));
  return validacion.mostrarError(input, result);
};

window.validacion = validacion;
