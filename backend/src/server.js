import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { candidate, isConfident } from './matching.js';
import { PlacesClient } from './places.js';

function loadEnv() { const file = resolve(process.cwd(), '.env'); if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) { const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, ''); } }
loadEnv();
const port = Number(process.env.PORT || 8787);
const client = new PlacesClient(process.env.GOOGLE_MAPS_API_KEY || '');

function allowedOrigin(origin) { return /^https:\/\/([a-z0-9-]+\.)?booking\.com$/i.test(origin || '') || /^chrome-extension:\/\//.test(origin || ''); }
function respond(response, status, body, origin) { response.writeHead(status, { 'Content-Type': 'application/json', ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Private-Network': 'true' } : {}) }); response.end(JSON.stringify(body)); }
async function body(request) { let text = ''; for await (const chunk of request) { text += chunk; if (text.length > 10_000) throw new Error('Request too large.'); } return JSON.parse(text || '{}'); }
function validListing(value) { return value && typeof value.name === 'string' && value.name.trim().length > 1 && value.name.length < 200 && (!value.address || typeof value.address === 'string'); }
function publicDetails(place) { return { name: place.displayName?.text, address: place.formattedAddress, rating: place.rating, reviewCount: place.userRatingCount || 0, mapsUrl: place.googleMapsUri, reviews: (place.reviews || []).slice(0, 5).map((review) => ({ author: review.authorAttribution?.displayName || 'Google user', authorUrl: review.authorAttribution?.uri, rating: review.rating, text: review.text?.text || '', relativeDate: review.relativePublishTimeDescription, publishedAt: review.publishTime, mapsUrl: review.googleMapsUri })) }; }

export function createServer(places = client) {
  return http.createServer(async (request, response) => {
    const origin = request.headers.origin;
    if (request.method === 'OPTIONS') return respond(response, allowedOrigin(origin) ? 204 : 403, {}, allowedOrigin(origin) ? origin : undefined);
    if (request.method === 'GET' && request.url === '/health') return respond(response, 200, { ok: true });
    if (!allowedOrigin(origin)) return respond(response, 403, { error: 'Only Booking.com and the extension may call this local companion.' });
    try {
      const payload = await body(request);
      if (request.method === 'POST' && request.url === '/lookup') {
        if (!validListing(payload)) return respond(response, 400, { error: 'A hotel name is required.' }, origin);
        const found = await places.search(payload);
        const candidates = (found.places || []).slice(0, 3).map((place) => candidate(payload, place));
        const match = candidates.find(isConfident);
        return respond(response, 200, match ? { status: 'matched', place: match } : { status: 'choose', candidates }, origin);
      }
      if (request.method === 'POST' && request.url === '/details') {
        if (typeof payload.placeId !== 'string' || payload.placeId.length > 300) return respond(response, 400, { error: 'A Google place ID is required.' }, origin);
        return respond(response, 200, publicDetails(await places.details(payload.placeId)), origin);
      }
      return respond(response, 404, { error: 'Not found.' }, origin);
    } catch (error) { console.error(error.message); return respond(response, 502, { error: 'Could not load Google Maps data. Check the local companion and API key.' }, origin); }
  });
}

if (process.argv[1]?.endsWith('/server.js')) {
  if (!process.env.GOOGLE_MAPS_API_KEY) console.warn('GOOGLE_MAPS_API_KEY is missing. Add it to .env before using StayCheck.');
  const server = createServer();
  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') console.error(`StayCheck is already running on http://127.0.0.1:${port}. Stop the earlier StayCheck terminal, then try again.`);
    else console.error(`StayCheck could not start: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, '127.0.0.1', () => console.log(`StayCheck companion listening at http://127.0.0.1:${port}`));
}
