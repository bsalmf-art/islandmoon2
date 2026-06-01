import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageCircle, ArrowRight, Trash2, Send, Sparkles, ExternalLink, Link as LinkIcon } from "lucide-react";

function timeAgo(iso) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `قبل ${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `قبل ${Math.floor(diff / 3600)} س`;
  if (diff < 86400 * 30) return `قبل ${Math.floor(diff / 86400)} يوم`;
  return d.toLocaleDateString("ar-SA");
}

export default function ArticleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popping, setPopping] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    // Try to hydrate from cached articles list first (so the page never feels broken)
    try {
      const cached = localStorage.getItem("namu_articles_cache");
      if (cached) {
        const arr = JSON.parse(cached);
        const found = Array.isArray(arr) && arr.find((x) => x.id === id);
        if (found) {
          setArticle({ ...found, liked_by_me: false });
          setComments([]);
        }
      }
    } catch {}
    try {
      const [a, c] = await Promise.all([
        api.get(`/articles/${id}`, { timeout: 6000 }),
        api.get(`/articles/${id}/comments`, { timeout: 6000 }),
      ]);
      setArticle(a.data);
      setComments(c.data);
    } catch {
      // keep cached article on screen
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) return navigate("/login", { state: { from: `/article/${id}` } });
    setPopping(true);
    setTimeout(() => setPopping(false), 400);
    const { data } = await api.post(`/articles/${id}/like`);
    setArticle((a) => ({ ...a, liked_by_me: data.liked, likes_count: data.likes_count }));
  };

  const submitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const { data } = await api.post(`/articles/${id}/comments`, { content: commentText });
      setComments((arr) => [...arr, data]);
      setArticle((a) => ({ ...a, comments_count: (a.comments_count || 0) + 1 }));
      setCommentText("");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (cid) => {
    if (!window.confirm("هل تريدين حذف التعليق؟")) return;
    await api.delete(`/comments/${cid}`);
    setComments((arr) => arr.filter((c) => c.id !== cid));
    setArticle((a) => ({ ...a, comments_count: Math.max(0, (a.comments_count || 1) - 1) }));
  };

  const deleteArticle = async () => {
    if (!window.confirm("هل تريدين حذف المقال نهائياً؟")) return;
    await api.delete(`/articles/${id}`);
    navigate("/");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="card-glass p-10 shimmer h-96" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center" data-testid="article-not-found">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="font-display text-2xl mb-2">المقال غير موجود</h2>
        <Link to="/" className="btn-pill btn-primary mt-4">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const isAuthor = user && user !== false && article.author_id === user.id;
  const isAdmin = user && user.role === "admin";
  const initials = article.author_name?.charAt(0) || "م";

  return (
    <div className="max-w-3xl mx-auto px-5 py-10" data-testid="article-detail">
      <button onClick={() => navigate("/")} className="btn-pill btn-ghost mb-6" data-testid="back-home-btn">
        <ArrowRight size={18} />
        <span>رجوع</span>
      </button>

      {/* Article */}
      <article className="card-glass p-6 md:p-8 slide-up">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-4xl drop-shadow">{article.cover_emoji}</div>
          <div className="flex-1 min-w-0">
            <span className="chip mb-3 inline-flex">{article.category}</span>
            <h1 className="font-display text-xl md:text-2xl text-[--c-deep] leading-snug">
              {article.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 mb-6 border-b border-pink-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${article.author_color} flex items-center justify-center text-white font-bold shadow-md`}
            >
              {initials}
            </div>
            <div>
              <div className="font-bold text-[--c-deep]">{article.author_name}</div>
              <div className="text-xs text-[--c-deep]/50">{timeAgo(article.created_at)}</div>
            </div>
          </div>
          {(isAuthor || isAdmin) && (
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit/${article.id}`)}
                data-testid="article-edit-btn"
                className="btn-pill btn-ghost !text-amber-700 !border-amber-200"
              >
                <Sparkles size={16} />
                <span>تعديل</span>
              </button>
              <button
                onClick={deleteArticle}
                data-testid="article-delete-btn"
                className="btn-pill btn-ghost !text-rose-600 !border-rose-200"
              >
                <Trash2 size={16} />
                <span>حذف</span>
              </button>
            </div>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-[--c-deep] leading-9 whitespace-pre-wrap text-base" data-testid="article-content">
          {article.content}
        </div>

        {/* Images Gallery */}
        {article.images && article.images.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="article-images">
            {article.images.map((src, i) => (
              <a
                key={i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl overflow-hidden border-2 border-pink-200 hover:scale-[1.02] transition"
                data-testid={`article-image-${i}`}
              >
                <img src={src} alt={`صورة ${i + 1}`} className="w-full h-auto object-cover" />
              </a>
            ))}
          </div>
        )}

        {/* Links */}
        {article.links && article.links.length > 0 && (
          <div className="mt-6" data-testid="article-links">
            <h3 className="font-display text-base text-[--c-deep] mb-3 flex items-center gap-2">
              <LinkIcon size={18} className="text-violet-600" />
              <span>روابط ذات صلة</span>
            </h3>
            <div className="space-y-2">
              {article.links.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`article-link-${i}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-50 border border-violet-200 hover:bg-violet-100 transition group"
                >
                  <div className="w-9 h-9 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0 group-hover:bg-violet-600 transition">
                    <ExternalLink size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[--c-deep]">{l.title}</div>
                    <div className="text-xs text-violet-700/80 truncate font-mono" dir="ltr">{l.url}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-pink-100">
          <button
            onClick={handleLike}
            data-testid="article-detail-like-btn"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${
              article.liked_by_me
                ? "bg-gradient-to-l from-pink-500 to-fuchsia-500 text-white"
                : "bg-white/80 text-[--c-deep] hover:bg-pink-50"
            }`}
          >
            <Heart size={18} fill={article.liked_by_me ? "currentColor" : "none"} className={popping ? "heart-pop" : ""} />
            <span>{article.likes_count} إعجاب</span>
          </button>
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 text-[--c-deep] font-bold">
            <MessageCircle size={18} />
            <span>{article.comments_count} تعليق</span>
          </div>
        </div>
      </article>

      {/* Comments */}
      <section className="mt-8" data-testid="comments-section">
        <h2 className="font-display text-lg mb-5 text-[--c-deep]">التعليقات 💬</h2>

        {/* Comment form */}
        {user && user !== false ? (
          <form onSubmit={submitComment} className="card-glass p-5 mb-5" data-testid="comment-form">
            <div className="flex gap-3 items-start">
              <div
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.avatar_color} flex items-center justify-center text-white font-bold shrink-0`}
              >
                {user.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <textarea
                  rows={3}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="input-field"
                  placeholder="شاركي رأيك أو أضيفي خبرتك…"
                  data-testid="comment-input"
                />
                {error && (
                  <div className="mt-2 text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-xl px-3 py-2">
                    {error}
                  </div>
                )}
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    data-testid="comment-submit-btn"
                    className="btn-pill btn-primary"
                  >
                    <Send size={16} />
                    <span>{submitting ? "جاري الإرسال…" : "إرسال"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="card-glass p-6 mb-5 text-center" data-testid="login-to-comment">
            <p className="text-[--c-deep]/70 mb-4">سجلي الدخول للمشاركة بالتعليقات</p>
            <Link to="/login" className="btn-pill btn-primary">
              دخول
            </Link>
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center text-[--c-deep]/50 py-10" data-testid="no-comments">
            🌸 لا توجد تعليقات بعد. كوني أول من تعلّق
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((c, idx) => {
              const canDelete =
                user && user !== false && (c.author_id === user.id || user.role === "admin");
              return (
                <div
                  key={c.id}
                  className="card-glass p-5 slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                  data-testid={`comment-${c.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${c.author_color} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {c.author_name?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-bold text-[--c-deep] text-sm">{c.author_name}</span>
                        <span className="text-xs text-[--c-deep]/50">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="text-[--c-deep]/85 leading-7 whitespace-pre-wrap">{c.content}</p>
                    </div>
                    {canDelete && (
                      <button
                        onClick={() => deleteComment(c.id)}
                        data-testid={`comment-delete-${c.id}`}
                        className="text-rose-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
