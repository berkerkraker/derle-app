"""Derle backend API tests — health, AI organize, auth endpoints"""
import pytest
import requests
import os

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "").rstrip("/")


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health
def test_health(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert data.get("service") == "derle"
    assert "ai_configured" in data


# AI organize — fallback (no key)
def test_ai_organize_fallback(client):
    r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "yarın marketten süt al", "lang": "tr"})
    assert r.status_code == 200
    data = r.json()
    assert data.get("source") == "fallback"
    assert isinstance(data.get("items"), list)


def test_ai_organize_empty_text(client):
    r = client.post(f"{BASE_URL}/api/ai/organize", json={"text": "", "lang": "tr"})
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data.get("items"), list)


# Auth endpoints — unauthenticated access should return 401/422
def test_get_notes_unauthenticated(client):
    r = client.get(f"{BASE_URL}/api/notes")
    assert r.status_code == 401


def test_sync_notes_unauthenticated(client):
    r = client.post(f"{BASE_URL}/api/notes/sync", json={"notes": []})
    assert r.status_code == 401


def test_auth_me_unauthenticated(client):
    r = client.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401
