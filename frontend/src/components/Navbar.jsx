import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, Plus, Sparkles, BookOpenText, User as UserIcon, Crown } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const initials = user && user.name ? user.name.trim().charAt(0) : "م";

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-white/40">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
        <Link to="/" data-testid="nav-home-link" className="flex items-center gap-2 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:rotate-6 transition-transform">
            <Sparkles className="text-white" size={22} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl text-[--c-deep]">بخبراتنا نسمو</div>
            <div className="text-[11px] text-[--c-deep]/60 font-medium">مدونة المعلمات</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user && user !== false ? (
            <>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  data-testid="nav-admin-panel-btn"
                  className="btn-pill !px-4 text-white hidden sm:inline-flex"
                  style={{ background: "linear-gradient(135deg, #F59E0B 0%, #DB2777 100%)" }}
                  title="لوحة التحكم"
                >
                  <Crown size={18} />
                  <span>اللوحة</span>
                </Link>
              )}
              <Link
                to="/new"
                data-testid="nav-new-article-btn"
                className="btn-pill btn-primary hidden sm:inline-flex"
              >
                <Plus size={18} strokeWidth={2.8} />
                <span>مقال جديد</span>
              </Link>
              <Link to="/new" data-testid="nav-new-article-btn-mobile" className="btn-pill btn-primary sm:hidden !px-3">
                <Plus size={18} strokeWidth={2.8} />
              </Link>

              <div
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-pink-200"
                data-testid="nav-user-info"
              >
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${user.avatar_color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {initials}
                </div>
                <span className="text-sm font-bold text-[--c-deep] max-w-[120px] truncate">
                  {user.name}
                </span>
                {user.role === "admin" && (
                  <span
                    data-testid="nav-admin-badge"
                    className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-l from-amber-400 to-orange-500 text-white shadow"
                  >
                    إدارة
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                data-testid="nav-logout-btn"
                className="btn-pill btn-ghost !px-3"
                title="تسجيل الخروج"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              {location.pathname !== "/login" && (
                <Link to="/login" data-testid="nav-login-btn" className="btn-pill btn-ghost">
                  <UserIcon size={18} />
                  <span>دخول</span>
                </Link>
              )}
              {location.pathname !== "/register" && (
                <Link to="/register" data-testid="nav-register-btn" className="btn-pill btn-primary">
                  <BookOpenText size={18} />
                  <span>انضمي إلينا</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
