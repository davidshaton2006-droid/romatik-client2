const FALLBACK_CABIN_IMAGE = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80';

export function isYandexDiskUrl(url: string | undefined): boolean {
  return !!url && url.includes('disk.yandex.ru');
}

/**
 * Slow last-resort fallback: an unofficial third-party redirector that resolves
 * a Yandex Disk share link server-side on every request (no caching), often
 * taking 8-10+ seconds. Kept only as a fallback if the official API below fails.
 */
export function getImageUrl(url: string | undefined): string {
  if (!url) return FALLBACK_CABIN_IMAGE;
  if (!isYandexDiskUrl(url)) return url;
  return `https://getfile.dokpub.com/yandex/get/${url}`;
}

interface ResolvedEntry {
  href: string;
  expiresAt: number;
}

const resolvedUrlCache = new Map<string, ResolvedEntry>();
const inFlight = new Map<string, Promise<string | null>>();
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours - conservative vs. the token's actual lifetime

/**
 * Resolves a Yandex Disk share link to a direct, CDN-served file URL using
 * Yandex's own public API. This is what actually fixes the slow photo loading:
 * it responds in a few hundred ms and the file is then served straight from
 * Yandex's CDN, instead of routing through the slow third-party dokpub proxy.
 */
export async function resolveYandexShareUrl(shareUrl: string): Promise<string | null> {
  const cached = resolvedUrlCache.get(shareUrl);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.href;
  }

  const existing = inFlight.get(shareUrl);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(shareUrl)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.href) return null;
      resolvedUrlCache.set(shareUrl, { href: data.href, expiresAt: Date.now() + CACHE_TTL_MS });
      return data.href as string;
    } catch {
      return null;
    } finally {
      inFlight.delete(shareUrl);
    }
  })();

  inFlight.set(shareUrl, promise);
  return promise;
}

export const FALLBACK_IMAGES = {
  bbq: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  chan: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
  sauna: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  pool: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
  raccoons: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=80',
  campfire: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1200&q=80',
  cafe: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
  cabin: 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=1200&q=80'
};
