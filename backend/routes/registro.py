from datetime import datetime
from flask import Blueprint, jsonify, request
from extensions import db
from models import Miembro, Actividad, Horario, Foto, Comuna
from services.validacion import (
    limpiar, validar_campos_miembro, validar_actividades,
    LIMITE_ACTIVIDADES
)
from services.archivos import allowed_file, guardar_archivo

registro_bp = Blueprint('registro', __name__)


@registro_bp.route('/registro', methods=['OPTIONS'])
def registro_options():
    return '', 204


@registro_bp.route('/registro', methods=['POST'])
def registro():
    errores, campos_tipo = validar_campos_miembro(request.form)

    # Verificar unicidad del RUT solo si el formato ya es válido
    rut = limpiar(request.form.get('rut', '')).upper()
    if 'rut' not in errores and Miembro.query.filter_by(rut=rut).first():
        errores['rut'] = 'Este RUT ya está registrado.'

    # Verificar que la comuna existe en la BD
    comuna_id_str = limpiar(request.form.get('comuna_id', ''))
    if 'comuna_id' not in errores:
        if not db.session.get(Comuna, int(comuna_id_str)):
            errores['comuna_id'] = 'La comuna seleccionada no existe.'

    act_errores_gen, act_errores = validar_actividades(request.form, requeridas=False)
    errores.update(act_errores_gen)

    if errores or any(ae for ae in act_errores):
        return jsonify({'ok': False, 'errores': errores, 'act_errores': act_errores}), 422

    try:
        miembro = Miembro(
            nombre=limpiar(request.form.get('nombre', '')),
            rut=rut,
            tipo=limpiar(request.form.get('tipo-miembro', '')),
            email=limpiar(request.form.get('email', '')),
            telefono=limpiar(request.form.get('telefono', '')),
            fecha_registro=datetime.now(),
            comuna_id=int(comuna_id_str),
            **campos_tipo
        )
        db.session.add(miembro)
        db.session.flush()

        _insertar_actividades(miembro.id, request.form, request.files)
        db.session.commit()

        return jsonify({'ok': True, 'mensaje': 'Miembro "{}" registrado exitosamente.'.format(miembro.nombre)})

    except Exception:
        db.session.rollback()
        return jsonify({'ok': False, 'errores': {'general': 'Error interno al guardar los datos.'}}), 500


@registro_bp.route('/actividad', methods=['OPTIONS'])
def actividad_options():
    return '', 204


@registro_bp.route('/actividad', methods=['POST'])
def registrar_actividad():
    errores = {}

    miembro_id_str = limpiar(request.form.get('miembro_id', ''))
    if not miembro_id_str or not miembro_id_str.isdigit():
        errores['miembro_id'] = 'Debe indicar un miembro válido.'
    else:
        miembro_obj = db.session.get(Miembro, int(miembro_id_str))
        if not miembro_obj:
            errores['miembro_id'] = 'El miembro indicado no existe.'
        elif len(miembro_obj.actividades) >= LIMITE_ACTIVIDADES:
            errores['miembro_id'] = 'Este miembro ya alcanzó el límite de {} actividades.'.format(LIMITE_ACTIVIDADES)

    act_errores_gen, act_errores = validar_actividades(request.form)
    errores.update(act_errores_gen)

    if errores or any(ae for ae in act_errores):
        return jsonify({'ok': False, 'errores': errores, 'act_errores': act_errores}), 422

    try:
        _insertar_actividades(int(miembro_id_str), request.form, request.files)
        db.session.commit()
        return jsonify({'ok': True, 'mensaje': 'Actividad registrada exitosamente.'})

    except Exception:
        db.session.rollback()
        return jsonify({'ok': False, 'errores': {'general': 'Error interno al guardar la actividad.'}}), 500


# ── Helper compartido ─────────────────────────────────────────

def _insertar_actividades(miembro_id, form, files):
    titulos    = form.getlist('titulo[]')
    categorias = form.getlist('categoria[]')
    descrips   = form.getlist('descripcion[]')
    lugares    = form.getlist('lugar[]')
    enlaces    = form.getlist('enlace[]')

    for i, titulo in enumerate(titulos):
        actividad = Actividad(
            miembro_id=miembro_id,
            titulo=limpiar(titulo),
            categoria=limpiar(categorias[i]) if i < len(categorias) else '',
            descripcion=limpiar(descrips[i]) if i < len(descrips) else '',
            lugar=limpiar(lugares[i])        if i < len(lugares)    else '',
            enlace=limpiar(enlaces[i])       if i < len(enlaces)    else '',
            fecha_registro=datetime.now()
        )
        db.session.add(actividad)
        db.session.flush()

        dias    = form.getlist('dia_{}[]'.format(i))
        inicios = form.getlist('hora_inicio_{}[]'.format(i))
        fines   = form.getlist('hora_fin_{}[]'.format(i))
        for j, dia in enumerate(dias):
            db.session.add(Horario(
                actividad_id=actividad.id,
                dia=limpiar(dia),
                hora_inicio=limpiar(inicios[j]) if j < len(inicios) else '',
                hora_fin=limpiar(fines[j])      if j < len(fines)   else ''
            ))

        for archivo in files.getlist('fotos_{}[]'.format(i)):
            if archivo and archivo.filename and allowed_file(archivo.filename):
                nombre_original, ruta = guardar_archivo(archivo)
                db.session.add(Foto(
                    actividad_id=actividad.id,
                    nombre_archivo=nombre_original,
                    ruta_archivo=ruta
                ))
