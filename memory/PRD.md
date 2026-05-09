# PRD - بخبراتنا نسمو (Namu Blog)

## Original Problem Statement
Build a blog application for female high school teachers at Secondary School 56 (Riyadh). Title: "بخبراتنا نسمو". Bright Arabic RTL design. JWT authentication, admin/principal roles, comments, likes, image/link attachments, official Ministry of Education branding, PWA support.

## Tech Stack
- Frontend: React 19 + Tailwind + shadcn/ui + axios
- Backend: FastAPI + Motor (async MongoDB)
- DB: MongoDB
- Auth: JWT (HS256), bcrypt password hashing

## Production Deployment (Completed Feb 2026)
- **GitHub**: bsalmf-art/islandmoon2 (public)
- **MongoDB Atlas**: Cluster0 (Free tier, 512MB)
- **Backend**: Render Free → https://namu-blog-api.onrender.com
- **Frontend**: Netlify Drop → https://guileless-dieffenbachia-79f516.netlify.app

## Implemented Features
- JWT auth with secret admin signup code
- Default admin seeded on startup
- Articles CRUD (title, content, images list, links list)
- Comments + Likes
- Admin panel: stats, user role management, name editing, blocking
- PWA: manifest.json + service worker, install prompt
- Official MOE header with logos and Vision 2030 branding
- Custom Arabic fonts and bright color scheme
- MediaPicker component for image/link attachments
- Generated PDF rubric (RUBRIC_AR.pdf) and deployment guide PDF

## Key API Endpoints
- POST /api/auth/login, /api/auth/register, /api/auth/admin-register
- GET /api/auth/me
- GET/POST/PUT/DELETE /api/articles
- POST /api/articles/{id}/like
- GET/POST /api/articles/{id}/comments
- GET /api/admin/stats, /api/admin/users
- PUT /api/admin/users/{id}, DELETE /api/admin/users/{id}

## DB Schema
- users: {id, name, email, password_hash, role, is_blocked, created_at}
- articles: {id, title, content, author_id, images[], links[], created_at}
- comments: {id, article_id, author_id, content, created_at}
- likes: {id, article_id, user_id}

## Production Env Vars (Render Backend)
- MONGO_URL (MongoDB Atlas connection string)
- DB_NAME=namu_blog
- JWT_SECRET (random hex)
- ADMIN_EMAIL=admin@namu.sa
- ADMIN_PASSWORD=Admin@2026
- ADMIN_SIGNUP_CODE=NAMU-56-TMJVTKQZK3Y
- CORS_ORIGINS=https://guileless-dieffenbachia-79f516.netlify.app

## Production Env Vars (Netlify Frontend)
- REACT_APP_BACKEND_URL=https://namu-blog-api.onrender.com

## Notes
- Render Free instance sleeps after 15 min inactivity (~50s cold start)
- Frontend deployed via Netlify Drop (zip upload), not git-connected
- Future redeployments: rebuild locally, zip /app/frontend/build, drag to Netlify
- Backend auto-deploys from GitHub commits to bsalmf-art/islandmoon2:main

## P1 Backlog (Future)
- Custom Netlify subdomain (cleaner URL)
- Notifications for new comments
- In-blog search
- Per-article reading stats
- Repeat deployment for "معًا نبني" and "سباق المليون" apps using same flow
