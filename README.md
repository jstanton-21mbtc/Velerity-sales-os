# Velerity Sales OS

Multi-tenant GPU server sales enablement and CRM for certified-refurbished AI infrastructure resellers.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS**
- **Supabase** (Auth + Postgres + Storage)
- **Prisma** (ORM, schema management)
- **Netlify** (deployment via `@netlify/plugin-nextjs`)
- **Anthropic Claude API** (Rep Copilot, account research — Phase 5)
- **Tavily API** (web search for account research — Phase 5)

## Local Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd velerity-sales-os
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Same (keep this secret) |
| `DATABASE_URL` | Supabase → Settings → Database → Connection string → Transaction pooler (port 6543) |
| `DIRECT_URL` | Same page → Session pooler (port 5432) — used by Prisma migrations |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `TAVILY_API_KEY` | app.tavily.com |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local |

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to your Supabase Postgres
npm run db:push

# Seed GPU specs, platform catalog, ICP segments, objections, training module,
# and a demo organization with sample accounts/deals/inventory
npm run db:seed
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Register a new organization at `/register` — this creates your org and sets you as ADMIN.

The seed also creates a demo org (`demo-velerity`) with sample data labeled as such.

## Supabase Auth setup

In your Supabase dashboard:

1. **Authentication → URL Configuration**: Set Site URL to your app URL (e.g. `http://localhost:3000` for local, your Netlify URL for production).
2. **Redirect URLs**: Add `http://localhost:3000/api/auth/callback` and your production callback URL.
3. **Email Auth**: Enabled by default — no extra config needed for email/password.

## Deployment (Netlify)

1. Push to GitHub
2. Connect repo in Netlify → New site from Git
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add all env vars from `.env.local.example` in Netlify → Site Settings → Environment Variables
6. The `netlify.toml` handles the Next.js plugin automatically

Note: Run `npm run db:push && npm run db:seed` once against your production Supabase before first deploy.

## Project Structure

```
src/
  app/
    (auth)/          # Login, register pages
    (app)/           # Protected app shell
      dashboard/
      academy/       # Server Academy — GPU/platform KB, compare, calculators, training
        gpus/
        platforms/
        compare/
        admin/       # Spec verification (ADMIN only)
      crm/           # Phase 2
      inventory/     # Phase 3
      prospecting/   # Phase 5
      copilot/       # Phase 5
    api/
      auth/          # Register, callback
  components/
    shared/          # Sidebar, topbar
    academy/         # VerificationBadge
  lib/
    supabase/        # Browser + server clients
    prisma.ts        # Singleton Prisma client
    auth.ts          # requireSession(), requireRole()
    utils.ts         # cn(), formatUsd(), etc.
  types/
prisma/
  schema.prisma      # Full data model (all phases)
  seed.ts            # GPU specs, platform specs, demo data
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma client after schema changes |
| `npm run db:push` | Push schema to database (no migration file) |
| `npm run db:migrate` | Deploy pending migrations (production) |
| `npm run db:seed` | Seed GPU specs, ICP segments, demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run Vitest tests |

## Build Phases

- **Phase 1** ← current: Scaffold, auth, Prisma schema, Server Academy (GPU ref, platforms, compare, admin verification)
- **Phase 2**: CRM — accounts, contacts, deals, pipeline with compliance gating, Kanban, audit log
- **Phase 3**: Inventory, serialized units, ATP logic, quote builder → PDF
- **Phase 4**: Workload-fit/VRAM calculator, TCO calculator, objection library UI, training/quizzes
- **Phase 5**: Prospecting, account scoring, AI account research (Claude + Tavily), Rep Copilot

## Key Constraints

1. Every spec has a `sourceUrl` and `verified` flag. Unverified specs are flagged to users.
2. Deals cannot advance past Compliance Screening without reviewer + date + notes (enforced in Server Action).
3. AI-generated content must show sources; never fabricate contacts or facts.
4. All demo data belongs to `isSampleData: true` org — clearly labeled in UI.
