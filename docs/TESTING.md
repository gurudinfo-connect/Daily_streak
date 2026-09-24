# Testing Notes

Manual test matrix (also covered by the Postman collection in `/postman`):

1. **Correct claim** — Day 1 available on a new account → `POST /claim` succeeds, wallet credited, `Day 2` becomes `TODAY` with a `nextClaimAt` ~24h out.
2. **Duplicate claim** — repeat the same `POST /claim` immediately → second call returns `409 ALREADY_CLAIMED`.
3. **Concurrent claim** — fire two `POST /claim` requests in parallel (e.g. `Promise.all`) → exactly one `WalletTransaction` is created; verify in MongoDB.
4. **Locked day** — attempt to claim Day 2 before `nextClaimAt` → `409 STILL_LOCKED`.
5. **Fake day** — `POST /claim { "day": 7 }` while only eligible for Day 2 → `409 DAY_MISMATCH`.
6. **Fake reward/streak** — include `reward`, `amount`, `currency`, `streak` in the body → ignored; response reflects the real configured reward.
7. **Fake user** — include `userId` for another account in the body → ignored; claim applies to the JWT's own user.
8. **Timer manipulation** — change the test device's clock forward → claim still rejected with `STILL_LOCKED` until real server time passes `nextClaimAt`.
9. **Missed day / reset** — manually set a `StreakCycle.nextClaimAt` in the past beyond `graceHours` (or wait it out in a dev environment with a short `claimWindowHours`/`graceHours`), then call `GET /daily-streak` → cycle resets to Day 1, a new `StreakCycle` is created, `STREAK_RESET` is written to `AuditLog`.
10. **Refresh persistence** — claim Day 1, refresh the browser → state still shows `Day 1 Claimed`, `Day 2` locked/counting down (pulled fresh from the API, not from React state).
11. **Multiple tabs** — open two tabs, claim in one → the other's next claim attempt gets `ALREADY_CLAIMED` or reflects the already-advanced day on refresh.
12. **Unauthorized request** — omit/garble the `Authorization` header → `401 NO_TOKEN`/`INVALID_TOKEN`.

Run the seed script (`npm run seed` in `backend/`) before testing so the 7
`StreakReward` days and `StreakConfig` exist.
