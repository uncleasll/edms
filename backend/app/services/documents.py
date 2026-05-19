from datetime import date, datetime
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session, selectinload

from app.models.entities import Attachment, Document, Notification, User
from app.schemas.dto import AttachmentOut, DocumentCreate, DocumentOut, DocumentUpdate, NotificationOut
from app.services.admin import add_audit


SYSTEM_KEYS = {
    "id",
    "typeId",
    "docNumber",
    "title",
    "createdBy",
    "createdAt",
    "deadline",
    "status",
    "department",
    "rows",
    "signatures",
    "editRequests",
    "lockedBy",
    "editApproved",
    "attachments",
}


def attachment_to_out(attachment: Attachment) -> AttachmentOut:
    return AttachmentOut(
        id=attachment.id,
        documentId=attachment.document_id,
        originalName=attachment.original_name,
        contentType=attachment.content_type,
        size=attachment.size,
        uploadedBy=attachment.uploaded_by,
        createdAt=attachment.created_at,
    )


def document_to_out(document: Document) -> DocumentOut:
    data: dict[str, Any] = {
        "id": document.id,
        "typeId": document.type_id,
        "docNumber": document.doc_number,
        "title": document.title,
        "createdBy": document.created_by,
        "createdAt": document.created_at,
        "deadline": document.deadline,
        "status": document.status,
        "department": document.department,
        "rows": document.rows or [],
        "signatures": document.signatures or [],
        "editRequests": document.edit_requests or [],
        "lockedBy": document.locked_by,
        "editApproved": document.edit_approved,
        "attachments": [attachment_to_out(a) for a in document.attachments],
    }
    data.update(document.extra or {})
    return DocumentOut(**data)


def notification_to_out(notification: Notification) -> NotificationOut:
    return NotificationOut(
        id=notification.id,
        message=notification.message,
        type=notification.type,
        read=notification.read,
        time=notification.created_at,
    )


def next_document_id(db: Session) -> str:
    count = db.query(func.count(Document.id)).scalar() or 0
    return f"DOC-{count + 1:03d}"


def can_view_document(user: User, document: Document) -> bool:
    if user.role == "director":
        return True
    if document.created_by == user.id:
        return True
    if document.department and document.department == user.department:
        return True
    return any(req.get("userId") == user.id for req in document.edit_requests or [])


def can_edit_document(user: User, document: Document) -> bool:
    if user.role == "director":
        return True
    if document.status in {"signed", "approved"}:
        return document.edit_approved == user.id
    return document.created_by == user.id


