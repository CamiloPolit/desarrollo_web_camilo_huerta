/**
 * miembros.js — Listado de miembros con paginación, filtros y ordenamiento.
 */

var store = window.dccStore;

/* ── Referencias al DOM ──────────────────────────────────── */

var selectFiltroTipo = document.getElementById('filtro-tipo');
var selectOrden = document.getElementById('orden');
var inputBusqueda = document.getElementById('busqueda');
var cuerpoTabla = document.getElementById('cuerpo-tabla');
var paginacion = document.getElementById('paginacion');
var conteoResultados = document.getElementById('conteo-resultados');

/* Modal de detalle */
var overlayModal = document.getElementById('overlay-modal');
var tituloModal = document.getElementById('titulo-modal');
var contenidoModal = document.getElementById('contenido-modal');
var listaActividadesModal = document.getElementById('lista-actividades-modal');
var btnCerrarModal = document.getElementById('btn-cerrar-modal');

/* ── Estado de la vista ──────────────────────────────────── */

var PAGE_SIZE = 10;

var estado = {
  pagina: 1,
  filtroTipo: 'todos',
  orden: 'nombre-asc',
  busqueda: ''
};

/* ── Etiquetas de tipo ───────────────────────────────────── */

var TIPO_LABEL = {
  pregrado: 'Pregrado',
  postgrado: 'Postgrado',
  funcionario: 'Funcionario/a',
  academico: 'Académico/a'
};

/* ── Pipeline de filtrado y ordenamiento ────────────────── */

function obtenerMiembrosFiltrados() {
  var lista = store.members.slice();

  /* Filtrar por tipo */
  if (estado.filtroTipo !== 'todos') {
    lista = lista.filter(function (m) {
      return m.tipo === estado.filtroTipo;
    });
  }

  /* Filtrar por búsqueda de texto */
  var q = estado.busqueda.trim().toLowerCase();
  if (q.length > 0) {
    lista = lista.filter(function (m) {
      return (
        m.nombre.toLowerCase().indexOf(q) !== -1 ||
        m.email.toLowerCase().indexOf(q) !== -1 ||
        m.rut.toLowerCase().indexOf(q) !== -1
      );
    });
  }

  /* Ordenar */
  lista.sort(function (a, b) {
    switch (estado.orden) {
      case 'nombre-asc':
        return a.nombre.localeCompare(b.nombre, 'es');
      case 'nombre-desc':
        return b.nombre.localeCompare(a.nombre, 'es');
      case 'email-asc':
        return a.email.localeCompare(b.email, 'es');
      case 'tipo-asc':
        return (TIPO_LABEL[a.tipo] || '').localeCompare(TIPO_LABEL[b.tipo] || '', 'es');
      default:
        return 0;
    }
  });

  return lista;
}

/* ── Renderizar tabla ────────────────────────────────────── */

function renderizarTabla(lista) {
  cuerpoTabla.innerHTML = '';

  if (lista.length === 0) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    td.colSpan = 6;
    td.className = 'sin-resultados';
    td.innerHTML = '<p>No se encontraron miembros con los criterios seleccionados.</p>';
    tr.appendChild(td);
    cuerpoTabla.appendChild(tr);
    return;
  }

  var inicio = (estado.pagina - 1) * PAGE_SIZE;
  var fin = Math.min(inicio + PAGE_SIZE, lista.length);
  var pagina = lista.slice(inicio, fin);

  pagina.forEach(function (m) {
    var tr = document.createElement('tr');

    /* Columna: Nombre */
    var tdNombre = document.createElement('td');
    tdNombre.textContent = m.nombre;
    tr.appendChild(tdNombre);

    /* Columna: RUT */
    var tdRut = document.createElement('td');
    tdRut.textContent = m.rut;
    tr.appendChild(tdRut);

    /* Columna: Tipo */
    var tdTipo = document.createElement('td');
    tdTipo.className = 'celda-tipo';
    var span = document.createElement('span');
    span.className = 'etiqueta-tipo tipo-' + m.tipo;
    span.textContent = TIPO_LABEL[m.tipo] || m.tipo;
    tdTipo.appendChild(span);
    tr.appendChild(tdTipo);

    /* Columna: Correo */
    var tdEmail = document.createElement('td');
    var enlaceEmail = document.createElement('a');
    enlaceEmail.href = 'mailto:' + m.email;
    enlaceEmail.textContent = m.email;
    tdEmail.appendChild(enlaceEmail);
    tr.appendChild(tdEmail);

    /* Columna: Teléfono */
    var tdTel = document.createElement('td');
    tdTel.textContent = m.telefono || '—';
    tr.appendChild(tdTel);

    /* Columna: Acciones */
    var tdAcc = document.createElement('td');
    var btnVer = document.createElement('button');
    btnVer.type = 'button';
    btnVer.className = 'btn-ver-detalle';
    btnVer.textContent = 'Ver detalle';
    btnVer.setAttribute('aria-label', 'Ver detalle de ' + m.nombre);
    btnVer.addEventListener('click', function () {
      abrirModal(m);
    });
    tdAcc.appendChild(btnVer);
    tr.appendChild(tdAcc);

    cuerpoTabla.appendChild(tr);
  });
}

/* ── Renderizar paginación ───────────────────────────────── */

