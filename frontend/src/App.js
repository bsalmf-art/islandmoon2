import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import OfficialHeader from "./components/OfficialHeader";
import PageBackground from "./components/PageBackground";
import InstallPrompt from "./components/InstallPrompt";
import KeepAlive from "./components/KeepAlive";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NewArticlePage from "./pages/NewArticlePage";
import EditArticlePage from "./pages/EditArticlePage";
import ArticleDetailPage from "./pages/ArticleDetailPage";
import AdminSignupPage from "./pages/AdminSignupPage";
import AdminPanelPage from "./pages/AdminPanelPage";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading || user === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-[--c-deep]/60 font-bold">جاري التحميل…</div>
      </div>
    );
  }
  if (!user || user === false) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  return (
    <PageBackground>
      <OfficialHeader />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/new"
          element={
            <ProtectedRoute>
              <NewArticlePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <EditArticlePage />
            </ProtectedRoute>
          }
        />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
        <Route path="/admin-signup" element={<AdminSignupPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanelPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="mt-12 bg-[--c-deep] text-white/80">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-white mb-2">بخبراتنا نسمو</div>
            <p className="text-sm text-white/60 max-w-2xl mx-auto leading-relaxed">
              مدونة معلمات الثانوية ٥٦ — فضاء تربوي نتبادل فيه الخبرات التعليمية والتربوية، ونحتفي بإنجازاتنا، ونلهم بعضنا البعض.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
            <div>© 2026 مدونة بخبراتنا نسمو — جميع الحقوق محفوظة.</div>
            <div className="text-amber-200/80">ابتكار وإعداد: أ. بُثينة الفاضل</div>
            <div>تُصدر بحبٍّ، وتُقرأ بشغف.</div>
          </div>
        </div>
      </footer>
      <InstallPrompt />
      <KeepAlive />
    </PageBackground>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
