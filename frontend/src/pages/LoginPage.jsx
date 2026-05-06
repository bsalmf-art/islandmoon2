import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../lib/api";
import { Mail, Lock, LogIn } from "lucide-react";
import PenHandIcon from "../components/PenHandIcon";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      const next = location.state?.from || "/";
      navigate(next);
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
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-500/40">
            <PenHandIcon size={30} color="white" />
          </div>
        </div>
        <h1 className="font-display text-4xl text-center mb-2 text-[--c-deep]">أهلاً بعودتك</h1>
        <p className="text-center text-[--c-deep]/60 mb-8">سجلي الدخول لمتابعة مشاركة خبراتك</p>

        <form onSubmit={submit} className="space-y-4" data-testid="login-form">
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
                data-testid="login-email-input"
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
                placeholder="••••••••"
                data-testid="login-password-input"
              />
            </div>
          </div>

          {error && (
            <div
              data-testid="login-error"
              className="text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-xl px-4 py-3"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="btn-pill btn-primary w-full justify-center !py-3"
          >
            <LogIn size={18} />
            <span>{loading ? "جاري الدخول…" : "دخول"}</span>
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-[--c-deep]/70">
          ليس لديك حساب؟{" "}
          <Link to="/register" data-testid="login-to-register-link" className="font-bold text-pink-600 hover:underline">
            انضمي إلينا
          </Link>
        </div>
      </div>
    </div>
  );
}
