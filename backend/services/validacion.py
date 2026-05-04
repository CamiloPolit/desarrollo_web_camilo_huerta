import re

TIPOS_VALIDOS      = {'pregrado', 'postgrado', 'funcionario', 'academico'}
CATEGORIAS_VALIDAS = {'artistica', 'deportiva', 'tecnologica', 'social', 'recreativa', 'otra'}
DIAS_VALIDOS       = {'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'}
LIMITE_ACTIVIDADES = 10


def limpiar(valor):
    return valor.strip() if valor else ''


def validar_email(email):
    return bool(re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$', email))


def validar_rut(rut):
    """Valida formato y dígito verificador del RUT chileno."""
    clean = rut.strip().replace('.', '').upper()
    if not re.match(r'^\d{6,8}-[\dK]$', clean):
        return False
    body, dv = clean.split('-')
    total, mul = 0, 2
    for c in reversed(body):
        total += int(c) * mul
        mul = 2 if mul == 7 else mul + 1
    esperado = 11 - (total % 11)
    esperado_str = '0' if esperado == 11 else 'K' if esperado == 10 else str(esperado)
    return dv == esperado_str


def validar_campos_miembro(form):
    """
    Valida los campos del formulario de registro de miembro.
    Devuelve (errores: dict, campos_tipo: dict).
    """
    errores = {}

    nombre = limpiar(form.get('nombre', ''))
    if not nombre or len(nombre) < 2:
        errores['nombre'] = 'El nombre es obligatorio (mínimo 2 caracteres).'
    elif not re.match(r'^[A-Za-záéíóúÁÉÍÓÚñÑüÜ\s]+$', nombre):
        errores['nombre'] = 'El nombre solo puede contener letras y espacios.'

    rut = limpiar(form.get('rut', '')).upper()
    if not rut:
        errores['rut'] = 'El RUT es obligatorio.'
    elif not validar_rut(rut):
        errores['rut'] = 'El RUT no es válido.'

    tipo = limpiar(form.get('tipo-miembro', ''))
    if tipo not in TIPOS_VALIDOS:
        errores['tipo'] = 'Tipo de miembro no válido.'

    email = limpiar(form.get('email', ''))
    if not email:
        errores['email'] = 'El correo electrónico es obligatorio.'
    elif not validar_email(email):
        errores['email'] = 'El correo electrónico no tiene un formato válido.'

    telefono = limpiar(form.get('telefono', ''))
    if telefono and not re.match(r'^(\+?56)?[\s-]?[2-9]\d{7,8}$', telefono.replace(' ', '')):
        errores['telefono'] = 'El teléfono no tiene un formato válido.'

    comuna_id_str = limpiar(form.get('comuna_id', ''))
    if not comuna_id_str or not comuna_id_str.isdigit():
        errores['comuna_id'] = 'Debe seleccionar una comuna.'

    campos_tipo = _validar_campos_tipo(tipo, form, errores)

    return errores, campos_tipo


def _validar_campos_tipo(tipo, form, errores):
    campos = {}

    if tipo == 'pregrado':
        plan = limpiar(form.get('plan-estudio', ''))
        anio_str = limpiar(form.get('anio-ingreso', ''))
        if not plan:
            errores['plan_estudio'] = 'El plan de estudio es obligatorio.'
        else:
            campos['plan_estudio'] = plan
        if not anio_str or not anio_str.isdigit() or not (2000 <= int(anio_str) <= 2026):
            errores['anio_ingreso'] = 'El año de ingreso debe estar entre 2000 y 2026.'
        else:
            campos['anio_ingreso'] = int(anio_str)

    elif tipo == 'postgrado':
        programa = limpiar(form.get('programa', ''))
        anio_str = limpiar(form.get('anio-ingreso-post', ''))
        if not programa:
            errores['programa'] = 'El programa es obligatorio.'
        else:
            campos['programa'] = programa
        if not anio_str or not anio_str.isdigit() or not (2000 <= int(anio_str) <= 2026):
            errores['anio_ingreso'] = 'El año de ingreso debe estar entre 2000 y 2026.'
        else:
            campos['anio_ingreso'] = int(anio_str)
        campos['profesor_guia'] = limpiar(form.get('profesor-guia', ''))

    elif tipo == 'funcionario':
        cargo = limpiar(form.get('cargo', ''))
        unidad = limpiar(form.get('unidad', ''))
        tipo_contrato = limpiar(form.get('tipo-contrato', ''))
        if not cargo:
            errores['cargo'] = 'El cargo es obligatorio.'
        else:
            campos['cargo'] = cargo
        if not unidad:
            errores['unidad'] = 'La unidad es obligatoria.'
        else:
            campos['unidad'] = unidad
        if tipo_contrato not in ('planta', 'contrata', 'honorarios'):
            errores['tipo_contrato'] = 'El tipo de contrato no es válido.'
        else:
            campos['tipo_contrato'] = tipo_contrato

    elif tipo == 'academico':
        jerarquia = limpiar(form.get('jerarquia', ''))
        area = limpiar(form.get('area-investigacion', ''))
        if jerarquia not in ('asistente', 'asociado', 'titular', 'adjunto'):
            errores['jerarquia'] = 'La jerarquía no es válida.'
        else:
            campos['jerarquia'] = jerarquia
        if not area:
            errores['area_investigacion'] = 'El área de investigación es obligatoria.'
        else:
            campos['area_investigacion'] = area
        campos['oficina'] = limpiar(form.get('oficina', ''))

    return campos


def validar_actividades(form, idx_inicio=0, requeridas=True):
    """
    Valida la lista de actividades en el form (titulo[], categoria[], etc.).
    Devuelve (errores_generales: dict, act_errores: list[dict]).
    Si requeridas=False, no falla cuando no viene ninguna actividad.
    """
    errores = {}
    titulos    = form.getlist('titulo[]')
    categorias = form.getlist('categoria[]')
    descrips   = form.getlist('descripcion[]')
    lugares    = form.getlist('lugar[]')
    enlaces    = form.getlist('enlace[]')

    if not titulos and requeridas:
        errores['actividades'] = 'Debe registrar al menos una actividad.'

    act_errores = []
    for i, titulo in enumerate(titulos):
        ae = {}
        if len(limpiar(titulo)) < 5:
            ae['titulo'] = 'El título debe tener al menos 5 caracteres.'
        cat = limpiar(categorias[i]) if i < len(categorias) else ''
        if cat not in CATEGORIAS_VALIDAS:
            ae['categoria'] = 'Categoría no válida.'
        desc = limpiar(descrips[i]) if i < len(descrips) else ''
        if len(desc) < 20:
            ae['descripcion'] = 'La descripción debe tener al menos 20 caracteres.'
        enlace = limpiar(enlaces[i]) if i < len(enlaces) else ''
        if not enlace or not re.match(r'^https?://.{3,}', enlace):
            ae['enlace'] = 'El enlace debe ser una URL válida (http:// o https://).'

        ae_horarios = _validar_horarios_actividad(form, i + idx_inicio)
        if ae_horarios:
            ae['horarios'] = ae_horarios

        act_errores.append(ae)

    return errores, act_errores


def _validar_horarios_actividad(form, idx):
    dias    = form.getlist('dia_{}[]'.format(idx))
    inicios = form.getlist('hora_inicio_{}[]'.format(idx))
    fines   = form.getlist('hora_fin_{}[]'.format(idx))

    if not dias:
        return 'Debe agregar al menos un horario.'

    for j, dia in enumerate(dias):
        if limpiar(dia) not in DIAS_VALIDOS:
            return 'Día no válido en horario {}.'.format(j + 1)
        inicio = limpiar(inicios[j]) if j < len(inicios) else ''
        fin    = limpiar(fines[j])   if j < len(fines)   else ''
        if not re.match(r'^\d{2}:\d{2}$', inicio) or not re.match(r'^\d{2}:\d{2}$', fin):
            return 'Hora inválida en horario {}.'.format(j + 1)
        if inicio >= fin:
            return 'La hora de fin debe ser posterior a la de inicio en horario {}.'.format(j + 1)

    return None
