from flask import Blueprint, jsonify
from extensions import db
from sqlalchemy import text

estadisticas_bp = Blueprint('estadisticas', __name__)


@estadisticas_bp.route('/estadisticas', methods=['GET'])
def estadisticas():
    miembros_por_dia = db.session.execute(
        text(
            'SELECT DATE(fecha_registro) AS dia, COUNT(*) AS cantidad '
            'FROM miembro GROUP BY DATE(fecha_registro) ORDER BY dia'
        )
    ).fetchall()

    actividades_por_categoria = db.session.execute(
        text(
            'SELECT categoria, COUNT(*) AS total '
            'FROM actividad GROUP BY categoria'
        )
    ).fetchall()

    actividades_por_comuna = db.session.execute(
        text(
            'SELECT c.nombre AS comuna, COUNT(a.id) AS total '
            'FROM actividad a '
            'JOIN miembro m ON a.miembro_id = m.id '
            'JOIN comuna c ON m.comuna_id = c.id '
            'GROUP BY c.id, c.nombre '
            'ORDER BY total DESC'
        )
    ).fetchall()

    return jsonify({
        'miembros_por_dia': [
            {'dia': str(r.dia), 'cantidad': r.cantidad}
            for r in miembros_por_dia
        ],
        'actividades_por_categoria': [
            {'categoria': r.categoria, 'total': r.total}
            for r in actividades_por_categoria
        ],
        'actividades_por_comuna': [
            {'comuna': r.comuna, 'total': r.total}
            for r in actividades_por_comuna
        ],
    })
