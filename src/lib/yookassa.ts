/**
 * Client-side helper for creating a YooKassa payment. The actual YooKassa
 * API call happens server-side (Cloudflare Worker, see /worker) — the
 * secret key must never be used in the browser.
 */

export interface CreatePaymentParams {
  bookingId: string;
  cabinType: 'two_seat' | 'three_seat';
  checkIn: string;
  checkOut: string;
  cabinsCount: number;
  hasThirdAdult: boolean;
  selectedExtraServices: string[];
  guestName: string;
}

export interface CreatePaymentResult {
  confirmationUrl: string;
  paymentId: string;
  amount: number;
}

function getPaymentsApiUrl(): string {
  const configured = import.meta.env.VITE_PAYMENTS_API_URL as string | undefined;
  return configured || '';
}

/**
 * Creates a YooKassa payment for a booking and returns the URL to redirect
 * the guest to for paying via their bank. Returns null if the payments API
 * isn't configured (payments feature disabled) or the request fails.
 */
export async function createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult | null> {
  const apiUrl = getPaymentsApiUrl();
  if (!apiUrl) {
    console.warn('⚠️ VITE_PAYMENTS_API_URL not configured — payments are disabled.');
    return null;
  }

  try {
    const returnUrl = `${window.location.origin}/payment-result?bookingId=${encodeURIComponent(params.bookingId)}`;

    const res = await fetch(`${apiUrl}/api/payments/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, returnUrl })
    });

    if (!res.ok) {
      console.error('❌ Payment creation failed:', res.status, await res.text());
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('❌ Failed to create payment:', error);
    return null;
  }
}
