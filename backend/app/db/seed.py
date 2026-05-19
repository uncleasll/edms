from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.entities import Document, DocumentTemplate, Notification, User


USERS = [
    (1, "direktor", "Abdullayev Jamshid", "director", "Rahbariyat", "Direktor", "DJ"),
    (2, "ombor1", "Karimov Bekzod", "warehouse", "Ombor 1", "Ombor mudiri", "KB"),
    (3, "ombor2", "Toshmatov Sanjar", "warehouse", "Ombor 2", "Ombor mudiri", "TS"),
    (4, "ombor3", "Nazarov Ulugbek", "warehouse", "Ombor 3", "Ombor mudiri", "NU"),
    (5, "ishlab1", "Raxmatullayev Firdavs", "production", "1-Ishlab chiqarish", "Bo'lim boshlig'i", "RF"),
    (6, "ishlab2", "Yusupova Dilnoza", "production", "2-Ishlab chiqarish", "Bo'lim boshlig'i", "YD"),
    (7, "ishlab3", "Mirzayev Sherzod", "production", "3-Ishlab chiqarish", "Bo'lim boshlig'i", "MS"),
    (8, "rejalar", "Holmatov Nodir", "planning", "Rejalashtirish bo'limi", "Bosh mutaxassis", "HN"),
    (9, "qayta", "Ergasheva Maftuna", "reprocessing", "Qayta ishlash bo'limi", "Bo'lim boshlig'i", "EM"),
    (10, "tayyor", "Sodiqov Jasur", "finished", "Tayyor mahsulotlar ombori", "Ombor mudiri", "SJ"),
]


def add_days(days: int) -> str:
    return (date.today() + timedelta(days=days)).isoformat()


DOCUMENTS = [
    {
        "id": "DOC-001",
        "type_id": "XB-1",
        "doc_number": "XB-001",
        "title": "Xom ashyo buyurtma shakli",
        "created_by": 8,
        "created_at": add_days(-5),
        "deadline": add_days(-2),
        "status": "pending",
        "department": "Rejalashtirish bo'limi",
        "rows": [
            {
                "id": 1,
                "date": add_days(-5),
                "rawMaterial": "Paxta ip",
                "type": "A-sifat",
                "unit": "kg",
                "quantity": 500,
                "supplier": "Namangan Tekstil",
                "department": "1-Ishlab chiqarish",
                "note": "",
            }
        ],
    },
    {
        "id": "DOC-002",
        "type_id": "01-QQD",
        "doc_number": "01-QQD-045",
        "title": "Xaridlarni qabul qilish dalolatnomasi",
        "created_by": 2,
        "created_at": add_days(-7),
        "deadline": add_days(-5),
        "status": "approved",
        "department": "Ombor 1",
        "rows": [
            {"id": 1, "no": "1", "date": add_days(-7), "itemName": "Paxta ip", "type": "Premium", "unit": "kg", "docQty": 300, "actualQty": 295, "diff": -5, "defect": 0, "otherReturn": ""}
        ],
        "signatures": [{"userId": 2, "name": "Karimov Bekzod", "time": add_days(-6)}],
        "extra": {"supplier": "Namangan Tekstil", "receiver": "Ombor 1", "ttnNo": "TTN-2025-001"},
    },
    {
        "id": "DOC-003",
        "type_id": "1-ICHH",
        "doc_number": "1-ICHH-012",
        "title": "1-Ishlab chiqarish hisoboti",
        "created_by": 5,
        "created_at": add_days(-3),
        "deadline": add_days(2),
        "status": "draft",
        "department": "1-Ishlab chiqarish",
        "rows": [{"id": 1, "no": "1", "model": "Model-A", "name": "Ko'ylak", "ordered": 200, "produced": 185, "diff": -15, "reprocessed": 5, "defects": 3, "waste": 2}],
        "extra": {"month": "May 2025"},
    },
    {
        "id": "DOC-004",
        "type_id": "01-QQD",
        "doc_number": "01-QQD-046",
        "title": "Xaridlarni qabul qilish dalolatnomasi",
        "created_by": 2,
        "created_at": add_days(-10),
        "deadline": add_days(-8),
        "status": "signed",
        "department": "Ombor 1",
        "rows": [{"id": 1, "no": "1", "date": add_days(-10), "itemName": "Gazlama", "type": "B", "unit": "m", "docQty": 1000, "actualQty": 1000, "diff": 0, "defect": 10, "otherReturn": ""}],
        "signatures": [{"userId": 2, "name": "Karimov Bekzod", "time": add_days(-9)}, {"userId": 1, "name": "Abdullayev Jamshid", "time": add_days(-8)}],
        "extra": {"supplier": "Fergana Textil", "receiver": "Ombor 1", "ttnNo": "TTN-2025-002"},
    },
    {
        "id": "DOC-005",
        "type_id": "2-QD",
        "doc_number": "2-QD-008",
        "title": "Qaytarish dalolatnomasi",
        "created_by": 4,
        "created_at": add_days(-2),
        "deadline": add_days(0),
        "status": "pending",
        "department": "Ombor 3",
        "rows": [{"id": 1, "no": "1", "itemName": "Ip", "type": "Sintetik", "unit": "kg", "qty": 50, "returnReason": "Sifatsiz"}],
    },
]


