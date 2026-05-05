import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Shield, Users, FileText, MessageCircle, Heart, Ban, Crown, GraduationCap,
  ArrowDownCircle, ArrowUpCircle, Trash2, CheckCircle2, AlertCircle, ArrowRight,
  RefreshCw, Pencil,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, color, testid }) {
  return (
    <div className="card-glass p-5 flex items-center gap-4" data-testid={testid}>
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shrink-0`}>
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <div className="text-2xl font-black text-[--c-deep]">{value}</div>
        <div className="text-xs font-bold text-[--c-deep]/60">{label}</div>
      </div>
    </div>
  );
}

function UserRow({ user, onUpdate, onDelete, currentUserId }) {
  const [busy, setBusy] = useState(false);
  const isMe = user.id === currentUserId;
  const initials = user.name?.charAt(0) || "م";

  const update = async (changes) => {
    setBusy(true);
    try {
      await onUpdate(user.id, changes);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`حذف ${user.name} وجميع مقالاتها وتعليقاتها نهائياً؟`)) return;
    setBusy(true);
    try {
      await onDelete(user.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`card-glass p-4 ${user.is_blocked ? "opacity-70 ring-2 ring-rose-200" : ""}`}
      data-testid={`admin-user-row-${user.id}`}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${user.avatar_color} flex items-center justify-center text-white font-bold shadow shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[--c-deep] truncate">{user.name}</span>
            {user.role === "admin" && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-l from-amber-400 to-orange-500 text-white">
                إدارة
              </span>
            )}
            {user.is_blocked && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
                محظورة
              </span>
            )}
            {isMe && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                أنتِ
              </span>
            )}
          </div>
          <div className="text-xs text-[--c-deep]/60 truncate">{user.email}</div>
          <div className="text-[11px] text-[--c-deep]/50 mt-1">
            {user.articles_count} مقال • {user.comments_count} تعليق
          </div>
        </div>

        <div className="flex gap-1 flex-wrap">
          {!isMe && user.role === "teacher" && (
            <button
              onClick={() => update({ role: "admin" })}
              disabled={busy}
              data-testid={`admin-promote-${user.id}`}
              className="px-3 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1"
              title="ترقية إلى مشرفة"
            >
              <ArrowUpCircle size={14} /> ترقية
            </button>
          )}
          {!isMe && user.role === "admin" && (
            <button
              onClick={() => update({ role: "teacher" })}
              disabled={busy}
              data-testid={`admin-demote-${user.id}`}
              className="px-3 py-2 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold flex items-center gap-1"
              title="تنزيل إلى معلمة"
            >
              <ArrowDownCircle size={14} /> تنزيل
            </button>
          )}
          {!isMe && (
            <button
              onClick={() => update({ is_blocked: !user.is_blocked })}
              disabled={busy}
              data-testid={`admin-block-${user.id}`}
              className={`px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1 ${
                user.is_blocked
                  ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                  : "bg-rose-100 hover:bg-rose-200 text-rose-700"
              }`}
              title={user.is_blocked ? "رفع الحظر" : "حظر"}
            >
              {user.is_blocked ? <CheckCircle2 size={14} /> : <Ban size={14} />}
              {user.is_blocked ? "رفع الحظر" : "حظر"}
            </button>
          )}
          {!isMe && (
            <button
              onClick={handleDelete}
              disabled={busy}
              data-testid={`admin-delete-user-${user.id}`}
              className="px-3 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1"
              title="حذف الحساب"
            >
              <Trash2 size={14} /> حذف
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, u, a, c] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/articles"),
        api.get("/admin/comments"),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setArticles(a.data);
      setComments(c.data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user !== false) {
      if (user.role !== "admin") {
        navigate("/");
        return;
      }
      loadAll();
    }
  }, [user, navigate]);

  const handleUserUpdate = async (id, changes) => {
    try {
      const { data } = await api.put(`/admin/users/${id}`, changes);
      setUsers((arr) => arr.map((u) => (u.id === id ? data : u)));
      loadAll();
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  const handleUserDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((arr) => arr.filter((u) => u.id !== id));
      loadAll();
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  const handleArticleDelete = async (id) => {
    if (!window.confirm("حذف المقال نهائياً؟")) return;
    try {
      await api.delete(`/articles/${id}`);
      setArticles((arr) => arr.filter((a) => a.id !== id));
      loadAll();
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  const handleCommentDelete = async (id) => {
    if (!window.confirm("حذف التعليق؟")) return;
    try {
      await api.delete(`/comments/${id}`);
      setComments((arr) => arr.filter((c) => c.id !== id));
      loadAll();
    } catch (err) {
      alert(formatApiError(err));
    }
  };

  if (!user || user === false) return null;

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="btn-pill btn-ghost" data-testid="admin-back-btn">
            <ArrowRight size={18} />
            <span>للرئيسية</span>
          </button>
          <div>
            <h1 className="font-display text-3xl text-[--c-deep] flex items-center gap-2">
              <Crown className="text-amber-500" size={28} />
              لوحة التحكم
            </h1>
            <p className="text-sm text-[--c-deep]/60">إدارة شاملة للموقع والمحتوى</p>
          </div>
        </div>
        <button onClick={loadAll} className="btn-pill btn-ghost" data-testid="admin-refresh-btn">
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>تحديث</span>
        </button>
      </div>

      {error && (
        <div className="card-glass p-4 mb-4 text-rose-700 bg-rose-50 border-rose-200 flex items-center gap-2" data-testid="admin-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap" data-testid="admin-tabs">
        {[
          { id: "overview", label: "نظرة عامة", icon: Shield },
          { id: "users", label: `المعلمات (${users.length})`, icon: Users },
          { id: "articles", label: `المقالات (${articles.length})`, icon: FileText },
          { id: "comments", label: `التعليقات (${comments.length})`, icon: MessageCircle },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`admin-tab-${t.id}`}
            className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
              tab === t.id
                ? "bg-gradient-to-l from-amber-500 via-pink-500 to-violet-500 text-white shadow-md"
                : "bg-white/80 text-[--c-deep]/70 hover:bg-white"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {loading && !stats ? (
        <div className="card-glass p-10 shimmer h-64" />
      ) : (
        <>
          {tab === "overview" && stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="admin-stats-grid">
              <StatCard icon={GraduationCap} label="معلمات" value={stats.teachers_count} color="from-pink-500 to-fuchsia-500" testid="stat-teachers" />
              <StatCard icon={Crown} label="مشرفات" value={stats.admins_count} color="from-amber-400 to-orange-500" testid="stat-admins" />
              <StatCard icon={FileText} label="مقالات" value={stats.articles_count} color="from-violet-500 to-purple-500" testid="stat-articles" />
              <StatCard icon={MessageCircle} label="تعليقات" value={stats.comments_count} color="from-cyan-500 to-blue-500" testid="stat-comments" />
              <StatCard icon={Heart} label="إعجابات" value={stats.likes_count} color="from-rose-500 to-pink-500" testid="stat-likes" />
              <StatCard icon={Ban} label="محظورات" value={stats.blocked_count} color="from-slate-500 to-zinc-600" testid="stat-blocked" />
            </div>
          )}

          {tab === "users" && (
            <div className="space-y-3" data-testid="admin-users-list">
              {users.length === 0 ? (
                <div className="card-glass p-10 text-center text-[--c-deep]/60">لا توجد مستخدمات</div>
              ) : (
                users.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    currentUserId={user.id}
                    onUpdate={handleUserUpdate}
                    onDelete={handleUserDelete}
                  />
                ))
              )}
            </div>
          )}

          {tab === "articles" && (
            <div className="space-y-3" data-testid="admin-articles-list">
              {articles.length === 0 ? (
                <div className="card-glass p-10 text-center text-[--c-deep]/60">لا توجد مقالات</div>
              ) : (
                articles.map((a) => (
                  <div key={a.id} className="card-glass p-4 flex items-center gap-3 flex-wrap" data-testid={`admin-article-${a.id}`}>
                    <div className="text-3xl shrink-0">{a.cover_emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[--c-deep] truncate">{a.title}</div>
                      <div className="text-xs text-[--c-deep]/60">
                        {a.author_name} • {a.likes_count} إعجاب • {a.comments_count} تعليق
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link
                        to={`/article/${a.id}`}
                        data-testid={`admin-view-article-${a.id}`}
                        className="px-3 py-2 rounded-full bg-violet-100 hover:bg-violet-200 text-violet-700 text-xs font-bold"
                      >
                        عرض
                      </Link>
                      <Link
                        to={`/edit/${a.id}`}
                        data-testid={`admin-edit-article-${a.id}`}
                        className="px-3 py-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Pencil size={12} /> تعديل
                      </Link>
                      <button
                        onClick={() => handleArticleDelete(a.id)}
                        data-testid={`admin-delete-article-${a.id}`}
                        className="px-3 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 size={12} /> حذف
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === "comments" && (
            <div className="space-y-3" data-testid="admin-comments-list">
              {comments.length === 0 ? (
                <div className="card-glass p-10 text-center text-[--c-deep]/60">لا توجد تعليقات</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="card-glass p-4" data-testid={`admin-comment-${c.id}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.author_color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                        {c.author_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[--c-deep] mb-1">{c.author_name}</div>
                        <p className="text-sm text-[--c-deep]/85 leading-7 line-clamp-3">{c.content}</p>
                        <Link to={`/article/${c.article_id}`} className="text-xs text-pink-600 hover:underline">
                          عرض المقال →
                        </Link>
                      </div>
                      <button
                        onClick={() => handleCommentDelete(c.id)}
                        data-testid={`admin-delete-comment-${c.id}`}
                        className="px-3 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
