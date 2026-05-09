import React, { useRef, useState } from "react";
import { ImagePlus, Link as LinkIcon, X, Plus } from "lucide-react";

// Compress image to max 1200px width and ~70% quality, return base64 data URL
async function compressImage(file, maxW = 1200, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxW / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MediaPicker({ images, setImages, links, setLinks }) {
  const fileRef = useRef(null);
  const [linkDraft, setLinkDraft] = useState({ title: "", url: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setBusy(true);
    setErr("");
    try {
      const newImgs = [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 8 * 1024 * 1024) {
          setErr(`الصورة "${f.name}" أكبر من 8 ميجابايت`);
          continue;
        }
        const dataUrl = await compressImage(f);
        newImgs.push(dataUrl);
      }
      setImages([...(images || []), ...newImgs].slice(0, 10));
    } catch (er) {
      setErr("تعذّر معالجة الصورة. جربي صورة أخرى.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = (i) => setImages((images || []).filter((_, idx) => idx !== i));

  const addLink = () => {
    const title = linkDraft.title.trim();
    let url = linkDraft.url.trim();
    if (!title || !url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    setLinks([...(links || []), { title, url }].slice(0, 10));
    setLinkDraft({ title: "", url: "" });
  };

  const removeLink = (i) => setLinks((links || []).filter((_, idx) => idx !== i));

  return (
    <div className="space-y-5">
      {/* IMAGES */}
      <div>
        <label className="block text-sm font-bold text-[--c-deep] mb-2">
          الصور المرفقة <span className="text-[--c-deep]/50 font-normal">(اختياري - حتى ١٠ صور)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
          data-testid="media-image-input"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy || (images && images.length >= 10)}
          data-testid="media-image-pick-btn"
          className="btn-pill btn-ghost !py-2.5"
        >
          <ImagePlus size={18} />
          <span>{busy ? "جاري المعالجة…" : "إضافة صور"}</span>
        </button>
        {err && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mt-2" data-testid="media-error">
            {err}
          </div>
        )}
        {images && images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-3" data-testid="media-images-grid">
            {images.map((src, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border-2 border-pink-200">
                <img src={src} alt={`مرفق ${i + 1}`} className="w-full h-28 object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  data-testid={`media-image-remove-${i}`}
                  className="absolute top-1 left-1 w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LINKS */}
      <div>
        <label className="block text-sm font-bold text-[--c-deep] mb-2">
          الروابط المرفقة <span className="text-[--c-deep]/50 font-normal">(اختياري)</span>
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={linkDraft.title}
            onChange={(e) => setLinkDraft({ ...linkDraft, title: e.target.value })}
            placeholder="اسم الرابط (مثل: درس مرئي)"
            data-testid="media-link-title-input"
            className="input-field !py-2 text-sm"
          />
          <input
            type="url"
            value={linkDraft.url}
            onChange={(e) => setLinkDraft({ ...linkDraft, url: e.target.value })}
            placeholder="https://example.com"
            data-testid="media-link-url-input"
            className="input-field !py-2 text-sm font-mono"
            dir="ltr"
          />
          <button
            type="button"
            onClick={addLink}
            disabled={!linkDraft.title.trim() || !linkDraft.url.trim()}
            data-testid="media-link-add-btn"
            className="btn-pill btn-primary !py-2 shrink-0 disabled:opacity-50"
          >
            <Plus size={16} />
            <span>إضافة</span>
          </button>
        </div>
        {links && links.length > 0 && (
          <div className="space-y-2 mt-3" data-testid="media-links-list">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200">
                <LinkIcon size={16} className="text-violet-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[--c-deep] truncate">{l.title}</div>
                  <div className="text-xs text-violet-700/80 truncate font-mono" dir="ltr">{l.url}</div>
                </div>
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  data-testid={`media-link-remove-${i}`}
                  className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
