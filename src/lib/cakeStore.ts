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
      messages: cake.messages.map((m) => ({ ...m, read: m.read || readIds.has(m.id) })),
    };
  }

  const { data: cakeRow, error: cakeError } = await supabase!
    .from('cakes')
    .select('id, slug, recipient_name, cake_title, final_sender, final_message, final_candle')
    .eq('slug', slug)
    .single();
  if (cakeError || !cakeRow) return null;

  const { data: messageRows, error: msgError } = await supabase!
    .from('messages')
    .select('id, sender, message, candle, created_at')
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
    finalMessage: {
      sender: cakeRow.final_sender,
      message: cakeRow.final_message,
      candle: cakeRow.final_candle as CandleDesign,
    },
    messages: (messageRows ?? []).map((row) => ({
      id: row.id,
      sender: row.sender,
      message: row.message,
      candle: row.candle as CandleDesign,
      read: readIds.has(row.id),
      createdAt: row.created_at,
    })),
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
