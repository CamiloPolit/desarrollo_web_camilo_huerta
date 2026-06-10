from datetime import datetime
from extensions import db


class Comentario(db.Model):
    __tablename__ = 'comentario'

    id           = db.Column(db.Integer, primary_key=True)
    nombre       = db.Column(db.String(80), nullable=False)
    texto        = db.Column(db.String(300), nullable=False)
    fecha        = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
