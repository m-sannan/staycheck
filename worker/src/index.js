const GOOGLE_PLACES_API = 'https://places.googleapis.com/v1';
const MONTHLY_REQUEST_LIMIT = 20;
const DAILY_IP_REQUEST_LIMIT = 40;
const DAILY_GLOBAL_REQUEST_LIMIT = 1_000;

function json(body, status = 200, origin) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...(origin ? { 'access-control-allow-origin': origin, vary: 'Origin' } : {}) } });
}

function allowedOrigin(request, env) {
  const origin = request.headers.get('origin') || '';
  const expected = env.ALLOWED_EXTENSION_ID ? `chrome-extension://${env.ALLOWED_EXTENSION_ID}` : '';
  return origin.startsWith('chrome-extension://') && (!expected || origin === expected) ? origin : '';
}

function validInstallationId(value) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || ''); }
function validListing(value) { return value && typeof value.name === 'string' && value.name.trim().length > 1 && value.name.length < 200 && (!value.address || typeof value.address === 'string'); }
function monthBucket() { return new Date().toISOString().slice(0, 7); }
function dayBucket() { return new Date().toISOString().slice(0, 10); }

async function hash(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function consume(db, scope, bucket, key, limit) {
  const result = await db.prepare(`INSERT INTO usage_counters (scope, bucket, counter_key, count, updated_at)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(scope, bucket, counter_key) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
    WHERE count < ?`).bind(scope, bucket, key, new Date().toISOString(), limit).run();
  return result.meta.changes === 1;
}

async function allowRequest(request, env) {
  const installationId = request.headers.get('x-staycheck-installation');
  if (!validInstallationId(installationId)) return { ok: false, error: 'StayCheck installation ID is missing. Reload the extension and try again.', status: 401 };
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const ipHash = await hash(`${env.RATE_LIMIT_SALT}:${ip}`);
  const [installation, ipLimit, globalLimit] = await Promise.all([
    consume(env.USAGE, 'installation', monthBucket(), installationId, MONTHLY_REQUEST_LIMIT),
    consume(env.USAGE, 'ip', dayBucket(), ipHash, DAILY_IP_REQUEST_LIMIT),
    consume(env.USAGE, 'global', dayBucket(), 'all', DAILY_GLOBAL_REQUEST_LIMIT)
  ]);
  if (!installation) return { ok: false, error: 'This installation has reached its 10 Google review checks for this month.', status: 429 };
  if (!ipLimit) return { ok: false, error: 'Too many checks from this network today. Please try again tomorrow.', status: 429 };
  if (!globalLimit) return { ok: false, error: 'StayCheck has reached today’s public usage limit. Please try again tomorrow.', status: 429 };
  return { ok: true };
}

async function google(path, options, fields, env) {
  const response = await fetch(`${GOOGLE_PLACES_API}${path}`, { ...options, headers: { 'content-type': 'application/json', 'x-goog-api-key': env.GOOGLE_MAPS_API_KEY, 'x-goog-fieldmask': fields, ...(options.headers || {}) } });
  if (!response.ok) throw new Error(`Google Places request failed (${response.status}).`);
  return response.json();
}

function tokens(value = '') { return new Set(String(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((token) => token && !new Set(['hotel', 'the', 'and', 'inn', 'by', 'a', 'an']).has(token))); }
function overlap(left, right) { const a = tokens(left); const b = tokens(right); if (!a.size || !b.size) return 0; return [...a].filter((token) => b.has(token)).length / new Set([...a, ...b]).size; }
function confidenceLabel(match) { if (match.confidence >= 55 && match.nameScore >= 0.55 && match.addressScore >= 0.35) return 'high'; if (match.confidence >= 48 && match.nameScore >= 0.35 && match.addressScore >= 0.15) return 'possible'; return 'low'; }
function candidate(listing, place) { const nameScore = overlap(listing.name, place.displayName?.text); const addressScore = overlap(listing.address, place.formattedAddress); const match = { id: place.id, name: place.displayName?.text || 'Unnamed place', address: place.formattedAddress || '', rating: place.rating, reviewCount: place.userRatingCount || 0, mapsUrl: place.googleMapsUri, confidence: Math.round((nameScore * 0.7 + addressScore * 0.3) * 100), nameScore, addressScore }; return { ...match, confidenceLabel: confidenceLabel(match) }; }
function publicDetails(place) { return { name: place.displayName?.text, address: place.formattedAddress, rating: place.rating, reviewCount: place.userRatingCount || 0, mapsUrl: place.googleMapsUri, reviews: (place.reviews || []).slice(0, 5).map((review) => ({ author: review.authorAttribution?.displayName || 'Google user', authorUrl: review.authorAttribution?.uri, authorPhotoUri: review.authorAttribution?.photoUri, rating: review.rating, text: review.text?.text || '', relativeDate: review.relativePublishTimeDescription, publishedAt: review.publishTime, visitDate: review.visitDate, mapsUrl: review.googleMapsUri })) }; }

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);
    if (request.method === 'OPTIONS') return origin ? new Response(null, { status: 204, headers: { 'access-control-allow-origin': origin, vary: 'Origin', 'access-control-allow-headers': 'content-type, x-staycheck-installation', 'access-control-allow-methods': 'POST, OPTIONS' } }) : json({ error: 'Not allowed.' }, 403);
    if (request.method === 'GET' && new URL(request.url).pathname === '/health') return json({ ok: true, service: 'staycheck' });
    if (!origin) return json({ error: 'Only the StayCheck extension may call this service.' }, 403);
    if (request.method !== 'POST') return json({ error: 'Not found.' }, 404, origin);

    try {
      const payload = await request.json();
      const usage = await allowRequest(request, env);
      if (!usage.ok) return json({ error: usage.error }, usage.status, origin);
      const path = new URL(request.url).pathname;
      if (path === '/lookup') {
        if (!validListing(payload)) return json({ error: 'A hotel name is required.' }, 400, origin);
        const found = await google('/places:searchText', { method: 'POST', body: JSON.stringify({ textQuery: [payload.name, payload.address].filter(Boolean).join(', ') }) }, 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri', env);
        const candidates = (found.places || []).slice(0, 3).map((place) => candidate(payload, place));
        const match = candidates.find((place) => place.confidenceLabel === 'high');
        return json(match ? { status: 'matched', place: match, candidates } : { status: 'choose', candidates }, 200, origin);
      }
      if (path === '/details') {
        if (typeof payload.placeId !== 'string' || payload.placeId.length > 300) return json({ error: 'A Google place ID is required.' }, 400, origin);
        const place = await google(`/places/${encodeURIComponent(payload.placeId)}`, { method: 'GET' }, 'id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews', env);
        return json(publicDetails(place), 200, origin);
      }
      return json({ error: 'Not found.' }, 404, origin);
    } catch (error) {
      console.error(JSON.stringify({ event: 'worker_error', message: error instanceof Error ? error.message : 'Unknown error' }));
      return json({ error: 'Could not load Google Maps data. Please try again later.' }, 502, origin);
    }
  }
};
