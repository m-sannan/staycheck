import test from 'node:test';
import assert from 'node:assert/strict';
import { candidate, isConfident, overlap } from '../src/matching.js';

test('normalizes hotel name variants', () => { assert.ok(overlap('Hotel Crystal Luxury Inn - Bandra', 'Crystal Luxury Inn, Bandra') > 0.7); });
test('accepts a matching name and address', () => { const match = candidate({ name: 'Hotel Crystal Luxury Inn - Bandra', address: 'Bandra West, Mumbai, Maharashtra' }, { id: 'x', displayName: { text: 'Hotel Crystal Luxury Inn - Bandra (west), Mumbai' }, formattedAddress: 'Swami Vivekanand Rd, Bandra West, Mumbai, Maharashtra 400050', rating: 3.7, userRatingCount: 566 }); assert.equal(isConfident(match), true); });
test('does not accept a remote name-only match', () => { const match = candidate({ name: 'Hotel Crystal Luxury Inn', address: 'Bandra West, Mumbai' }, { id: 'x', displayName: { text: 'Hotel Crystal Luxury Inn' }, formattedAddress: 'MG Road, Bengaluru, Karnataka' }); assert.equal(isConfident(match), false); });
