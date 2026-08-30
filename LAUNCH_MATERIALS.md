# StayCheck launch materials

Before publishing, publish the `site` folder at a public HTTPS URL. Use the final policy URL in the Chrome Web Store Privacy tab and the final landing-page URL in the Store Listing.

## Chrome Web Store listing

**Name:** StayCheck

**Short description:** Compare a hotel listing with Google Maps ratings and review excerpts before you book.

**Detailed description:**

StayCheck adds a compact Google Maps review check to supported hotel pages on Booking.com, Agoda, and Expedia.

It finds the matching Google Maps place using the hotel name and address, shows the rating, review count, and attributed review excerpts, and lets you choose or save the right place when a match needs your confirmation. Each excerpt links straight to its source on Google Maps.

Use StayCheck as a second opinion while researching a stay. Google reviews come from a different reviewer pool than the travel site you are viewing.

StayCheck does not book hotels, change prices, or require an account.

**Category:** Travel

**Support email:** `msannan121@gmail.com`

**Single purpose:** StayCheck helps travelers research a hotel by showing Google Maps ratings and attributed review excerpts on supported Booking.com, Agoda, and Expedia property pages.

**Permission justifications:**

| Permission | Why it is needed |
| --- | --- |
| `storage` | Stores the user’s saved place match, a random installation ID for service limits, and local diagnostic/status information in Chrome. |
| `activeTab` | Lets the popup re-run a check only for the tab the user has actively opened. |
| Booking.com, Agoda, Expedia host access | Reads the hotel name and address on supported property pages and renders the StayCheck panel there. |
| StayCheck Worker host access | Sends the hotel name/address lookup and receives Google Maps match/review results. |

**Privacy disclosure answers:**

- Handles website content: **Yes** — the hotel name and address visible on a supported property page are sent to StayCheck’s Worker to run the requested match.
- Collects personal information: **No**.
- Sells user data: **No**.
- Uses data for purposes unrelated to the extension’s single purpose: **No**.
- Privacy policy URL: `REPLACE-WITH-PUBLISHED-HTTPS-PRIVACY-URL`.

## Product Hunt draft

**Name:** StayCheck

**Tagline:** Check Google Maps reviews before you book a hotel.

**Topics:** Travel, Chrome Extensions, Productivity

**Pricing:** Free

**Website:** Use the public landing page or Chrome Web Store URL once it is live.

**Description (under 260 characters):**

StayCheck puts a quick Google Maps review check on Booking.com, Agoda, and Expedia hotel pages—so you can compare a property’s rating, review count, and attributed review excerpts before you book.

**Maker’s first comment:**

Hey Product Hunt! I built StayCheck for the moment when a hotel looks great on a booking site, but you still want a quick second opinion before committing.

On supported Booking.com, Agoda, and Expedia property pages, StayCheck matches the hotel with Google Maps using its name and address. It then shows the Google Maps rating, review count, and a few attributed review excerpts right where you’re researching. If the automatic match is uncertain, you can choose the correct place yourself and StayCheck remembers that choice locally.

The goal is simple: less tab-hopping, better context before booking. It’s free, needs no account, and every displayed review links back to Google Maps.

I’d love to hear: what is the one thing you always check before booking a stay?

**Gallery storyboard (create 3–5 images at 1270 × 760):**

1. “Before you book, check the fuller picture.” — Booking.com hotel page with the expanded StayCheck panel.
2. “Google Maps reviews, right where you research.” — close-up of rating, attribution, reviewer avatars, and source links.
3. “Not sure it’s the same hotel? You decide.” — candidate-selection state.
4. “Works across the travel sites you already use.” — Booking.com, Agoda, Expedia marks plus a concise supported-sites note.

## Release sequence

1. Create a public GitHub repository, push this project to its `main` branch, then open **Settings → Pages** and select **GitHub Actions** as the publishing source. The included workflow deploys only `site/` (plus its icon). Verify `/privacy.html` and `/terms.html` in an incognito window at `https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY/`.
2. Confirm the Worker returns `authorPhotoUri` (or `authorPhotoUrl`) and `googleMapsUri` (or `mapsUrl`) for every displayed review, and does not cache Google Maps content (Place IDs are the permitted exception). This extension build deliberately suppresses excerpts missing either field.
3. Create `dist/StayCheck-1.0.0.zip` with the supplied packaging command and upload it as **unlisted** in the Chrome Web Store dashboard.
4. Copy the permanent extension ID assigned after upload. In the Cloudflare Worker, set `ALLOWED_EXTENSION_ID` to that value, redeploy, and test the Store-installed unlisted extension on one real property page from each supported site.
5. Complete the Store Listing and Privacy forms using the copy above. Use deferred publishing if review finishes before your desired release time.
6. Publish the Store listing. Then use the real Store URL as the Product Hunt download link, create the gallery, add the first comment, and schedule the Product Hunt launch.

Product Hunt requires a personal (not company) account. A newly created personal account normally must be at least one week old to post, although Product Hunt says newsletter subscription can provide immediate access. Make sure the product is already usable when the Product Hunt post goes live.
