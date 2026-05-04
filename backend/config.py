import os


class Config:
    SQLALCHEMY_DATABASE_URI = (
        'mysql+pymysql://cc5002:programacionweb@localhost:3306/tarea2'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'ogg'}
