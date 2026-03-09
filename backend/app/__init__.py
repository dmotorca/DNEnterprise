import os

from flask import Flask

from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors, bcrypt


def create_app(config_name=None):
    """Application factory pattern."""
    if config_name is None:
        config_name = os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    from app.auth import auth_bp
    from app.routes import main_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)

    # Create database tables
    with app.app_context():
        from app import models  # noqa: F401
        db.create_all()

    return app
