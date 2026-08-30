# StayCheck

> A second opinion before you book.

StayCheck is a Chrome extension for Booking.com, Agoda, and Expedia hotel property pages. It compares the selected property with Google Maps before you book. The public path uses a Cloudflare Worker; you do not need a local server.

## What it does

On a supported property page, StayCheck reads the displayed hotel name and address, asks StayCheck’s review service to find the Google Maps place, and adds a comparison panel.

The panel shows:

- Google rating and review count
- matched property address
- up to five Google Maps review excerpts
- direct links to the full Google Maps listing and individual source reviews

If name and address do not identify one reliable result, StayCheck shows up to three Google candidates for you to choose. It never runs on search-result pages.

On Booking.com the panel appears below the property header. On Agoda and Expedia it appears below the Overview/Rooms navigation, so it stays near the point where you choose a room.

When you select a candidate, StayCheck saves that Google Place ID only in Chrome's local extension storage for that browser profile. It will reuse the choice as **Matched by you** on future visits. Use **Wrong place? Choose another** or **Forget saved match** in the expanded panel to change it. No review text or browsing history is saved.

## Load the extension on this computer

1. Clone or pull this repository.
2. In Chrome, open `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select the `extension/` folder in this repo.
3. Open a Booking.com, Agoda, or Expedia **hotel property** page.

Alternatively, unzip `dist/staycheck-extension.zip` (created with `npm run pack`) and load that unpacked folder. The extension talks to `https://staycheck-api.msannan121.workers.dev`. Keep that Worker running before you share the extension.

Privacy policy: `docs/privacy.html`. Chrome Web Store copy: `docs/chrome-web-store.md`.

## Hosted Worker

`worker/` is the Cloudflare Worker API (`/lookup`, `/details`, `/health`). The Google API key stays in Cloudflare secrets. Anonymous usage limits apply.

Required Worker secrets: `GOOGLE_MAPS_API_KEY` and `RATE_LIMIT_SALT`. Do not add either secret to this repository. After the Chrome Web Store assigns the final extension ID, set `ALLOWED_EXTENSION_ID` on the Worker so only that published extension can call the API.

```bash
npx wrangler d1 migrations apply staycheck-usage --remote --config worker/wrangler.jsonc
npm run worker:deploy
```

## Verify

```bash
npm test
curl https://staycheck-api.msannan121.workers.dev/health
```

A successful property match loads its review panel automatically; uncertain matches require a selection before review excerpts load.

## Optional local companion

For offline API work only: copy `.env.example` to `.env`, set `GOOGLE_MAPS_API_KEY`, run `npm start`, and temporarily point `API` in `extension/background.js` at `http://127.0.0.1:8787`. Do not ship that change.

## Constraints

Google Places returns a maximum of five review excerpts. StayCheck shows them with author photo, name, and source links, and lets you open the complete listing in Google Maps.
