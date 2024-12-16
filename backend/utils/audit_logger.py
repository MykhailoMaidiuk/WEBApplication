# utils/audit_logger.py
from database.database import db
from models.audit_log import AuditLog
from flask_login import current_user
from datetime import datetime
import json

def log_event(event_type, event_details=None, user=None):
    """
    Zapisuje auditní záznam do databáze.
    
    :param event_type: Typ události (např. 'register', 'login')
    :param event_details: Další detaily události jako slovník
    :param user: Uživatel iniciující událost (pokud není zadán, použije se current_user)
    """
    if user is None:
        if current_user.is_authenticated:
            user = current_user
        else:
            user = None  # Systémový uživatel

    audit_log = AuditLog(
        timestamp=datetime.utcnow(),
        user_id=user.id if user else None,
        username=user.username if user else 'system',
        event_type=event_type,
        event_details=json.dumps(event_details) if event_details else None
    )
    
    try:
        db.session.add(audit_log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Zde můžete přidat další zpracování chyb, např. logování
        print(f"Error logging audit event: {e}")
