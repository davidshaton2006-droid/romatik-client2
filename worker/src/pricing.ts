/**
 * Server-side price recomputation so a client can't send an arbitrary amount
 * to be charged. Mirrors src/lib/pricing.ts — keep the two in sync if the
 * pricing rules ever change.
 */

const WEEKDAY_PRICE = 7000;
const WEEKEND_PRICE = 9000;
const THIRD_ADULT_FEE = 1000;

function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 5 || day === 6 || day === 0;
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  return Math.max(1, nights);
}

function calculateBasePerCabin(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let basePrice = 0;
  for (let d = new Date(start); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    basePrice += isWeekend(d) ? WEEKEND_PRICE : WEEKDAY_PRICE;
  }
  return basePrice;
}

export interface ServerBookingInput {
  checkIn: string;
  checkOut: string;
  cabinsCount: number;
  hasThirdAdult: boolean;
  servicesTotal: number;
}

/**
 * Returns the true total price (== 100% prepayment amount) for a booking,
 * recomputed from trusted inputs only — never trust a client-supplied total.
 */
export function calculateTotalPrice(input: ServerBookingInput): number {
  const nights = calculateNights(input.checkIn, input.checkOut);
  const basePrice = calculateBasePerCabin(input.checkIn, input.checkOut);

  const thirdAdultFeeTotal = input.hasThirdAdult ? THIRD_ADULT_FEE * nights : 0;
  const singleCabinTotal = basePrice + thirdAdultFeeTotal;
  const allCabinsTotal = singleCabinTotal * Math.max(1, input.cabinsCount);

  return allCabinsTotal + Math.max(0, input.servicesTotal);
}
