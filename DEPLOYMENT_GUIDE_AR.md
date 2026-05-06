# 🚀 دليل نشر مدونة "بخبراتنا نسمو" مجاناً

> **الهدف**: نشر الموقع بثلاث خدمات مجانية: MongoDB Atlas + Render + Vercel
> **الوقت المتوقع**: 30-60 دقيقة
> **التكلفة**: 0 دولار للأبد ✨

---

## 📋 ما تحتاجينه قبل البدء

- [ ] حساب GitHub (مجاني)
- [ ] حساب بريد إلكتروني (لتسجيل الحسابات الجديدة)
- [ ] صبر ومتابعة الخطوات بالترتيب 💪

---

## 🗂️ المرحلة ١: حفظ المشروع على GitHub

### الخطوات:
1. على منصة Emergent، ابحثي عن زر **"Save to GitHub"** (في القائمة العلوية)
2. اضغطيه واتبعي التعليمات لربط حساب GitHub
3. اختاري اسم المستودع (مثلاً: `namu-blog`)
4. انتظري حتى يظهر "✓ Saved successfully"
5. **احفظي رابط المستودع** (سيكون مثل: `https://github.com/USERNAME/namu-blog`)

✅ **علامة النجاح**: عند فتح GitHub.com، تجدين المستودع الجديد فيه مجلدات `backend` و `frontend`

---

## 🗄️ المرحلة ٢: قاعدة بيانات MongoDB Atlas (مجانية)

### الخطوات:

1. افتحي: [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. سجلي بحسابك الجوجل أو ببريدك الإلكتروني
3. أجيبي عن أسئلة الإعداد (اختاري ما يناسبك)
4. عند طلب اختيار الخطة → اختاري **"M0 FREE"** ✅ (مجانية للأبد)
5. اختاري المنطقة الأقرب: **AWS - Frankfurt (eu-central-1)**
6. اضغطي **"Create Cluster"** (قد تستغرق 3-5 دقائق)

### بعد إنشاء الكلستر:

7. من القائمة الجانبية → **Database Access** → **Add New Database User**
   - Username: `admin`
   - Password: اضغطي **"Autogenerate Secure Password"** ثم **"Copy"** (احفظيه!)
   - Privileges: **"Atlas admin"**
   - اضغطي **"Add User"**

8. **Network Access** → **Add IP Address** → اضغطي **"Allow Access from Anywhere"** (يضيف 0.0.0.0/0) → **Confirm**

9. **Database** (أو Clusters) → اضغطي **"Connect"** → **"Drivers"**:
   - Driver: Python
   - Version: 3.12 or later
   - انسخي رابط الاتصال يبدأ بـ `mongodb+srv://...`
   - استبدلي `<password>` بكلمة المرور التي حفظتها

✅ **النتيجة**: رابط MongoDB جاهز شكله:
```
mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**احفظيه! ستحتاجينه في المرحلة ٣**.

---

## 🐍 المرحلة ٣: نشر الباك إند على Render (مجاني)

### الخطوات:

1. افتحي: [render.com](https://render.com) → **"Get Started"**
2. سجلي عبر **"Sign up with GitHub"** → وافقي على الصلاحيات
3. في لوحة التحكم → **"+ New"** → **"Web Service"**
4. اختاري مستودع `namu-blog` (الذي صنعتيه في المرحلة ١)
5. عبئي:
   - **Name**: `namu-blog-backend`
   - **Region**: `Frankfurt`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Plan**: **Free** ✅

6. **Advanced** → **Environment Variables** → اضغطي **"Add Environment Variable"** وأضيفي:

| Key | Value |
|---|---|
| `MONGO_URL` | (الصقي رابط MongoDB من المرحلة ٢) |
| `DB_NAME` | `namu_blog` |
| `JWT_SECRET` | `df516bf02ee426fa98fcab80d8ed49bea57488534b835e13b6d0c0dcf6768f4a` |
| `ADMIN_EMAIL` | `admin@namu.sa` |
| `ADMIN_PASSWORD` | `Admin@2026` |
| `ADMIN_SIGNUP_CODE` | `NAMU-56-TMJVTKQZK3Y` |
| `FRONTEND_URL` | `*` (مؤقتاً، سنحدثها لاحقاً) |
| `CORS_ORIGINS` | `*` (مؤقتاً) |

7. اضغطي **"Create Web Service"** وانتظري ~5-10 دقائق حتى يكتمل البناء

✅ **علامة النجاح**: عند الفتح ترين رسالة `{"app":"بخبراتنا نسمو","ok":true}`

**احفظي رابط الباك إند** (مثل: `https://namu-blog-backend.onrender.com`)

> ⚠️ **تنبيه**: الخطة المجانية في Render "تنام" بعد 15 دقيقة من عدم الاستخدام، وأول طلب بعدها يأخذ ~30 ثانية. هذا طبيعي.

---

## ⚛️ المرحلة ٤: نشر الفرونت إند على Vercel (مجاني)

### الخطوات:

1. افتحي: [vercel.com](https://vercel.com) → **"Sign Up"**
2. اختاري **"Continue with GitHub"** ووافقي على الصلاحيات
3. في الصفحة الرئيسية → **"Add New..."** → **"Project"**
4. ابحثي عن مستودع `namu-blog` → اضغطي **"Import"**
5. عبئي:
   - **Project Name**: `namu-blog` (أو ما تريدين)
   - **Framework Preset**: `Create React App` (يُكتشف تلقائياً)
   - **Root Directory**: اضغطي **"Edit"** → اختاري `frontend`
   - **Build Command**: `yarn build` (تلقائي)
   - **Output Directory**: `build` (تلقائي)

6. **Environment Variables** → أضيفي:

| Key | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | (الصقي رابط Render من المرحلة ٣) |

7. اضغطي **"Deploy"** وانتظري 2-5 دقائق

✅ **النتيجة**: رابط دائم مثل: `https://namu-blog.vercel.app`

---

## 🔗 المرحلة ٥: ربط الجميع ببعض

### الآن نُحدّث Render ليقبل طلبات Vercel:

1. ارجعي لـ **Render** → اختاري الخدمة `namu-blog-backend`
2. **Environment** → عدّلي:
   - `FRONTEND_URL` = رابط Vercel (مثل: `https://namu-blog.vercel.app`)
   - `CORS_ORIGINS` = نفس رابط Vercel
3. اضغطي **"Save Changes"** (سيعيد التشغيل تلقائياً)

✅ **انتهى! الموقع جاهز ويعمل على رابطك الجديد** 🎉

---

## 🧪 الاختبار النهائي

1. افتحي رابط Vercel
2. اضغطي **"دخول"** → جربي تسجيل الدخول بحسابك:
   - البريد: `b.salm.f@gmail.com` (إذا أعدتي التسجيل)
   - أو الافتراضي: `admin@namu.sa` / `Admin@2026`
3. تأكدي من ظهور:
   - ✅ الديباجة الخضراء أعلى الصفحة
   - ✅ شعار المدرسة + شعار الوزارة
   - ✅ شارة "إدارة" + زر "اللوحة"
4. جربي **نشر مقال** و **التعليق** و **الإعجاب**

---

## ❓ مشاكل شائعة وحلولها

### مشكلة 1: الباك إند لا يبدأ على Render
**الحل**: تحققي من Logs في Render. عادة المشكلة في `MONGO_URL` غير صحيح.

### مشكلة 2: "Network Error" عند تسجيل الدخول
**الحل**: تأكدي أن `CORS_ORIGINS` في Render = نفس رابط Vercel **بدون** شرطة في النهاية.

### مشكلة 3: الموقع بطيء بعد فترة عدم استخدام
**الحل**: طبيعي. خطة Render المجانية تنام. الحل: أول طلب يأخذ ~30 ثانية ثم يصبح سريعاً.

### مشكلة 4: لا تظهر الشعارات
**الحل**: تأكدي أن مجلد `frontend/public` يحتوي على `school-logo.jpg` و `moe-logo.jpg`. لو ضاعت، أعيدي رفعهم في GitHub.

---

## 🔐 معلومات الحسابات (احفظيها)

```
مدير افتراضي:
  البريد: admin@namu.sa
  كلمة المرور: Admin@2026

رمز تسجيل الإدارة (لـ /admin-signup):
  NAMU-56-TMJVTKQZK3Y

JWT_SECRET (لا تشاركيه):
  df516bf02ee426fa98fcab80d8ed49bea57488534b835e13b6d0c0dcf6768f4a
```

---

## 🆘 لو احتجتِ مساعدة

ارجعي للمحادثة مع المساعد التقني وأرسلي:
- لقطة شاشة من الخطأ
- الخطوة التي توقفتي عندها
- أي رسائل خطأ في Logs

بالتوفيق! 🌸✨