TEMPLATES = [
    ("XB-1", "XB-1", "Xom ashyo buyurtma shakli", "Rejalashtirish bo'limi", 3, "xb1"),
    ("01-QQD", "01-QQD", "Xaridlarni qabul qilish dalolatnomasi", "Ombor 1", 2, "ombor1"),
    ("1-MKO", "1-MKO", "Material kirim orderi", "Ombor 2", 2, "generic"),
    ("2-QD", "2-QD", "Qaytarish dalolatnomasi", "Ombor 3", 3, "generic"),
    ("3-QID", "3-QID", "Qayta ishashga berish dalolatnomasi", "Qayta ishlashga berish", 2, "generic"),
    ("4-QO", "4-QO", "Qayta ishlovdan mahsulot qabul hisoboti", "Qayta ishlashga berish", 3, "generic"),
    ("5-TYX", "5-TYX", "Talabnoma yuk xati", "1,2,3-Ishlab chiqarish", 2, "generic"),
    ("6-QD", "6-QD", "TMZlarni qaytarish dalolatnomasi", "1,2,3-Ishlab chiqarish", 2, "generic"),
    ("1-ICHH", "1-ICHH", "1-Ishlab chiqarish sexi hisoboti", "1-Ishlab chiqarish", 5, "production"),
    ("2-ICHAH", "2-ICHAH", "2-Ishlab chiqarish aylanma hisoboti", "2-Ishlab chiqarish", 5, "generic"),
    ("3-ICHH", "3-ICHH", "3-Ishlab chiqarish sexi hisoboti", "3-Ishlab chiqarish", 5, "production"),
    ("02-TM", "02-TM", "Tayyor mahsulotlarni kirim orderi", "Tayyor mahsulotlar ombori", 2, "generic"),
]


DEFAULT_FIELDS = [
    {"key": "itemName", "label": "Nomi", "type": "text"},
    {"key": "type", "label": "Turi", "type": "text"},
    {"key": "unit", "label": "O'lchov", "type": "text"},
    {"key": "qty", "label": "Miqdor", "type": "number"},
    {"key": "amount", "label": "Summa", "type": "number"},
    {"key": "note", "label": "Izoh", "type": "text"},
]


def seed_templates(db: Session) -> None:
    existing_ids = {item.id for item in db.query(DocumentTemplate).all()}
    for template_id, code, name, department, deadline_days, form_key in TEMPLATES:
        if template_id in existing_ids:
            continue
        db.add(
            DocumentTemplate(
                id=template_id,
                code=code,
                name=name,
                department=department,
                deadline_days=deadline_days,
                form_key=form_key,
                fields=DEFAULT_FIELDS,
                active=True,
            )
        )


def seed_database(db: Session) -> None:
    seed_templates(db)
    if db.query(User).first():
        for _, username, *_ in USERS:
            user = db.query(User).filter(User.username == username).first()
            if user and not user.password_hash.startswith("$pbkdf2-sha256$"):
                user.password_hash = hash_password("1234")
        db.commit()
        return

    for user_id, username, name, role, department, position, avatar in USERS:
        db.add(
            User(
                id=user_id,
                username=username,
                password_hash=hash_password("1234"),
                name=name,
                role=role,
                department=department,
                position=position,
                avatar=avatar,
            )
        )

    for item in DOCUMENTS:
        db.add(
            Document(
                id=item["id"],
                type_id=item["type_id"],
                doc_number=item["doc_number"],
                title=item["title"],
                created_by=item["created_by"],
                created_at=item["created_at"],
                deadline=item["deadline"],
                status=item["status"],
                department=item["department"],
                rows=item.get("rows", []),
                signatures=item.get("signatures", []),
                edit_requests=[],
                edit_approved=None,
                locked_by=None,
                extra=item.get("extra", {}),
            )
        )

    db.flush()  # users va documents bazaga yoziladi (FK constraint bajariladi)

    db.add(Notification(user_id=1, message="DOC-005 muddat o'tdi!", type="overdue"))
    db.add(Notification(user_id=1, message="DOC-001 imzoni kutmoqda", type="pending"))
    db.commit()