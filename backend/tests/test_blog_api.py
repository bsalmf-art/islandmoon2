"""
Backend API tests for "بخبراتنا نسمو" blog.
Tests auth (register/login/me/logout), articles CRUD, likes toggle, comments.
Uses requests.Session cookie jar to validate httpOnly cookie-based auth.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pdf-search-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@namu.sa"
ADMIN_PASSWORD = "Admin@2026"
SEED_USER = {"email": "sarah@namu.sa", "password": "Password123"}
SEED_USER_2 = {"email": "mona@namu.sa", "password": "Password123"}


def _session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------------- Health ----------------
def test_health_root():
    r = requests.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True


# ---------------- Auth ----------------
class TestAuth:
    def test_register_new_teacher_sets_cookie(self):
        s = _session()
        unique = uuid.uuid4().hex[:8]
        email = f"TEST_{unique}@namu.sa"
        payload = {"name": f"TEST معلمة {unique}", "email": email, "password": "Password123"}
        r = s.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["email"] == email.lower()
        assert body["name"] == payload["name"]
        assert body["role"] == "teacher"
        assert "id" in body and isinstance(body["id"], str)
        assert "_id" not in body
        assert "password_hash" not in body
        # httpOnly cookie set
        assert "access_token" in s.cookies.get_dict()
        # me works with cookie
        me = s.get(f"{API}/auth/me")
        assert me.status_code == 200
        assert me.json()["email"] == email.lower()

    def test_register_duplicate_email_returns_400_arabic(self):
        s = _session()
        r = s.post(f"{API}/auth/register", json={
            "name": "أ. سارة العتيبي",
            "email": SEED_USER["email"],
            "password": "Password123",
        })
        assert r.status_code == 400
        detail = r.json().get("detail", "")
        # Arabic message
        assert "مسجل" in detail or "مسبق" in detail, detail

    def test_login_seeded_user_success_cookie(self):
        s = _session()
        r = s.post(f"{API}/auth/login", json=SEED_USER)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["email"] == SEED_USER["email"]
        assert "_id" not in body
        assert "password_hash" not in body
        assert "access_token" in s.cookies.get_dict()

    def test_login_wrong_password_401(self):
        s = _session()
        r = s.post(f"{API}/auth/login", json={"email": SEED_USER["email"], "password": "wrong_wrong"})
        assert r.status_code == 401
        detail = r.json().get("detail", "")
        assert "البريد" in detail or "كلمة" in detail, detail

    def test_me_without_cookie_returns_401(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_logout_clears_cookie(self):
        s = _session()
        r = s.post(f"{API}/auth/login", json=SEED_USER)
        assert r.status_code == 200
        assert "access_token" in s.cookies.get_dict()
        r2 = s.post(f"{API}/auth/logout")
        assert r2.status_code == 200
        # After logout, me should return 401 (cookie removed)
        me = s.get(f"{API}/auth/me")
        assert me.status_code == 401


# ---------------- Articles + Likes + Comments ----------------
@pytest.fixture(scope="module")
def user_session():
    s = _session()
    r = s.post(f"{API}/auth/login", json=SEED_USER)
    assert r.status_code == 200, f"Seed user login failed: {r.text}"
    return s


@pytest.fixture(scope="module")
def user2_session():
    s = _session()
    r = s.post(f"{API}/auth/login", json=SEED_USER_2)
    assert r.status_code == 200, f"Seed user2 login failed: {r.text}"
    return s


@pytest.fixture(scope="module")
def admin_session():
    s = _session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return s


class TestArticles:
    def test_list_articles_no_auth(self):
        r = requests.get(f"{API}/articles")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for art in data:
            assert "_id" not in art
            assert art.get("liked_by_me") is False  # no auth
            assert "id" in art and "title" in art

    def test_create_article_requires_auth(self):
        r = requests.post(f"{API}/articles", json={
            "title": "TEST عنوان",
            "content": "TEST محتوى طويل كفاية",
            "category": "عام",
            "cover_emoji": "🌸",
        })
        assert r.status_code == 401

    def test_create_get_delete_article(self, user_session):
        payload = {
            "title": f"TEST تجربتي {uuid.uuid4().hex[:6]}",
            "content": "TEST محتوى المقال الطويل لأجل الاختبار",
            "category": "رحلتي",
            "cover_emoji": "✨",
        }
        r = user_session.post(f"{API}/articles", json=payload)
        assert r.status_code == 200, r.text
        art = r.json()
        assert art["title"] == payload["title"]
        assert art["content"] == payload["content"]
        assert art["category"] == payload["category"]
        assert art["cover_emoji"] == payload["cover_emoji"]
        assert art["author_name"]
        assert art["likes_count"] == 0
        assert art["comments_count"] == 0
        assert "_id" not in art
        aid = art["id"]

        # GET by id
        r2 = requests.get(f"{API}/articles/{aid}")
        assert r2.status_code == 200
        got = r2.json()
        assert got["id"] == aid
        assert got["title"] == payload["title"]
        assert "_id" not in got

        # DELETE
        r3 = user_session.delete(f"{API}/articles/{aid}")
        assert r3.status_code == 200
        assert r3.json().get("ok") is True

        # Verify 404 after delete
        r4 = requests.get(f"{API}/articles/{aid}")
        assert r4.status_code == 404

    def test_delete_article_non_owner_forbidden(self, user_session, user2_session):
        # user1 creates
        r = user_session.post(f"{API}/articles", json={
            "title": "TEST ownership",
            "content": "TEST محتوى الاختبار للملكية",
        })
        assert r.status_code == 200
        aid = r.json()["id"]
        # user2 tries delete -> 403
        r2 = user2_session.delete(f"{API}/articles/{aid}")
        assert r2.status_code == 403
        # cleanup by owner
        user_session.delete(f"{API}/articles/{aid}")

    def test_admin_can_delete_any_article(self, user_session, admin_session):
        r = user_session.post(f"{API}/articles", json={
            "title": "TEST admin delete",
            "content": "TEST محتوى حذف الإدارة",
        })
        assert r.status_code == 200
        aid = r.json()["id"]
        r2 = admin_session.delete(f"{API}/articles/{aid}")
        assert r2.status_code == 200
        r3 = requests.get(f"{API}/articles/{aid}")
        assert r3.status_code == 404

    def test_get_nonexistent_article_404(self):
        r = requests.get(f"{API}/articles/{uuid.uuid4()}")
        assert r.status_code == 404


class TestLikes:
    def test_like_toggle(self, user_session):
        # create article
        r = user_session.post(f"{API}/articles", json={
            "title": "TEST like",
            "content": "TEST محتوى الإعجاب",
        })
        aid = r.json()["id"]
        try:
            # like
            r1 = user_session.post(f"{API}/articles/{aid}/like")
            assert r1.status_code == 200
            body1 = r1.json()
            assert body1["liked"] is True
            assert body1["likes_count"] == 1

            # verify liked_by_me true in GET
            g = user_session.get(f"{API}/articles/{aid}")
            assert g.status_code == 200
            assert g.json()["liked_by_me"] is True
            assert g.json()["likes_count"] == 1

            # unlike
            r2 = user_session.post(f"{API}/articles/{aid}/like")
            assert r2.status_code == 200
            body2 = r2.json()
            assert body2["liked"] is False
            assert body2["likes_count"] == 0
        finally:
            user_session.delete(f"{API}/articles/{aid}")

    def test_like_requires_auth(self):
        # list one existing article
        lst = requests.get(f"{API}/articles").json()
        if not lst:
            pytest.skip("no articles seeded")
        aid = lst[0]["id"]
        r = requests.post(f"{API}/articles/{aid}/like")
        assert r.status_code == 401


class TestComments:
    def test_list_comments_no_auth(self):
        lst = requests.get(f"{API}/articles").json()
        if not lst:
            pytest.skip("no articles")
        aid = lst[0]["id"]
        r = requests.get(f"{API}/articles/{aid}/comments")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_add_and_delete_comment(self, user_session):
        r = user_session.post(f"{API}/articles", json={
            "title": "TEST comments",
            "content": "TEST محتوى التعليقات",
        })
        aid = r.json()["id"]
        try:
            c = user_session.post(f"{API}/articles/{aid}/comments", json={"content": "TEST تعليق رائع"})
            assert c.status_code == 200, c.text
            cbody = c.json()
            assert cbody["content"] == "TEST تعليق رائع"
            assert cbody["article_id"] == aid
            assert "_id" not in cbody
            cid = cbody["id"]

            lst = requests.get(f"{API}/articles/{aid}/comments").json()
            assert any(x["id"] == cid for x in lst)

            # comments_count reflected on article
            art = requests.get(f"{API}/articles/{aid}").json()
            assert art["comments_count"] >= 1

            # delete comment
            d = user_session.delete(f"{API}/comments/{cid}")
            assert d.status_code == 200
        finally:
            user_session.delete(f"{API}/articles/{aid}")

    def test_add_comment_requires_auth(self):
        lst = requests.get(f"{API}/articles").json()
        if not lst:
            pytest.skip("no articles")
        aid = lst[0]["id"]
        r = requests.post(f"{API}/articles/{aid}/comments", json={"content": "nope"})
        assert r.status_code == 401

    def test_delete_other_user_comment_forbidden(self, user_session, user2_session):
        r = user_session.post(f"{API}/articles", json={
            "title": "TEST del other comment",
            "content": "TEST محتوى",
        })
        aid = r.json()["id"]
        try:
            c = user_session.post(f"{API}/articles/{aid}/comments", json={"content": "TEST t"})
            cid = c.json()["id"]
            d = user2_session.delete(f"{API}/comments/{cid}")
            assert d.status_code == 403
        finally:
            user_session.delete(f"{API}/articles/{aid}")


# ---------------- CORS ----------------
class TestCORS:
    def test_cors_allows_frontend_origin_with_credentials(self):
        origin = BASE_URL
        # Actual GET (what browser sends with withCredentials). Preflight is handled by
        # the Cloudflare/ingress layer and its headers are not from FastAPI CORSMiddleware.
        r = requests.get(f"{API}/articles", headers={"Origin": origin})
        assert r.status_code == 200
        assert r.headers.get("access-control-allow-credentials", "").lower() == "true", (
            f"Missing ACAC header. Got headers: {dict(r.headers)}"
        )
        allow_origin = r.headers.get("access-control-allow-origin", "")
        # Either echoed origin or '*' (ingress may rewrite, but ACAC=true must be present)
        assert allow_origin in (origin, "*"), f"Unexpected ACAO: {allow_origin}"
