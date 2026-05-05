# PRD – بخبراتنا نسمو (Blog for High School 56 Female Teachers)

## Original Problem Statement
> "تقدر تسوي مدونة … مدونة لمعلمات الثانوية ٥٦ لتبادل الخبرات التعليمية بعنوان بخبراتنا نسمو، ألوان وخلفيات زاهية، ويسمح لجميع المعلمات بالدخول بالتسجيل بحساباتهن للمشاركة، مع السماح بوضع تعليقات و لايكات."

## Tech Stack
- Backend: FastAPI + Motor + MongoDB
- Frontend: React 19 + Tailwind + lucide-react (RTL Arabic)
- Auth: JWT in httpOnly cookies (bcrypt password hashing)

## User Personas
- **Teacher (معلمة)** – Registers with name/email/password, writes articles, likes & comments.
- **Admin** – Can delete any article/comment (seeded automatically from .env).

## Core Requirements (Static)
- Arabic RTL UI, vivid/cheerful colors (pink, fuchsia, violet, amber)
- Title "بخبراتنا نسمو" with sparkly aurora background
- Auth: register/login/logout/me (cookie-based)
- Articles: create / list / read / delete (owner or admin)
- Likes: toggle per user per article
- Comments: list / add / delete (owner or admin)
- Categories + emoji cover for each article

## What's Implemented (2026-05-05)
### Backend
- `POST/GET/DELETE /api/articles` (auth required for create/delete; owner/admin only)
- `PUT /api/articles/{id}` – edit (owner or admin) with partial update support
- `POST /api/articles/{id}/like` (toggle, returns liked + likes_count)
- `GET/POST /api/articles/{id}/comments`, `DELETE /api/comments/{id}`
- `POST /api/auth/register | login | logout`, `GET /api/auth/me`
- Admin auto-seeded from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Bcrypt + PyJWT, httpOnly cookie (`samesite=none`, `secure=true`)
- MongoDB indexes: users.email unique, likes (article_id+user_id) unique
- All responses exclude Mongo `_id`; UUID-based ids

### Frontend
- **Official Saudi header**: المملكة العربية السعودية / وزارة التعليم / إدارة تعليم الرياض / الثانوية ٥٦ on a deep emerald banner with both school logo (right) and MoE logo (left)
- Hero landing with title "بخبراتنا نسمو" + scribble underline
- Articles grid with emoji covers, categories filter chips
- Article detail page with comments thread + like button
- **Admin features**: edit/delete buttons on every article card + dashboard banner with support email
- "إدارة" badge on navbar for admin users
- Login & Register pages with glass-morphism cards
- New Article composer + Edit Article page
- AuthContext with axios + withCredentials
- Floating petals + grain overlay + Tajawal/Lalezar fonts

### Testing
- Backend: 25/25 pytest tests passed (auth, articles CRUD + edit, likes, comments, CORS, admin permissions)

## Seeded Test Data
- 3 teachers + 3 sample articles (educational, behavioral, tech)
- Admin `admin@namu.sa` / `Admin@2026`

## P0 / P1 Backlog
- [P1] Edit article (currently only delete)
- [P1] User profile page (list user's articles)
- [P1] Pagination for articles list
- [P2] Search articles by keyword
- [P2] Image upload for cover (currently emoji only)
- [P2] Brute-force lockout on login (5 attempts → 15min)
- [P2] Email verification + password reset flow
- [P2] Notifications (when someone likes/comments your article)
- [P3] Trending / most-liked sort
- [P3] Bookmark articles for later
