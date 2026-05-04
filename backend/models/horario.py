from extensions import db


class Horario(db.Model):
    __tablename__ = 'horario'

    id           = db.Column(db.Integer, primary_key=True)
    actividad_id = db.Column(db.Integer, db.ForeignKey('actividad.id'), nullable=False)
    dia          = db.Column(
        db.Enum('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
        nullable=False
    )
    hora_inicio  = db.Column(db.String(5), nullable=False)
    hora_fin     = db.Column(db.String(5), nullable=False)
