"""Derle backend — notes app API.

Provides:
- Optional Google auth (Emergent-managed) for cloud backup/sync.
- Per-user notes sync (offline-first, last-write-wins + tombstones).
- AI organize proxy (user's own OpenAI key, server-side only) with clean
  failure signalling so the mobile app can fall back to its on-device engine.
"""

import os
import json
import logging
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import List, Optional, Annotated, Any

import httpx
from fastapi import FastAPI, APIRouter, Header, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, BeforeValidator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-5.4-mini").strip()
OPENAI_MODEL_FALLBACK = os.environ.get("OPENAI_MODEL_FALLBACK", "gpt-4o-mini").strip()

EMERGENT_SESSION_URL = (
    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"
)
SESSION_TTL_DAYS = 7

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("derle")

app = FastAPI(title="Derle API")
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]

CATEGORY_IDS = ["gorevler", "fikirler", "kisisel", "alisveris", "saglik", "para_is", "notlar"]
PRIORITIES = ["high", "medium", "low"]


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class SessionIn(BaseModel):
    session_id: str


class NoteIn(BaseModel):
    id: str
    text: str = ""
    category: str = "notlar"
    priority: str = "low"
    pinned: bool = False
    done: bool = False
    createdAt: int
    updatedAt: int
    deleted: bool = False
    source: Optional[str] = None


class SyncIn(BaseModel):
    notes: List[NoteIn] = Field(default_factory=list)


class OrganizeIn(BaseModel):
    text: str
    lang: str = "tr"


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def aware(dt: Any) -> datetime:
    if isinstance(dt, datetime):
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    return now_utc()


async def get_current_user(authorization: Optional[str]) -> dict:
    """Resolve the authenticated user from a Bearer session token (401 on fail)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ", 1)[1].strip()
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    if aware(session.get("expires_at")) < now_utc():
        await db.user_sessions.delete_one({"session_token": token})
        raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# AI organize (user's own OpenAI key, server-side only)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are the organizing engine of "Derle", a Turkish-first brain-dump notes app.
The user pastes raw, unstructured thoughts (usually Turkish). Turn them into clean note items.

THE ONLY TRANSFORMATIONS YOU ARE ALLOWED TO MAKE:
1) Fix obvious spelling / typing mistakes (imla/yazim) in the user's own language.
2) Split the text into separate items ONLY when it clearly contains multiple distinct thoughts
   (multiple lines, bullet points, or clearly separate tasks). A single thought stays as ONE item.

STRICT RULES — NEVER VIOLATE:
- NEVER rewrite, rephrase, paraphrase, summarize, shorten, expand, or translate the user's text.
- NEVER drop words you consider unimportant. Keep the user's exact wording and meaning.
- NEVER add new information or invent content.
- Keep each item in the SAME language the user wrote it in.
- Preserve the original phrasing; only correct clear typos.

For EACH item assign:
- category: exactly one of [gorevler, fikirler, kisisel, alisveris, saglik, para_is, notlar].
  gorevler = a task / thing to do; fikirler = an idea or thought; kisisel = personal life / people / relationships;
  alisveris = shopping / things to buy; saglik = health / medical; para_is = money / work / finance / business;
  notlar = general note / anything else.
- priority: "high" (clearly urgent or important — words like acil, bugun, son tarih, deadline, hemen),
  "medium" (a real actionable task to do soon), "low" (general note/idea, no urgency).

Return ONLY the structured JSON."""

ORGANIZE_SCHEMA = {
    "type": "object",
    "properties": {
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "category": {"type": "string", "enum": CATEGORY_IDS},
                    "priority": {"type": "string", "enum": PRIORITIES},
                },
                "required": ["text", "category", "priority"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["items"],
    "additionalProperties": False,
}


def _sanitize_items(data: dict) -> List[dict]:
    out: List[dict] = []
    for it in (data or {}).get("items", [])[:50]:
        text = (it.get("text") or "").strip()
        if not text:
            continue
        cat = it.get("category") if it.get("category") in CATEGORY_IDS else "notlar"
        pri = it.get("priority") if it.get("priority") in PRIORITIES else "low"
        out.append({"text": text, "category": cat, "priority": pri})
    return out


async def organize_with_openai(text: str) -> Optional[List[dict]]:
    if not OPENAI_API_KEY:
        return None
    try:
        from openai import AsyncOpenAI
    except Exception as e:  # pragma: no cover
        logger.warning("openai import failed: %s", e)
        return None

    oa = AsyncOpenAI(api_key=OPENAI_API_KEY, timeout=25.0)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": text},
    ]
    response_format = {
        "type": "json_schema",
        "json_schema": {"name": "organized_notes", "strict": True, "schema": ORGANIZE_SCHEMA},
    }

    for model in [OPENAI_MODEL, OPENAI_MODEL_FALLBACK]:
        if not model:
            continue
        # Try with temperature first; some newer models reject it -> retry without.
        for params in ({"temperature": 0}, {}):
            try:
                resp = await oa.chat.completions.create(
                    model=model,
                    messages=messages,
                    response_format=response_format,
                    **params,
                )
                content = resp.choices[0].message.content or "{}"
                items = _sanitize_items(json.loads(content))
                if items:
                    logger.info("AI organize ok via %s (%d items)", model, len(items))
                    return items
            except Exception as e:
                msg = str(e)
                if "temperature" in msg and params:
                    continue  # the no-temperature retry handles it
                logger.warning("AI organize failed (%s): %s", model, msg[:200])
                break  # move on to fallback model
    return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"ok": True, "service": "derle", "ai_configured": bool(OPENAI_API_KEY)}


