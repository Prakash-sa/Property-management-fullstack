import type { Property, PropertyStatus } from '../types';

const STATUSES: PropertyStatus[] = ['available', 'pending', 'sold'];
const CITIES = ['Austin, TX', 'Denver, CO', 'San Jose, CA', 'Seattle, WA', 'Chicago, IL', 'Phoenix, AZ', 'Miami, FL'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export const PROPERTIES: Property[] = Array.from({ length: 300 }).map((_, i) => {
  const id = `prop-${String(i + 1).padStart(4, '0')}`;
  const name = `Property ${i + 1}`;
  const price = rand(120_000, 950_000);
  const status = STATUSES[rand(0, STATUSES.length - 1)];
  const location = CITIES[rand(0, CITIES.length - 1)];
  return { id, name, price, status, location };
});

export function filterProps(status: 'all' | PropertyStatus) {
  return status === 'all' ? PROPERTIES : PROPERTIES.filter(p => p.status === status);
}

export function genUpdate(): Partial<Property> & { id: string } {
  const idx = rand(0, PROPERTIES.length - 1);
  const base = PROPERTIES[idx];
  const nextStatus = STATUSES[rand(0, STATUSES.length - 1)];
  const delta = rand(-20_000, 25_000);
  const updated = { ...base, status: nextStatus, price: Math.max(80_000, base.price + delta) };
  PROPERTIES[idx] = updated;
  return { id: updated.id, status: updated.status, price: updated.price };
}
