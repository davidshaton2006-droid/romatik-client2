import { calculateTotalPrice } from './pricing';
import { calculateServicesTotal } from './services';
import { createYooKassaPayment, fetchYooKassaPayment } from './yookassa';
import { findBookingDocByPaymentId, updateBookingFields } from './firestore';
import { syncTravelLineBookings, verifyTravelLineWebhook } from './travelline';
import { syncTravelLineAvailability } from './travellineAvailability';

export interface Env {
  ALLOWED_ORIGINS: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_ID: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  YOOKASSA_SHOP_ID: string;
  YOOKASSA_SECRET_KEY: string;
  TRAVELLINE_CLIENT_ID: string;
  TRAVELLINE_CLIENT_SECRET: string;
  TRAVELLINE_PROPERTY_ID: string;
  TRAVELLINE_WEBHOOK_KEY: string;
  TRAVELLINE_AVAILABILITY_DAYS_AHEAD?: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
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

async function handleTravelLineWebhook(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  if (!verifyTravelLineWebhook(request, env)) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  try {
    // The webhook body isn't trusted for data — it's just a signal to go
    // check TravelLine's API for what's new. See travelline.ts for why.
    //
    // Availability/quota is deliberately NOT checked here too: that scan
    // makes ~25-30 subrequests on its own (one TravelLine API call per
    // night in the window, plus Firestore queries/writes), and bundling it
    // with the booking sync's own subrequests in one Worker invocation can
    // exceed Cloudflare's per-invocation subrequest cap. It runs as its own,
    // separately-scheduled invocation instead — see scheduled() below and
    // handleTravelLineAvailabilitySync for on-demand checks.
    const result = await syncTravelLineBookings(env);
    return json({ status: 'ok', ...result }, 200, cors);
  } catch (err) {
    console.error('TravelLine sync failed', err);
    return json({ status: 'error_logged' }, 200, cors);
  }
}

async function handleTravelLineAvailabilitySync(
  request: Request,
  env: Env,
  cors: Record<string, string>
): Promise<Response> {
  if (!verifyTravelLineWebhook(request, env)) {
    return json({ error: 'Unauthorized' }, 401, cors);
  }

  try {
    const result = await syncTravelLineAvailability(env);
    return json({ status: 'ok', ...result }, 200, cors);
  } catch (err) {
    console.error('TravelLine availability sync failed', err);
    return json({ status: 'error_logged', error: err instanceof Error ? err.message : String(err) }, 200, cors);
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

    if (request.method === 'POST' && url.pathname === '/api/webhooks/travelline') {
      return handleTravelLineWebhook(request, env, cors);
    }

    // Same auth as the TravelLine webhook (X-Webhook-Key) — lets an admin
    // (or this session) trigger just the availability/quota check on demand,
    // in its own request so it isn't sharing a subrequest budget with
    // anything else. See handleTravelLineAvailabilitySync above.
    if (request.method === 'POST' && url.pathname === '/api/admin/sync-travelline-availability') {
      return handleTravelLineAvailabilitySync(request, env, cors);
    }

    return json({ error: 'Not found' }, 404, cors);
  },

  // Backup for the webhook: runs the booking sync on a fixed schedule so a
  // missed or unconfigured webhook can't silently stop bookings from
  // reaching the staff app. The availability/quota check runs on its own,
  // separate hourly schedule (see wrangler.toml's triggers.crons) — each
  // cron match is its own Worker invocation with its own subrequest budget,
  // which is why these two syncs are kept apart instead of bundled here.
  async scheduled(event: { cron: string }, env: Env): Promise<void> {
    if (event.cron === '0 * * * *') {
      try {
        const result = await syncTravelLineAvailability(env);
        console.log('Scheduled TravelLine availability sync:', result);
      } catch (err) {
        console.error('Scheduled TravelLine availability sync failed', err);
      }
      return;
    }

    try {
      const result = await syncTravelLineBookings(env);
      console.log('Scheduled TravelLine sync:', result);
    } catch (err) {
      console.error('Scheduled TravelLine sync failed', err);
    }
  }
};
