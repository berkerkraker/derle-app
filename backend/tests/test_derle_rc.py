"""Derle RC quality tests — backend health, AI organize, fallback, sync."""
import pytest
import requests
import os

BASE_URL = os.environ.get("EXPO_BACKEND_URL", "").rstrip("/")


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ── Health ──────────────────────────────────────────────────────────────────
class TestHealth:
    def test_root_ok(self, client):
        r = client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        d = r.json()
        assert d.get("ok") is True
        assert d.get("service") == "derle"
        assert "ai_configured" in d
        print(f"ai_configured={d['ai_configured']}")

    def test_ai_configured_true(self, client):
        """OPENAI_API_KEY should be active per task context."""
        r = client.get(f"{BASE_URL}/api/")
        assert r.json().get("ai_configured") is True


# ── AI Organize ──────────────────────────────────────────────────────────────
class TestAIOrganize:
    def test_basic_split(self, client):
        """'süt al kahve al annemi ara' → ≥3 items."""
        r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "süt al kahve al annemi ara", "lang": "tr"})
        assert r.status_code == 200
        d = r.json()
        assert d.get("source") == "ai"
        items = d.get("items", [])
        assert len(items) >= 3, f"Expected ≥3 items, got {len(items)}: {items}"

    def test_full_sentence_5plus(self, client):
        """'bugün marketten süt al kahve al annemi ara müşteriyle konuş sunumu hazırla' → ≥5 items."""
        text = "bugün marketten süt al kahve al annemi ara müşteriyle konuş sunumu hazırla"
        r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": text, "lang": "tr"})
        assert r.status_code == 200
        d = r.json()
        assert d.get("source") == "ai"
        items = d.get("items", [])
        assert len(items) >= 5, f"Expected ≥5 items, got {len(items)}: {items}"
        cats = [i["category"] for i in items]
        print(f"Items: {items}")
        # Should have alisveris, kisisel, para_is categories
        assert "alisveris" in cats or "gorevler" in cats

    def test_categories_valid(self, client):
        """All returned categories must be valid."""
        valid = {"gorevler", "fikirler", "kisisel", "alisveris", "saglik", "para_is", "notlar"}
        r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "süt al annemi ara toplantı var", "lang": "tr"})
        assert r.status_code == 200
        for item in r.json().get("items", []):
            assert item["category"] in valid

    def test_priorities_valid(self, client):
        """All returned priorities must be high/medium/low."""
        valid = {"high", "medium", "low"}
        r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "acil ilaç al yarın toplantı", "lang": "tr"})
        assert r.status_code == 200
        for item in r.json().get("items", []):
            assert item["priority"] in valid

    def test_empty_text(self, client):
        """Empty text → empty items list."""
        r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "", "lang": "tr"})
        assert r.status_code == 200
        assert r.json().get("items") == []

    def test_fallback_signal(self, client):
        """Source must be 'ai' or 'fallback', never missing."""
        r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "test note", "lang": "tr"})
        assert r.status_code == 200
        assert r.json().get("source") in ("ai", "fallback")


# ── Auth endpoints ────────────────────────────────────────────────────────────
class TestAuthEndpoints:
    def test_me_unauthenticated(self, client):
        r = client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_notes_unauthenticated(self, client):
        r = client.get(f"{BASE_URL}/api/notes")
        assert r.status_code == 401

    def test_sync_unauthenticated(self, client):
        r = client.post(f"{BASE_URL}/api/notes/sync", json={"notes": []})
        assert r.status_code == 401
