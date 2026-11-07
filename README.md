# Dental Studio — sample clinic site

A sample single-site dental clinic website built to the locked design system in
`Dental Clinic Website PRD.md`: film-navy sections on a porcelain paper, one Three.js
tooth arch that the booking flow drives, quiet serif typographic pages, and a soft
shadow Assistant bubble.

## Quickstart

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. Everything is local; there is no database or
network service needed to look at (or build) the site.

```bash
npm run build   # type-check + production build
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Operating-table hero (three.js arch), tooth finder, patient promises, shade slider, popular treatments, first visit |
| `/treatments` | All eleven treatments, full rows with visits/recovery columns |
| `/team` | Sample team profiles |
| `/your-visit` | Four visit steps, hours table, FAQ, parking and bus copy |
| `/book` | Four-step booking flow (Reason → Time → Your details → Review) with the arch picker |
| `/privacy`, `/terms` | Sample policies |
| `/api/bookings` | POST; 201 / 400 / 422 / 429 |
| `/api/assistant` | POST; rule-based replies; body required |

## What is stubbed (by design)

- **Persistence** — `/api/bookings` keeps requests in an in-memory store
  (`lib/bookingStore.ts`, deduped on `requestId`). There is a matching Prisma schema
  in `prisma/schema.prisma`; to wire a real database, create it from that schema,
  set `DATABASE_URL` in `.env`, and swap `bookingStore.add` for Prisma inserts.
- **Notifications** — no email/SMS is sent on booking. Add it in
  `app/api/bookings/route.ts`.
- **Assistant** — `app/api/assistant/route.ts` answers from a hand-written rule list
  (`lib/assistant.ts`): hours, address, booking, treatments, cost disclaimer, urgent
  triage, fear of drills. Swap the resolver for an LLM whenever you like; the widget
  contract does not change. Anything clinical routes to a phone call, never advice.
- **Team portraits and reviews** — marked "sample" in the UI; no invented patients
  or specially ordered photos.
- **Analytics** — `lib/analytics.ts` fires client events over the console/queue only.

## Motion and interaction notes

- The arch staggers the rise per tooth digit with back-out easing; drag spins the
  arch (±1.1 rad); WebGL failure or reduced-motion swaps it for the poster chart.
- Selecting a tooth anywhere (canvas, chart chips, booking prefill) mirrors it
  everywhere via `lib/store.ts`.
- Rate limits: bookings 5/h per IP, assistant 30/h per IP (`lib/rateLimit.ts`).
