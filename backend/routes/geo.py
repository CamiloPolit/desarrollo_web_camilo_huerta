from flask import Blueprint, jsonify
from models import Region

geo_bp = Blueprint('geo', __name__)


@geo_bp.route('/regiones', methods=['GET'])
def regiones():
    data = []
    for r in Region.query.order_by(Region.nombre).all():
        data.append({
            'id': r.id,
            'nombre': r.nombre,
            'comunas': [
                {'id': c.id, 'nombre': c.nombre}
                for c in sorted(r.comunas, key=lambda c: c.nombre)
            ]
        })
    return jsonify(data)
