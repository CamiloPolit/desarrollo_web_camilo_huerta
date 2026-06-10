from flask import Blueprint, jsonify, request
from extensions import db
from models.actividad import Actividad
from models.comentario import Comentario
from services.validacion import limpiar

comentarios_bp = Blueprint('comentarios', __name__)


@comentarios_bp.route('/actividades/<int:actividad_id>/comentarios', methods=['GET'])
def listar(actividad_id):
    actividad = db.session.get(Actividad, actividad_id)
    if actividad is None:
        return jsonify({'error': 'Actividad no encontrada.'}), 404

    return jsonify([
        {
            'id':     c.id,
            'nombre': c.nombre,
            'texto':  c.texto,
            'fecha':  c.fecha.strftime('%d/%m/%Y %H:%M'),
        }
        for c in actividad.comentarios
    ])


@comentarios_bp.route('/actividades/<int:actividad_id>/comentarios', methods=['POST'])
def agregar(actividad_id):
    actividad = db.session.get(Actividad, actividad_id)
    if actividad is None:
        return jsonify({'error': 'Actividad no encontrada.'}), 404

    datos = request.get_json(silent=True) or {}
    nombre = limpiar(datos.get('nombre', ''))
    texto  = limpiar(datos.get('texto', ''))

    errores = {}
    if len(nombre) < 3:
        errores['nombre'] = 'El nombre debe tener al menos 3 caracteres.'
    if len(nombre) > 80:
        errores['nombre'] = 'El nombre no puede superar los 80 caracteres.'
    if len(texto) < 5:
        errores['texto'] = 'El comentario debe tener al menos 5 caracteres.'
    if len(texto) > 300:
        errores['texto'] = 'El comentario no puede superar los 300 caracteres.'

    if errores:
        return jsonify({'errores': errores}), 422

    comentario = Comentario(
        nombre=nombre,
        texto=texto,
        actividad_id=actividad_id,
    )
    db.session.add(comentario)
    db.session.commit()

    return jsonify({
        'id':     comentario.id,
        'nombre': comentario.nombre,
        'texto':  comentario.texto,
        'fecha':  comentario.fecha.strftime('%d/%m/%Y %H:%M'),
    }), 201
