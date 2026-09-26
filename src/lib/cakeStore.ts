import { supabase, isSupabaseConfigured } from './supabase';
import { getMockCake } from '../data/mockCakes';
import { getDeviceId, getLocalReadIds, markLocalRead } from './deviceReadState';
import type { BirthdayCake, CandleDesign } from '../types';

// Mock mode has no server, so `MOCK_CAKES` (from data/mockCakes.ts) doubles
// as the shared in-memory database for the current tab. adminStore.ts
// creates/deletes against that same object, so everything stays consistent
// without a second copy to keep in sync.

export async function fetchCake(slug: string): Promise<BirthdayCake | null> {
  if (!isSupabaseConfigured) {
    const cake = getMockCake(slug);
    if (!cake) return null;
    const readIds = getLocalReadIds(slug);
    return {
      ...cake,
      // Unread candles don't get their text released to the client yet —
      // it's fetched on demand in fetchMessageText() when the candle is
      // actually opened. (Already-read ones are permanently unclickable,
      // so they never need it again either.)
      finalMessage: null,
      messages: cake.messages.map((m) => {
        const read = m.read || readIds.has(m.id);
        return { ...m, read, message: read ? m.message : '' };
      }),
    };
  }

  // Note: deliberately NOT selecting `message` here, and not selecting the
  // cake's final_* columns at all. Those are fetched on demand — see
  // fetchMessageText() and fetchFinalMessage() below — so a message's text
  // never reaches the browser until its own candle is actually opened.
  const { data: cakeRow, error: cakeError } = await supabase!
    .from('cakes')
    .select('id, slug, recipient_name, cake_title')
    .eq('slug', slug)
    .single();
  if (cakeError || !cakeRow) return null;

  const { data: messageRows, error: msgError } = await supabase!
    .from('messages')
    .select('id, sender, candle, created_at')
    .eq('cake_id', cakeRow.id)
    .order('created_at', { ascending: true });
  if (msgError) return null;

  const deviceId = getDeviceId();
  const { data: readRows } = await supabase!
    .from('read_state')
    .select('message_id')
    .eq('device_id', deviceId)
    .in('message_id', (messageRows ?? []).map((m) => m.id));
  const readIds = new Set((readRows ?? []).map((r) => r.message_id as string));

  return {
    slug: cakeRow.slug,
    recipientName: cakeRow.recipient_name,
    cakeTitle: cakeRow.cake_title,
    finalMessage: null,
    messages: (messageRows ?? []).map((row) => ({
      id: row.id,
      sender: row.sender,
      message: '',
      candle: row.candle as CandleDesign,
      read: readIds.has(row.id),
      createdAt: row.created_at,
    })),
  };
}

// Fetches a single message's text on demand. Call this right when a candle
// is opened, not before — that's what keeps every other sender's message
// out of the browser until the recipient actually taps that candle.
export async function fetchMessageText(slug: string, messageId: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    const cake = getMockCake(slug);
    const msg = cake?.messages.find((m) => m.id === messageId);
    return msg?.message ?? null;
  }
  const { data, error } = await supabase!.from('messages').select('message').eq('id', messageId).single();
  if (error || !data) return null;
  return data.message as string;
}

// Fetches the hidden final message on demand, once every candle is read.
export async function fetchFinalMessage(
  slug: string
): Promise<{ sender: string; message: string; candle: CandleDesign } | null> {
  if (!isSupabaseConfigured) {
    const cake = getMockCake(slug);
    return cake ? cake.finalMessage : null;
  }
  const { data, error } = await supabase!
    .from('cakes')
    .select('final_sender, final_message, final_candle')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return {
    sender: data.final_sender as string,
    message: data.final_message as string,
    candle: data.final_candle as CandleDesign,
  };
}

export async function submitMessage(
  slug: string,
  input: { sender: string; message: string; candle: CandleDesign }
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    const cake = getMockCake(slug);
    if (!cake) return { ok: false, error: 'This cake does not exist.' };
    cake.messages.push({
      id: crypto.randomUUID(),
      sender: input.sender,
      message: input.message,
      candle: input.candle,
      read: false,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }

  const { data: cakeRow, error: cakeError } = await supabase!
    .from('cakes')
    .select('id')
    .eq('slug', slug)
    .single();
  if (cakeError || !cakeRow) return { ok: false, error: 'This cake does not exist.' };

  const { error } = await supabase!.from('messages').insert({
    cake_id: cakeRow.id,
    sender: input.sender,
    message: input.message,
    candle: input.candle,
  });
  if (error) return { ok: false, error: 'Could not save your message. Please try again.' };
  return { ok: true };
}

export async function markMessageRead(slug: string, messageId: string): Promise<void> {
  markLocalRead(slug, messageId);
  if (!isSupabaseConfigured) {
    const cake = getMockCake(slug);
    const msg = cake?.messages.find((m) => m.id === messageId);
    if (msg) msg.read = true;
    return;
  }
  const deviceId = getDeviceId();
  await supabase!.from('read_state').upsert(
    { message_id: messageId, device_id: deviceId, read_at: new Date().toISOString() },
    { onConflict: 'message_id,device_id' }
  );
}