function renderizarPaginacion(total) {
  paginacion.innerHTML = '';
  var totalPaginas = Math.ceil(total / PAGE_SIZE);
  if (totalPaginas <= 1) return;

  function crearBtn(texto, pagina, activo, deshabilitado) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-pagina' + (activo ? ' activo' : '');
    btn.textContent = texto;
    btn.disabled = deshabilitado || false;
    if (!activo && !deshabilitado) {
      btn.addEventListener('click', function () {
        estado.pagina = pagina;
        renderizar();
        document.getElementById('contenido-principal').scrollIntoView({ behavior: 'smooth' });
      });
    }
    return btn;
  }

  paginacion.appendChild(
    crearBtn('‹ Anterior', estado.pagina - 1, false, estado.pagina === 1)
  );

  for (var i = 1; i <= totalPaginas; i++) {
    paginacion.appendChild(crearBtn(i, i, i === estado.pagina, false));
  }

  paginacion.appendChild(
    crearBtn('Siguiente ›', estado.pagina + 1, false, estado.pagina === totalPaginas)
  );
}

/* ── Renderizado principal ───────────────────────────────── */

function renderizar() {
  var lista = obtenerMiembrosFiltrados();
  var total = lista.length;

  conteoResultados.textContent = total === 0
    ? 'No se encontraron miembros.'
    : 'Mostrando ' + Math.min((estado.pagina - 1) * PAGE_SIZE + 1, total) +
      '–' + Math.min(estado.pagina * PAGE_SIZE, total) +
      ' de ' + total + ' miembro' + (total !== 1 ? 's' : '') + '.';

  renderizarTabla(lista);
  renderizarPaginacion(total);
}

/* ── Listeners ─────────────────────────────── */

selectFiltroTipo.addEventListener('change', function () {
  estado.filtroTipo = this.value;
  estado.pagina = 1;
  renderizar();
});

selectOrden.addEventListener('change', function () {
  estado.orden = this.value;
  estado.pagina = 1;
  renderizar();
});

var busquedaTimer;
inputBusqueda.addEventListener('input', function () {
  clearTimeout(busquedaTimer);
  var valor = this.value;
  busquedaTimer = setTimeout(function () {
    estado.busqueda = valor;
    estado.pagina = 1;
    renderizar();
  }, 280);
});

/* ── Modal de detalle del miembro ───────────────────────── */

function abrirModal(m) {
  tituloModal.textContent = m.nombre;
  contenidoModal.innerHTML = '';

  function agregarCampo(etiqueta, valor) {
    if (!valor && valor !== 0) return;
    var dt = document.createElement('dt');
    dt.textContent = etiqueta;
    var dd = document.createElement('dd');
    dd.textContent = valor;
    contenidoModal.appendChild(dt);
    contenidoModal.appendChild(dd);
  }

  agregarCampo('RUT', m.rut);
  agregarCampo('Tipo', TIPO_LABEL[m.tipo] || m.tipo);
  agregarCampo('Correo electrónico', m.email);
  agregarCampo('Teléfono', m.telefono || 'No informado');
  agregarCampo('Fecha de registro', new Date(m.fechaRegistro).toLocaleDateString('es-CL'));

  if (m.tipo === 'pregrado') {
    var PLAN_LABEL = {
      'plan-comun': 'Plan Común',
      'ing-civil-computacion': 'Ingeniería Civil en Computación'
    };
    agregarCampo('Plan de estudio activo', PLAN_LABEL[m.planEstudio] || m.planEstudio);
    agregarCampo('Año de ingreso', m.anioIngreso);
  }
  if (m.tipo === 'postgrado') {
    agregarCampo('Programa', m.programa);
    agregarCampo('Año de ingreso', m.anioIngreso);
    agregarCampo('Profesor guía', m.profesorGuia || 'No informado');
  }
  if (m.tipo === 'funcionario') {
    agregarCampo('Cargo', m.cargo);
    agregarCampo('Unidad', m.unidad);
    agregarCampo('Tipo de contrato', m.tipoContrato);
  }
  if (m.tipo === 'academico') {
    agregarCampo('Jerarquía', m.jerarquia);
    agregarCampo('Área de investigación', m.areaInvestigacion);
    agregarCampo('Oficina', m.oficina || 'No informada');
  }

  /* Actividades del miembro */
  listaActividadesModal.innerHTML = '';
  var acts = store.activities.filter(function (a) {
    return a.miembroId === m.id;
  });

  if (acts.length === 0) {
    var li = document.createElement('li');
    li.textContent = 'No ha registrado actividades aún.';
    listaActividadesModal.appendChild(li);
  } else {
    acts.forEach(function (a) {
      var li = document.createElement('li');
      li.style.marginBottom = '0.35rem';
      li.textContent = a.titulo + ' (' + a.categoria + ')';
      listaActividadesModal.appendChild(li);
    });
  }

  overlayModal.classList.add('visible');
  overlayModal.setAttribute('aria-hidden', 'false');
  btnCerrarModal.focus();
}

function cerrarModal() {
  overlayModal.classList.remove('visible');
  overlayModal.setAttribute('aria-hidden', 'true');
}

btnCerrarModal.addEventListener('click', cerrarModal);

overlayModal.addEventListener('click', function (e) {
  if (e.target === overlayModal) cerrarModal();
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && overlayModal.classList.contains('visible')) {
    cerrarModal();
  }
});

/* ── Renderizado inicial ─────────────────────────────────── */

renderizar();
