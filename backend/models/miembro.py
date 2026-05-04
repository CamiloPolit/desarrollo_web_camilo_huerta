from extensions import db


class Miembro(db.Model):
    __tablename__ = 'miembro'

    id             = db.Column(db.Integer, primary_key=True)
    nombre         = db.Column(db.String(255), nullable=False)
    rut            = db.Column(db.String(12), nullable=False, unique=True)
    tipo           = db.Column(
        db.Enum('pregrado', 'postgrado', 'funcionario', 'academico'),
        nullable=False
    )
    email          = db.Column(db.String(80), nullable=False)
    telefono       = db.Column(db.String(20), nullable=False, default='')
    fecha_registro = db.Column(db.DateTime, nullable=False)
    comuna_id      = db.Column(db.Integer, db.ForeignKey('comuna.id'), nullable=False)

    # Pregrado
    plan_estudio = db.Column(db.String(50), nullable=True)
    anio_ingreso = db.Column(db.SmallInteger, nullable=True)

    # Postgrado
    programa      = db.Column(db.String(100), nullable=True)
    profesor_guia = db.Column(db.String(150), nullable=True)

    # Funcionario
    cargo         = db.Column(db.String(100), nullable=True)
    unidad        = db.Column(db.String(100), nullable=True)
    tipo_contrato = db.Column(
        db.Enum('planta', 'contrata', 'honorarios'),
        nullable=True
    )

    # Académico
    jerarquia          = db.Column(
        db.Enum('asistente', 'asociado', 'titular', 'adjunto'),
        nullable=True
    )
    area_investigacion = db.Column(db.String(200), nullable=True)
    oficina            = db.Column(db.String(20), nullable=True)

    actividades = db.relationship('Actividad', backref='miembro', lazy=True)
