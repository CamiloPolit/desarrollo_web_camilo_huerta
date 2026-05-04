import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename


def allowed_file(filename):
    extensiones = current_app.config.get('ALLOWED_EXTENSIONS', set())
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in extensiones


def guardar_archivo(archivo):
    """
    Guarda el archivo en UPLOAD_FOLDER con nombre único (UUID).
    Devuelve (nombre_original, ruta_relativa) o lanza excepción si no es permitido.
    """
    if not archivo or not archivo.filename:
        raise ValueError('Archivo inválido.')
    if not allowed_file(archivo.filename):
        raise ValueError('Extensión no permitida: {}'.format(archivo.filename))

    ext = archivo.filename.rsplit('.', 1)[1].lower()
    nombre_unico = '{}.{}'.format(uuid.uuid4(), ext)
    destino = os.path.join(current_app.config['UPLOAD_FOLDER'], nombre_unico)
    archivo.save(destino)
    return secure_filename(archivo.filename), 'uploads/' + nombre_unico
