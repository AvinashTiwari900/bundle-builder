# RAS Backend API

Node/Express + PostgreSQL (via Prisma) backend for the RAS candidate portal.
This owns real authentication (bcrypt + JWT in an httpOnly cookie) and the
core candidate profile. Designed so a future recruiter panel can call the
same API/database without a schema rework — see `prisma/schema.prisma` for
the `Job`/`Application`/etc. tables that already exist for that purpose,
even though nothing writes to them yet.

## Setup

1. **PostgreSQL**: install locally, or run via Docker:
   ```bash
   docker run --name ras-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ras -p 5432:5432 -d postgres:17
   ```
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` / `JWT_SECRET`.
3. Install dependencies and run migrations:
   ```bash
   npm install
   npm run prisma:migrate
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Or from the repo root, run frontend + backend together: `npm run dev:all`.

## Scripts
- `npm run dev` — start the API with hot reload (tsx watch)
- `npm run build` / `npm start` — compile and run the production build
- `npm run prisma:migrate` — create/apply a migration after editing `prisma/schema.prisma`
- `npm run prisma:studio` — browse the database in Prisma's GUI

## What's implemented (Phase 1)
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`, `GET /api/auth/check-email`
- `PUT /api/candidates/me`

Everything else (jobs, applications, resumes, documents, projects,
notifications, portfolio) still lives in the frontend's localStorage — that's
Phase 2, once this foundation is proven out.

## Deployment
Not deployed yet. Render or Railway both work well for Express + managed
Postgres with simple git-push deploys; keep the frontend on Netlify as
today and point `VITE_API_URL` at the deployed API's URL.
