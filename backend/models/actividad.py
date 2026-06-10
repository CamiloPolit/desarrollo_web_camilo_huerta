from extensions import db


class Actividad(db.Model):
    __tablename__ = 'actividad'

    id             = db.Column(db.Integer, primary_key=True)
    miembro_id     = db.Column(db.Integer, db.ForeignKey('miembro.id'), nullable=False)
    titulo         = db.Column(db.String(150), nullable=False)
    categoria      = db.Column(
        db.Enum('artistica', 'deportiva', 'tecnologica', 'social', 'recreativa', 'otra'),
        nullable=False
    )
    descripcion    = db.Column(db.Text, nullable=True)
    lugar          = db.Column(db.String(200), nullable=True)
    enlace         = db.Column(db.String(500), nullable=True)
    fecha_registro = db.Column(db.DateTime, nullable=False)

    horarios    = db.relationship('Horario',    backref='actividad', lazy=True)
    fotos       = db.relationship('Foto',       backref='actividad', lazy=True)
    comentarios = db.relationship('Comentario', backref='actividad', lazy=True,
                                  order_by='Comentario.fecha.desc()')
