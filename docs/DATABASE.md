# Database Schema

## User
`email` (unique), `passwordHash`, `name`, `isActive`

## Wallet
`userId` (unique), `balances: { VES, INR }`

## StreakConfig
Singleton (`key: "default"`): `cycleLengthDays` (7), `claimWindowHours` (24),
`graceHours` (24, extra time before a missed day resets the streak), `active`.

## StreakReward
`day` (unique), `rewardType` (`VES`|`GIFT_CARD`), `currency` (`VES`|`INR`),
`amount`, `title`, `subtitle`, `assetType` (`coin`|`gift-card`|`crown`),
`isUltimate`, `active`, `metadata`.

## StreakCycle
One doc per streak attempt. `userId`, `cycleNumber`, `status`
(`ACTIVE`|`COMPLETED`|`RESET`), `currentDay`, `checkedIn`, `lastClaimAt`,
`nextClaimAt` (null ⇒ claimable now), `startedAt`, `endedAt`.

Index: `{ userId, status }` — fast lookup of the active cycle.

## StreakClaim
`userId`, `cycleId`, `day`, `rewardId`, `status`, `claimedAt`, `transactionId`.

**Unique index: `{ userId, cycleId, day }`.** This is the actual duplicate/
concurrency guard — a second insert for the same triple always fails at the
database layer with `E11000`, regardless of application-level races.

## WalletTransaction
`userId`, `currency`, `type` (`CREDIT`), `amount`, `source` (`DAILY_STREAK`),
`referenceId` (unique, `STREAK-<claimId>`), `streakDay`, `balanceBefore`,
`balanceAfter`, `status`.

## AuditLog
`userId`, `event` (`STREAK_CLAIM_REQUEST` | `STREAK_CLAIM_SUCCESS` |
`STREAK_CLAIM_REJECTED` | `STREAK_RESET` | `DUPLICATE_CLAIM` | `INVALID_CLAIM`),
`details`, `ip`.

## Traceability

`StreakClaim → WalletTransaction → Wallet.balances` is fully traceable: every
successful claim has exactly one transaction, and every transaction records
the exact before/after balance, so an evaluator can reconstruct wallet state
from the ledger alone.
