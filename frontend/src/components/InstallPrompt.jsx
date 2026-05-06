import React, { useEffect, useState } from "react";
import { Smartphone, X, Download } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setIsIOS(ios);

    // Already installed?
    if (standalone) return;

    // Hidden by user previously?
    const dismissed = localStorage.getItem("install-dismissed");
    if (dismissed) {
      const age = Date.now() - parseInt(dismissed, 10);
      if (age < 7 * 24 * 60 * 60 * 1000) return; // within 7 days
    }

    if (ios) {
      // iOS: show after 4 seconds
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }

    // Android / Desktop: wait for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShow(false);
    setShowIOSGuide(false);
    localStorage.setItem("install-dismissed", String(Date.now()));
  };

  if (!show) return null;

  if (showIOSGuide) {
    return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" data-testid="install-ios-guide">
        <div className="card-glass p-6 max-w-sm w-full slide-up bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-[--c-deep]">ثبّتي التطبيق على آيفون 📱</h3>
            <button onClick={dismiss} className="text-[--c-deep]/60" data-testid="install-close">
              <X size={20} />
            </button>
          </div>
          <ol className="space-y-3 text-sm text-[--c-deep]/85 leading-7">
            <li className="flex gap-2">
              <span className="font-black text-pink-500">1️⃣</span>
              اضغطي زر <strong>المشاركة</strong> ⬆️ في أسفل المتصفح (سفاري)
            </li>
            <li className="flex gap-2">
              <span className="font-black text-pink-500">2️⃣</span>
              اختاري <strong>"إضافة إلى الشاشة الرئيسية"</strong> ➕
            </li>
            <li className="flex gap-2">
              <span className="font-black text-pink-500">3️⃣</span>
              اضغطي <strong>"إضافة"</strong> في الزاوية ✨
            </li>
            <li className="flex gap-2">
              <span className="font-black text-pink-500">4️⃣</span>
              ستجدين أيقونة المدونة على شاشتك الرئيسية! 🎉
            </li>
          </ol>
          <button
            onClick={dismiss}
            data-testid="install-ios-done"
            className="btn-pill btn-primary w-full justify-center !py-3 mt-5"
          >
            فهمت ✓
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-4 sm:max-w-sm z-40 slide-up"
      data-testid="install-prompt"
    >
      <div className="card-glass p-4 flex items-center gap-3 bg-white shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shrink-0">
          <Smartphone className="text-white" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[--c-deep] text-sm">ثبّتي المدونة كتطبيق 📱</div>
          <div className="text-xs text-[--c-deep]/60">وصول أسرع من الشاشة الرئيسية</div>
        </div>
        <button
          onClick={handleInstall}
          data-testid="install-yes-btn"
          className="btn-pill btn-primary !px-3 !py-2 text-xs"
        >
          <Download size={14} />
          <span>ثبّت</span>
        </button>
        <button onClick={dismiss} data-testid="install-dismiss-btn" className="text-[--c-deep]/40 hover:text-[--c-deep]/70">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
