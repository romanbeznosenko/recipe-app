from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy import Column, DateTime
import datetime
from datetime import timezone

def get_utc_now():
    return datetime.datetime.now(timezone.utc)

class TimestampMixin:
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=get_utc_now, nullable=False)

    @declared_attr
    def updated_at(cls):
        return Column(DateTime, default=get_utc_now, nullable=False, onupdate=get_utc_now)