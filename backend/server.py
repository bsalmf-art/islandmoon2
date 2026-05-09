from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict


# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT helpers
JWT_ALGORITHM = "HS256"


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/",
    )


# Models
class UserRegister(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class AdminRegister(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    admin_code: str = Field(min_length=4, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str = "teacher"
    avatar_color: str = "from-pink-400 to-fuchsia-500"
    created_at: str
    is_blocked: bool = False
    access_token: Optional[str] = None


class AdminUserOut(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    email: str
    role: str
    avatar_color: str
    created_at: str
    is_blocked: bool = False
    articles_count: int = 0
    comments_count: int = 0


class AdminUserUpdate(BaseModel):
    role: Optional[str] = Field(default=None, pattern="^(teacher|admin)$")
    is_blocked: Optional[bool] = None
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)


class AdminStats(BaseModel):
    teachers_count: int
    admins_count: int
    articles_count: int
    comments_count: int
    likes_count: int
    blocked_count: int


class ArticleLink(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    url: str = Field(min_length=4, max_length=500)


class ArticleCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    content: str = Field(min_length=10)
    category: str = Field(default="عام", max_length=60)
    cover_emoji: str = Field(default="🌸", max_length=8)
    images: List[str] = Field(default_factory=list)
    links: List[ArticleLink] = Field(default_factory=list)


class ArticleUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=200)
    content: Optional[str] = Field(default=None, min_length=10)
    category: Optional[str] = Field(default=None, max_length=60)
    cover_emoji: Optional[str] = Field(default=None, max_length=8)
    images: Optional[List[str]] = None
    links: Optional[List[ArticleLink]] = None


class ArticleOut(BaseModel):
    id: str
    title: str
    content: str
    category: str
    cover_emoji: str
    author_id: str
    author_name: str
    author_color: str
    images: List[str] = Field(default_factory=list)
    links: List[ArticleLink] = Field(default_factory=list)
    likes_count: int = 0
    comments_count: int = 0
    liked_by_me: bool = False
    created_at: str


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentOut(BaseModel):
    id: str
    article_id: str
    content: str
    author_id: str
    author_name: str
    author_color: str
    created_at: str


# Auth dependencies
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="غير مصرح بالدخول")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="نوع التوكن غير صالح")
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="المستخدمة غير موجودة")
        if user.get("is_blocked"):
            raise HTTPException(status_code=403, detail="تم تعليق حسابك")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية الجلسة")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توكن غير صالح")


async def get_current_user_optional(request: Request) -> Optional[dict]:
    try:
        return await get_current_user(request)
    except HTTPException:
        return None


async def require_admin(current=Depends(get_current_user)) -> dict:
    if current.get("role") != "admin":
        raise HTTPException(status_code=403, detail="هذه الصفحة مخصصة للإدارة فقط")
    return current


# App
app = FastAPI(title="بخبراتنا نسمو")
api_router = APIRouter(prefix="/api")

AVATAR_COLORS = [
    "from-pink-400 to-fuchsia-500",
    "from-rose-400 to-pink-600",
    "from-fuchsia-400 to-purple-600",
    "from-amber-400 to-orange-500",
    "from-teal-400 to-cyan-500",
    "from-violet-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-yellow-400 to-amber-500",
]


def pick_color() -> str:
    import random
    return random.choice(AVATAR_COLORS)


# ========== AUTH ==========
@api_router.post("/auth/register", response_model=UserOut)
async def register(payload: UserRegister, response: Response):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="هذا البريد مسجل مسبقاً")
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "teacher",
        "avatar_color": pick_color(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], email)
    set_auth_cookie(response, token)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    user_doc["access_token"] = token
    return UserOut(**user_doc)


@api_router.post("/auth/admin-register", response_model=UserOut)
async def admin_register(payload: AdminRegister, response: Response):
    expected = os.environ.get("ADMIN_SIGNUP_CODE", "")
    if not expected or payload.admin_code.strip() != expected:
        raise HTTPException(status_code=403, detail="الرمز السري غير صحيح")
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="هذا البريد مسجل مسبقاً")
    user_doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "admin",
        "avatar_color": "from-amber-400 to-orange-500",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], email)
    set_auth_cookie(response, token)
    user_doc.pop("password_hash", None)
    user_doc.pop("_id", None)
    user_doc["access_token"] = token
    return UserOut(**user_doc)


