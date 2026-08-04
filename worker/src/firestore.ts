/**
 * Minimal Firestore REST client authenticated as a Google service account.
 * Cloudflare Workers can't use the Node-only firebase-admin SDK, so this
 * signs its own OAuth2 JWT with Web Crypto and talks to the Firestore REST
 * API directly. This bypasses Firestore security rules entirely (as
 * server-side trusted code should) — never expose these credentials to
 * the client.
 */

interface ServiceAccount {
  client_email: string;
  private_key: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getAccessToken(serviceAccountJson: string): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const sa: ServiceAccount = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const encoder = new TextEncoder();
  const unsigned = `${base64UrlEncode(encoder.encode(JSON.stringify(header)))}.${base64UrlEncode(encoder.encode(JSON.stringify(claims)))}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned));
  const jwt = `${unsigned}.${base64UrlEncode(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to obtain Google access token: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

interface FirestoreEnv {
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_ID: string;
}

function baseUrl(env: FirestoreEnv): string {
  return `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/${env.FIREBASE_DATABASE_ID}/documents`;
}

/**
 * Finds the single booking document whose `payment_id` field matches the
 * given value (that field stores our own client-generated booking id).
 * Returns the document's full resource name (e.g. ".../documents/bookings/abc123")
 * or null if not found.
 */
export async function findBookingDocByPaymentId(
  env: FirestoreEnv,
  paymentId: string
): Promise<{ name: string; fields: Record<string, any> } | null> {
  const token = await getAccessToken(env.FIREBASE_SERVICE_ACCOUNT_JSON);

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/${env.FIREBASE_DATABASE_ID}/documents:runQuery`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'bookings' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'payment_id' },
              op: 'EQUAL',
              value: { stringValue: paymentId }
            }
          },
          limit: 1
        }
      })
    }
  );

  if (!res.ok) {
    throw new Error(`Firestore query failed: ${res.status} ${await res.text()}`);
  }

  const results = (await res.json()) as Array<{ document?: { name: string; fields: Record<string, any> } }>;
  const doc = results.find((r) => r.document)?.document;
  return doc ? { name: doc.name, fields: doc.fields } : null;
}

/**
 * Patches specific fields on a booking document. `fields` uses plain JS
 * values for string/number/boolean — converted to Firestore's typed format.
 */
export async function updateBookingFields(
  env: FirestoreEnv,
  documentName: string,
  fields: Record<string, string | number | boolean>
): Promise<void> {
  const token = await getAccessToken(env.FIREBASE_SERVICE_ACCOUNT_JSON);

  const firestoreFields: Record<string, any> = {};
  const fieldPaths: string[] = [];
  for (const [key, value] of Object.entries(fields)) {
    fieldPaths.push(key);
    if (typeof value === 'string') firestoreFields[key] = { stringValue: value };
    else if (typeof value === 'number') firestoreFields[key] = { doubleValue: value };
    else if (typeof value === 'boolean') firestoreFields[key] = { booleanValue: value };
  }

  const params = fieldPaths.map((p) => `updateMask.fieldPaths=${encodeURIComponent(p)}`).join('&');
  const res = await fetch(`https://firestore.googleapis.com/v1/${documentName}?${params}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: firestoreFields })
  });

  if (!res.ok) {
    throw new Error(`Firestore update failed: ${res.status} ${await res.text()}`);
  }
}
