import { CHECKOUTS } from '../data/checkoutTable.js';

export function getCpuRoute(score) {
  const route = CHECKOUTS[score];
  if (!route) return null;
  if (route.some(h => h.includes('21'))) return null;
  return route;
}
