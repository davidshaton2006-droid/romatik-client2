/**
 * Yookassa payment integration
 * https://yookassa.ru/developers/api
 */

export interface YookassaPaymentRequest {
  amount: number; // Amount in rubles (will be converted to kopecks)
  description: string;
  return_url: string;
  confirmation_type?: 'redirect';
}

export interface YookassaPayment {
  id: string;
  status: 'pending' | 'succeeded' | 'canceled';
  amount: {
    value: string;
    currency: string;
  };
  description: string;
  created_at: string;
  confirmation?: {
    confirmation_url: string;
  };
}

export interface PaymentCheckResult {
  success: boolean;
  payment?: YookassaPayment;
  error?: string;
}

/**
 * Initialize Yookassa payment
 * In production, this should be called from your backend
 */
export async function initializeYookassaPayment(
  request: YookassaPaymentRequest
): Promise<{ confirmationUrl: string; paymentId: string } | null> {
  try {
    // In production, call your backend endpoint instead
    // This is just a template for the structure

    const shopId = import.meta.env.VITE_YOOKASSA_SHOP_ID;
    const apiKey = import.meta.env.VITE_YOOKASSA_API_KEY;

    if (!shopId || !apiKey) {
      console.warn('⚠️ Yookassa credentials not configured. Payments will be disabled.');
      return null;
    }

    // DO NOT call Yookassa API directly from client!
    // This should be done from your backend for security
    console.error(
      '❌ Direct Yookassa API calls from client are not secure. ' +
      'Please implement /api/payments/create endpoint on your backend.'
    );

    return null;
  } catch (error) {
    console.error('❌ Failed to initialize Yookassa payment:', error);
    return null;
  }
}

/**
 * Check payment status
 * Should be called from your backend API endpoint
 */
export async function checkPaymentStatus(
  paymentId: string
): Promise<PaymentCheckResult> {
  try {
    const response = await fetch('/api/payments/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId })
    });

    if (!response.ok) {
      throw new Error('Failed to check payment status');
    }

    const data = await response.json();
    return { success: true, payment: data };
  } catch (error) {
    console.error('❌ Failed to check payment status:', error);
    return {
      success: false,
      error: 'Не удалось проверить статус платежа'
    };
  }
}

/**
 * Format price for Yookassa (amount in rubles)
 */
export function formatYookassaAmount(rubles: number): string {
  return rubles.toFixed(2);
}

/**
 * Validate payment response from Yookassa webhook
 */
export function validateYookassaWebhook(
  signature: string,
  body: string,
  apiKey: string
): boolean {
  // Implementation depends on Yookassa documentation
  // This is a placeholder
  return !!signature && !!body && !!apiKey;
}
