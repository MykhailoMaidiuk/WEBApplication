# models/audit_log.py
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .book import Base
from .user import User

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    username = Column(String(80), nullable=True)
    event_type = Column(String(50), nullable=False)
    event_details = Column(Text, nullable=True)
    
    user = relationship('User')

    def as_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'user_id': self.user_id,
            'username': self.username,
            'event_type': self.event_type,
            'event_details': self.event_details,
        }
