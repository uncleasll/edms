from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from app.models.entities import AuditLog, DocumentTemplate, User
from app.schemas.dto import AuditLogOut, TemplateOut, UserOut


def initials(name: str) -> str:
    parts = [p[0] for p in name.split() if p]
    return "".join(parts[:2]).upper() or "U"


def user_to_out(user: User) -> UserOut:
    return UserOut(
        id=user.id,
        username=user.username,
        name=user.name,
        role=user.role,
        department=user.department,
        position=user.position,
        avatar=user.avatar,
        active=user.active,
    )


def template_to_out(template: DocumentTemplate) -> TemplateOut:
    return TemplateOut(
        id=template.id,
        code=template.code,
        name=template.name,
        department=template.department,
        deadlineDays=template.deadline_days,
        formKey=template.form_key,
        fields=template.fields or [],
        active=template.active,
    )


def add_audit(db: Session, actor: User | None, action: str, entity_type: str, entity_id: str, details: dict[str, Any] | None = None) -> None:
    db.add(
        AuditLog(
            actor_id=actor.id if actor else None,
            action=action,
            entity_type=entity_type,
            entity_id=str(entity_id),
            details=details or {},
            created_at=datetime.utcnow(),
        )
    )


def audit_to_out(log: AuditLog) -> AuditLogOut:
    return AuditLogOut(
        id=log.id,
        actorId=log.actor_id,
        actorName=log.actor.name if log.actor else None,
        action=log.action,
        entityType=log.entity_type,
        entityId=log.entity_id,
        details=log.details or {},
        createdAt=log.created_at,
    )
