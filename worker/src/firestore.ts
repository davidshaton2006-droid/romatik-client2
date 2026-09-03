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
 * Returns check_in/check_out/cabin_id for every booking whose cabin_id
 * falls in [min, max] — used to figure out which numbered cabin is free
 * for a given date range within one house-type's id block. Date-overlap
 * filtering happens in memory since Firestore can't range-filter two
 * different fields (cabin_id and dates) in one simple query.
 */
export async function findBookingsInCabinRange(
  env: FirestoreEnv,
  min: number,
  max: number
): Promise<Array<{ cabin_id: number; check_in: string; check_out: string; created_by: string }>> {
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
            compositeFilter: {
              op: 'AND',
              filters: [
                { fieldFilter: { field: { fieldPath: 'cabin_id' }, op: 'GREATER_THAN_OR_EQUAL', value: { doubleValue: min } } },
                { fieldFilter: { field: { fieldPath: 'cabin_id' }, op: 'LESS_THAN_OR_EQUAL', value: { doubleValue: max } } }
              ]
            }
          },
          select: {
            fields: [{ fieldPath: 'cabin_id' }, { fieldPath: 'check_in' }, { fieldPath: 'check_out' }, { fieldPath: 'created_by' }]
          }
        }
      })
    }
  );

  if (!res.ok) {
    throw new Error(`Firestore query failed: ${res.status} ${await res.text()}`);
  }

  const results = (await res.json()) as Array<{ document?: { name: string; fields: Record<string, any> } }>;
  return results
    .filter((r) => r.document)
    .map((r) => ({
      cabin_id: r.document!.fields.cabin_id?.doubleValue ?? r.document!.fields.cabin_id?.integerValue ?? 0,
      check_in: r.document!.fields.check_in?.stringValue || '',
      check_out: r.document!.fields.check_out?.stringValue || '',
      created_by: r.document!.fields.created_by?.stringValue || ''
    }));
}

/**
 * Permanently removes a booking document. Used only for our own synthetic
 * `travelline_quota` placeholder docs (see travellineAvailability.ts) once
 * they're no longer needed — never for real bookings.
 */
export async function deleteBookingDoc(env: FirestoreEnv, docId: string): Promise<void> {
  const token = await getAccessToken(env.FIREBASE_SERVICE_ACCOUNT_JSON);

  const res = await fetch(`${baseUrl(env)}/bookings/${encodeURIComponent(docId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok && res.status !== 404) {
    throw new Error(`Firestore delete failed: ${res.status} ${await res.text()}`);
  }
}

/**
 * Returns, for every already-synced TravelLine booking, its stored status
 * and modified-timestamp — in a single query, so the sync job can skip
 * anything unchanged without a per-booking existence check (Workers have a
 * hard cap on subrequests per invocation).
 */
export async function listSyncedTravelLineBookings(
  env: FirestoreEnv
): Promise<Map<string, { status: string; modified: string }>> {
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
              field: { fieldPath: 'created_by' },
              op: 'EQUAL',
              value: { stringValue: 'travelline' }
            }
          },
          select: { fields: [{ fieldPath: 'travelline_number' }, { fieldPath: 'travelline_status' }, { fieldPath: 'travelline_modified' }] }
        }
      })
    }
  );

  if (!res.ok) {
    throw new Error(`Firestore query failed: ${res.status} ${await res.text()}`);
  }

  const results = (await res.json()) as Array<{ document?: { fields: Record<string, any> } }>;
  const map = new Map<string, { status: string; modified: string }>();
  for (const r of results) {
    const f = r.document?.fields;
    const number = f?.travelline_number?.stringValue;
    if (number) {
      map.set(number, {
        status: f?.travelline_status?.stringValue || '',
        modified: f?.travelline_modified?.stringValue || ''
      });
    }
  }
  return map;
}

function toFirestoreValue(value: string | number | boolean): any {
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  return { doubleValue: value };
}

/**
 * Creates or fully overwrites the booking document at bookings/{docId}
 * with exactly the given fields (upsert — no updateMask means Firestore
 * replaces the whole document).
 */
export async function setBookingDoc(
  env: FirestoreEnv,
  docId: string,
  fields: Record<string, string | number | boolean>
): Promise<void> {
  const token = await getAccessToken(env.FIREBASE_SERVICE_ACCOUNT_JSON);

  const firestoreFields: Record<string, any> = {};
  for (const [key, value] of Object.entries(fields)) {
    firestoreFields[key] = toFirestoreValue(value);
  }

  const res = await fetch(`${baseUrl(env)}/bookings/${encodeURIComponent(docId)}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: firestoreFields })
  });

  if (!res.ok) {
    throw new Error(`Firestore upsert failed: ${res.status} ${await res.text()}`);
  }
}

export interface QuotaWrite {
  docId: string;
  /** Present (and no `delete`) => create/overwrite the document with these fields. */
  fields?: Record<string, string | number | boolean>;
  /** true => delete the document instead of writing. */
  delete?: boolean;
}

/**
 * Applies many booking-doc writes/deletes in ONE Firestore request via the
 * `:batchWrite` endpoint, instead of one subrequest per document. Needed by
 * travellineAvailability.ts: a sync run can touch dozens of quota-block docs
 * (especially the first run, reconciling weeks of drift at once), and each
 * as a separate subrequest risks hitting Cloudflare's per-invocation
 * subrequest cap alongside the ~21 TravelLine API calls the same run makes.
 */
export async function batchWriteBookingDocs(env: FirestoreEnv, writes: QuotaWrite[]): Promise<void> {
  if (writes.length === 0) return;

  const token = await getAccessToken(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const docNamePrefix = `projects/${env.FIREBASE_PROJECT_ID}/databases/${env.FIREBASE_DATABASE_ID}/documents/bookings`;

  const body = {
    writes: writes.map((w) => {
      const name = `${docNamePrefix}/${w.docId}`;
      if (w.delete) return { delete: name };
      const firestoreFields: Record<string, any> = {};
      for (const [key, value] of Object.entries(w.fields || {})) {
        firestoreFields[key] = toFirestoreValue(value);
      }
      return { update: { name, fields: firestoreFields } };
    })
  };

  const res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/${env.FIREBASE_DATABASE_ID}/documents:batchWrite`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }
  );

  if (!res.ok) {
    throw new Error(`Firestore batchWrite failed: ${res.status} ${await res.text()}`);
  }
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
