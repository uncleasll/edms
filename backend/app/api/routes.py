import json
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, get_current_user, hash_password, require_director, verify_password
from app.db.session import get_db
from app.models.entities import Attachment, AuditLog, DocumentTemplate, Notification, User
from app.schemas.dto import (
    AuditLogOut,
    DocumentCreate,
    DocumentOut,
    DocumentUpdate,
    LoginIn,
    NotificationOut,
    StatusOut,
    TemplateCreate,
    TemplateOut,
    TemplateUpdate,
    TokenOut,
    UserCreate,
    UserOut,
    UserUpdate,
)
from app.services.admin import add_audit, audit_to_out, initials, template_to_out, user_to_out
from app.services.documents import (
    approve_edit,
    create_attachment,
    create_document,
    document_to_out,
    get_attachment_path,
    get_document_or_404,
    list_accessible_documents,
    notification_to_out,
    request_edit,
    sign_document,
    update_document,
)
from app.services.excel import rows_to_xlsx, xlsx_to_rows


router = APIRouter()

EXPORT_LABELS = {
    "uz": {
        "document_id": "Hujjat ID",
        "document_number": "Hujjat raqami",
        "title": "Sarlavha",
        "status": "Holat",
        "currency": "Valyuta",
    },
    "ru": {
        "document_id": "ID документа",
        "document_number": "Номер документа",
        "title": "Название",
        "status": "Статус",
        "currency": "Валюта",
    },
    "tr": {
        "document_id": "Belge ID",
        "document_number": "Belge numarası",
        "title": "Başlık",
        "status": "Durum",
        "currency": "Para birimi",
    },
    "en": {
        "document_id": "Document ID",
        "document_number": "Document number",
        "title": "Title",
        "status": "Status",
        "currency": "Currency",
    },
}


def export_labels(lang: str) -> dict[str, str]:
    return EXPORT_LABELS.get(lang, EXPORT_LABELS["uz"])


@router.get("/health", tags=["system"])
def health() -> dict[str, bool]:
    return {"ok": True}


@router.post("/auth/login", response_model=TokenOut, tags=["auth"])
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not user.active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token(user.id, {"role": user.role})
    return TokenOut(access_token=token, user=user_to_out(user))


@router.get("/auth/me", response_model=UserOut, tags=["auth"])
def me(current_user: User = Depends(get_current_user)) -> UserOut:
    return user_to_out(current_user)


