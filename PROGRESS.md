# Blooper Arena - Phase 1 MVP Progress Report

## Project Overview

**Blooper Arena** (blooperarena.com) is a persistent AI competition game where players create characters, allocate attributes, and compete over 30-day seasons to grow virtual net worth. 95-99% of the system runs without an LLM - outcomes are formula-driven using seeded RNG for reproducibility.

---

## Build Status

| Metric | Value |
|--------|-------|
| TypeScript Files | 122 |
| Lines of Code | 8,548 |
| Unit Tests | 159 (all passing) |
| E2E Test Specs | 5 |
| Git Commits | 3 |
| Build | Passing (web + worker) |
| Database | Connected (Neon Postgres, ap-southeast-1) |

---

## Technology Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 15 (App Router) on Vercel |
| Backend Worker | Fastify 5 on Render.com (Docker) |
| Database | Neon Postgres (free tier) + Drizzle ORM 0.44 |
| Auth | Better Auth (email/password, Drizzle adapter) |
| UI | shadcn/ui + Tailwind CSS 4 + Radix UI |
| State | TanStack Query (server) + Zustand (client) |
| Monorepo | Turborepo + pnpm workspaces |
| Testing | Vitest (unit) + Playwright (E2E) |
| Error Tracking | Sentry (Next.js + Node.js) |

---

## Project Structure

```
blooper-arena/
├── apps/
│   ├── web/                   # Next.js app (2,908 LOC)
│   │   ├── src/app/
│   │   │   ├── (auth)/        # Login, Register pages
│   │   │   ├── (game)/        # Dashboard, Character, Season, Decisions, Leaderboard
│   │   │   └── api/           # 7 API routes
│   │   ├── src/components/    # 16 UI components
│   │   ├── src/lib/           # Auth, DB, rate limiting, utilities
│   │   ├── src/stores/        # Zustand game store
│   │   └── e2e/               # Playwright tests
│   └── worker/                # Fastify worker (455 LOC)
│       ├── src/jobs/          # 4 cron job processors
│       ├── src/routes/        # Health + admin routes
│       └── Dockerfile         # Multi-stage Docker build
├── packages/
│   ├── database/              # Drizzle schemas + client (814 LOC)
│   │   └── src/schema/        # 12 table schemas
│   ├── game-engine/           # Pure simulation logic (4,009 LOC)
│   │   ├── src/simulation/    # Tick engine, outcome engine, policy engine
│   │   ├── src/formulas/      # Sigmoid, negotiation, investment, salary, risk
│   │   ├── src/opportunities/ # Generator, registry
│   │   ├── src/economy/       # Ledger, balance calculator
│   │   ├── src/energy/        # Energy manager
│   │   ├── src/random/        # Seeded RNG
│   │   ├── src/rules/         # YAML loader, validator
│   │   ├── src/scoring/       # Leaderboard scoring
│   │   ├── rules-data/v1/     # Event rules, energy costs, season config (YAML)
│   │   └── src/__tests__/     # 5 test suites (159 tests)
│   └── shared/                # Validators, types, constants (265 LOC)
└── tooling/                   # Shared TS, ESLint, Prettier configs
```

---

## Plan Completion: 15/15 Steps (100%)

### Step 0: Monorepo Scaffolding - DONE
- pnpm workspace with 9 packages
- Turborepo with build dependency graph and caching
- Shared TypeScript, ESLint, and Prettier configurations

### Step 1: Database Package - DONE
12 Drizzle schemas with indexes:

| Table | Purpose |
|-------|---------|
| users | Auth users (id, email, name, emailVerified) |
| sessions | Better Auth sessions |
| accounts | OAuth/credential accounts (with issuer, idToken) |
| verifications | Email verification tokens |
| characters | Player characters with JSONB attributes |
| seasons | Competition seasons (status, rules, seed, capital) |
| season_players | Per-season player state (cash, debt, energy, reputation) |
| ledger_entries | Append-only money ledger |
| opportunities | Generated game opportunities (8 types) |
| events | Event history log |
| decisions | Player choices with options and expiry |
| leaderboard_snapshots | Pre-calculated rankings |
| relationships | Player-to-player relationships |
| businesses | Player-owned businesses |
| ai_jobs | AI processing queue (Phase 3) |

Plus: client factory (neon-http for serverless, node-postgres for worker), seed script, reset script, activate-season utility.

### Step 2: Shared Package - DONE
- **Validators**: Character creation (100-point attribute total), decision submission, season joining
- **Constants**: Energy costs, game config, attribute definitions
- **Types**: API response types, game state types

