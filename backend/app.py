import os
from flask import Flask
from config import Config
from extensions import db
import models  # registra todos los modelos con SQLAlchemy
from routes import geo_bp, miembros_bp, registro_bp


def create_app(config=Config):
    app = Flask(__name__)
    app.config.from_object(config)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    db.init_app(app)

    app.register_blueprint(geo_bp)
    app.register_blueprint(miembros_bp)
    app.register_blueprint(registro_bp)

    @app.after_request
    def agregar_cors(response):
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        return response

    return app


if __name__ == '__main__':
    create_app().run(debug=True, port=5000)