@api_router.post("/auth/login", response_model=UserOut)
async def login(payload: UserLogin, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="البريد أو كلمة المرور غير صحيحة")
    if user.get("is_blocked"):
        raise HTTPException(status_code=403, detail="تم تعليق حسابك. تواصلي مع الإدارة.")
    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    user.pop("password_hash", None)
    user["access_token"] = token
    return UserOut(**user)


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me", response_model=UserOut)
async def me(current=Depends(get_current_user)):
    return UserOut(**current)


# ========== ARTICLES ==========
async def enrich_article(doc: dict, current_user: Optional[dict]) -> ArticleOut:
    article_id = doc["id"]
    likes_count = await db.likes.count_documents({"article_id": article_id})
    comments_count = await db.comments.count_documents({"article_id": article_id})
    liked_by_me = False
    if current_user:
        liked_by_me = (
            await db.likes.find_one(
                {"article_id": article_id, "user_id": current_user["id"]}
            )
            is not None
        )
    return ArticleOut(
        id=doc["id"],
        title=doc["title"],
        content=doc["content"],
        category=doc.get("category", "عام"),
        cover_emoji=doc.get("cover_emoji", "🌸"),
        author_id=doc["author_id"],
        author_name=doc.get("author_name", "معلمة"),
        author_color=doc.get("author_color", "from-pink-400 to-fuchsia-500"),
        images=doc.get("images", []),
        links=doc.get("links", []),
        likes_count=likes_count,
        comments_count=comments_count,
        liked_by_me=liked_by_me,
        created_at=doc["created_at"],
    )


@api_router.get("/articles", response_model=List[ArticleOut])
async def list_articles(current=Depends(get_current_user_optional)):
    docs = await db.articles.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    if not docs:
        return []
    article_ids = [d["id"] for d in docs]

    # Bulk aggregate likes/comments counts in 2 queries
    likes_map = {}
    async for row in db.likes.aggregate([
        {"$match": {"article_id": {"$in": article_ids}}},
        {"$group": {"_id": "$article_id", "count": {"$sum": 1}}},
    ]):
        likes_map[row["_id"]] = row["count"]

    comments_map = {}
    async for row in db.comments.aggregate([
        {"$match": {"article_id": {"$in": article_ids}}},
        {"$group": {"_id": "$article_id", "count": {"$sum": 1}}},
    ]):
        comments_map[row["_id"]] = row["count"]

    liked_set = set()
    if current:
        async for row in db.likes.find(
            {"article_id": {"$in": article_ids}, "user_id": current["id"]},
            {"_id": 0, "article_id": 1},
        ):
            liked_set.add(row["article_id"])

    return [
        ArticleOut(
            id=d["id"],
            title=d["title"],
            content=d["content"],
            category=d.get("category", "عام"),
            cover_emoji=d.get("cover_emoji", "🌸"),
            author_id=d["author_id"],
            author_name=d.get("author_name", "معلمة"),
            author_color=d.get("author_color", "from-pink-400 to-fuchsia-500"),
            images=d.get("images", []),
            links=d.get("links", []),
            likes_count=likes_map.get(d["id"], 0),
            comments_count=comments_map.get(d["id"], 0),
            liked_by_me=d["id"] in liked_set,
            created_at=d["created_at"],
        )
        for d in docs
    ]


