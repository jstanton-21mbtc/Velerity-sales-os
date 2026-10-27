# CLAUDE.md — Velerity Sales OS

## Project Overview
Velerity Sales OS is a multi-tenant, role-based sales enablement and CRM platform for
certified-refurbished NVIDIA AI server resellers. Users are sales reps, managers, and
admins. The app makes reps fluent in GPU hardware, manages the full sales pipeline with
compliance gating, tracks serialized inventory, and provides AI-powered prospecting and
call prep.

Based on the business model of Velerity Compute (https://www.veleritycompute.com).

## Tech Stack
- **Framework**: Next.js 15, App Router, TypeScript (strict)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Supabase Postgres, accessed via Prisma ORM
- **Auth**: Supabase Auth — users belong to an Organization (tenant)
- **Storage**: Supabase Storage (health reports, attachments)
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`)
- **Web search**: Tavily API (account research)
- **PDF**: @react-pdf/renderer (quotes)
- **Charts**: Recharts
- **Deployment**: Netlify + @netlify/plugin-nextjs

## Multi-Tenancy Pattern
EVERY table that holds business data has an `org_id` column (FK → `organizations.id`).
ALL Prisma queries MUST include `where: { orgId: session.user.orgId }` — no exceptions.
Never expose cross-tenant data. The `organizations` table is the root of the data model.

## Role-Based Access
Roles: `REP` | `MANAGER` | `ADMIN`
- REP: view/edit own deals, accounts, contacts, leads; read inventory and KB
- MANAGER: all REP permissions + all deals in org, pipeline dashboard, quote approval
- ADMIN: all MANAGER permissions + user management, org settings, spec verification,
  supplier qualification, audit log

Enforce in middleware (`src/middleware.ts`) and in Server Actions via `requireRole()`.

## Directory Structure
```
velerity-sales-os/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (auth)/register/
│   │   ├── (app)/layout.tsx        # Sidebar + topbar shell
│   │   ├── (app)/dashboard/
│   │   ├── (app)/academy/          # Server Academy (KB)
│   │   │   ├── gpus/[slug]/
│   │   │   ├── platforms/[slug]/
│   │   │   ├── compare/
│   │   │   ├── workload-fit/
│   │   │   ├── tco/
│   │   │   ├── objections/
│   │   │   ├── training/
│   │   │   └── admin/              # Spec verification (ADMIN only)
│   │   ├── (app)/crm/
│   │   ├── (app)/inventory/
│   │   ├── (app)/prospecting/
│   │   ├── (app)/copilot/
│   │   ├── (app)/settings/
│   │   └── api/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui (do not edit directly)
│   │   ├── academy/
│   │   ├── crm/
│   │   ├── inventory/
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/client.ts
│   │   ├── supabase/server.ts
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── claude.ts
│   │   ├── tavily.ts
│   │   ├── calculators/vram.ts
│   │   ├── calculators/tco.ts
│   │   └── utils.ts
│   ├── types/index.ts
│   └── hooks/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── netlify.toml
├── CLAUDE.md
└── README.md
```

## Conventions

### TypeScript
- Strict mode enabled. No `any`. Use `unknown` and narrow.
- All Server Actions in `src/app/(app)/[module]/actions.ts`
- Zod schemas co-located with forms, in `schemas.ts` per module dir

### Naming
- Files: `kebab-case` for routes/components, `camelCase` for lib/utils
- DB columns: `snake_case` (Prisma maps to camelCase in TypeScript)
- Components: PascalCase, one per file
- Constants: UPPER_SNAKE_CASE

### Data Access
- All DB reads via Prisma in Server Components or Server Actions
- Always include `orgId` filter — use `requireSession()` helper from `src/lib/auth.ts`
- Never use Prisma in client components; fetch via Server Actions or Route Handlers
- Supabase client only used for: auth, storage upload/download

### Spec Accuracy Rule (CRITICAL)
Every GPU and platform spec row has:
- `sourceUrl: String?` — direct link to OEM spec sheet or official datasheet
- `verified: Boolean @default(false)` — set to true by ADMIN after confirming source
- `verifiedBy / verifiedAt` — audit trail

NEVER hardcode a spec as `verified: true` without a real source URL.
Flag uncertain values with `verified: false` and a note. Admin screen surfaces all
unverified specs for review.

### AI Rules
- Claude API calls go through `src/app/api/claude/route.ts`
- Account research: ALWAYS show source URLs from Tavily. Never fabricate contact names,
  titles, emails, or funding facts.
- Copilot answers: cite KB entry by name/slug

### Compliance Gating (NON-NEGOTIABLE)
Deals cannot advance from `BUYER_COMPLIANCE_SCREENING` to `CONFIGURATION_QUOTE` without:
- `complianceReviewedBy` (user ID, not null)
- `complianceReviewedAt` (DateTime, not null)
- `complianceNotes` (string, min 10 chars)

Enforce in `advanceDealStage` Server Action — throw if conditions not met.
Tests in `src/lib/__tests__/compliance.test.ts`.

### Seed / Demo Data
All seeded records belong to an org with `isSampleData: true`.
A yellow banner is shown when `org.isSampleData === true`.

### Tests
- Vitest for unit tests
- Test files: `src/lib/__tests__/`
- Required: VRAM calc, TCO calc, compliance gating

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=          # Supabase pooled connection (Prisma runtime)
DIRECT_URL=            # Supabase direct connection (Prisma migrations)
ANTHROPIC_API_KEY=
TAVILY_API_KEY=
NEXT_PUBLIC_APP_URL=
```

## Domain Glossary

### GPU Generations
- **A100**: Ampere (2020). 40GB or 80GB HBM2e. PCIe or SXM4. MIG (up to 7 instances).
  Best for: training mid-scale models, HPC, inference at scale.
- **H100**: Hopper (2022). 80GB HBM3 (SXM5) or HBM2e (PCIe). NVL = 2-GPU module (188GB).
  Transformer Engine (FP8). NVLink 4.0. Best for: LLM training and inference.
- **H200**: Hopper die (2024). 141GB HBM3e (SXM/NVL). Same compute as H100, significantly
  better for memory-bound workloads (large inference, long contexts).

### Interconnects
- **NVLink**: GPU-to-GPU interconnect (3.0 on A100, 4.0 on H100/H200)
- **NVSwitch**: Non-blocking switch for all-to-all NVLink in HGX/DGX systems
- **InfiniBand**: Inter-node fabric. HDR (200Gb/s) with A100, NDR (400Gb/s) with H100/H200
- **ConnectX-6**: 200GbE or HDR IB NIC
- **ConnectX-7**: 400GbE or NDR IB NIC
- **BlueField DPU**: Data Processing Unit — offloads networking/storage/security from CPU

### Platforms
- **HGX**: NVIDIA reference baseboard for 8-GPU SXM systems. OEMs build around it.
- **DGX**: NVIDIA's own branded server (DGX A100, H100, H200). Full vertical integration.
- **DGX SuperPOD**: Rack-scale reference architecture.
- **PCIe server**: Standard server with GPUs in PCIe slots. Lower GPU-to-GPU BW than SXM.

### Precision / Data Types
- **FP64**: Double precision. HPC/scientific. Strong on A100.
- **FP32**: Standard float. Training baseline.
- **TF32**: NVIDIA format. FP32 range, ~10× throughput on Tensor Cores.
- **BF16**: Brain float. Preferred for LLM training.
- **FP16**: Half precision. Mixed-precision training and inference.
- **FP8**: Hopper+ only. 2× vs FP16. Transformer Engine manages scaling.
- **INT8**: Integer inference. High throughput, requires quantization.
- **MIG**: Multi-Instance GPU. Partitions one A100/H100 into up to 7 isolated instances.

### Pipeline Stages (in order)
1. `PROSPECT` — identified target, not yet engaged
2. `DISCOVERY` — active conversation, uncovering needs
3. `WORKLOAD_QUALIFIED` — workload defined, GPU type and scale confirmed
4. `BUYER_COMPLIANCE_SCREENING` — export control and buyer screening in progress
5. `CONFIGURATION_QUOTE` — spec finalized, quote building (**GATED**: compliance must complete)
6. `DOCUMENTATION_REVIEW` — buyer reviewing health reports, warranty docs
7. `PO_CONTRACT` — purchase order or contract stage
8. `FULFILLMENT` — inventory reserved, shipping in progress
9. `DEPLOYED_EXPANSION` — closed won; monitor for expansion
10. `CLOSED_LOST` — lost deal

### Inventory Status
`INCOMING` → `TESTING` → `CERTIFIED` → `RESERVED` → `SOLD` → `SHIPPED`

### Condition Grades
- **Grade A**: Like new. <100 GPU hours. No cosmetic damage. Full cert.
- **Grade B**: Light use. Minor cosmetic. Full cert. Full warranty.
- **Grade C**: Moderate use. Functional. Cert complete. Reduced warranty or AS-IS.

### Warranty Tiers
- **NVIDIA Limited Warranty**: Re-certified GPUs meeting NVIDIA's program criteria
- **Seller Warranty**: Velerity's own warranty when NVIDIA warranty not available
- **AS-IS**: No warranty. Must be disclosed and agreed in writing.

### Four Paths to AI Capacity (competitive frame)
1. **New OEM**: Full warranty, latest specs. 6–9 month lead times. 2–3× premium.
2. **Cloud GPU rental**: No capex. 3–5× more expensive than owned for >40% utilization.
3. **Gray-market / uncertified**: Lower price. No diagnostics, no warranty, compliance risk.
4. **Certified refurbished (Velerity)**: <5 week lead time. 30–60% below new. Full cert.

### ICP Segments
GPU clouds/neoclouds | AI-native startups (Seed–C) | Enterprise AI/ML teams |
Universities & research labs | Healthcare & life sciences | Financial services |
Media/VFX/rendering | Autonomous vehicles & robotics | Energy & O&G |
Telecom | Bitcoin miners pivoting to AI/HPC | Colocation providers & MSPs |
Sovereign/data-residency-sensitive orgs

## Build Phases
- **Phase 1**: Scaffold, auth, full Prisma schema, Server Academy with seeded/source-tagged
  specs, comparison tool, admin spec verification screen ← CURRENT
- **Phase 2**: CRM core — accounts, contacts, deals, pipeline with compliance gating,
  Kanban + list views, manager dashboard, audit log
- **Phase 3**: Inventory — serialized units, reserve against deal, ATP logic, supplier
  records, quote builder → PDF export
- **Phase 4**: Workload-fit/VRAM calc, TCO calculator, objection library, DC readiness
  checklist, rep training/quizzes, calculator tests
- **Phase 5**: Prospecting — ICP library, buying-signal tracker, account scoring,
  AI account research (Claude + Tavily), CSV import, Rep Copilot

## Key Constraints
1. Spec accuracy over completeness — unverified > fabricated
2. Compliance gate is enforced in Server Action code, not just UI
3. AI content must show sources; never fabricate contacts, facts, or funding details
4. Sample data must be clearly labeled — never mix with real org data
5. Export-control primer is informational only — not legal advice
