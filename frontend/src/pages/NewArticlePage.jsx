import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { Send, ArrowRight } from "lucide-react";
import PenHandIcon from "../components/PenHandIcon";
import MediaPicker from "../components/MediaPicker";

const CATEGORIES = ["تعليمية", "تربوية", "تقنية", "إدارية", "تحفيزية", "عام"];
const EMOJIS = ["🌸", "✨", "📚", "🎨", "💡", "🌟", "🌷", "💗", "🌼", "🎓", "🪄", "🍀"];

export default function NewArticlePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "تعليمية",
    cover_emoji: "🌸",
    images: [],
    links: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/articles", form);
      navigate(`/article/${data.id}`);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <button
        onClick={() => navigate(-1)}
        className="btn-pill btn-ghost mb-6"
        data-testid="back-btn"
      >
        <ArrowRight size={18} />
        <span>رجوع</span>
      </button>

      <div className="card-glass p-8 md:p-10 slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
            <PenHandIcon size={24} color="white" />
          </div>
          <div>
            <h1 className="font-display text-xl text-[--c-deep]">شاركي خبرتك</h1>
            <p className="text-sm text-[--c-deep]/60">دعي بصمتك التربوية تلهم زميلاتك</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5" data-testid="new-article-form">
          {/* Emoji */}
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">رمز المقال</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm({ ...form, cover_emoji: em })}
                  data-testid={`emoji-${em}`}
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

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">التصنيف</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, category: c })}
                  data-testid={`category-${c}`}
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

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">عنوان المقال</label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-field text-lg font-bold"
              placeholder="عنوان جذاب ومعبّر…"
              data-testid="article-title-input"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">المحتوى</label>
            <textarea
              required
              minLength={10}
              rows={12}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="input-field leading-9"
              placeholder="اكتبي خبرتك التعليمية، نصائحك، أفكارك التربوية…"
              data-testid="article-content-input"
            />
          </div>

          {/* Media (Images + Links) */}
          <MediaPicker
            images={form.images}
            setImages={(v) => setForm((f) => ({ ...f, images: typeof v === "function" ? v(f.images) : v }))}
            links={form.links}
            setLinks={(v) => setForm((f) => ({ ...f, links: typeof v === "function" ? v(f.links) : v }))}
          />

          {error && (
            <div
              data-testid="new-article-error"
              className="text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-xl px-4 py-3"
            >
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              data-testid="article-submit-btn"
              className="btn-pill btn-primary !py-3"
            >
              <Send size={18} />
              <span>{loading ? "جاري النشر…" : "نشر المقال"}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-pill btn-ghost !py-3"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