@api_router.post("/ai/organize")
async def ai_organize(payload: OrganizeIn):
    text = (payload.text or "").strip()
    if not text:
        return {"source": "ai", "items": []}
    items = await organize_with_openai(text)
    if items is None:
        # Clean failure: tell the client to use its on-device engine.
        return {"source": "fallback", "items": []}
    return {"source": "ai", "items": items}


@api_router.post("/auth/session")
async def auth_session(payload: SessionIn):
    """Exchange an Emergent session_id for our app session + user profile."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as hc:
            r = await hc.get(
                EMERGENT_SESSION_URL,
                headers={"X-Session-ID": payload.session_id},
            )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session_id")
        data = r.json()
    except HTTPException:
        raise
    except Exception as e:
        logger.warning("session exchange failed: %s", e)
        raise HTTPException(status_code=502, detail="Auth service unavailable")

    email = (data.get("email") or "").lower().strip()
    if not email:
        raise HTTPException(status_code=401, detail="No email in session")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        name = data.get("name") or existing.get("name", "")
        picture = data.get("picture") or existing.get("picture", "")
        await db.users.update_one(
            {"user_id": user_id}, {"$set": {"name": name, "picture": picture}}
        )
        user = {**existing, "name": name, "picture": picture}
    else:
        user_id = "user_" + uuid.uuid4().hex[:12]
        user = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name") or "",
            "picture": data.get("picture") or "",
            "created_at": now_utc().isoformat(),
        }
        await db.users.insert_one(dict(user))

    session_token = data.get("session_token") or ("st_" + uuid.uuid4().hex)
    await db.user_sessions.update_one(
        {"session_token": session_token},
        {"$set": {
            "session_token": session_token,
            "user_id": user_id,
            "expires_at": now_utc() + timedelta(days=SESSION_TTL_DAYS),
            "created_at": now_utc(),
        }},
        upsert=True,
    )
    user.pop("_id", None)
    return {"user": user, "session_token": session_token}


@api_router.get("/auth/me")
async def auth_me(authorization: Optional[str] = Header(default=None)):
    user = await get_current_user(authorization)
    return {"user": user}


@api_router.post("/auth/logout")
async def auth_logout(authorization: Optional[str] = Header(default=None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


@api_router.delete("/auth/account")
async def auth_delete_account(authorization: Optional[str] = Header(default=None)):
    user = await get_current_user(authorization)
    uid = user["user_id"]
    await db.notes.delete_many({"user_id": uid})
    await db.user_sessions.delete_many({"user_id": uid})
    await db.users.delete_one({"user_id": uid})
    logger.info("account deleted: %s", uid)
    return {"ok": True}


@api_router.get("/notes")
async def get_notes(authorization: Optional[str] = Header(default=None)):
    user = await get_current_user(authorization)
    docs = await db.notes.find(
        {"user_id": user["user_id"]}, {"_id": 0, "user_id": 0}
    ).to_list(5000)
    return {"notes": docs, "serverTime": now_utc().isoformat()}


@api_router.post("/notes/sync")
async def sync_notes(payload: SyncIn, authorization: Optional[str] = Header(default=None)):
    """Last-write-wins merge of client notes with the server copy."""
    user = await get_current_user(authorization)
    uid = user["user_id"]

    existing = {
        d["id"]: d
        for d in await db.notes.find({"user_id": uid}, {"_id": 0}).to_list(5000)
    }

    for note in payload.notes:
        nd = note.model_dump()
        prev = existing.get(nd["id"])
        if prev is None or int(nd["updatedAt"]) >= int(prev.get("updatedAt", 0)):
            nd["user_id"] = uid
            await db.notes.update_one(
                {"user_id": uid, "id": nd["id"]}, {"$set": nd}, upsert=True
            )
            existing[nd["id"]] = nd

    merged = await db.notes.find(
        {"user_id": uid}, {"_id": 0, "user_id": 0}
    ).to_list(5000)
    return {"notes": merged, "serverTime": now_utc().isoformat()}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("user_id", unique=True)
        await db.user_sessions.create_index("session_token", unique=True)
        await db.user_sessions.create_index("user_id")
        await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
        await db.notes.create_index([("user_id", 1), ("id", 1)], unique=True)
    except Exception as e:  # pragma: no cover
        logger.warning("index creation: %s", e)
    logger.info("Derle API ready (ai_configured=%s)", bool(OPENAI_API_KEY))


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
