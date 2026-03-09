from flask import jsonify

from app.routes import main_bp


@main_bp.route("/", methods=["GET"])
def index():
    """API root health check."""
    return jsonify({
        "status": "ok",
        "message": "DNEnterprise API is running",
    }), 200


@main_bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "healthy"}), 200
