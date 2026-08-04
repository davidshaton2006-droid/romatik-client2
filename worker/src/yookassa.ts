interface YooKassaEnv {
  YOOKASSA_SHOP_ID: string;
  YOOKASSA_SECRET_KEY: string;
}

function authHeader(env: YooKassaEnv): string {
  return `Basic ${btoa(`${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`)}`;
}

export interface YooKassaPayment {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled';
  paid: boolean;
  amount: { value: string; currency: string };
  metadata?: Record<string, string>;
  confirmation?: { confirmation_url: string };
}

export async function createYooKassaPayment(
  env: YooKassaEnv,
  params: {
    amountRub: number;
    description: string;
    returnUrl: string;
    bookingId: string;
    customerPhone: string;
  }
): Promise<YooKassaPayment> {
  const amountValue = params.amountRub.toFixed(2);

  const res = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: authHeader(env),
      'Content-Type': 'application/json',
      'Idempotence-Key': crypto.randomUUID()
    },
    body: JSON.stringify({
      amount: { value: amountValue, currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: params.returnUrl },
      capture: true,
      description: params.description,
      metadata: { bookingId: params.bookingId },
      receipt: {
        customer: { phone: params.customerPhone },
        tax_system_code: 2,
        items: [
          {
            description: params.description.slice(0, 128),
            quantity: '1.00',
            amount: { value: amountValue, currency: 'RUB' },
            vat_code: 1,
            payment_mode: 'full_payment',
            payment_subject: 'service',
            tax_system_code: 2
          }
        ]
      }
    })
  });

  if (!res.ok) {
    throw new Error(`YooKassa create payment failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

/**
 * Always re-fetch the payment from YooKassa's API to confirm its real status
 * server-to-server, rather than trusting the webhook body directly — this is
 * YooKassa's own recommended way to validate a notification.
 */
export async function fetchYooKassaPayment(env: YooKassaEnv, paymentId: string): Promise<YooKassaPayment> {
  const res = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
    headers: { Authorization: authHeader(env) }
  });

  if (!res.ok) {
    throw new Error(`YooKassa fetch payment failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}
