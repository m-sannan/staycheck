# StayCheck

> A second opinion before you book.

StayCheck is a personal Chrome extension for Booking.com hotel property pages. It compares the selected property with Google Maps before you book.

## What it does

When a Booking.com property page opens, StayCheck reads the displayed hotel name and address, asks a companion service running on your laptop to find the Google Maps place, and adds a panel near the Booking.com score.

The panel shows:

- Google rating and review count
- matched property address
- up to five Google review excerpts
- direct links to the full Google Maps listing and individual source reviews

If name and address do not identify one reliable result, StayCheck shows up to three Google candidates for you to choose. It never runs on Booking.com search-result pages.

## Setup

1. In Google Cloud, create a project, attach billing, and enable **Places API (New)**.
2. Create an API key. Copy `.env.example` to `.env`, then set `GOOGLE_MAPS_API_KEY` to that key.
3. Run `npm start` from this repository. Keep the terminal open while you use the extension.
4. In Chrome, visit `chrome://extensions`, enable **Developer mode**, choose **Load unpacked**, and select `extension/`.
5. Open a Booking.com hotel property page.

The companion service listens only on `127.0.0.1` and the API key remains on your laptop. There is no hosted backend, account, database, analytics, payment flow, or review cache.

## Verify

Run `npm test` for the matching checks. A successful property match loads its review panel automatically; uncertain matches require a selection before review excerpts load.

## Constraints

Google Places returns a maximum of five review excerpts. StayCheck shows them with author/source links and lets you open the complete listing in Google Maps. A future hosted version can move the same `/lookup` and `/details` endpoints to Cloudflare Workers, Render, Railway, or Vercel.
