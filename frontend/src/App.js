import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import OfficialHeader from "./components/OfficialHeader";
import PageBackground from "./components/PageBackground";
import InstallPrompt from "./components/InstallPrompt";
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
      <footer className="text-center py-8 text-sm text-[--c-deep]/50">
        مدونة معلمات الثانوية ٥٦ • بخبراتنا نسمو
      </footer>
      <InstallPrompt />
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
