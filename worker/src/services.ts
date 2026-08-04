/**
 * Mirrors src/data/extraServices.ts — used to recompute the services total
 * server-side instead of trusting a client-supplied amount.
 */
const EXTRA_SERVICE_PRICES: Record<string, number> = {
  siberian_tub_session: 5000,
  russian_sauna_2h: 3000,
  cafe_daily_lunch: 0
};

export function calculateServicesTotal(selectedExtraServices: unknown): number {
  if (!Array.isArray(selectedExtraServices)) return 0;
  return selectedExtraServices.reduce((sum: number, id: unknown) => {
    if (typeof id !== 'string') return sum;
    return sum + (EXTRA_SERVICE_PRICES[id] ?? 0);
  }, 0);
}
