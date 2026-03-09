from app.extensions import db


def init_db(app):
    """Initialize the database and create all tables."""
    with app.app_context():
        db.create_all()


def drop_db(app):
    """Drop all database tables."""
    with app.app_context():
        db.drop_all()
