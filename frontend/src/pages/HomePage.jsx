import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageCircle, BookOpen, PenLine, Shield, Pencil, Trash2, Share2, Copy, Check } from "lucide-react";
import PenHandIcon from "../components/PenHandIcon";

const CATEGORIES = ["الكل", "تعليمية", "تربوية", "تقنية", "إدارية", "تحفيزية", "عام"];

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = `🌸 مدونة "بخبراتنا نسمو" – معلمات الثانوية ٥٦\nانضمي إلينا لتبادل الخبرات التعليمية والتربوية:\n${url}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = shareText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "بخبراتنا نسمو", text: shareText, url });
        return;
      } catch {}
    }
    setOpen((v) => !v);
  };

  return (
    <div className="relative">
      <button
        onClick={nativeShare}
        data-testid="hero-share-btn"
        className="btn-pill text-white"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)", boxShadow: "0 8px 24px -8px rgba(16,185,129,0.6)" }}
      >
        <Share2 size={18} />
        <span>شاركي الرابط</span>
      </button>
      {open && (
        <div
          className="absolute z-30 top-full mt-2 right-0 w-64 card-glass p-3 space-y-2"
          data-testid="share-menu"
        >
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-whatsapp"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-emerald-50 transition"
          >
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-black">W</span>
            <span className="font-bold text-[--c-deep]">واتساب</span>
          </a>
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="share-telegram"
            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-cyan-50 transition"
          >
            <span className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center text-sm font-black">T</span>
            <span className="font-bold text-[--c-deep]">تيليجرام</span>
          </a>
          <button
            onClick={copy}
            data-testid="share-copy"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-pink-50 transition text-right"
          >
            <span className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </span>
            <span className="font-bold text-[--c-deep]">{copied ? "تم النسخ ✓" : "نسخ الرابط"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 86400 * 30) return `قبل ${Math.floor(diff / 86400)} يوم`;
  return d.toLocaleDateString("ar-SA");
}

function ArticleCard({ article, onLike, onDelete, idx, isAdmin }) {
  const { user } = useAuth();
  const [popping, setPopping] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    setPopping(true);
    setTimeout(() => setPopping(false), 400);
    await onLike(article.id);
  };

  const handleQuickDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`حذف المقال: "${article.title}" ؟`)) return;
    await onDelete(article.id);
  };

  const initials = article.author_name?.charAt(0) || "م";
  const excerpt = article.content.length > 180 ? article.content.slice(0, 180) + "…" : article.content;

  return (
    <Link
      to={`/article/${article.id}`}
      data-testid={`article-card-${article.id}`}
      className="card-glass p-6 block slide-up relative"
      style={{ animationDelay: `${idx * 70}ms` }}
    >
      {isAdmin && (
        <div className="absolute top-3 left-3 flex gap-1 z-10">
          <Link
            to={`/edit/${article.id}`}
            onClick={(e) => e.stopPropagation()}
            data-testid={`card-edit-${article.id}`}
            className="w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center justify-center"
            title="تعديل"
          >
            <Pencil size={14} />
          </Link>
          <button
            onClick={handleQuickDelete}
            data-testid={`card-delete-${article.id}`}
            className="w-8 h-8 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center"
            title="حذف"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-4xl drop-shadow">{article.cover_emoji}</div>
        <div className="flex-1 min-w-0">
          <span className="chip mb-2 inline-flex">{article.category}</span>
          <h3 className="font-display text-2xl text-[--c-deep] leading-tight line-clamp-2">
            {article.title}
          </h3>
        </div>
      </div>

      <p className="text-[--c-deep]/75 text-sm leading-7 mb-5 line-clamp-3">{excerpt}</p>

      <div className="flex items-center justify-between pt-4 border-t border-pink-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${article.author_color} flex items-center justify-center text-white font-bold text-sm shadow`}
          >
            {initials}
          </div>
          <div className="leading-tight">
            <div className="text-xs font-bold text-[--c-deep]">{article.author_name}</div>
            <div className="text-[10px] text-[--c-deep]/50">{timeAgo(article.created_at)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            data-testid={`article-like-btn-${article.id}`}
            disabled={!user}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all ${
              article.liked_by_me
                ? "bg-pink-100 text-pink-600"
                : "bg-white/70 text-[--c-deep]/60 hover:text-pink-500"
            } ${!user ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <Heart
              size={16}
              fill={article.liked_by_me ? "currentColor" : "none"}
              className={popping ? "heart-pop" : ""}
            />
            <span className="text-xs font-bold">{article.likes_count}</span>
          </button>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/70 text-[--c-deep]/60">
            <MessageCircle size={16} />
            <span className="text-xs font-bold">{article.comments_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("الكل");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/articles");
      setArticles(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleLike = async (id) => {
    try {
      const { data } = await api.post(`/articles/${id}/like`);
      setArticles((arr) =>
        arr.map((a) =>
          a.id === id ? { ...a, liked_by_me: data.liked, likes_count: data.likes_count } : a
        )
      );
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/articles/${id}`);
      setArticles((arr) => arr.filter((a) => a.id !== id));
    } catch (err) {
      alert("تعذّر الحذف");
    }
  };

  const isAdmin = user && user !== false && user.role === "admin";
  const filtered = filter === "الكل" ? articles : articles.filter((a) => a.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-5 pt-8 pb-20">
      {isAdmin && (
        <div className="card-glass p-5 mb-6 slide-up bg-gradient-to-l from-amber-50 to-pink-50 border-amber-200" data-testid="admin-banner">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shrink-0">
              <Shield className="text-white" size={22} />
            </div>
            <div className="flex-1 min-w-[240px]">
              <h3 className="font-display text-xl text-[--c-deep] mb-1">
                مرحباً بكِ في وضع الإدارة
              </h3>
              <p className="text-sm text-[--c-deep]/70 leading-7">
                يمكنك تعديل/حذف أي مقال من البطاقات هنا، أو فتح <strong>لوحة التحكم</strong> الكاملة لإدارة المعلمات والترقيات والحظر.
              </p>
            </div>
            <Link
              to="/admin"
              data-testid="admin-banner-open-panel"
              className="btn-pill !px-5 !py-3 text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)" }}
            >
              <Shield size={18} />
              <span>افتحي اللوحة</span>
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative mb-12 slide-up" data-testid="home-hero">
        <div className="card-glass px-8 py-12 md:px-14 md:py-16 overflow-hidden relative">
          <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-gradient-to-br from-pink-300 to-fuchsia-400 opacity-50 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 opacity-50 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-pink-200 mb-5">
              <PenHandIcon size={18} color="#DB2777" />
              <span className="text-xs font-bold text-[--c-deep]">الثانوية ٥٦ • إدارة تعليم الرياض</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl leading-tight text-[--c-deep] mb-4 flex items-center gap-4 flex-wrap">
              <span className="scribble-underline">بخبراتنا</span>{" "}
              <span className="bg-gradient-to-l from-pink-500 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
                نسمو
              </span>
              <PenHandIcon size={56} className="md:w-20 md:h-20" color="#DB2777" />
            </h1>

            <p className="text-lg md:text-xl text-[--c-deep]/75 max-w-2xl leading-9 font-medium">
              فضاء تربوي شاركن فيه ما تعلمتنّ، احتفلن بإنجازاتكن، وتبادلن الأفكار التعليمية والتربوية.
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              {user && user !== false ? (
                <Link to="/new" data-testid="hero-write-btn" className="btn-pill btn-primary">
                  <PenLine size={18} />
                  <span>اكتبي خبرتك الآن</span>
                </Link>
              ) : (
                <Link to="/register" data-testid="hero-join-btn" className="btn-pill btn-primary">
                  <BookOpen size={18} />
                  <span>انضمي للمدونة</span>
                </Link>
              )}
              <a href="#articles" className="btn-pill btn-ghost">
                تصفحي المقالات
              </a>
              <ShareButton />
            </div>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section id="articles" className="mb-6 slide-up" style={{ animationDelay: "120ms" }}>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
          <h2 className="font-display text-3xl text-[--c-deep]">آخر المقالات</h2>
          <div className="text-sm text-[--c-deep]/60 font-medium">
            {filtered.length} مقال
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-testid={`filter-${c}`}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                filter === c
                  ? "bg-gradient-to-l from-pink-500 to-violet-500 text-white shadow-md shadow-pink-300"
                  : "bg-white/70 text-[--c-deep]/70 hover:bg-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Articles Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card-glass p-6 h-64 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-glass p-14 text-center" data-testid="empty-state">
          <div className="flex justify-center mb-4">
            <PenHandIcon size={72} color="#DB2777" />
          </div>
          <h3 className="font-display text-2xl mb-2">لا توجد مقالات بعد</h3>
          <p className="text-[--c-deep]/60 mb-6">
            كوني أول معلمة تشاركنا خبرتها التعليمية
          </p>
          {user && user !== false ? (
            <Link to="/new" className="btn-pill btn-primary">
              <PenLine size={18} />
              <span>اكتبي مقالك الأول</span>
            </Link>
          ) : (
            <Link to="/register" className="btn-pill btn-primary">
              <BookOpen size={18} />
              <span>انضمي وابدئي</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a, idx) => (
            <ArticleCard key={a.id} article={a} onLike={handleLike} onDelete={handleDelete} idx={idx} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
