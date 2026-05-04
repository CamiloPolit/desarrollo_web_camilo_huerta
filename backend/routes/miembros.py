from flask import Blueprint, jsonify, request
from extensions import db
from models import Miembro
from services.validacion import limpiar

PER_PAGE = 10

miembros_bp = Blueprint('miembros', __name__)


@miembros_bp.route('/miembros', methods=['GET'])
def listar():
    pagina   = max(1, request.args.get('pagina', 1, type=int))
    busqueda = limpiar(request.args.get('busqueda', ''))

    query = Miembro.query
    if busqueda:
        like  = '%{}%'.format(busqueda)
        query = query.filter(db.or_(
            Miembro.nombre.ilike(like),
            Miembro.email.ilike(like),
            Miembro.rut.ilike(like)
        ))

    query         = query.order_by(Miembro.nombre)
    total         = query.count()
    items         = query.offset((pagina - 1) * PER_PAGE).limit(PER_PAGE).all()
    total_paginas = max(1, (total + PER_PAGE - 1) // PER_PAGE)

    return jsonify({
        'total': total,
        'pagina': pagina,
        'total_paginas': total_paginas,
        'miembros': [_resumen(m) for m in items]
    })


@miembros_bp.route('/miembros/ultimos', methods=['GET'])
def ultimos():
    items = (Miembro.query
             .order_by(Miembro.fecha_registro.desc())
             .limit(5)
             .all())
    return jsonify([_resumen(m) for m in items])


@miembros_bp.route('/miembros/<int:miembro_id>', methods=['GET'])
def detalle(miembro_id):
    m = db.session.get(Miembro, miembro_id)
    if m is None:
        return jsonify({'error': 'Miembro no encontrado.'}), 404
    return jsonify(_detalle_completo(m))


# ── Serializadores ────────────────────────────────────────────

def _resumen(m):
    return {
        'id':              m.id,
        'nombre':          m.nombre,
        'rut':             m.rut,
        'tipo':            m.tipo,
        'email':           m.email,
        'telefono':        m.telefono or '',
        'comuna':          m.comuna.nombre,
        'fecha_registro':  m.fecha_registro.strftime('%d/%m/%Y %H:%M'),
    }


def _detalle_completo(m):
    datos = {
        'id':              m.id,
        'nombre':          m.nombre,
        'rut':             m.rut,
        'tipo':            m.tipo,
        'email':           m.email,
        'telefono':        m.telefono or '',
        'fecha_registro':  m.fecha_registro.strftime('%d/%m/%Y %H:%M'),
        'comuna':          m.comuna.nombre,
        'region':          m.comuna.region.nombre,
        'actividades':     [_serializar_actividad(a) for a in m.actividades],
    }

    if m.tipo == 'pregrado':
        datos['plan_estudio'] = m.plan_estudio or ''
        datos['anio_ingreso'] = m.anio_ingreso
    elif m.tipo == 'postgrado':
        datos['programa']      = m.programa or ''
        datos['anio_ingreso']  = m.anio_ingreso
        datos['profesor_guia'] = m.profesor_guia or ''
    elif m.tipo == 'funcionario':
        datos['cargo']         = m.cargo or ''
        datos['unidad']        = m.unidad or ''
        datos['tipo_contrato'] = m.tipo_contrato or ''
    elif m.tipo == 'academico':
        datos['jerarquia']          = m.jerarquia or ''
        datos['area_investigacion'] = m.area_investigacion or ''
        datos['oficina']            = m.oficina or ''

    return datos


def _serializar_actividad(a):
    return {
        'id':          a.id,
        'titulo':      a.titulo,
        'categoria':   a.categoria,
        'descripcion': a.descripcion or '',
        'lugar':       a.lugar or '',
        'enlace':      a.enlace or '',
        'horarios': [
            {'dia': h.dia, 'hora_inicio': h.hora_inicio, 'hora_fin': h.hora_fin}
            for h in a.horarios
        ],
        'fotos': [
            {'ruta': f.ruta_archivo, 'nombre': f.nombre_archivo}
            for f in a.fotos
        ],
    }
