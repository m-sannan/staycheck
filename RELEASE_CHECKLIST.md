# Release checklist

- [x] Create and add an original StayCheck extension logo before sharing publicly or submitting to the Chrome Web Store.
- [x] Replace the temporary text/shield mark with the final logo in the extension UI.
- [x] Add required Chrome extension icons to the manifest.
- [x] Deploy the Cloudflare Worker and D1 anonymous usage counters.
- [x] Move the Google API key to Cloudflare Worker secrets.
- [x] Add Booking.com, Agoda, and Expedia property-page support.
- [x] Add local saved matches, stricter confidence handling, and a user-facing force-check control.
- [x] Replace the temporary personal-build name and align the popup with the final logo palette.
- [ ] Recheck Google Maps attribution and source-link display requirements.
- [ ] Complete real-browser regression testing on Booking.com, Agoda, and Expedia after the latest changes.
- [ ] Publish a privacy policy and add its URL to the Chrome Web Store listing.
- [ ] Upload the extension as unlisted, then set `ALLOWED_EXTENSION_ID` in the Worker using the final Store extension ID.
- [ ] Prepare Chrome Web Store listing copy, screenshots, support contact, and permission explanations.
- [ ] Bump the extension version to `1.0.0` for the first public release.
