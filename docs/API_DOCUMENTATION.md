# API Documentation

Base URL: `http://localhost:5000/api`

All `/daily-streak/*` routes require `Authorization: Bearer <token>`.

## Auth

### POST /auth/register
Body: `{ "email": "a@b.com", "password": "secret123", "name": "Ava" }`
201 → `{ success, token, user: { id, email, name } }`

### POST /auth/login
Body: `{ "email": "a@b.com", "password": "secret123" }`
200 → `{ success, token, user }`

### GET /auth/me
Header: `Authorization: Bearer <token>`
200 → `{ success, user }`

## Daily Streak

### GET /daily-streak
Full state: streak, nextReward, wallet balances, and all 7 reward cards.

```json
{
  "success": true,
  "serverTime": "2026-09-21T12:00:00.000Z",
  "streak": {
    "currentStreak": 1,
    "currentDay": 2,
    "checkedIn": 1,
    "totalRewards": 7,
    "status": "ACTIVE",
    "cycleNumber": 1,
    "nextClaimAt": "2026-09-22T12:00:00.000Z",
    "claimableNow": false
  },
  "nextReward": { "day": 2, "amount": 10, "currency": "VES", "type": "VES" },
  "wallet": { "VES": 5, "INR": 0 },
  "rewards": [
    { "day": 1, "status": "CLAIMED", "reward": { "type": "VES", "currency": "VES", "amount": 5, "title": "Daily Reward" }, "nextClaimAt": null },
    { "day": 2, "status": "TODAY", "reward": { "amount": 10, "currency": "VES" }, "nextClaimAt": "2026-09-22T12:00:00.000Z" }
  ]
}
```

### GET /daily-streak/status
Lightweight version — just `serverTime` + `streak`. Used by the frontend when
a visible countdown hits zero, to re-confirm eligibility before showing "Claim".

### POST /daily-streak/claim
Body (optional, hint only): `{ "day": 2 }`

The backend ignores any `reward`, `amount`, `currency`, `streak`, or `userId`
fields in the body. `day`, if sent, is compared against the server-derived
actual day and rejected on mismatch (`409 DAY_MISMATCH`) rather than honored.

Success (200): same shape as `GET /daily-streak`, reflecting the post-claim state.

Error responses (never leak driver internals):

| HTTP | code | when |
|---|---|---|
| 409 | `STILL_LOCKED` | claim window hasn't elapsed |
| 409 | `DAY_MISMATCH` | client's `day` no longer matches the real current day |
| 409 | `ALREADY_CLAIMED` | duplicate/concurrent claim caught by the unique index |
| 401 | `NO_TOKEN` / `INVALID_TOKEN` | missing/invalid JWT |
| 429 | `RATE_LIMITED` | too many claim attempts in a short window |
| 500 | `SERVER_ERROR` | unexpected failure (message is generic to the client; real error is logged server-side) |

### GET /daily-streak/history
```json
{ "success": true, "history": [ { "day": 1, "claimedAt": "...", "reward": { "day": 1, "amount": 5, "currency": "VES" }, "transactionId": "..." } ] }
```
