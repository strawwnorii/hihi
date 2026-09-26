// Read state is scoped to *this recipient's device/browser*, not to a login.
// Friends submit messages with no account. The recipient opens a link with no
// account either — so "which candles has the recipient already blown out" is
// tracked against a random, persistent device id stored in localStorage.
//
// In mock mode (no Supabase configured) this file is the entire source of
// truth: read state lives in localStorage, keyed by cake slug.
//
// Once Supabase is connected, the same device id is sent as `device_id` on
// every read-state write (see src/lib/supabase.ts + supabase/schema.sql),
// and Row Level Security only allows a device to write rows carrying its own
// id — see the schema file for the exact policy.

const DEVICE_ID_KEY = 'birthday-cake:device-id';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function readKey(slug: string) {
  return `birthday-cake:reads:${slug}`;
}

export function getLocalReadIds(slug: string): Set<string> {
  try {
    const raw = localStorage.getItem(readKey(slug));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markLocalRead(slug: string, messageId: string) {
  const ids = getLocalReadIds(slug);
  ids.add(messageId);
  localStorage.setItem(readKey(slug), JSON.stringify(Array.from(ids)));
}
