import React from "react";

export default function OfficialHeader() {
  return (
    <div className="bg-gradient-to-l from-emerald-900 via-emerald-800 to-emerald-900 text-white border-b-4 border-amber-500/80">
      <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between gap-4">
        {/* MoE logo - left in RTL = visual right */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/moe-logo.jpg"
            alt="وزارة التعليم – رؤية ٢٠٣٠"
            className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-1.5 shadow-xl object-contain"
            data-testid="moe-logo"
          />
        </div>

        {/* Center preamble */}
        <div className="text-center flex-1 leading-relaxed px-2" data-testid="preamble">
          <div className="font-display text-lg md:text-2xl tracking-wide text-amber-300 font-bold">
            المملكة العربية السعودية
          </div>
          <div className="text-base md:text-lg font-bold text-white">وزارة التعليم</div>
          <div className="text-sm md:text-base font-medium text-white/85">
            إدارة تعليم الرياض • الثانوية ٥٦
          </div>
        </div>

        {/* School logo */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src="/school-logo.jpg"
            alt="الثانوية ٥٦"
            className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl p-1.5 shadow-xl object-contain"
            data-testid="school-logo"
          />
        </div>
      </div>
    </div>
  );
}
