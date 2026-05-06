#!/usr/bin/env python3
"""Convert DEPLOYMENT_GUIDE_AR.md to a styled Arabic RTL PDF."""
import markdown
from weasyprint import HTML, CSS
from pathlib import Path

ROOT = Path("/app")
md_text = (ROOT / "DEPLOYMENT_GUIDE_AR.md").read_text(encoding="utf-8")
html_body = markdown.markdown(md_text, extensions=["tables", "fenced_code", "toc"])

html = f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<title>دليل نشر مدونة بخبراتنا نسمو</title>
</head>
<body>
<div class="cover">
  <div class="cover-emoji">🚀</div>
  <h1 class="cover-title">دليل نشر</h1>
  <h2 class="cover-subtitle">مدونة "بخبراتنا نسمو"</h2>
  <p class="cover-school">معلمات الثانوية ٥٦ • إدارة تعليم الرياض</p>
  <p class="cover-tag">نشر مجاني عبر MongoDB Atlas + Render + Vercel</p>
</div>
<div class="content">
{html_body}
</div>
</body>
</html>"""

css = CSS(string="""
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&family=Cairo:wght@400;700;900&family=Lalezar&display=swap');

@page {
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
    @top-center {
        content: "بخبراتنا نسمو – دليل النشر";
        font-family: Tajawal, sans-serif;
        font-size: 9pt;
        color: #888;
    }
    @bottom-center {
        content: counter(page) " / " counter(pages);
        font-family: Tajawal, sans-serif;
        font-size: 9pt;
        color: #888;
    }
}
@page :first {
    margin: 0;
    @top-center { content: ""; }
    @bottom-center { content: ""; }
}

* { box-sizing: border-box; }
html, body {
    direction: rtl;
    font-family: 'Tajawal', 'Cairo', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.85;
    color: #2A1B4F;
}

/* COVER */
.cover {
    page-break-after: always;
    height: 297mm;
    width: 210mm;
    background: linear-gradient(135deg, #FF4FA3 0%, #8B5CF6 50%, #1B7B3F 100%);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40mm 25mm;
    text-align: center;
}
.cover-emoji { font-size: 84pt; line-height: 1; margin-bottom: 14mm; }
.cover-title {
    font-family: 'Lalezar', 'Cairo', sans-serif;
    font-size: 60pt; margin: 0; line-height: 1.1;
    text-shadow: 0 6px 24px rgba(0,0,0,0.25);
}
.cover-subtitle {
    font-family: 'Lalezar', 'Cairo', sans-serif;
    font-size: 36pt; margin: 6mm 0 0; line-height: 1.2;
    color: #FFE7A0;
}
.cover-school {
    font-size: 16pt; margin-top: 18mm; font-weight: 700;
    background: rgba(255,255,255,0.18);
    padding: 8mm 14mm; border-radius: 999px;
    backdrop-filter: blur(8px);
}
.cover-tag {
    margin-top: 8mm; font-size: 12pt; opacity: 0.92; font-weight: 500;
}

/* CONTENT */
.content { padding-top: 4mm; }

h1 {
    font-family: 'Lalezar', 'Cairo', sans-serif;
    font-size: 26pt;
    color: #FF4FA3;
    border-right: 6px solid #FF4FA3;
    padding-right: 4mm;
    margin: 14mm 0 6mm 0;
    page-break-after: avoid;
}
h2 {
    font-family: 'Lalezar', 'Cairo', sans-serif;
    font-size: 19pt;
    color: #8B5CF6;
    margin: 12mm 0 4mm 0;
    page-break-after: avoid;
    border-bottom: 2px dashed #FFE7A0;
    padding-bottom: 2mm;
}
h3 {
    font-family: 'Cairo', sans-serif;
    font-size: 14pt;
    color: #1B7B3F;
    margin: 7mm 0 2mm 0;
    page-break-after: avoid;
}

p { margin: 2mm 0; text-align: justify; }
strong { color: #DB2777; font-weight: 800; }
em { color: #1B7B3F; font-style: normal; font-weight: 700; }

ul, ol { padding-right: 7mm; padding-left: 0; margin: 2mm 0; }
li { margin: 1.5mm 0; }
li::marker { color: #FF4FA3; font-weight: 900; }

a { color: #DB2777; text-decoration: none; word-break: break-all; }

hr {
    border: none;
    border-top: 2px dashed #FFE7A0;
    margin: 8mm 0;
}

/* code */
code {
    font-family: 'Courier New', monospace;
    background: #FFF4D6;
    color: #B45309;
    padding: 0.5mm 2mm;
    border-radius: 3mm;
    direction: ltr;
    unicode-bidi: embed;
    font-size: 10pt;
}
pre {
    background: linear-gradient(135deg, #FFF4D6 0%, #FFE7F1 100%);
    border-right: 5px solid #FF4FA3;
    padding: 4mm 5mm;
    border-radius: 3mm;
    overflow-x: auto;
    direction: ltr;
    text-align: left;
    page-break-inside: avoid;
}
pre code {
    background: transparent;
    color: #2A1B4F;
    padding: 0;
    font-size: 9.5pt;
    line-height: 1.6;
}

/* tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin: 4mm 0;
    page-break-inside: avoid;
    box-shadow: 0 2mm 6mm rgba(255,79,163,0.12);
    border-radius: 3mm;
    overflow: hidden;
}
th {
    background: linear-gradient(135deg, #FF4FA3 0%, #8B5CF6 100%);
    color: white;
    padding: 3mm 4mm;
    font-weight: 800;
    text-align: right;
    font-size: 11pt;
}
td {
    padding: 2.5mm 4mm;
    border-bottom: 1px solid #FFE7F1;
    font-size: 10.5pt;
    text-align: right;
}
tr:nth-child(even) td { background: #FFFBF1; }
tr:hover td { background: #FFE7F1; }
td code { font-size: 9pt; }

/* blockquote */
blockquote {
    background: linear-gradient(135deg, #FFE7F1 0%, #E5DBFF 100%);
    border-right: 5px solid #FF4FA3;
    padding: 4mm 5mm;
    margin: 5mm 0;
    border-radius: 3mm;
    font-style: italic;
    color: #6B21A8;
    page-break-inside: avoid;
}

/* checkboxes */
input[type=checkbox] {
    margin-left: 2mm;
    transform: scale(1.2);
}

/* checkmarks in lists become emoji-style */
ul li {
    list-style-type: '🌸 ';
}
ol li {
    list-style: decimal;
}

@media print {
    h1, h2, h3 { page-break-after: avoid; }
    pre, table, blockquote { page-break-inside: avoid; }
}
""")

out = ROOT / "DEPLOYMENT_GUIDE_AR.pdf"
HTML(string=html, base_url=str(ROOT)).write_pdf(target=str(out), stylesheets=[css])
print(f"✓ Created: {out} ({out.stat().st_size // 1024} KB)")