@api_router.post("/articles", response_model=ArticleOut)
async def create_article(payload: ArticleCreate, current=Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "title": payload.title.strip(),
        "content": payload.content.strip(),
        "category": payload.category.strip() or "عام",
        "cover_emoji": payload.cover_emoji or "🌸",
        "author_id": current["id"],
        "author_name": current["name"],
        "author_color": current.get("avatar_color", "from-pink-400 to-fuchsia-500"),
        "images": payload.images or [],
        "links": [link.model_dump() for link in (payload.links or [])],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.articles.insert_one(doc)
    doc.pop("_id", None)
    return await enrich_article(doc, current)


@api_router.get("/articles/{article_id}", response_model=ArticleOut)
async def get_article(article_id: str, current=Depends(get_current_user_optional)):
    doc = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    return await enrich_article(doc, current)


@api_router.delete("/articles/{article_id}")
async def delete_article(article_id: str, current=Depends(get_current_user)):
    doc = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    if doc["author_id"] != current["id"] and current.get("role") != "admin":
        raise HTTPException(status_code=403, detail="لا تملكين صلاحية الحذف")
    await db.articles.delete_one({"id": article_id})
    await db.comments.delete_many({"article_id": article_id})
    await db.likes.delete_many({"article_id": article_id})
    return {"ok": True}


@api_router.put("/articles/{article_id}", response_model=ArticleOut)
async def update_article(
    article_id: str, payload: ArticleUpdate, current=Depends(get_current_user)
):
    doc = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    if doc["author_id"] != current["id"] and current.get("role") != "admin":
        raise HTTPException(status_code=403, detail="لا تملكين صلاحية التعديل")
    updates = {}
    if payload.title is not None:
        updates["title"] = payload.title.strip()
    if payload.content is not None:
        updates["content"] = payload.content.strip()
    if payload.category is not None:
        updates["category"] = payload.category.strip() or "عام"
    if payload.cover_emoji is not None:
        updates["cover_emoji"] = payload.cover_emoji or "🌸"
    if payload.images is not None:
        updates["images"] = payload.images
    if payload.links is not None:
        updates["links"] = [link.model_dump() for link in payload.links]
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.articles.update_one({"id": article_id}, {"$set": updates})
    new_doc = await db.articles.find_one({"id": article_id}, {"_id": 0})
    return await enrich_article(new_doc, current)


# ========== LIKES ==========
@api_router.post("/articles/{article_id}/like")
async def toggle_like(article_id: str, current=Depends(get_current_user)):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    existing = await db.likes.find_one(
        {"article_id": article_id, "user_id": current["id"]}
    )
    if existing:
        await db.likes.delete_one({"article_id": article_id, "user_id": current["id"]})
        liked = False
    else:
        await db.likes.insert_one(
            {
                "id": str(uuid.uuid4()),
                "article_id": article_id,
                "user_id": current["id"],
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        liked = True
    count = await db.likes.count_documents({"article_id": article_id})
    return {"liked": liked, "likes_count": count}


# ========== COMMENTS ==========
@api_router.get("/articles/{article_id}/comments", response_model=List[CommentOut])
async def list_comments(article_id: str):
    docs = (
        await db.comments.find({"article_id": article_id}, {"_id": 0})
        .sort("created_at", 1)
        .to_list(500)
    )
    return [CommentOut(**d) for d in docs]


@api_router.post("/articles/{article_id}/comments", response_model=CommentOut)
async def add_comment(
    article_id: str, payload: CommentCreate, current=Depends(get_current_user)
):
    article = await db.articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="المقال غير موجود")
    doc = {
        "id": str(uuid.uuid4()),
        "article_id": article_id,
        "content": payload.content.strip(),
        "author_id": current["id"],
        "author_name": current["name"],
        "author_color": current.get("avatar_color", "from-pink-400 to-fuchsia-500"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.comments.insert_one(doc)
    doc.pop("_id", None)
    return CommentOut(**doc)


@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, current=Depends(get_current_user)):
    doc = await db.comments.find_one({"id": comment_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="التعليق غير موجود")
    if doc["author_id"] != current["id"] and current.get("role") != "admin":
        raise HTTPException(status_code=403, detail="لا تملكين صلاحية الحذف")
    await db.comments.delete_one({"id": comment_id})
    return {"ok": True}


# ========== ADMIN PANEL ==========
@api_router.get("/admin/stats", response_model=AdminStats)
async def admin_stats(current=Depends(require_admin)):
    return AdminStats(
        teachers_count=await db.users.count_documents({"role": "teacher"}),
        admins_count=await db.users.count_documents({"role": "admin"}),
        articles_count=await db.articles.count_documents({}),
        comments_count=await db.comments.count_documents({}),
        likes_count=await db.likes.count_documents({}),
        blocked_count=await db.users.count_documents({"is_blocked": True}),
    )


@api_router.get("/admin/users", response_model=List[AdminUserOut])
async def admin_list_users(current=Depends(require_admin)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(1000)
    if not users:
        return []
    # Bulk aggregate counts in 2 queries
    articles_counts = {}
    async for row in db.articles.aggregate([
        {"$group": {"_id": "$author_id", "count": {"$sum": 1}}},
    ]):
        articles_counts[row["_id"]] = row["count"]
    comments_counts = {}
    async for row in db.comments.aggregate([
        {"$group": {"_id": "$author_id", "count": {"$sum": 1}}},
    ]):
        comments_counts[row["_id"]] = row["count"]
    return [
        AdminUserOut(
            id=u["id"],
            name=u["name"],
            email=u["email"],
            role=u.get("role", "teacher"),
            avatar_color=u.get("avatar_color", "from-pink-400 to-fuchsia-500"),
            created_at=u["created_at"],
            is_blocked=u.get("is_blocked", False),
            articles_count=articles_counts.get(u["id"], 0),
            comments_count=comments_counts.get(u["id"], 0),
        )
        for u in users
    ]


@api_router.put("/admin/users/{user_id}", response_model=AdminUserOut)
async def admin_update_user(
    user_id: str, payload: AdminUserUpdate, current=Depends(require_admin)
):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="المستخدمة غير موجودة")
    if user_id == current["id"] and payload.role == "teacher":
        raise HTTPException(status_code=400, detail="لا يمكنك تنزيل صلاحياتك بنفسك")
    if user_id == current["id"] and payload.is_blocked is True:
        raise HTTPException(status_code=400, detail="لا يمكنك حظر نفسك")
    updates = {}
    if payload.role is not None:
        updates["role"] = payload.role
    if payload.is_blocked is not None:
        updates["is_blocked"] = payload.is_blocked
    if payload.name is not None:
        new_name = payload.name.strip()
        updates["name"] = new_name
        # Propagate name change to existing articles & comments authored by this user
        await db.articles.update_many({"author_id": user_id}, {"$set": {"author_name": new_name}})
        await db.comments.update_many({"author_id": user_id}, {"$set": {"author_name": new_name}})
    if updates:
        await db.users.update_one({"id": user_id}, {"$set": updates})
    new_user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return AdminUserOut(
        id=new_user["id"],
        name=new_user["name"],
        email=new_user["email"],
        role=new_user.get("role", "teacher"),
        avatar_color=new_user.get("avatar_color", "from-pink-400 to-fuchsia-500"),
        created_at=new_user["created_at"],
        is_blocked=new_user.get("is_blocked", False),
        articles_count=await db.articles.count_documents({"author_id": user_id}),
        comments_count=await db.comments.count_documents({"author_id": user_id}),
    )


@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, current=Depends(require_admin)):
    if user_id == current["id"]:
        raise HTTPException(status_code=400, detail="لا يمكنك حذف نفسك")
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="المستخدمة غير موجودة")
    # Cascade delete articles, comments, likes by this user
    await db.articles.delete_many({"author_id": user_id})
    await db.comments.delete_many({"author_id": user_id})
    await db.likes.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    return {"ok": True}


@api_router.get("/admin/comments", response_model=List[CommentOut])
async def admin_list_comments(current=Depends(require_admin)):
    docs = await db.comments.find({}, {"_id": 0}).sort("created_at", -1).to_list(2000)
    return [CommentOut(**d) for d in docs]


# Health
@api_router.get("/")
async def root():
    return {"app": "بخبراتنا نسمو", "ok": True}


app.include_router(api_router)

# CORS
cors_env = os.environ.get("CORS_ORIGINS", "*")
frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
if cors_env.strip() == "*":
    cors_origins = ["*"]
    allow_credentials = False  # browsers reject "*" with credentials
else:
    cors_origins = [o.strip() for o in cors_env.split(",") if o.strip()]
    if frontend_url and frontend_url not in cors_origins:
        cors_origins.append(frontend_url)
    if "http://localhost:3000" not in cors_origins:
        cors_origins.append("http://localhost:3000")
    allow_credentials = True

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.articles.create_index("id", unique=True)
    await db.articles.create_index("created_at")
    await db.comments.create_index("article_id")
    await db.likes.create_index([("article_id", 1), ("user_id", 1)], unique=True)

    # Seed admin
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@namu.sa")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@2026")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "name": "إدارة المدونة",
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "role": "admin",
                "avatar_color": "from-amber-400 to-orange-500",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info(f"Admin seeded: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
