# PRD - بخبراتنا نسمو (Namu Blog)

## Original Problem Statement
Build a blog application for female high school teachers at Secondary School 56 (Riyadh). Title: "بخبراتنا نسمو". Bright Arabic RTL design. JWT authentication, admin/principal roles, comments, likes, image/link attachments, official Ministry of Education branding, PWA support.

## Tech Stack
- Frontend: React 19 + Tailwind + shadcn/ui + axios
- Backend: FastAPI + Motor
- DB: MongoDB
- Auth: JWT (HS256), bcrypt

## Production Deployment (Completed Feb 2026)
- **GitHub**: bsalmf-art/islandmoon2 (public)
- **MongoDB Atlas**: Cluster0 Free
- **Backend**: Render Free → https://namu-blog-api.onrender.com
- **Frontend**: Netlify (Drop deploys) → https://bikhibratinanasmu.netlify.app

## Critical Fix: Safari iPad Cross-Origin Cookies
- Problem: Safari blocks third-party cookies from netlify.app → onrender.com.
- Fix: Netlify `_redirects` proxies `/api/*` to Render, making backend appear same-origin. Frontend uses empty REACT_APP_BACKEND_URL so all API calls go through `/api/...` (same domain → cookies are first-party).
- Backend additionally returns access_token in JSON body (frontend can fall back to localStorage Bearer if cookies blocked).

## Implemented Features
- JWT auth + secret admin signup code
- Default admin seeded on startup
- Articles CRUD (title, content, images[], links[])
- Comments + Likes
- Admin panel: stats, users management, role/name editing, blocking
- PWA: manifest.json + sw.js + install prompt
- Official MOE header (logo, school logo, Vision 2030 branding)
- Custom Arabic fonts and bright color scheme
- MediaPicker for image/link attachments

## Production Env Vars
### Render (Backend)
- MONGO_URL, DB_NAME=namu_blog
- JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SIGNUP_CODE
- CORS_ORIGINS=https://bikhibratinanasmu.netlify.app (also matches *.netlify.app via regex)

### Netlify (Frontend) — none required
- REACT_APP_BACKEND_URL is empty in build → API uses same-origin /api proxy

## Frontend `_redirects`
```
/api/*  https://namu-blog-api.onrender.com/api/:splat  200
/*      /index.html                                    200
```

## DB Schema
- users: {id, name, email, password_hash, role, is_blocked, created_at}
- articles: {id, title, content, author_id, images[], links[], created_at}
- comments: {id, article_id, author_id, content, created_at}
- likes: {id, article_id, user_id}

## Notes
- Render Free instance sleeps after 15 min idle (~50s cold start).
- Future redeployments: rebuild locally with empty REACT_APP_BACKEND_URL, zip /app/frontend/build, drag-drop on Netlify.
- Backend updates: push commits to bsalmf-art/islandmoon2:main → Render auto-deploys.

## P1 Backlog (Future)
- Custom Netlify subdomain or short domain
- Notifications for new comments
- In-blog search
- Per-article reading stats
- Repeat deployment for "معًا نبني" and "سباق المليون" using same flow