@router.get("/users", response_model=list[UserOut], tags=["users"])
def users(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[UserOut]:
    return [user_to_out(user) for user in db.query(User).order_by(User.id).all()]


@router.post("/users", response_model=UserOut, tags=["admin"])
def create_user(payload: UserCreate, director: User = Depends(require_director), db: Session = Depends(get_db)) -> UserOut:
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
    user = User(
        username=payload.username,
        password_hash=hash_password(payload.password),
        name=payload.name,
        role=payload.role,
        department=payload.department,
        position=payload.position,
        avatar=payload.avatar or initials(payload.name),
        active=payload.active,
    )
    db.add(user)
    db.flush()
    add_audit(db, director, "user.created", "user", str(user.id), {"username": user.username})
    db.commit()
    db.refresh(user)
    return user_to_out(user)


@router.put("/users/{user_id}", response_model=UserOut, tags=["admin"])
def update_user(user_id: int, payload: UserUpdate, director: User = Depends(require_director), db: Session = Depends(get_db)) -> UserOut:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updates = payload.model_dump(exclude_unset=True)
    if "username" in updates and updates["username"] != user.username:
        if db.query(User).filter(User.username == updates["username"], User.id != user.id).first():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already exists")
        user.username = updates["username"]
    if "password" in updates and updates["password"]:
        user.password_hash = hash_password(updates["password"])
    for field in ["name", "role", "department", "position", "avatar", "active"]:
        if field in updates:
            setattr(user, field, updates[field])
    if not user.avatar:
        user.avatar = initials(user.name)
    add_audit(db, director, "user.updated", "user", str(user.id), {"fields": list(updates.keys())})
    db.commit()
    db.refresh(user)
    return user_to_out(user)


@router.delete("/users/{user_id}", response_model=StatusOut, tags=["admin"])
def delete_user(user_id: int, director: User = Depends(require_director), db: Session = Depends(get_db)) -> StatusOut:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.id == director.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Director cannot delete own account")
    user.active = False
    add_audit(db, director, "user.deleted", "user", str(user.id), {"username": user.username})
    db.commit()
    return StatusOut()


@router.get("/templates", response_model=list[TemplateOut], tags=["templates"])
def templates(_: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[TemplateOut]:
    return [template_to_out(item) for item in db.query(DocumentTemplate).order_by(DocumentTemplate.code).all()]


@router.post("/templates", response_model=TemplateOut, tags=["admin"])
def create_template(payload: TemplateCreate, director: User = Depends(require_director), db: Session = Depends(get_db)) -> TemplateOut:
    template_id = payload.id or payload.code
    if db.get(DocumentTemplate, template_id) or db.query(DocumentTemplate).filter(DocumentTemplate.code == payload.code).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Template already exists")
    template = DocumentTemplate(
        id=template_id,
        code=payload.code,
        name=payload.name,
        department=payload.department,
        deadline_days=payload.deadlineDays,
        form_key=payload.formKey,
        fields=payload.fields,
        active=payload.active,
    )
    db.add(template)
    add_audit(db, director, "template.created", "template", template.id, {"code": template.code})
    db.commit()
    db.refresh(template)
    return template_to_out(template)


@router.put("/templates/{template_id}", response_model=TemplateOut, tags=["admin"])
def update_template(template_id: str, payload: TemplateUpdate, director: User = Depends(require_director), db: Session = Depends(get_db)) -> TemplateOut:
    template = db.get(DocumentTemplate, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    updates = payload.model_dump(exclude_unset=True)
    if "code" in updates:
        template.code = updates["code"]
    if "name" in updates:
        template.name = updates["name"]
    if "department" in updates:
        template.department = updates["department"]
    if "deadlineDays" in updates:
        template.deadline_days = updates["deadlineDays"]
    if "formKey" in updates:
        template.form_key = updates["formKey"]
    if "fields" in updates:
        template.fields = updates["fields"]
    if "active" in updates:
        template.active = updates["active"]
    add_audit(db, director, "template.updated", "template", template.id, {"fields": list(updates.keys())})
    db.commit()
    db.refresh(template)
    return template_to_out(template)


@router.get("/audit-logs", response_model=list[AuditLogOut], tags=["admin"])
def audit_logs(_: User = Depends(require_director), db: Session = Depends(get_db)) -> list[AuditLogOut]:
    items = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(200).all()
    return [audit_to_out(item) for item in items]


@router.get("/documents", response_model=list[DocumentOut], tags=["documents"])
def documents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[DocumentOut]:
    return list_accessible_documents(db, current_user)


@router.post("/documents", response_model=DocumentOut, tags=["documents"])
def add_document(payload: DocumentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DocumentOut:
    return create_document(db, payload, current_user)


@router.get("/documents/{doc_id}", response_model=DocumentOut, tags=["documents"])
def get_document(doc_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DocumentOut:
    return document_to_out(get_document_or_404(db, doc_id, current_user))


@router.put("/documents/{doc_id}", response_model=DocumentOut, tags=["documents"])
def put_document(doc_id: str, payload: DocumentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DocumentOut:
    return update_document(db, doc_id, payload, current_user)


@router.post("/documents/{doc_id}/sign", response_model=DocumentOut, tags=["documents"])
def sign(doc_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DocumentOut:
    return sign_document(db, doc_id, current_user)


@router.post("/documents/{doc_id}/request-edit", response_model=DocumentOut, tags=["documents"])
def request_document_edit(doc_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DocumentOut:
    return request_edit(db, doc_id, current_user)


@router.post("/documents/{doc_id}/approve-edit/{user_id}", response_model=DocumentOut, tags=["documents"])
def approve_document_edit(doc_id: str, user_id: int, director: User = Depends(require_director), db: Session = Depends(get_db)) -> DocumentOut:
    return approve_edit(db, doc_id, user_id, director)


@router.post("/documents/{doc_id}/attachments", response_model=DocumentOut, tags=["files"])
def upload_attachment(
    doc_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentOut:
    document = get_document_or_404(db, doc_id, current_user)
    settings = get_settings()
    suffix = ""
    if file.filename and "." in file.filename:
        suffix = "." + file.filename.rsplit(".", 1)[-1]
    stored_name = f"{doc_id}-{uuid.uuid4().hex}{suffix}"
    path = settings.storage_dir / stored_name
    size = 0
    with path.open("wb") as output:
        while chunk := file.file.read(1024 * 1024):
            size += len(chunk)
            output.write(chunk)
    return create_attachment(
        db=db,
        document=document,
        user=current_user,
        original_name=file.filename or stored_name,
        stored_name=stored_name,
        content_type=file.content_type or "application/octet-stream",
        size=size,
    )


@router.get("/documents/{doc_id}/download", tags=["files"])
def download_document(
    doc_id: str,
    lang: str = Query(default="uz"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    document = get_document_or_404(db, doc_id, current_user)
    payload = document_to_out(document).model_dump(mode="json")
    payload["exportLanguage"] = lang
    payload["labels"] = export_labels(lang)
    content = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
    headers = {"Content-Disposition": f'attachment; filename="{doc_id}.json"'}
    return StreamingResponse(iter([content]), media_type="application/json", headers=headers)


@router.get("/documents/{doc_id}/export.xlsx", tags=["files"])
def export_document_excel(
    doc_id: str,
    lang: str = Query(default="uz"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StreamingResponse:
    document = get_document_or_404(db, doc_id, current_user)
    doc = document_to_out(document).model_dump(mode="json")
    labels = export_labels(lang)
    rows = doc.get("rows") or []
    headers = sorted({key for row in rows for key in row.keys() if key != "id"})
    sheet_rows = [
        [labels["document_id"], doc["id"]],
        [labels["document_number"], doc["docNumber"]],
        [labels["title"], doc["title"]],
        [labels["status"], doc["status"]],
        [labels["currency"], doc.get("currency", "UZS")],
        [],
        headers or ["note"],
    ]
    for row in rows:
        sheet_rows.append([row.get(header, "") for header in headers] if headers else [""])
    content = rows_to_xlsx(sheet_rows)
    headers_out = {"Content-Disposition": f'attachment; filename="{doc_id}.xlsx"'}
    return StreamingResponse(
        iter([content]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers_out,
    )


@router.post("/documents/{doc_id}/import.xlsx", response_model=DocumentOut, tags=["files"])
def import_document_excel(
    doc_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DocumentOut:
    document = get_document_or_404(db, doc_id, current_user)
    all_rows = xlsx_to_rows(file.file.read())
    if not all_rows:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Excel file is empty")

    header_index = 0
    for index, row in enumerate(all_rows[:-1]):
        if all(value in (None, "") for value in row) and any(value not in (None, "") for value in all_rows[index + 1]):
            header_index = index + 1
            break
    else:
        for index, row in enumerate(all_rows):
            values = [value for value in row if value is not None]
            if len(values) >= 2:
                header_index = index
                break
    headers = [str(value).strip() for value in all_rows[header_index] if value is not None]
    imported_rows = []
    for index, row in enumerate(all_rows[header_index + 1 :], start=1):
        item = {"id": index}
        for key, value in zip(headers, row):
            item[key] = value
        if any(value not in (None, "") for value in item.values()):
            imported_rows.append(item)
    document.rows = imported_rows
    add_audit(db, current_user, "document.excel_imported", "document", doc_id, {"rows": len(imported_rows), "file": file.filename})
    db.commit()
    db.refresh(document)
    return document_to_out(document)


@router.get("/attachments/{attachment_id}/download", tags=["files"])
def download_attachment(attachment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FileResponse:
    attachment = db.get(Attachment, attachment_id)
    if not attachment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    get_document_or_404(db, attachment.document_id, current_user)
    path = get_attachment_path(get_settings().storage_dir, attachment)
    return FileResponse(path, media_type=attachment.content_type, filename=attachment.original_name)


@router.get("/notifications", response_model=list[NotificationOut], tags=["notifications"])
def list_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[NotificationOut]:
    items = (
        db.query(Notification)
        .filter((Notification.user_id == current_user.id) | (Notification.user_id.is_(None)))
        .order_by(Notification.created_at.desc())
        .limit(100)
        .all()
    )
    return [notification_to_out(item) for item in items]


@router.post("/notifications/read", response_model=StatusOut, tags=["notifications"])
def mark_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> StatusOut:
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.read.is_(False)).update({"read": True})
    db.commit()
    return StatusOut()