### Step 3: Authentication - DONE
- Better Auth with Drizzle adapter and explicit schema mapping
- Email/password authentication (min 8 chars)
- 7-day session expiry with daily refresh
- Login and register pages with form validation
- Lazy initialization to avoid Next.js build-time evaluation

### Step 4: Game Engine Core - DONE (4,009 LOC)

**4a. Seeded RNG**: `seedrandom`-based with fork(), random(), randomInt(), weightedChoice(), pick(), shuffle(), chance(). Player-tick RNG: `seasonSeed:playerId:tickNumber`.

**4b. Rule Loader**: YAML parser with Zod validation. Rules define eligibility, generation probability, attribute modifiers, choices, outcome formulas, and importance thresholds for all 8 event types.

**4c. Formulas** (5 modules):
- `sigmoid(x)` - Standard sigmoid mapping to (0, 1)
- `calculateNegotiationScore()` - 30% negotiation, 20% reputation, 15% relationship, 15% strategy, 10% offer quality, 10% RNG - resistance
- `calculateInvestmentOutcome()` - Risk-adjusted sigmoid for success probability, creative/risk-appetite bonuses for returns, discipline loss protection
- `calculateSalary()` - Weighted attributes positioning within salary range
- `calculateRiskOutcome()` - Mitigation scoring against severity threshold, discipline-based damage reduction

**4d. Opportunity Generator**: Generates opportunities per tick based on eligibility rules, attribute-modified probabilities, cooldown tracking, and player state. Supports all 8 event types: job_offer, investment, partnership, market_event, business_launch, risk_event, skill_challenge, social_event.

**4e. Outcome Engine** (550 LOC): Resolves choices for all 8 event types with formula-based outcomes, ledger entries, reputation changes, relationship tracking, and business creation.

**4f. Tick Engine** (212 LOC): Pure function `processTick(input) -> output`. Processes energy replenishment, business revenue/expenses, opportunity generation, level progression (log2 net worth), and reputation decay toward neutral.

**4g. Ledger Operations**: Append-only ledger entry creation with balance tracking. Net worth = cash + business valuations - debt.

### Step 5: Fastify Worker - DONE

4 cron job processors:

| Job | Schedule | Purpose |
|-----|----------|---------|
| Tick Processor | Every 30 min | Batch-process all active players |
| Leaderboard Calculator | Every hour | Snapshot rankings with previous rank tracking |
| Energy Replenisher | Every 15 min | Replenish energy (1 per 6 min, max 100) |
| Decision Expirer | Every 15 min | Expire pending decisions past deadline |

Plus: Self-ping every 5 min (Render free tier keep-alive), API-key-protected admin routes, Dockerfile with multi-stage build (node:22-alpine).

### Step 6: Frontend Scaffolding - DONE
- Next.js 15 App Router with route groups: `(auth)` and `(game)`
- 16 UI components (7 shadcn/ui primitives + 9 custom)
- TanStack Query for server state with auto-refresh
- Zustand store for client state
- Providers wrapper with QueryClientProvider

### Step 7: Character Creation - DONE
- 6-slider attribute allocator (strategy, negotiation, riskAppetite, charisma, discipline, creativity)
- 100-point budget with real-time validation
- Character card preview component
- POST /api/characters with Zod validation

### Step 8: Season System - DONE
- Season listing page with status badges (upcoming, registration, active, completed)
- Join flow: POST /api/seasons/[id]/join creates season_player + initial ledger entry
- Player count display per season
- "Joined" indicator for authenticated users

### Step 9: Player Dashboard - DONE
- Stats overview (cash, netWorth, debt, reputation, influence, level, rank)
- Energy bar with visual indicator and replenishment rate
- Pending decisions list with expiry countdown
- "While you were away" event timeline
- Auto-refresh every 60 seconds via TanStack Query

### Step 10: Decision Submission - DONE
- POST /api/decisions/[id] with:
  - Session validation and character ownership check
  - Decision expiry check
  - Energy cost validation and deduction (SQL atomic update)
  - Status transition: pending -> submitted
  - Event logging for audit trail
- GET /api/decisions/[id] for decision details

### Step 11: Leaderboard - DONE
- Pre-calculated snapshots from leaderboard_snapshots table
- Cursor-based pagination (configurable limit, max 100)
- Rank change tracking (previousRank)
- Fallback to season_players when no snapshots exist
- Support for "active" as special season identifier
- 5-minute auto-refresh

### Step 12: Energy System - DONE
- Energy manager: calculateCurrentEnergy(), canAffordAction(), deductEnergy(), calculateReplenishment()
- Replenishment: 1 energy per 6 minutes, max 100
- Cost validation on decision submission
- Energy bar component with color indicators (red <20%, warning 20-50%, green >50%)
- Database tracking via energyLastReplenishedAt

