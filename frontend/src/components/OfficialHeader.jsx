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
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-1.5 shadow-lg object-contain"
            data-testid="moe-logo"
          />
        </div>

        {/* Center preamble */}
        <div className="text-center flex-1 leading-relaxed px-2" data-testid="preamble">
          <div className="font-display text-base md:text-lg tracking-wide text-amber-300 font-bold">
            المملكة العربية السعودية
          </div>
          <div className="text-sm md:text-base font-bold text-white">وزارة التعليم</div>
          <div className="text-xs md:text-sm font-medium text-white/85">
            إدارة تعليم الرياض • الثانوية ٥٦
          </div>
        </div>

        {/* School logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/school-logo.jpg"
            alt="الثانوية ٥٦"
            className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl p-1.5 shadow-lg object-contain"
            data-testid="school-logo"
          />
        </div>
      </div>
    </div>
  );
}
