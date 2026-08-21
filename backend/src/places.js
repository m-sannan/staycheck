const BASE = 'https://places.googleapis.com/v1';
export class PlacesClient {
  constructor(key, fetchImpl = fetch) { this.key = key; this.fetch = fetchImpl; }
  async call(path, options, fields) { const response = await this.fetch(`${BASE}${path}`, { ...options, headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': this.key, 'X-Goog-FieldMask': fields, ...(options.headers || {}) } }); if (!response.ok) throw new Error(`Google Places request failed (${response.status}).`); return response.json(); }
  search(listing) { return this.call('/places:searchText', { method: 'POST', body: JSON.stringify({ textQuery: [listing.name, listing.address].filter(Boolean).join(', ') }) }, 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri'); }
  details(placeId) { return this.call(`/places/${encodeURIComponent(placeId)}`, { method: 'GET' }, 'id,displayName,formattedAddress,rating,userRatingCount,googleMapsUri,reviews'); }
}
