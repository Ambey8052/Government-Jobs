# SarkariSetu

A MERN application that matches applicants to Indian government jobs, PSU/banking/railways/police/defence
recruitment, teaching posts, schemes and scholarships — based on their education, category, location and
preferences, with a per-listing match percentage and eligibility breakdown.

**Stack:** MongoDB (Atlas) · Express · React (Vite) · Node.js · Tailwind CSS v4

## How matching works

Listings are added by admins (not scraped). Every listing has structured eligibility criteria (age range with
category-wise relaxation, minimum education level, stream, gender, reserved categories, domicile state,
experience). The matching engine (`server/src/services/matchingEngine.js`) is fully rule-based and deterministic:

1. **Hard filters** — age (with SC/ST/OBC/EWS/PwD/Ex-serviceman relaxation), gender, reserved category,
   domicile, minimum education, minimum experience. Failing any of these marks the listing "Not Eligible" and
   caps its score at 30.
2. **Weighted scoring (0–100)** — education level fit (25), stream/field fit (15), experience fit (15),
   sector preference fit (20), location preference fit (15), marks/cutoff fit (10).

This is intentionally not an LLM call: it's explainable (the UI shows exactly why a score is what it is) and
free to run at scale. An AI layer (resume parsing, semantic matching, natural-language eligibility summaries)
can be added later as an enhancement without changing this core.

## Project structure

```
SarkariSetu/
  server/           Express API
    src/
      config/       DB connection
      models/       User, Opportunity, SavedOpportunity (Mongoose)
      controllers/   Route handlers
      routes/        Express routers
      middleware/    auth (JWT cookie), error handling
      services/       matchingEngine.js — the core scoring logic
      utils/          constants (enums), JWT helpers, seed script
  client/           React (Vite) frontend, Tailwind CSS v4
    src/
      api/          axios calls per resource
      context/      AuthContext (session state)
      components/   Navbar, OpportunityCard, MatchBadge, FilterBar, ...
      pages/         Landing, Login/Register, Onboarding, Dashboard,
                     OpportunityDetail, Profile, Saved, admin/*
```

## Prerequisites

- Node.js 18+ (this machine has v24 — fine)
- A **MongoDB Atlas** free-tier cluster (or any MongoDB connection string)

## 1. Set up MongoDB Atlas

1. Create a free account/cluster at https://cloud.mongodb.com
2. Under **Database Access**, create a DB user with a username/password
3. Under **Network Access**, allow your current IP (or `0.0.0.0/0` for local dev only)
4. Click **Connect → Drivers**, copy the connection string, e.g.
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sarkarisetu?retryWrites=true&w=majority`

## 2. Configure environment variables

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
- `MONGO_URI` — paste your Atlas connection string
- `JWT_SECRET` — any long random string (e.g. generate with `openssl rand -hex 32`)

The client only needs an override if the API runs somewhere other than `localhost:5000`:
```bash
cd client
cp .env.example .env   # optional, defaults already point at localhost:5000/api
```

## 3. Install & run

```bash
# Backend
cd server
npm install
npm run seed     # creates an admin user + ~8 sample listings (illustrative data, not live)
npm run dev      # http://localhost:5000

# Frontend (separate terminal)
cd client
npm install
npm run dev      # http://localhost:5173
```

Seeded admin login: **admin@sarkarisetu.local** / **Admin@123** — log in, then visit `/admin` to
manage real listings (edit/delete the sample ones, add your own).

Any new signup via `/register` becomes a regular applicant. To promote a user to admin, update their
`role` field to `"admin"` directly in the `users` collection (Atlas UI or `mongosh`).

## What's built (MVP scope)

- Email/password auth (httpOnly JWT cookie)
- Multi-step applicant onboarding (personal details, education, preferences)
- Rule-based match engine + per-listing score breakdown with plain-English eligibility reasons
- Dashboard of ranked matches with search/category/type/eligibility filters
- Save/bookmark listings
- Admin panel: stats dashboard, full CRUD on listings with a structured eligibility form
- Public listing detail pages (viewable without login, match score shown only when logged in)

## Deliberately out of scope for this build (by your choice)

- Automated scraping of external job/scheme sites — listings are admin-curated for reliability
- OpenAI/LLM-based matching — the engine above is deterministic; an AI layer (resume parsing, semantic
  search, natural-language Q&A over eligibility) is a natural next addition on top of it
- Production deployment config (hosting, CI/CD) — this build targets local development

## Notes

- Seeded sample listings (`server/src/utils/seed.js`) are illustrative only, not live data — replace them via
  the admin panel before treating this as a real information source.
- If you use `0.0.0.0/0` in Atlas Network Access for convenience during development, tighten it before
  sharing any connection string or deploying.
