# StayCheck

> A second opinion before you book.

StayCheck is a Chrome extension for Booking.com, Agoda, and Expedia hotel property pages. It compares the selected property with Google Maps before you book.

## What it does

When you open a supported hotel property page, StayCheck reads the displayed hotel name and address, asks a companion service running on your laptop to find the Google Maps place, and adds a panel near the property's score.

The panel shows:

- Google rating and review count
- matched property address
- up to five Google review excerpts
- direct links to the full Google Maps listing and individual source reviews

If name and address do not identify one reliable result, StayCheck shows up to three Google candidates for you to choose. It never runs on search-result pages.

On Booking.com the panel appears below the property header. On Agoda and Expedia it appears below the Overview/Rooms navigation, so it stays near the point where you choose a room.

When you select a candidate, StayCheck saves that Google Place ID only in Chrome's local extension storage for that browser profile. It will reuse the choice as **Matched by you** on future visits. Use **Wrong place? Choose another** or **Forget saved match** in the expanded panel to change it. No review text or browsing history is saved.

## Setup

1. In Google Cloud, create a project, attach billing, and enable **Places API (New)**.
2. Create an API key. Copy `.env.example` to `.env`, then set `GOOGLE_MAPS_API_KEY` to that key.
3. Run `npm start` from this repository. Keep the terminal open while you use the extension.
4. In Chrome, visit `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `extension/`.
5. Open a Booking.com hotel property page.

The local companion service listens only on `127.0.0.1` and keeps the API key on your laptop. The hosted Worker is the public deployment path. There are no accounts, analytics, payment flow, or review cache. The local match key uses the normalized hotel name/address, so future Expedia and Agoda extractors can reuse a confirmed match for the same property. If an address is missing, the site hostname is included to avoid unsafe name-only sharing.

## Hosted Worker

`worker/` contains the Cloudflare Worker version of the API. It has the same `/lookup`, `/details`, and `/health` contract, keeps the Google API key in Cloudflare, and applies anonymous usage limits. The current deployment is `https://staycheck-api.msannan121.workers.dev`.

The Worker uses the `staycheck-usage` D1 database and requires `GOOGLE_MAPS_API_KEY` and `RATE_LIMIT_SALT` as Wrangler secrets. Do not add either secret to this repository. Once the Chrome Web Store assigns the final extension ID, set `ALLOWED_EXTENSION_ID` in the Worker to restrict access to that published extension.

## Verify

Run `npm test` for the matching checks. A successful property match loads its review panel automatically; uncertain matches require a selection before review excerpts load.

## Constraints

Google Places returns a maximum of five review excerpts. StayCheck shows them with author/source links and lets you open the complete listing in Google Maps. A future hosted version can move the same `/lookup` and `/details` endpoints to Cloudflare Workers, Render, Railway, or Vercel.
