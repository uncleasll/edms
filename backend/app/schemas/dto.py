from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class UserOut(BaseModel):
    id: int
    username: str
    name: str
    role: str
    department: str
    position: str
    avatar: str
    active: bool = True


class UserCreate(BaseModel):
    username: str
    password: str = "1234"
    name: str
    role: str
    department: str
    position: str
    avatar: str | None = None
    active: bool = True


class UserUpdate(BaseModel):
    username: str | None = None
    password: str | None = None
    name: str | None = None
    role: str | None = None
    department: str | None = None
    position: str | None = None
    avatar: str | None = None
    active: bool | None = None


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class AttachmentOut(BaseModel):
    id: int
    documentId: str
    originalName: str
    contentType: str
    size: int
    uploadedBy: int
    createdAt: datetime


class DocumentBase(BaseModel):
    typeId: str
    docNumber: str
    title: str
    status: str = "draft"
    createdBy: int | None = None
    createdAt: str | None = None
    deadline: str
    department: str | None = None
    rows: list[dict[str, Any]] = Field(default_factory=list)
    signatures: list[dict[str, Any]] = Field(default_factory=list)
    editRequests: list[dict[str, Any]] = Field(default_factory=list)
    lockedBy: int | None = None
    editApproved: int | bool | None = None

    model_config = {"extra": "allow"}


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    typeId: str | None = None
    docNumber: str | None = None
    title: str | None = None
    status: str | None = None
    deadline: str | None = None
    department: str | None = None
    rows: list[dict[str, Any]] | None = None
    lockedBy: int | None = None
    editApproved: int | bool | None = None

    model_config = {"extra": "allow"}


class DocumentOut(DocumentBase):
    id: str
    attachments: list[AttachmentOut] = Field(default_factory=list)


class TemplateBase(BaseModel):
    code: str
    name: str
    department: str
    deadlineDays: int = 3
    formKey: str = "generic"
    fields: list[dict[str, Any]] = Field(default_factory=list)
    active: bool = True


class TemplateCreate(TemplateBase):
    id: str | None = None


class TemplateUpdate(BaseModel):
    code: str | None = None
    name: str | None = None
    department: str | None = None
    deadlineDays: int | None = None
    formKey: str | None = None
    fields: list[dict[str, Any]] | None = None
    active: bool | None = None


class TemplateOut(TemplateBase):
    id: str


class AuditLogOut(BaseModel):
    id: int
    actorId: int | None
    actorName: str | None = None
    action: str
    entityType: str
    entityId: str
    details: dict[str, Any] = Field(default_factory=dict)
    createdAt: datetime


class NotificationOut(BaseModel):
    id: int
    message: str
    type: str
    read: bool
    time: datetime


class StatusOut(BaseModel):
    ok: bool = True
