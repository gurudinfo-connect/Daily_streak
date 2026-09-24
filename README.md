# VELoop Rewards — Daily Streak (MERN)

A backend-driven Daily Streak & Rewards feature for VELoop Rewards. **React controls
the presentation. The backend controls the streak.**

## Architecture

```
React (Vite) ──HTTP/JWT──> Express REST API ──> Node.js ──Mongoose──> MongoDB
```

Every value that matters (current day, claim eligibility, reward amount, timer,
wallet balance) is computed and validated on the backend. The frontend only
renders what the API returns and visually counts down using **server time**,
not the device clock.

- `backend/` — Express + MongoDB API (see `backend/src`)
- `frontend/` — React (Vite) + Bootstrap + CSS Modules UI
- `docs/` — API docs, DB schema, security notes, testing notes
- `postman/` — Postman collection for manual/API testing

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # loads the 7-day reward config into MongoDB
npm run dev                # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env       # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`, sign up, and you'll land on `/daily-streak`.

## Database schema (summary — full detail in `docs/DATABASE.md`)

| Model | Purpose |
|---|---|
| `User` | Auth identity (email + bcrypt password hash) |
| `Wallet` | Per-user balances by currency (`VES`, `INR`) |
| `StreakConfig` | Cycle length, claim window, grace period — editable without redeploying |
| `StreakReward` | The 7-day reward table (day → type/amount/currency/title/asset) |
| `StreakCycle` | One doc per streak attempt: `currentDay`, `checkedIn`, `nextClaimAt` |
| `StreakClaim` | One doc per successful claim; **unique index on `(userId, cycleId, day)`** is what makes duplicate/concurrent claims impossible |
| `WalletTransaction` | Immutable ledger entry for every credit, with `balanceBefore`/`balanceAfter` |
| `AuditLog` | Security event trail (`STREAK_CLAIM_REQUEST`, `DUPLICATE_CLAIM`, `STREAK_RESET`, …) |

## Streak logic, in one paragraph

On every `GET /daily-streak` or `POST /daily-streak/claim`, the backend loads the
user's **active `StreakCycle`**, checks whether `now > nextClaimAt + graceHours`
(missed window) and resets it server-side if so — the client never triggers or
declares a reset. On claim, the backend re-derives the actual current day from
the cycle (ignoring any `day` the client sent except as an optimistic-lock hint),
re-fetches the reward configuration from `StreakReward` (ignoring any reward/
amount/currency the client sent), and — inside a MongoDB transaction — creates a
`StreakClaim`, atomically `$inc`s the `Wallet`, writes a `WalletTransaction`, and
advances the cycle's `currentDay`/`nextClaimAt`. The unique index on `StreakClaim`
guarantees that even two simultaneous requests can only produce one successful
claim; the second gets an `E11000` duplicate-key error, which is translated into
a clean `ALREADY_CLAIMED` response.

## Security model

See `docs/SECURITY.md` for the full anti-cheat walkthrough (DevTools tampering,
clock manipulation, fake rewards, day-skipping, cross-user claims, duplicate/
concurrent requests). Short version: **nothing the client sends is trusted**
except the JWT identity and, as a hint only, the requested day.

## Known limitations / where the real CPA integration goes

- The "Preparing your reward…" step (`CpaDemo.jsx`) is a polished placeholder,
  as specified — it never grants anything itself. Swap it for the real ad SDK
  call later; keep the backend `/claim` call as the only thing that actually
  grants a reward.
- All reward/hero/why-streak artwork is now the supplied illustrations (optimized WebP in
  `frontend/src/assets/icons/`, mapped in `frontend/src/assets/icons.js`).
- Tablet breakpoints are implemented via CSS Grid auto-adjustment (900px/600px
  breakpoints in `DailyStreak.module.css`); fine-tune against the actual mobile
  design assets once available locally.
- No production credentials are included anywhere in this repo — `.env.example`
  files only.
