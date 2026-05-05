import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { Mail, Lock, User, Sparkles, BookOpen } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="card-glass p-8 md:p-10 slide-up">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-pink-500/40">
            <Sparkles className="text-white" size={28} strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-display text-4xl text-center mb-2 text-[--c-deep]">انضمي إلينا 💫</h1>
        <p className="text-center text-[--c-deep]/60 mb-8">
          أنشئي حسابك وابدئي بمشاركة خبراتك التعليمية
        </p>

        <form onSubmit={submit} className="space-y-4" data-testid="register-form">
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">الاسم</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
              <input
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pr-11"
                placeholder="مثال: أ. سارة العتيبي"
                data-testid="register-name-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pr-11"
                placeholder="example@school.sa"
                data-testid="register-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-11"
                placeholder="٦ أحرف على الأقل"
                data-testid="register-password-input"
              />
            </div>
          </div>

          {error && (
            <div
              data-testid="register-error"
              className="text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-xl px-4 py-3"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit-btn"
            className="btn-pill btn-primary w-full justify-center !py-3"
          >
            <BookOpen size={18} />
            <span>{loading ? "جاري الإنشاء…" : "إنشاء حسابي"}</span>
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-[--c-deep]/70">
          لديك حساب بالفعل؟{" "}
          <Link to="/login" data-testid="register-to-login-link" className="font-bold text-pink-600 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
