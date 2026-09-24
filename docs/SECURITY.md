# Security Notes — Anti-Cheat Walkthrough

| Attack | Where it's stopped |
|---|---|
| Change streak/day in React DevTools | Backend never reads streak/day from client state; `GET /daily-streak` always recomputes from `StreakCycle` + `StreakClaim` in MongoDB. |
| Change phone/PC clock forward 24h | All eligibility checks (`nextClaimAt`, missed-window) compare against `Date.now()` **on the server**. The frontend countdown is cosmetic; timer-zero triggers a re-check against `/daily-streak`, not an automatic unlock. |
| Send `{ "day": 7 }` while only eligible for Day 2 | `streak.service.js#claimReward` derives `actualDay` from the stored cycle; a mismatched `day` is rejected with `409 DAY_MISMATCH` before any reward logic runs. |
| Send `{ "reward": 1000000, "currency": "VES" }` | The claim endpoint never reads `reward`/`amount`/`currency` from the body at all — the reward is looked up server-side via `StreakReward.findOne({ day: actualDay })`. |
| Send `{ "userId": "anotherUser" }` | `req.userId` comes exclusively from the verified JWT (`auth.middleware.js`); the controller never reads `req.body.userId`. |
| Double-click / duplicate POST /claim | Unique index `{ userId, cycleId, day }` on `StreakClaim` — the second insert throws `E11000`, caught and returned as `409 ALREADY_CLAIMED`. |
| Two simultaneous claim requests (race) | Same unique index — MongoDB itself serializes the two inserts, so only one can ever succeed even without any additional locking. |
| Missed a day, streak should reset | `hasMissedWindow()` is checked on **every** read/write before anything else runs; the reset happens server-side and is invisible to (uncontrollable by) the frontend. |
| Multiple browser tabs claiming at once | Same as the concurrent-request case — the database-level unique index is tab-agnostic. |
| Closing the browser shouldn't reset the streak | Reset only happens based on `now > nextClaimAt + graceHours`, never on frontend activity/lifecycle events. |
| Logout/login, different device | Streak state lives entirely in MongoDB keyed by `userId`, not in any client storage. |

## What the frontend is allowed to decide
Only presentation: which asset to show, how to animate a reveal, how to lay
out a card, and the *visual* countdown number (which is always re-validated
against `serverTime` before anything is granted).

## Error hygiene
`error.middleware.js` returns generic messages for any 5xx — raw Mongoose/
Mongo errors (`MongoServerError`, `CastError`) or Axios errors are logged
server-side only, never sent to the client.
