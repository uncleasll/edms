from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(50), index=True)
    department: Mapped[str] = mapped_column(String(160))
    position: Mapped[str] = mapped_column(String(160))
    avatar: Mapped[str] = mapped_column(String(8))
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class DocumentTemplate(Base):
    __tablename__ = "document_templates"

    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    department: Mapped[str] = mapped_column(String(160))
    deadline_days: Mapped[int] = mapped_column(Integer, default=3)
    form_key: Mapped[str] = mapped_column(String(80), default="generic")
    fields: Mapped[list] = mapped_column(JSON, default=list)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    type_id: Mapped[str] = mapped_column(String(40), index=True)
    doc_number: Mapped[str] = mapped_column(String(120), index=True)
    title: Mapped[str] = mapped_column(String(255))
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[str] = mapped_column(String(20))
    deadline: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(40), index=True, default="draft")
    department: Mapped[str | None] = mapped_column(String(160), nullable=True)
    rows: Mapped[list] = mapped_column(JSON, default=list)
    signatures: Mapped[list] = mapped_column(JSON, default=list)
    edit_requests: Mapped[list] = mapped_column(JSON, default=list)
    edit_approved: Mapped[int | None] = mapped_column(Integer, nullable=True)
    locked_by: Mapped[int | None] = mapped_column(Integer, nullable=True)
    extra: Mapped[dict] = mapped_column(JSON, default=dict)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator: Mapped[User] = relationship("User")
    attachments: Mapped[list["Attachment"]] = relationship(
        "Attachment",
        back_populates="document",
        cascade="all, delete-orphan",
        order_by="Attachment.created_at.desc()",
    )


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    message: Mapped[str] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(40), default="info")
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    document_id: Mapped[str] = mapped_column(ForeignKey("documents.id"), index=True)
    original_name: Mapped[str] = mapped_column(String(255))
    stored_name: Mapped[str] = mapped_column(String(255), unique=True)
    content_type: Mapped[str] = mapped_column(String(120), default="application/octet-stream")
    size: Mapped[int] = mapped_column(Integer)
    uploaded_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    document: Mapped[Document] = relationship("Document", back_populates="attachments")
    uploader: Mapped[User] = relationship("User")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    actor_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(120), index=True)
    entity_type: Mapped[str] = mapped_column(String(80), index=True)
    entity_id: Mapped[str] = mapped_column(String(120), index=True)
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    actor: Mapped[User | None] = relationship("User")
