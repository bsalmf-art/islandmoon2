#!/usr/bin/env python3
"""Generate a printable Arabic RTL PDF rubric for persuasive communication skill."""
from weasyprint import HTML, CSS
from pathlib import Path

ROOT = Path("/app")

html = """<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8"><title>بطاقة تقييم مهارة التواصل الإقناعي</title></head>
<body>

<!-- COVER -->
<div class="cover">
    <div class="cover-header">
        <div class="cover-emblem">📋</div>
        <div class="cover-org">المملكة العربية السعودية<br/>وزارة التعليم<br/>إدارة تعليم الرياض • الثانوية ٥٦</div>
    </div>
    <h1 class="cover-title">بطاقة تقييم</h1>
    <h2 class="cover-subtitle">مهارة التواصل الإقناعي</h2>
    <div class="cover-grade">الصف الثاني الثانوي • مادة اللغة العربية</div>
    <div class="cover-frame">
        <div class="cover-frame-row"><span>اسم الطالبة:</span><span class="dots"></span></div>
        <div class="cover-frame-row"><span>رقم الطالبة:</span><span class="dots"></span></div>
        <div class="cover-frame-row"><span>الفصل:</span><span class="dots short"></span><span>الشعبة:</span><span class="dots short"></span></div>
        <div class="cover-frame-row"><span>التاريخ:</span><span class="dots short"></span><span>اليوم:</span><span class="dots short"></span></div>
        <div class="cover-frame-row"><span>اسم المعلمة:</span><span class="dots"></span></div>
        <div class="cover-frame-row"><span>موضوع العرض الإقناعي:</span><span class="dots"></span></div>
    </div>
    <div class="cover-foot">بإشراف إدارة الثانوية ٥٦</div>
</div>

<!-- CRITERIA INTRO -->
<h1 class="page-h1">معايير التقييم</h1>
<p class="lead">تتكون بطاقة التقييم من <strong>٥ معايير أساسية</strong> تقيس مهارة التواصل الإقناعي بشكل متكامل، كل معيار يُقيَّم من <strong>٤ نقاط</strong>، والمجموع الكلي <strong>٢٠ نقطة</strong>.</p>

<!-- CRITERION 1 -->
<div class="criterion">
    <div class="crit-header">
        <span class="crit-num">١</span>
        <h2 class="crit-title">وضوح الفكرة وتحديد الهدف الإقناعي</h2>
        <span class="crit-points">/ ٤</span>
    </div>
    <table class="rubric">
        <tr><th class="lvl lvl-1">ممتاز ٤</th><td>فكرة واضحة جداً، هدف إقناعي محدد منذ المقدمة، ومرتبطة بسياق واقعي.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-2">جيد جداً ٣</th><td>فكرة واضحة مع بعض التفصيل المطلوب لبعض النقاط.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-3">جيد ٢</th><td>فكرة عامة تحتاج لتركيز أكثر وتحديد أوضح للهدف.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-4">يحتاج تطوير ١</th><td>فكرة مشوشة أو غير محددة بشكل كافٍ.</td><td class="check">☐</td></tr>
    </table>
    <div class="crit-score">الدرجة المستحقة: <span class="score-box"></span> / ٤</div>
</div>

<!-- CRITERION 2 -->
<div class="criterion">
    <div class="crit-header">
        <span class="crit-num">٢</span>
        <h2 class="crit-title">قوة الحجج والبراهين العقلية</h2>
        <span class="crit-points">/ ٤</span>
    </div>
    <table class="rubric">
        <tr><th class="lvl lvl-1">ممتاز ٤</th><td>حجج منطقية متسلسلة، أدلة من القرآن أو السنة أو إحصاءات موثقة.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-2">جيد جداً ٣</th><td>حجج جيدة مع شاهد أو دليل واحد على الأقل.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-3">جيد ٢</th><td>حجج عامة بدون أدلة كافية أو موثقة.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-4">يحتاج تطوير ١</th><td>افتقار للحجج المنطقية أو وجود تناقض بينها.</td><td class="check">☐</td></tr>
    </table>
    <div class="crit-score">الدرجة المستحقة: <span class="score-box"></span> / ٤</div>
</div>

<!-- CRITERION 3 -->
<div class="criterion">
    <div class="crit-header">
        <span class="crit-num">٣</span>
        <h2 class="crit-title">الاستمالات العاطفية والأخلاقية</h2>
        <span class="crit-points">/ ٤</span>
    </div>
    <table class="rubric">
        <tr><th class="lvl lvl-1">ممتاز ٤</th><td>توازن دقيق بين العقل والعاطفة، وربط مؤثر بقيم المجتمع.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-2">جيد جداً ٣</th><td>استخدام مؤثر للعاطفة دون مبالغة.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-3">جيد ٢</th><td>محاولات بسيطة للتأثير العاطفي تحتاج لتعميق.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-4">يحتاج تطوير ١</th><td>جفاف في الخطاب أو عاطفة مفتعلة غير صادقة.</td><td class="check">☐</td></tr>
    </table>
    <div class="crit-score">الدرجة المستحقة: <span class="score-box"></span> / ٤</div>
</div>

<!-- CRITERION 4 -->
<div class="criterion">
    <div class="crit-header">
        <span class="crit-num">٤</span>
        <h2 class="crit-title">اللغة والأسلوب البلاغي</h2>
        <span class="crit-points">/ ٤</span>
    </div>
    <table class="rubric">
        <tr><th class="lvl lvl-1">ممتاز ٤</th><td>فصحى سليمة، تنوع بين تشبيه واستعارة وترادف، تنويع في الأساليب.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-2">جيد جداً ٣</th><td>لغة فصيحة مع لمسات بلاغية واضحة.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-3">جيد ٢</th><td>لغة سليمة بدون تميّز بلاغي.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-4">يحتاج تطوير ١</th><td>أخطاء لغوية متكررة أو ضعف ملحوظ في الأسلوب.</td><td class="check">☐</td></tr>
    </table>
    <div class="crit-score">الدرجة المستحقة: <span class="score-box"></span> / ٤</div>
</div>

<!-- CRITERION 5 -->
<div class="criterion">
    <div class="crit-header">
        <span class="crit-num">٥</span>
        <h2 class="crit-title">الأداء الصوتي ولغة الجسد</h2>
        <span class="crit-points">/ ٤</span>
    </div>
    <table class="rubric">
        <tr><th class="lvl lvl-1">ممتاز ٤</th><td>تنويع في النبرات، تواصل بصري، ثقة بالنفس، إيماءات هادفة.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-2">جيد جداً ٣</th><td>حضور جيد مع بعض التحفظ في الأداء.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-3">جيد ٢</th><td>أداء متوسط يحتاج للجرأة وتنويع النبرة.</td><td class="check">☐</td></tr>
        <tr><th class="lvl lvl-4">يحتاج تطوير ١</th><td>تردد، رتابة، أو ضعف في التواصل البصري.</td><td class="check">☐</td></tr>
    </table>
    <div class="crit-score">الدرجة المستحقة: <span class="score-box"></span> / ٤</div>
</div>

<!-- TOTAL -->
<div class="total-card">
    <h2>المجموع النهائي</h2>
    <div class="total-row"><span>المجموع الكلي:</span><span class="total-box"></span><span>/ ٢٠</span></div>
    <div class="total-row"><span>النسبة المئوية:</span><span class="total-box"></span><span>%</span></div>
    <div class="total-formula">النسبة = (المجموع ÷ ٢٠) × ١٠٠</div>
</div>

<!-- ANALYSIS PAGE -->
<h1 class="page-h1">آلية التحليل والتفسير</h1>

<h3 class="page-h3">جدول مستويات الأداء</h3>
<table class="levels-table">
    <thead>
        <tr><th>النسبة المئوية</th><th>المستوى</th><th>الدلالة التربوية</th></tr>
    </thead>
    <tbody>
        <tr class="lvl-row excellent"><td>٩٠٪ - ١٠٠٪</td><td><strong>متمكنة جداً</strong></td><td>تجيد المهارة بإتقان، وتستحق ترشيحها للمنافسات.</td></tr>
        <tr class="lvl-row great"><td>٧٥٪ - ٨٩٪</td><td><strong>متمكنة</strong></td><td>تتقن المهارة، وتحتاج لتحديات أعلى لرفع المستوى.</td></tr>
        <tr class="lvl-row good"><td>٦٠٪ - ٧٤٪</td><td><strong>في طريق التمكن</strong></td><td>تحتاج تدريباً مكثفاً على نقاط الضعف المحددة.</td></tr>
        <tr class="lvl-row needs"><td>أقل من ٦٠٪</td><td><strong>تحتاج دعم</strong></td><td>تحتاج خطة علاجية فردية مع متابعة دقيقة.</td></tr>
    </tbody>
</table>

<h3 class="page-h3">خطوات التحليل المهني</h3>
<div class="steps">
    <div class="step"><span class="step-num">١</span><div><strong>تحديد المعيار الأقوى:</strong> أعلى درجة = نقطة قوة، استثمريها بإسناد دور قيادي للطالبة.</div></div>
    <div class="step"><span class="step-num">٢</span><div><strong>تحديد المعيار الأضعف:</strong> أقل درجة = أولوية للعلاج، خططي تدريباً مركزاً.</div></div>
    <div class="step"><span class="step-num">٣</span><div><strong>تحليل النمط:</strong>
        <ul>
            <li>عقلي قوي + عاطفي ضعيف ← تدريب على الاستمالات الوجدانية.</li>
            <li>لغة قوية + أداء ضعيف ← تدريب على الإلقاء.</li>
            <li>أداء قوي + لغة ضعيفة ← تدريب على البلاغة والصياغة.</li>
        </ul>
    </div></div>
    <div class="step"><span class="step-num">٤</span><div><strong>المقارنة الزمنية:</strong> قارني أداء الطالبة عبر ٣ تقييمات خلال الفصل وارسمي مخططاً بيانياً لكل معيار لتتبع التطور.</div></div>
    <div class="step"><span class="step-num">٥</span><div><strong>التغذية الراجعة:</strong> استخدمي صيغة "إيجابي + ملاحظة + إيجابي":
        <ul>
            <li>أعجبني في عرضك ...</li>
            <li>لاحظت أنك تحتاجين لتعزيز ...</li>
            <li>ثقتي بقدرتك على التطور كبيرة لأنك ...</li>
        </ul>
    </div></div>
</div>

<h3 class="page-h3">الرسم البياني للمعايير</h3>
<table class="chart-table">
    <thead>
        <tr><th>المعيار</th><th>١</th><th>٢</th><th>٣</th><th>٤</th></tr>
    </thead>
    <tbody>
        <tr><td>وضوح الفكرة</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
        <tr><td>قوة الحجج</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
        <tr><td>الاستمالات العاطفية</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
        <tr><td>اللغة والأسلوب</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
        <tr><td>الأداء الصوتي</td><td>☐</td><td>☐</td><td>☐</td><td>☐</td></tr>
    </tbody>
</table>
<p class="hint">ضعي ✓ في الخانة المناسبة لكل معيار، ثم صلي بين العلامات لرسم خط التطور.</p>

<!-- COMMENTS PAGE -->
<h1 class="page-h1">ملاحظات المعلمة وخطة التطوير</h1>

<div class="notes">
    <h3>نقاط القوة لدى الطالبة:</h3>
    <div class="lines">
        <div class="line"></div><div class="line"></div><div class="line"></div>
    </div>

    <h3>نقاط تحتاج تطوير:</h3>
    <div class="lines">
        <div class="line"></div><div class="line"></div><div class="line"></div>
    </div>

    <h3>التوصيات والخطة العلاجية:</h3>
    <div class="lines">
        <div class="line"></div><div class="line"></div><div class="line"></div><div class="line"></div>
    </div>

    <h3>تقييم الطالبة لنفسها:</h3>
    <div class="lines">
        <div class="line"></div><div class="line"></div>
    </div>

    <div class="signature-row">
        <div class="sig-block">
            <div class="sig-label">توقيع المعلمة</div>
            <div class="sig-line"></div>
        </div>
        <div class="sig-block">
            <div class="sig-label">توقيع الطالبة</div>
            <div class="sig-line"></div>
        </div>
        <div class="sig-block">
            <div class="sig-label">المتابعة التالية</div>
            <div class="sig-line"></div>
        </div>
    </div>
</div>

</body>
</html>"""