def get_document_or_404(db: Session, doc_id: str, user: User) -> Document:
    document = (
        db.query(Document)
        .options(selectinload(Document.attachments))
        .filter(Document.id == doc_id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    if not can_view_document(user, document):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Document access denied")
    return document


def list_accessible_documents(db: Session, user: User) -> list[DocumentOut]:
    query = db.query(Document).options(selectinload(Document.attachments)).order_by(Document.created_at.desc())
    docs = query.all()
    return [document_to_out(doc) for doc in docs if can_view_document(user, doc)]


def collect_extra(payload: DocumentCreate | DocumentUpdate) -> dict[str, Any]:
    raw = payload.model_dump(exclude_unset=True)
    extra = payload.model_extra or {}
    return {key: value for key, value in {**raw, **extra}.items() if key not in SYSTEM_KEYS}


def create_document(db: Session, payload: DocumentCreate, user: User) -> DocumentOut:
    doc_id = next_document_id(db)
    extra = collect_extra(payload)
    if user.role != "director":
        extra["currency"] = "UZS"
    else:
        extra["currency"] = extra.get("currency") or "UZS"
    document = Document(
        id=doc_id,
        type_id=payload.typeId,
        doc_number=payload.docNumber,
        title=payload.title,
        created_by=user.id,
        created_at=payload.createdAt or date.today().isoformat(),
        deadline=payload.deadline,
        status=payload.status,
        department=payload.department or user.department,
        rows=payload.rows,
        signatures=[],
        edit_requests=[],
        edit_approved=None,
        locked_by=None,
        extra=extra,
    )
    db.add(document)
    db.add(Notification(user_id=user.id, message=f"Yangi hujjat yaratildi: {doc_id}", type="success"))
    add_audit(db, user, "document.created", "document", doc_id, {"docNumber": payload.docNumber})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


def update_document(db: Session, doc_id: str, payload: DocumentUpdate, user: User) -> DocumentOut:
    document = get_document_or_404(db, doc_id, user)
    if not can_edit_document(user, document):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Document is locked for this user")

    updates = payload.model_dump(exclude_unset=True)
    if "typeId" in updates:
        document.type_id = updates["typeId"]
    if "docNumber" in updates:
        document.doc_number = updates["docNumber"]
    if "title" in updates:
        document.title = updates["title"]
    if "status" in updates:
        document.status = updates["status"]
    if "deadline" in updates:
        document.deadline = updates["deadline"]
    if "department" in updates:
        document.department = updates["department"]
    if "rows" in updates:
        document.rows = updates["rows"] or []
    if "lockedBy" in updates:
        document.locked_by = updates["lockedBy"]
    if "editApproved" in updates:
        value = updates["editApproved"]
        document.edit_approved = value if isinstance(value, int) else None

    extra = dict(document.extra or {})
    incoming_extra = collect_extra(payload)
    if "currency" in incoming_extra and user.role != "director":
        incoming_extra["currency"] = extra.get("currency") or "UZS"
    if "currency" in incoming_extra and incoming_extra["currency"] != extra.get("currency"):
        add_audit(db, user, "document.currency_changed", "document", doc_id, {"from": extra.get("currency"), "to": incoming_extra["currency"]})
    extra.update(incoming_extra)
    document.extra = extra
    db.add(Notification(user_id=user.id, message=f"Hujjat saqlandi: {doc_id}", type="success"))
    add_audit(db, user, "document.updated", "document", doc_id, {"status": document.status})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


def sign_document(db: Session, doc_id: str, user: User) -> DocumentOut:
    document = get_document_or_404(db, doc_id, user)
    signatures = list(document.signatures or [])
    if any(sig.get("userId") == user.id for sig in signatures):
        return document_to_out(document)

    signatures.append({"userId": user.id, "name": user.name, "time": datetime.utcnow().isoformat()})
    document.signatures = signatures
    document.status = "approved" if user.role == "director" else "signed"
    db.add(Notification(user_id=document.created_by, message=f"{user.name} imzo qo'ydi: {doc_id}", type="success"))
    add_audit(db, user, "document.signed", "document", doc_id, {"status": document.status})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


def request_edit(db: Session, doc_id: str, user: User) -> DocumentOut:
    document = get_document_or_404(db, doc_id, user)
    requests = list(document.edit_requests or [])
    if not any(req.get("userId") == user.id and req.get("status") == "pending" for req in requests):
        requests.append({"userId": user.id, "name": user.name, "time": datetime.utcnow().isoformat(), "status": "pending"})
        document.edit_requests = requests
        director_ids = [u.id for u in db.query(User).filter(User.role == "director").all()]
        for director_id in director_ids:
            db.add(Notification(user_id=director_id, message=f"{user.name} tahrirlash so'radi: {doc_id}", type="info"))
        add_audit(db, user, "document.edit_requested", "document", doc_id, {})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


def approve_edit(db: Session, doc_id: str, request_user_id: int, director: User) -> DocumentOut:
    document = get_document_or_404(db, doc_id, director)
    requests = []
    for req in document.edit_requests or []:
        if req.get("userId") == request_user_id:
            requests.append({**req, "status": "approved"})
        else:
            requests.append(req)
    document.edit_requests = requests
    document.edit_approved = request_user_id
    document.status = "draft"
    db.add(Notification(user_id=request_user_id, message=f"Tahrirlash ruxsati berildi: {doc_id}", type="success"))
    add_audit(db, director, "document.edit_approved", "document", doc_id, {"userId": request_user_id})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


def create_attachment(
    db: Session,
    document: Document,
    user: User,
    original_name: str,
    stored_name: str,
    content_type: str,
    size: int,
) -> DocumentOut:
    attachment = Attachment(
        document_id=document.id,
        original_name=original_name,
        stored_name=stored_name,
        content_type=content_type,
        size=size,
        uploaded_by=user.id,
    )
    db.add(attachment)
    db.add(Notification(user_id=document.created_by, message=f"Fayl yuklandi: {document.id}", type="success"))
    add_audit(db, user, "file.uploaded", "document", document.id, {"file": original_name, "size": size})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


def get_attachment_path(storage_dir: Path, attachment: Attachment) -> Path:
    path = storage_dir / attachment.stored_name
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored file missing")
    return path
