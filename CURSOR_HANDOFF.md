# StayCheck — Cursor handoff

## Product

StayCheck is a Manifest V3 Chrome extension that adds a Google Maps review comparison panel to hotel property pages on Booking.com, Agoda, and Expedia. It never runs on search-result pages.

The panel shows a Google rating on a five-point scale, review count, matched address, a Google Maps link, and up to five Google-provided review excerpts. It is a comparison aid, not a hotel-ranking or truth-detection product.

## Current architecture

```text
Chrome extension
  ├─ content.js: property extraction, injected panel, candidate choice, review UI
  ├─ background.js: Worker requests, local saved matches, local diagnostics
  └─ popup.*: force check and optional local diagnostic copy

Cloudflare Worker
  ├─ POST /lookup: Google Places text search and safe matching
  ├─ POST /details: Google Place details and up to five review excerpts
  ├─ GET /health
  └─ D1: anonymous usage counters only
```

The deployed API is `https://staycheck-api.msannan121.workers.dev`.

## Privacy and data handling

- Google Maps API key is a Cloudflare secret; it is never in the extension or repository.
- The Worker does not save property data or Google review text.
- D1 stores anonymous installation/month, salted IP/day, and global/day usage counts.
- Saved user-selected matches and diagnostic events remain in `chrome.storage.local` on that browser profile.
- Diagnostics are hidden by default and copied only when the user chooses **Help diagnose an issue** → **Copy details**.

## Matching behavior

1. Extract a hotel name/address from JSON-LD; fall back to visible page content.
2. Ask Google Places Text Search for up to three candidates.
3. Use a match automatically only when name and address scores meet the high-confidence threshold.
4. Otherwise show candidates and require a user selection.
5. A user-selected place ID is saved locally and marked **Matched by you** on later visits.

The expanded panel includes **Wrong place? Choose another** and **Forget saved match**.

## Local development

```bash
npm install
npm test
npm run worker:dev
```

Load `extension/` as an unpacked extension in Chrome. After changing extension files, reload it in `chrome://extensions`, then refresh a supported property page.

For the local companion instead of the hosted Worker, use an ignored `.env` with a Google Places API key and run `npm start`; switch `API` in `extension/background.js` back to `http://127.0.0.1:8787` only for local testing.

## Deployment

```bash
cd worker
npx wrangler d1 migrations apply staycheck-usage --remote
npx wrangler deploy
```

Required Worker secrets: `GOOGLE_MAPS_API_KEY` and `RATE_LIMIT_SALT`. Do not place their values in files, commits, terminals captured in screenshots, or chat.

## Release work remaining

See `RELEASE_CHECKLIST.md`. The key remaining work is real-browser testing on all three sites, Google attribution compliance review, privacy policy publication, Chrome Web Store metadata, and locking the Worker to the final Store extension ID.
