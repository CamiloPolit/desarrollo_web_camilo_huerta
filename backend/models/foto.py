from extensions import db


class Foto(db.Model):
    __tablename__ = 'foto'

    id             = db.Column(db.Integer, primary_key=True)
    actividad_id   = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    ruta_archivo   = db.Column(db.String(300), nullable=False)
