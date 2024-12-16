# routes/audit_routes.py
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.database import Session as DBSession
from models.audit_log import AuditLog
from models.user import User
from utils.audit_logger import log_event

audit_bp = Blueprint('audit', __name__)

@audit_bp.route('/audit_logs', methods=['GET'])
@login_required
def get_audit_logs():
    # Zde můžete přidat kontrolu, zda je aktuální uživatel administrátor
    if not current_user.username == 'admin':  # Příklad jednoduché kontroly
        return jsonify({"error": "Unauthorized"}), 403

    db_session = DBSession()
    try:
        logs = db_session.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
        return jsonify([log.as_dict() for log in logs]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        db_session.close()