### Step 13: Testing & Hardening - DONE

**Unit Tests (Vitest) - 159 tests, all passing:**

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| formulas.test.ts | 54 | All 5 formula modules, edge cases, bounds checking |
| seeded-rng.test.ts | 37 | Determinism, fork, distributions, playerTickRNG |
| tick-engine.test.ts | 25 | Level calc, processTick, reputation decay, businesses |
| energy.test.ts | 27 | Replenishment, affordability, deduction, edge cases |
| ledger.test.ts | 16 | Entry creation, balance tracking, counter reset |

**E2E Tests (Playwright) - 5 specs:**
- Landing page load
- User registration flow
- Login flow
- Season listing
- Leaderboard viewing

**Rate Limiting:**
- Next.js: In-memory Map-based rate limiter with IP extraction
  - Characters POST: 10 req/min
  - Decisions POST: 20 req/min
  - Season Join POST: 10 req/min
- Fastify Worker: @fastify/rate-limit at 100 req/min global

### Step 14: Deployment - DONE

**Vercel (Web App):**
- `vercel.json` configured for pnpm monorepo
- Build: `pnpm turbo build --filter=@blooper-arena/web...`
- Output: `apps/web/.next`

**Render (Worker):**
- `render.yaml` blueprint for Docker service
- Dockerfile: node:22-alpine, multi-stage build
- Health check: GET /health
- Plan: free tier

**Sentry (Error Tracking):**
- Next.js: `instrumentation.ts` (server/edge) + `instrumentation-client.ts` (client)
- Fastify: `@sentry/node` init at server startup
- Production-only, 10% trace sampling

**Environment:**
- `.env.example` template with 12 variables
- `.gitignore` excludes secrets

---

## API Routes

| Method | Route | Purpose | Rate Limit |
|--------|-------|---------|------------|
| POST | /api/auth/[...all] | Better Auth handler | - |
| GET | /api/auth/[...all] | Better Auth handler | - |
| POST | /api/characters | Create character | 10/min |
| GET | /api/characters | List user's characters | - |
| POST | /api/decisions/[id] | Submit decision | 20/min |
| GET | /api/decisions/[id] | Get decision details | - |
| GET | /api/leaderboard/[season] | Paginated leaderboard | - |
| GET | /api/me/dashboard | Player dashboard data | - |
| GET | /api/seasons | List all seasons | - |
| POST | /api/seasons/[id]/join | Join a season | 10/min |

---

## Frontend Pages

| Route | Page | Auth Required |
|-------|------|---------------|
| / | Landing page | No |
| /login | Login form | No |
| /register | Registration form | No |
| /character/create | Attribute allocator | Yes |
| /dashboard | Player dashboard | Yes |
| /decisions | Decision management | Yes |
| /leaderboard | Season leaderboard | No |
| /season | Season listing | No |

---

## Database Connection

- **Provider**: Neon Postgres (free tier, ap-southeast-1)
- **Serverless**: `drizzle-orm/neon-http` (for Vercel API routes)
- **Pooled**: `drizzle-orm/node-postgres` (for Fastify worker)
- **Schema Management**: Drizzle Kit push

---

## Deployment Architecture

```
blooperarena.com (GoDaddy DNS -> Vercel)
           |
     [Vercel CDN]
           |
   [Next.js App Router]
    /              \
Server          API Routes
Components    (auth, characters,
 (SSR)       decisions, leaderboard)
    \              /
    [Better Auth]
           |
 [Drizzle - neon-http]
           |
    [Neon Postgres]
           |
 [Drizzle - node-postgres]
           |
    [Fastify Worker]
   (Render.com Docker)
           |
 Tick Engine    (*/30min)
 Leaderboard   (*/1hr)
 Energy/Expiry (*/15min)
```

---

## Remaining Operational Steps

1. **Push to GitHub** - Create repo, push all 3 commits
2. **Deploy to Vercel** - Import repo, set env vars, deploy
3. **Point DNS** - GoDaddy: blooperarena.com -> Vercel nameservers
4. **Deploy Worker** - Render: use render.yaml blueprint, set env vars
5. **Set up Sentry** - Create free project, add DSN to env vars
6. **Create Production Season** - Run seed script against production DB

---

## What's NOT in Phase 1

- AI narration (Phase 3)
- Friend challenges / private leagues (Phase 2)
- Achievements (Phase 2)
- Daily recap generation (Phase 2)
- Public spectator feed (Phase 2)
- Monetization (Phase 5)
- Multiple game modes (Phase 4)
- WebSocket real-time updates
- Mobile apps
- NPC characters
- Google OAuth (only email/password for now)
