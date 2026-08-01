/**
 * Pricing calculation for cabins
 */

export interface PricingBreakdown {
  nights: number;
  weeknights: number;
  weekendnights: number;
  pricePerNightWeekday: number;
  pricePerNightWeekend: number;
  basePerCabin: number;
  thirdAdultFeePerNight: number;
  thirdAdultFeeTotal: number;
  singleCabinTotal: number;
  allCabinsTotal: number;
  servicesTotal: number;
  totalPrice: number;
  prepaymentAmount: number;
  remainingBalance: number;
}

// Price constants (RUB)
export const PRICE_CONSTANTS = {
  WEEKDAY_PRICE: 7000, // Monday-Thursday
  WEEKEND_PRICE: 9000, // Friday-Sunday
  THIRD_ADULT_FEE: 1000 // Per night
};

/**
 * Check if a date is a weekend (Friday-Sunday)
 */
function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0;
}

/**
 * Calculate price for a night based on day of week
 */
function getPriceForNight(date: Date): number {
  return isWeekend(date) ? PRICE_CONSTANTS.WEEKEND_PRICE : PRICE_CONSTANTS.WEEKDAY_PRICE;
}

/**
 * Calculate number of nights between two dates
 */
function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  return Math.max(1, nights);
}

/**
 * Calculate base price per cabin (accommodation only, no services)
 */
function calculateBasePerCabin(checkIn: string, checkOut: string): {
  basePrice: number;
  weeknights: number;
  weekendnights: number;
} {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  let basePrice = 0;
  let weeknights = 0;
  let weekendnights = 0;

  // Iterate through each night
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const price = getPriceForNight(d);
    basePrice += price;

    if (isWeekend(d)) {
      weekendnights++;
    } else {
      weeknights++;
    }
  }

  return { basePrice, weeknights, weekendnights };
}

/**
 * Main pricing calculation function
 */
export function calculatePricing(
  checkIn: string,
  checkOut: string,
  cabinsCount: number = 1,
  hasThirdAdult: boolean = false,
  servicesTotal: number = 0
): PricingBreakdown {
  const nights = calculateNights(checkIn, checkOut);
  const { basePrice, weeknights, weekendnights } = calculateBasePerCabin(checkIn, checkOut);

  // Calculate third adult fee (only for triples with third adult)
  const thirdAdultFeePerNight = hasThirdAdult ? PRICE_CONSTANTS.THIRD_ADULT_FEE : 0;
  const thirdAdultFeeTotal = thirdAdultFeePerNight * nights;

  // Single cabin total (base + third adult)
  const singleCabinTotal = basePrice + thirdAdultFeeTotal;

  // All cabins total
  const allCabinsTotal = singleCabinTotal * cabinsCount;

  // Total with services
  const totalPrice = allCabinsTotal + servicesTotal;

  // Prepayment: 50%
  const prepaymentAmount = Math.round(totalPrice * 0.5);
  const remainingBalance = totalPrice - prepaymentAmount;

  return {
    nights,
    weeknights,
    weekendnights,
    pricePerNightWeekday: PRICE_CONSTANTS.WEEKDAY_PRICE,
    pricePerNightWeekend: PRICE_CONSTANTS.WEEKEND_PRICE,
    basePerCabin: basePrice,
    thirdAdultFeePerNight,
    thirdAdultFeeTotal,
    singleCabinTotal,
    allCabinsTotal,
    servicesTotal,
    totalPrice,
    prepaymentAmount,
    remainingBalance
  };
}

/**
 * Format price to Russian Rubles
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU');
}

/**
 * Get price description (e.g., "7 000 ₽ (пн-чт) / 9 000 ₽ (пт-вс)")
 */
export function getPriceDescription(): string {
  return `${formatPrice(PRICE_CONSTANTS.WEEKDAY_PRICE)} ₽ (пн-чт) / ${formatPrice(PRICE_CONSTANTS.WEEKEND_PRICE)} ₽ (пт-вс)`;
}

/**
 * Calculate estimated price range for date range
 */
export function estimatePriceRange(
  checkIn: string,
  checkOut: string,
  cabinsCount: number = 1
): { min: number; max: number } {
  const nights = calculateNights(checkIn, checkOut);

  // Minimum: all weekdays
  const min = PRICE_CONSTANTS.WEEKDAY_PRICE * nights * cabinsCount;

  // Maximum: all weekends
  const max = PRICE_CONSTANTS.WEEKEND_PRICE * nights * cabinsCount;

  return { min, max };
}
