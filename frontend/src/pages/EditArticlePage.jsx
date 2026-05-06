import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Sparkles, Save, ArrowRight } from "lucide-react";

const CATEGORIES = ["تعليمية", "تربوية", "تقنية", "إدارية", "تحفيزية", "عام"];
const EMOJIS = ["🌸", "✨", "📚", "🎨", "💡", "🌟", "🌷", "💗", "🌼", "🎓", "🪄", "🍀"];

export default function EditArticlePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/articles/${id}`);
        // Permission check on client (server enforces too)
        if (user && data.author_id !== user.id && user.role !== "admin") {
          navigate(`/article/${id}`);
          return;
        }
        setForm({
          title: data.title,
          content: data.content,
          category: data.category,
          cover_emoji: data.cover_emoji,
        });
      } catch (err) {
        setError(formatApiError(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/articles/${id}`, form);
      navigate(`/article/${id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-10">
        <div className="card-glass p-10 shimmer h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <button onClick={() => navigate(-1)} className="btn-pill btn-ghost mb-6" data-testid="back-btn">
        <ArrowRight size={18} />
        <span>رجوع</span>
      </button>

      <div className="card-glass p-8 md:p-10 slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-display text-xl text-[--c-deep]">تعديل المقال</h1>
            <p className="text-sm text-[--c-deep]/60">حدّثي المحتوى ثم احفظي التغييرات</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5" data-testid="edit-article-form">
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">رمز المقال</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm({ ...form, cover_emoji: em })}
                  data-testid={`edit-emoji-${em}`}
                  className={`w-12 h-12 rounded-2xl text-2xl transition-all ${
                    form.cover_emoji === em
                      ? "bg-gradient-to-br from-pink-200 to-fuchsia-200 ring-2 ring-pink-400 scale-110"
                      : "bg-white/70 hover:scale-105"
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">التصنيف</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  data-testid={`edit-category-${c}`}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    form.category === c
                      ? "bg-gradient-to-l from-pink-500 to-violet-500 text-white shadow"
                      : "bg-white/70 text-[--c-deep]/70 hover:bg-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">العنوان</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-lg font-bold"
              data-testid="edit-title-input"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">المحتوى</label>
            <textarea
              required
              minLength={10}
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field leading-9"
              data-testid="edit-content-input"
            />
          </div>

          {error && (
            <div className="text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-xl px-4 py-3" data-testid="edit-error">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-pill btn-primary !py-3"
              data-testid="edit-save-btn"
            >
              <Save size={18} />
              <span>{saving ? "جاري الحفظ…" : "حفظ التعديلات"}</span>
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-pill btn-ghost !py-3">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
