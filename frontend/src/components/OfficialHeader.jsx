import React from "react";

export default function OfficialHeader() {
  return (
    <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-900 text-white border-b-4 border-amber-500/80">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
        {/* MoE logo - left in RTL = visual right */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/moe-logo.jpg"
            alt="وزارة التعليم – رؤية ٢٠٣٠"
            className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-1 shadow-md object-contain"
            data-testid="moe-logo"
          />
        </div>

        {/* Center preamble */}
        <div className="text-center flex-1 leading-snug" data-testid="preamble">
          <div className="font-display text-base md:text-xl tracking-wide text-amber-300">
            المملكة العربية السعودية
          </div>
          <div className="text-sm md:text-base font-bold text-white/95">وزارة التعليم</div>
          <div className="text-xs md:text-sm font-medium text-white/80">
            إدارة تعليم الرياض • الثانوية ٥٦
          </div>
        </div>

        {/* School logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/school-logo.jpg"
            alt="الثانوية ٥٦"
            className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl p-1 shadow-md object-contain"
            data-testid="school-logo"
          />
        </div>
      </div>
    </div>
  );
}
