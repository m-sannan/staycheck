# Chrome Web Store listing (draft)

Use this when uploading StayCheck. The $5 developer registration, 2FA, screenshots, and the actual upload must be done in your Google account. This environment cannot publish the listing.

## Store fields

**Name:** StayCheck

**Short description (132 characters max):**
Independently check Booking.com, Agoda, and Expedia hotel pages against Google Maps ratings, addresses, and review excerpts before you book.

**Detailed description:**

StayCheck is a second opinion before you book.

When you open a hotel property page on Booking.com, Agoda, or Expedia, StayCheck finds the matching Google Maps listing and shows:

- Google rating (out of 5) and review count
- matched address
- up to five Google Maps review excerpts
- a link to the full Google Maps listing

StayCheck does not average scores or tell you that a hotel is good or bad. Google and the booking site use different reviewer pools. StayCheck only makes that comparison easier.

If the name and address are not a safe automatic match, you choose among up to three Google candidates. Your choice is saved only in this browser.

StayCheck does not run on search-result pages. It does not require an account. The Google Maps API key stays on StayCheck’s server, not in the extension.

**Category:** Productivity (or Travel if available)

**Language:** English

## Privacy

Privacy policy URL (after you enable GitHub Pages on the `docs/` folder, or host the file elsewhere):

`https://m-sannan.github.io/staycheck/privacy.html`

Until Pages is on, you can also serve the same file from any HTTPS URL you control. A Google Doc is not accepted.

## Permission justifications

- **storage:** Saves anonymous installation ID, optional Place IDs you confirm, and on-device diagnostics.
- **activeTab:** Lets **Check this page again** in the toolbar popup ask the current tab to rerun StayCheck.
- **Host permission for staycheck-api.msannan121.workers.dev:** The extension must call StayCheck’s server, which holds the Google Maps API key and returns lookup/details JSON. The key is never shipped in the extension.

## Single purpose

StayCheck shows a Google Maps review comparison on the hotel property page the user is already viewing.

## Upload steps

1. Run `npm run pack` and upload `dist/staycheck-extension.zip` (manifest at the zip root).
2. Submit as **Unlisted** first.
3. Copy the assigned extension ID.
4. Set Worker secret/var `ALLOWED_EXTENSION_ID` to that ID and redeploy.
5. Load the unlisted link on Booking, Agoda, and Expedia property pages.
6. When that is stable, change visibility to Public and keep version `1.0.0` (or bump if you already shipped 1.0.0 unlisted with fixes).

## Screenshots to capture on your machine

Chrome Web Store needs 1280×800 or 640×400 JPEGs/PNGs. Capture:

1. Booking.com property page with the StayCheck panel collapsed (Google rating visible).
2. The same page with excerpts expanded, attribution and Maps link visible.
3. Agoda property page with the panel.
4. Expedia property page with the panel.
5. Candidate chooser when a match is uncertain (if you can trigger it).
6. Toolbar popup on a property page.

Use `extension/assets/staycheck-icon-1024.png` for the store icon.
