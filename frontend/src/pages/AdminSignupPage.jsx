import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { formatApiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Shield, Key, Crown } from "lucide-react";

export default function AdminSignupPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    admin_code: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/admin-register", form);
      await refresh();
      navigate("/");
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 py-14">
      <div className="card-glass p-8 md:p-10 slide-up border-2 border-amber-300/60">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
            <Crown className="text-white" size={28} strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-display text-3xl text-center mb-1 text-[--c-deep]">
          تسجيل حساب إدارة
        </h1>
        <p className="text-center text-[--c-deep]/60 mb-2 text-sm">
          هذه الصفحة مخصصة لإدارة المدرسة فقط
        </p>
        <div className="flex items-center justify-center gap-2 mb-7 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <Shield size={14} />
          <span>مطلوب رمز سري للتسجيل</span>
        </div>

        <form onSubmit={submit} className="space-y-4" data-testid="admin-signup-form">
          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">الاسم الكامل</label>
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
              <input
                type="text"
                required
                minLength={2}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-field pr-11"
                placeholder="مثال: أ. ليلى الشهري - مديرة المدرسة"
                data-testid="admin-name-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field pr-11"
                placeholder="example@school.sa"
                data-testid="admin-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field pr-11"
                placeholder="٦ أحرف على الأقل"
                data-testid="admin-password-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[--c-deep] mb-2">
              الرمز السري للإدارة
            </label>
            <div className="relative">
              <Key className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
              <input
                type="text"
                required
                value={form.admin_code}
                onChange={(e) => setForm({ ...form, admin_code: e.target.value })}
                className="input-field pr-11 font-mono"
                placeholder="NAMU-56-XXXXXXXX"
                data-testid="admin-code-input"
              />
            </div>
            <p className="text-xs text-[--c-deep]/50 mt-1">
              يُسلَّم الرمز للإدارة فقط من قِبل المسؤول التقني
            </p>
          </div>

          {error && (
            <div
              data-testid="admin-signup-error"
              className="text-sm text-rose-700 bg-rose-100 border border-rose-200 rounded-xl px-4 py-3"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            data-testid="admin-signup-submit"
            className="btn-pill w-full justify-center !py-3 text-white"
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #DB2777 100%)",
              boxShadow: "0 8px 24px -8px rgba(245, 158, 11, 0.6)",
            }}
          >
            <Crown size={18} />
            <span>{loading ? "جاري الإنشاء…" : "إنشاء حساب الإدارة"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
