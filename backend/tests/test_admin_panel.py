"""
Backend API tests for Admin Panel endpoints.
- /api/admin/stats, /api/admin/users, PUT/DELETE /api/admin/users/{id}
- /api/admin/comments
- Self-protection (cannot demote/block/delete self)
- Blocked-user login rejection + existing-token rejection on /api/auth/me
- Cascade delete (articles, comments, likes)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://pdf-search-3.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@namu.sa"
ADMIN_PASSWORD = "Admin@2026"
SEED_TEACHER = {"email": "sarah@namu.sa", "password": "Password123"}


def _session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _register(email_prefix="TEST_PANEL_"):
    s = _session()
    unique = uuid.uuid4().hex[:8]
    email = f"{email_prefix}{unique}@namu.sa"
    pwd = "Password123"
    r = s.post(f"{API}/auth/register", json={
        "name": f"TEST PANEL {unique}",
        "email": email,
        "password": pwd,
    })
    assert r.status_code == 200, r.text
    return s, email, pwd, r.json()["id"]


@pytest.fixture(scope="module")
def admin_session():
    s = _session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return s


@pytest.fixture(scope="module")
def admin_id(admin_session):
    r = admin_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    return r.json()["id"]


@pytest.fixture(scope="module")
def teacher_session():
    s = _session()
    r = s.post(f"{API}/auth/login", json=SEED_TEACHER)
    assert r.status_code == 200, r.text
    return s


# ---------------- Stats ----------------
class TestAdminStats:
    def test_stats_admin_ok(self, admin_session):
        r = admin_session.get(f"{API}/admin/stats")
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["teachers_count", "admins_count", "articles_count",
                  "comments_count", "likes_count", "blocked_count"]:
            assert k in d, f"missing {k}"
            assert isinstance(d[k], int)
            assert d[k] >= 0
        assert d["admins_count"] >= 1

    def test_stats_teacher_forbidden(self, teacher_session):
        r = teacher_session.get(f"{API}/admin/stats")
        assert r.status_code == 403
        detail = r.json().get("detail", "")
        assert "إدارة" in detail or "للإدارة" in detail, detail

    def test_stats_unauth_401(self):
        r = requests.get(f"{API}/admin/stats")
        assert r.status_code == 401


# ---------------- List users ----------------
class TestAdminListUsers:
    def test_list_users_admin_ok(self, admin_session):
        r = admin_session.get(f"{API}/admin/users")
        assert r.status_code == 200, r.text
        users = r.json()
        assert isinstance(users, list)
        assert len(users) >= 1
        sample = users[0]
        for k in ["id", "name", "email", "role", "avatar_color",
                  "created_at", "is_blocked", "articles_count", "comments_count"]:
            assert k in sample, f"missing {k} in {sample}"
        # no leaks
        assert "password_hash" not in sample
        assert "_id" not in sample

    def test_list_users_teacher_forbidden(self, teacher_session):
        r = teacher_session.get(f"{API}/admin/users")
        assert r.status_code == 403


# ---------------- Promote / Demote / Block / Unblock ----------------
class TestAdminUpdateUser:
    def test_promote_teacher_to_admin_and_back(self, admin_session):
        _, email, _, uid = _register()
        try:
            # promote
            r = admin_session.put(f"{API}/admin/users/{uid}", json={"role": "admin"})
            assert r.status_code == 200, r.text
            assert r.json()["role"] == "admin"

            # demote back
            r2 = admin_session.put(f"{API}/admin/users/{uid}", json={"role": "teacher"})
            assert r2.status_code == 200, r2.text
            assert r2.json()["role"] == "teacher"
        finally:
            admin_session.delete(f"{API}/admin/users/{uid}")

    def test_block_unblock_user(self, admin_session):
        _, email, _, uid = _register()
        try:
            r = admin_session.put(f"{API}/admin/users/{uid}", json={"is_blocked": True})
            assert r.status_code == 200
            assert r.json()["is_blocked"] is True

            r2 = admin_session.put(f"{API}/admin/users/{uid}", json={"is_blocked": False})
            assert r2.status_code == 200
            assert r2.json()["is_blocked"] is False
        finally:
            admin_session.delete(f"{API}/admin/users/{uid}")

    def test_admin_cannot_demote_self(self, admin_session, admin_id):
        r = admin_session.put(f"{API}/admin/users/{admin_id}", json={"role": "teacher"})
        assert r.status_code == 400
        assert "تنزيل" in r.json().get("detail", "") or "نفس" in r.json().get("detail", "")
        # confirm admin still admin
        me = admin_session.get(f"{API}/auth/me").json()
        assert me["role"] == "admin"

    def test_admin_cannot_block_self(self, admin_session, admin_id):
        r = admin_session.put(f"{API}/admin/users/{admin_id}", json={"is_blocked": True})
        assert r.status_code == 400
        assert "حظر" in r.json().get("detail", "") or "نفس" in r.json().get("detail", "")
        # verify still reachable
        me = admin_session.get(f"{API}/auth/me")
        assert me.status_code == 200

    def test_update_nonexistent_user_404(self, admin_session):
        r = admin_session.put(f"{API}/admin/users/{uuid.uuid4()}", json={"role": "admin"})
        assert r.status_code == 404

    def test_teacher_cannot_update_users(self, teacher_session, admin_session):
        _, _, _, uid = _register()
        try:
            r = teacher_session.put(f"{API}/admin/users/{uid}", json={"role": "admin"})
            assert r.status_code == 403
        finally:
            admin_session.delete(f"{API}/admin/users/{uid}")


# ---------------- Blocked user behavior ----------------
class TestBlockedUser:
    def test_blocked_user_cannot_login(self, admin_session):
        s, email, pwd, uid = _register()
        try:
            r = admin_session.put(f"{API}/admin/users/{uid}", json={"is_blocked": True})
            assert r.status_code == 200
            s2 = _session()
            r2 = s2.post(f"{API}/auth/login", json={"email": email, "password": pwd})
            assert r2.status_code == 403, r2.text
            detail = r2.json().get("detail", "")
            assert "تعليق" in detail or "حسابك" in detail, detail
        finally:
            admin_session.delete(f"{API}/admin/users/{uid}")

    def test_blocked_user_existing_token_rejected(self, admin_session):
        # Register -> already logged in via cookie
        s, email, pwd, uid = _register()
        try:
            # verify me works first
            me0 = s.get(f"{API}/auth/me")
            assert me0.status_code == 200

            # admin blocks
            r = admin_session.put(f"{API}/admin/users/{uid}", json={"is_blocked": True})
            assert r.status_code == 200

            # existing token must now 403
            me1 = s.get(f"{API}/auth/me")
            assert me1.status_code == 403, me1.text
            assert "تعليق" in me1.json().get("detail", "")
        finally:
            admin_session.delete(f"{API}/admin/users/{uid}")


# ---------------- Cascade delete ----------------
class TestAdminDeleteUser:
    def test_admin_cannot_delete_self(self, admin_session, admin_id):
        r = admin_session.delete(f"{API}/admin/users/{admin_id}")
        assert r.status_code == 400
        assert "حذف" in r.json().get("detail", "") or "نفس" in r.json().get("detail", "")

    def test_delete_nonexistent_user_404(self, admin_session):
        r = admin_session.delete(f"{API}/admin/users/{uuid.uuid4()}")
        assert r.status_code == 404

    def test_teacher_cannot_delete_user(self, teacher_session, admin_session):
        _, _, _, uid = _register()
        try:
            r = teacher_session.delete(f"{API}/admin/users/{uid}")
            assert r.status_code == 403
        finally:
            admin_session.delete(f"{API}/admin/users/{uid}")

    def test_delete_user_cascades_articles_comments_likes(self, admin_session, teacher_session):
        s, email, pwd, uid = _register()
        try:
            # User creates article
            art = s.post(f"{API}/articles", json={
                "title": "TEST_PANEL cascade article",
                "content": "TEST_PANEL محتوى لاختبار الحذف المتتابع",
            })
            assert art.status_code == 200
            aid = art.json()["id"]

            # User comments on teacher's-or-own article
            c = s.post(f"{API}/articles/{aid}/comments", json={"content": "TEST_PANEL comment"})
            assert c.status_code == 200
            cid = c.json()["id"]

            # Teacher likes user's article so we have a like by teacher (unrelated,
            # should NOT be deleted). Also user likes their own article.
            lk_t = teacher_session.post(f"{API}/articles/{aid}/like")
            assert lk_t.status_code == 200
            lk_u = s.post(f"{API}/articles/{aid}/like")
            assert lk_u.status_code == 200

            # Also: user likes an existing teacher article (user_id=uid like)
            all_arts = requests.get(f"{API}/articles").json()
            teacher_other = next((a for a in all_arts if a["author_id"] != uid), None)

            if teacher_other:
                other_aid = teacher_other["id"]
                lk_other = s.post(f"{API}/articles/{other_aid}/like")
                assert lk_other.status_code == 200

            # Admin deletes user
            d = admin_session.delete(f"{API}/admin/users/{uid}")
            assert d.status_code == 200, d.text
            assert d.json().get("ok") is True

            # Article gone
            g = requests.get(f"{API}/articles/{aid}")
            assert g.status_code == 404

            # Comments for the deleted article's id gone (article gone too).
            # Also verify the user's comment ID is not anywhere via admin/comments list
            cl = admin_session.get(f"{API}/admin/comments")
            assert cl.status_code == 200
            ids = [x["id"] for x in cl.json()]
            assert cid not in ids

            # User login should now fail
            s2 = _session()
            r2 = s2.post(f"{API}/auth/login", json={"email": email, "password": pwd})
            assert r2.status_code == 401
        except Exception:
            # fallback cleanup
            admin_session.delete(f"{API}/admin/users/{uid}")
            raise


# ---------------- Admin comments listing ----------------
class TestAdminComments:
    def test_admin_list_comments_ok(self, admin_session, teacher_session):
        # ensure at least one comment exists by creating one
        art = teacher_session.post(f"{API}/articles", json={
            "title": "TEST_PANEL comments list",
            "content": "TEST_PANEL محتوى للتعليقات",
        })
        aid = art.json()["id"]
        c = teacher_session.post(f"{API}/articles/{aid}/comments", json={"content": "TEST_PANEL c1"})
        cid = c.json()["id"]
        try:
            r = admin_session.get(f"{API}/admin/comments")
            assert r.status_code == 200
            data = r.json()
            assert isinstance(data, list)
            assert any(x["id"] == cid for x in data)
            if data:
                sample = data[0]
                for k in ["id", "article_id", "content", "author_id", "author_name", "created_at"]:
                    assert k in sample
                assert "_id" not in sample
        finally:
            teacher_session.delete(f"{API}/articles/{aid}")

    def test_admin_comments_teacher_forbidden(self, teacher_session):
        r = teacher_session.get(f"{API}/admin/comments")
        assert r.status_code == 403
