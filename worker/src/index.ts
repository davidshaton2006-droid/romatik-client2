import { calculateTotalPrice } from './pricing';
import { calculateServicesTotal } from './services';
import { createYooKassaPayment, fetchYooKassaPayment } from './yookassa';
import { findBookingDocByPaymentId, updateBookingFields } from './firestore';

export interface Env {
  ALLOWED_ORIGINS: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  YOOKASSA_SHOP_ID: string;
  YOOKASSA_SECRET_KEY: string;
}

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
  const allowOrigin = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' }
  });
}

const CABIN_TITLES: Record<string, string> = {
  two_seat: 'Двухместный домик',
  three_seat: 'Трёхместный домик'
};

async function handleCreatePayment(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  const { bookingId, checkIn, checkOut, cabinsCount, hasThirdAdult, selectedExtraServices, cabinType, guestName, guestPhone, returnUrl } = body;

  if (!bookingId || !checkIn || !checkOut || !cabinsCount || !cabinType || !returnUrl || !guestPhone) {
    return json({ error: 'Missing required fields' }, 400, cors);
  }

  // YooKassa requires a fiscal-receipt phone in "7XXXXXXXXXX" format (digits only)
  let normalizedPhone = String(guestPhone).replace(/\D/g, '');
  if (normalizedPhone.length === 11 && normalizedPhone.startsWith('8')) {
    normalizedPhone = `7${normalizedPhone.slice(1)}`;
  }
  if (normalizedPhone.length !== 11) {
    return json({ error: 'Invalid phone number' }, 400, cors);
  }

  const servicesTotal = calculateServicesTotal(selectedExtraServices);
  const totalPrice = calculateTotalPrice({
    checkIn,
    checkOut,
    cabinsCount: Number(cabinsCount),
    hasThirdAdult: !!hasThirdAdult,
    servicesTotal
  });

  if (!Number.isFinite(totalPrice) || totalPrice <= 0 || totalPrice > 1_000_000) {
    return json({ error: 'Invalid computed amount' }, 400, cors);
  }

  try {
    const payment = await createYooKassaPayment(env, {
      amountRub: totalPrice,
      description: `Бронирование ${CABIN_TITLES[cabinType] || cabinType} — ${guestName || ''} (#${bookingId})`.trim(),
      returnUrl,
      bookingId,
      customerPhone: normalizedPhone
    });

    return json(
      {
        paymentId: payment.id,
        confirmationUrl: payment.confirmation?.confirmation_url,
        amount: totalPrice
      },
      200,
      cors
    );
  } catch (err) {
    console.error('Payment creation failed', err);
    return json({ error: 'Payment creation failed' }, 502, cors);
  }
}

async function handleWebhook(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  const paymentId = body?.object?.id;
  if (!paymentId) {
    return json({ error: 'Missing payment id' }, 400, cors);
  }

  try {
    // Never trust the webhook payload's status directly — re-fetch from
    // YooKassa's API server-to-server to confirm what actually happened.
    const payment = await fetchYooKassaPayment(env, paymentId);

    if (payment.status === 'succeeded' && payment.metadata?.bookingId) {
      const doc = await findBookingDocByPaymentId(env, payment.metadata.bookingId);
      if (doc) {
        await updateBookingFields(env, doc.name, {
          payment_status: 'success',
          is_fully_paid: true,
          remaining_balance: 0
        });
      } else {
        console.warn('No booking found for payment', payment.metadata.bookingId);
      }
    } else if (payment.status === 'canceled' && payment.metadata?.bookingId) {
      const doc = await findBookingDocByPaymentId(env, payment.metadata.bookingId);
      if (doc) {
        await updateBookingFields(env, doc.name, { payment_status: 'canceled' });
      }
    }

    return json({ status: 'ok' }, 200, cors);
  } catch (err) {
    console.error('Webhook processing failed', err);
    // Still return 200 so YooKassa doesn't endlessly retry a booking we
    // can't find; the error is logged for investigation.
    return json({ status: 'error_logged' }, 200, cors);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(env, origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method === 'POST' && url.pathname === '/api/payments/create') {
      return handleCreatePayment(request, env, cors);
    }

    if (request.method === 'POST' && url.pathname === '/api/webhooks/yookassa') {
      return handleWebhook(request, env, cors);
    }

    return json({ error: 'Not found' }, 404, cors);
  }
};
