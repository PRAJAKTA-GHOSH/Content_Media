# Loop — backend

Express API backing the four modules: Generative Studio, Publisher, Analytics Store,
Cross-Platform Insights. In-memory store (`src/data/store.js`) seeded with the same
`CMP-024` / `POST-104..106` IDs the frontend already renders, so plugging this in
doesn't change anything visually — it just makes the numbers real.

## Run locally
```
npm install
npm start        # listens on PORT, default 4000
```
Check it's alive: `GET http://localhost:4000/api/health`

## Deploy to Render
1. Push this folder to a git repo (root of the repo = this folder, or set Render's
   "Root Directory" to `backend/` if it's a subfolder of a monorepo).
2. New → Web Service → connect the repo.
3. Build command: `npm install` · Start command: `npm start`.
4. Add an env var `CORS_ORIGIN` set to your deployed frontend URL once you have it
   (e.g. `https://your-app.vercel.app`). Leave it as `*` to unblock first deploy.
5. Render sets `PORT` itself — `server.js` already reads `process.env.PORT`.

## Wire up the frontend
In `js/app.js`, replace the calls that currently read straight from `STORE` (in
`js/data.js`) with `fetch` calls to these routes, e.g.:
```js
const API_BASE = "https://your-backend.onrender.com/api";
const res = await fetch(`${API_BASE}/campaigns/CMP-024/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ brief: briefInput.value })
});
const posts = await res.json();
```
Every route returns the same shape the mock data already used, so this is a
find-and-replace job, not a rewrite.

## Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/campaigns` | List campaigns |
| GET | `/api/campaigns/:id` | One campaign |
| POST | `/api/campaigns` | Create a new campaign `{ objective, brief }` |
| POST | `/api/campaigns/:id/apply-insight` | Fold a Campaign Memory insight into the brief `{ insightId }` |
| POST | `/api/campaigns/:id/generate` | Generate 3 channel concepts from a brief `{ brief }` — validated immediately |
| GET | `/api/campaigns/:id/posts` | All posts for a campaign |
| GET | `/api/posts/:id` | One post |
| POST | `/api/posts/:id/approve` | PENDING_REVIEW → APPROVED (409 otherwise) |
| POST | `/api/posts/:id/discard` | PENDING_REVIEW/REJECTED → DISCARDED |
| POST | `/api/posts/:id/fix` | REJECTED → AI shortens copy → re-validates |
| POST | `/api/posts/:id/schedule` | APPROVED → SCHEDULED `{ scheduledFor }` (409 if not approved) |
| POST | `/api/posts/:id/publish` | SCHEDULED → PUBLISHED via mock adapter, attaches metrics (409 if not scheduled) |
| GET | `/api/campaigns/:id/compare` | Like-for-like cross-platform metrics table |
| GET | `/api/campaigns/:id/insights` | Campaign Memory insights |
| GET | `/api/campaigns/:id/report` | Weekly AI report — every claim cites real, existing post IDs |
| GET | `/api/campaigns/:id/impact` | Business impact numbers (minutes saved, turnaround, catch rate) |
| GET | `/api/campaigns/:id/lifecycle` | Status counts, for the Publisher pipeline track |

## The state machine (this is the part judges will try to break)

```
GENERATED → validate() → PENDING_REVIEW | REJECTED
PENDING_REVIEW → approve() → APPROVED
PENDING_REVIEW | REJECTED → discard() → DISCARDED
REJECTED → fix() → re-validate() → PENDING_REVIEW | REJECTED
APPROVED → schedule() → SCHEDULED
SCHEDULED → publish() → PUBLISHED (+ metrics attached)
```
Every transition function in `src/services/pipeline.js` checks the post's current
status before acting and throws a `TransitionError` (→ HTTP 409) on anything out of
order — including calling `schedule` on a post that was never approved. Try it with
curl, not just the UI:
```
curl -X POST http://localhost:4000/api/posts/POST-104/schedule
```
should 409 unless POST-104 is currently APPROVED.

## Swapping in a real generation model later
`src/services/generator.js` is the only file that "writes" content. Replace
`generateConcepts(brief)` with a real API call (e.g. two independent Claude calls —
one prompted to generate Bengali natively, one English natively) and keep the same
return shape (`{ channel, format, dims, sizeMb, copyEn, copyBn, cta, hashtags }`) —
nothing else in the pipeline needs to change.
