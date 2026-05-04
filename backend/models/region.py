from extensions import db


class Region(db.Model):
    __tablename__ = 'region'

    id      = db.Column(db.Integer, primary_key=True)
    nombre  = db.Column(db.String(200), nullable=False)
    comunas = db.relationship('Comuna', backref='region', lazy=True)