css = CSS(string="""
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;700;900&display=swap');

@page {
    size: A4;
    margin: 18mm 16mm;
    @top-center { content: "بطاقة تقييم مهارة التواصل الإقناعي – الثانوية ٥٦"; font-family: Tajawal, sans-serif; font-size: 9pt; color: #888; }
    @bottom-center { content: counter(page) " / " counter(pages); font-family: Tajawal, sans-serif; font-size: 9pt; color: #888; }
}
@page :first { margin: 0; @top-center { content: ""; } @bottom-center { content: ""; } }

* { box-sizing: border-box; }
html, body { direction: rtl; font-family: 'Tajawal', 'Cairo', sans-serif; font-size: 11pt; line-height: 1.7; color: #2A1B4F; margin: 0; padding: 0; }

/* COVER */
.cover {
    page-break-after: always;
    height: 297mm; width: 210mm;
    background: linear-gradient(160deg, #1B7B3F 0%, #0E5C2D 60%, #08381C 100%);
    color: white;
    display: flex; flex-direction: column; align-items: center;
    padding: 28mm 22mm;
}
.cover-header { text-align: center; margin-bottom: 12mm; }
.cover-emblem { font-size: 50pt; line-height: 1; margin-bottom: 6mm; }
.cover-org { font-size: 14pt; font-weight: 700; line-height: 1.7; color: #FFE7A0; }
.cover-title {
    font-family: Cairo, sans-serif;
    font-size: 44pt; font-weight: 900; margin: 8mm 0 2mm;
    text-align: center;
}
.cover-subtitle {
    font-family: Cairo, sans-serif;
    font-size: 28pt; font-weight: 700; margin: 0; color: #FFE7A0;
    text-align: center;
}
.cover-grade {
    margin-top: 6mm; padding: 4mm 10mm; border-radius: 999px;
    background: rgba(255,255,255,0.15); font-size: 13pt; font-weight: 700;
}
.cover-frame {
    margin-top: 18mm; width: 100%; padding: 8mm 7mm;
    background: rgba(255,255,255,0.1); border: 2px dashed #FFE7A0; border-radius: 4mm;
}
.cover-frame-row { display: flex; align-items: center; gap: 4mm; margin: 4mm 0; font-size: 12pt; font-weight: 600; }
.cover-frame-row span:first-child { white-space: nowrap; }
.cover-frame-row .dots { flex: 1; border-bottom: 1.5px dotted rgba(255,255,255,0.7); height: 8mm; min-width: 30mm; }
.cover-frame-row .dots.short { min-width: 20mm; flex: 0.6; }
.cover-foot { margin-top: auto; font-size: 11pt; opacity: 0.85; }

/* CONTENT */
.page-h1 {
    font-family: Cairo, sans-serif;
    font-size: 22pt; color: #1B7B3F; font-weight: 900;
    border-bottom: 4px double #1B7B3F; padding-bottom: 3mm; margin: 6mm 0 6mm;
    page-break-before: always; page-break-after: avoid;
}
.page-h1:first-of-type { page-break-before: auto; }
.page-h3 { font-family: Cairo, sans-serif; font-size: 14pt; color: #DB2777; font-weight: 700; margin: 6mm 0 3mm; page-break-after: avoid; }
.lead { font-size: 11.5pt; line-height: 1.9; padding: 4mm 6mm; background: #FFFBE7; border-right: 4px solid #F59E0B; border-radius: 2mm; }
strong { color: #DB2777; font-weight: 800; }

/* CRITERION CARD */
.criterion { margin: 8mm 0; page-break-inside: avoid; border: 1.5px solid #1B7B3F33; border-radius: 4mm; overflow: hidden; }
.crit-header {
    background: linear-gradient(135deg, #1B7B3F 0%, #2C9655 100%);
    color: white; padding: 3mm 5mm; display: flex; align-items: center; gap: 4mm;
}
.crit-num {
    width: 10mm; height: 10mm; border-radius: 50%; background: white; color: #1B7B3F;
    font-family: Cairo, sans-serif; font-size: 16pt; font-weight: 900;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.crit-title { font-family: Cairo, sans-serif; flex: 1; font-size: 14pt; font-weight: 700; margin: 0; }
.crit-points { font-size: 14pt; font-weight: 800; color: #FFE7A0; }

table.rubric { width: 100%; border-collapse: collapse; }
table.rubric tr { border-bottom: 1px solid #E5E7EB; }
table.rubric tr:last-child { border-bottom: none; }
table.rubric th.lvl { width: 28mm; font-size: 10.5pt; font-weight: 800; padding: 3mm 4mm; text-align: center; vertical-align: middle; }
table.rubric .lvl-1 { background: #DCFCE7; color: #166534; }
table.rubric .lvl-2 { background: #DBEAFE; color: #1E40AF; }
table.rubric .lvl-3 { background: #FEF3C7; color: #92400E; }
table.rubric .lvl-4 { background: #FEE2E2; color: #991B1B; }
table.rubric td { padding: 3mm 4mm; font-size: 10.5pt; vertical-align: middle; }
table.rubric td.check { width: 14mm; text-align: center; font-size: 14pt; }
.crit-score {
    padding: 3mm 5mm; background: #F9FAFB; font-weight: 700; font-size: 11pt;
    display: flex; align-items: center; gap: 3mm;
}
.score-box { display: inline-block; width: 14mm; height: 8mm; border: 2px solid #1B7B3F; border-radius: 2mm; }

/* TOTAL */
.total-card {
    margin: 10mm 0; padding: 6mm 8mm; border-radius: 4mm;
    background: linear-gradient(135deg, #FEF3C7 0%, #FFE7A0 100%);
    border: 2px solid #F59E0B; page-break-inside: avoid;
}
.total-card h2 { font-family: Cairo, sans-serif; margin: 0 0 4mm; font-size: 16pt; color: #92400E; }
.total-row { display: flex; align-items: center; gap: 4mm; font-size: 13pt; font-weight: 700; margin: 3mm 0; }
.total-box { display: inline-block; width: 22mm; height: 9mm; border: 2px solid #92400E; border-radius: 2mm; background: white; }
.total-formula { margin-top: 4mm; font-size: 10.5pt; color: #92400E; font-weight: 600; direction: ltr; text-align: right; padding-right: 0; }

/* LEVELS TABLE */
table.levels-table { width: 100%; border-collapse: collapse; margin: 4mm 0 6mm; box-shadow: 0 2mm 6mm rgba(0,0,0,0.06); border-radius: 3mm; overflow: hidden; }
table.levels-table th { background: linear-gradient(135deg, #1B7B3F 0%, #DB2777 100%); color: white; padding: 3mm 4mm; font-family: Cairo, sans-serif; font-size: 12pt; }
table.levels-table td { padding: 3mm 4mm; font-size: 11pt; border-bottom: 1px solid #F3F4F6; }
.lvl-row.excellent td { background: #ECFDF5; }
.lvl-row.great td { background: #EFF6FF; }
.lvl-row.good td { background: #FEFCE8; }
.lvl-row.needs td { background: #FEF2F2; }

/* STEPS */
.steps { margin: 4mm 0; }
.step {
    display: flex; gap: 4mm; align-items: flex-start;
    margin: 4mm 0; padding: 4mm 5mm; background: #F9FAFB; border-right: 4px solid #1B7B3F; border-radius: 2mm;
    page-break-inside: avoid;
}
.step-num {
    width: 9mm; height: 9mm; border-radius: 50%; background: #1B7B3F; color: white;
    font-family: Cairo, sans-serif; font-size: 13pt; font-weight: 900;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step ul { padding-right: 6mm; margin: 2mm 0 0; }
.step li { margin: 1.5mm 0; }
.step li::marker { color: #DB2777; }

/* CHART */
table.chart-table { width: 100%; border-collapse: collapse; margin: 3mm 0; }
table.chart-table th { background: #1B7B3F; color: white; padding: 3mm; font-family: Cairo, sans-serif; }
table.chart-table td { border: 1px solid #D1D5DB; padding: 3mm; text-align: center; font-size: 12pt; }
table.chart-table td:first-child { text-align: right; font-weight: 700; background: #F9FAFB; }
.hint { font-size: 10pt; color: #6B7280; font-style: italic; }

/* NOTES */
.notes h3 { font-family: Cairo, sans-serif; color: #1B7B3F; margin: 5mm 0 2mm; font-size: 13pt; }
.lines { margin: 0 0 4mm; }
.line { border-bottom: 1.5px dotted #9CA3AF; height: 8mm; }

.signature-row { display: flex; gap: 6mm; margin-top: 12mm; page-break-inside: avoid; }
.sig-block { flex: 1; }
.sig-label { font-weight: 700; font-size: 11pt; margin-bottom: 2mm; color: #1B7B3F; }
.sig-line { border-bottom: 2px solid #2A1B4F; height: 12mm; }
""")

out = ROOT / "RUBRIC_AR.pdf"
HTML(string=html, base_url=str(ROOT)).write_pdf(target=str(out), stylesheets=[css])
print(f"Created: {out} ({out.stat().st_size // 1024} KB)")
