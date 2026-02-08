# HireBoost AI

HireBoost AI is a production-ready AI resume optimizer built with Next.js 14, Prisma/Postgres, Stripe Checkout, and the OpenAI API.

## Features
- ATS-optimized resume generation with match score and missing keywords
- Bullet improvement suggestions (before/after + rationale)
- Stripe Checkout tiers with entitlement gating
- Server-side PDF generation
- Basic rate limiting, validation, and secure API handling

## Tech Stack
- Next.js 14 (App Router, TypeScript)
- TailwindCSS
- Prisma + PostgreSQL (Supabase-compatible)
- Stripe Checkout
- OpenAI API

## Local Setup

```bash
npm install
cp .env.example .env
```

Update `.env` with your API keys and Postgres connection string.

### Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## Environment Variables

See `.env.example` for the full list. Key values:
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (default: `gpt-4o-mini`)
- `DATABASE_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_SINGLE`
- `STRIPE_PRICE_ID_30DAY`
- `STRIPE_PRICE_ID_LIFETIME`
- `APP_BASE_URL`
- `AUTH_COOKIE_SECRET`

## Supabase Setup SQL (if not using Prisma migrations)

```sql
create table if not exists "Purchase" (
  id text primary key,
  email text not null,
  tier text not null,
  stripe_session_id text unique not null,
  stripe_customer_id text,
  status text not null,
  created_at timestamptz default now(),
  expires_at timestamptz,
  remaining_credits integer
);

create table if not exists "Generation" (
  id text primary key,
  email_or_anon_id text not null,
  resume_text_hash text not null,
  job_text_hash text not null,
  result_json jsonb not null,
  created_at timestamptz default now()
);
```

> Note: Prisma migrations are recommended. The SQL above mirrors the Prisma schema.

## Stripe Setup
1. Create 3 Prices in Stripe (one-time payment).
2. Set price IDs in `.env`:
   - `STRIPE_PRICE_ID_SINGLE`
   - `STRIPE_PRICE_ID_30DAY`
   - `STRIPE_PRICE_ID_LIFETIME`
3. Create a webhook endpoint pointing to:
   - `https://your-domain.com/api/webhook/stripe`
4. Subscribe to `checkout.session.completed` events.

## Vercel Deployment
1. Push the repository to GitHub.
2. Create a new Vercel project.
3. Add all environment variables from `.env`.
4. Deploy.

## Routes
- `/` Landing page
- `/app` Resume optimizer
- `/pricing` Pricing overview
- `/success` Stripe return page
- `/api/optimize` POST
- `/api/checkout` POST
- `/api/checkout/verify` GET
- `/api/webhook/stripe` POST
- `/api/download` GET
- `/health` GET
