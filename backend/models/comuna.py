from extensions import db


class Comuna(db.Model):
    __tablename__ = 'comuna'

    id        = db.Column(db.Integer, primary_key=True)
    nombre    = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey('region.id'), nullable=False)
    miembros  = db.relationship('Miembro', backref='comuna', lazy=True)
