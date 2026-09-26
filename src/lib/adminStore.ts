import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_CAKES, MOCK_PASSWORDS } from '../data/mockCakes';
import type { BirthdayCake, CandleDesign } from '../types';

export interface NewCakeInput {
  slug: string;
  recipientName: string;
  cakeTitle: string;
  finalSender: string;
  finalMessage: string;
  finalCandle: CandleDesign;
}

export async function createCake(input: NewCakeInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    if (MOCK_CAKES[input.slug]) return { ok: false, error: 'That link is already in use.' };
    MOCK_CAKES[input.slug] = {
      slug: input.slug,
      recipientName: input.recipientName,
      cakeTitle: input.cakeTitle,
      finalMessage: {
        sender: input.finalSender,
        message: input.finalMessage,
        candle: input.finalCandle,
      },
      messages: [],
    };
    return { ok: true };
  }

  const { data: session } = await supabase!.auth.getUser();
  if (!session.user) return { ok: false, error: 'Sign in first.' };

  const { error } = await supabase!.from('cakes').insert({
    slug: input.slug,
    recipient_name: input.recipientName,
    cake_title: input.cakeTitle,
    final_sender: input.finalSender,
    final_message: input.finalMessage,
    final_candle: input.finalCandle,
    owner_id: session.user.id,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteMessage(messageId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    for (const cake of Object.values(MOCK_CAKES)) {
      cake.messages = cake.messages.filter((m) => m.id !== messageId);
    }
    return;
  }
  await supabase!.from('messages').delete().eq('id', messageId);
}

// Deletes a cake entirely, along with every message and read-state row on
// it (both cascade via "on delete cascade" in schema.sql). RLS already
// restricts this to the cake's own owner, so no extra owner check is
// needed here beyond passing the slug.
export async function deleteCake(slug: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    delete MOCK_CAKES[slug];
    delete MOCK_PASSWORDS[slug];
    return { ok: true };
  }
  const { error } = await supabase!.from('cakes').delete().eq('slug', slug);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listMyCakes(): Promise<BirthdayCake[]> {
  if (!isSupabaseConfigured) {
    return Object.values(MOCK_CAKES);
  }
  const { data } = await supabase!
    .from('cakes')
    .select('slug, recipient_name, cake_title, final_sender, final_message, final_candle');
  return (data ?? []).map((row) => ({
    slug: row.slug,
    recipientName: row.recipient_name,
    cakeTitle: row.cake_title,
    finalMessage: {
      sender: row.final_sender,
      message: row.final_message,
      candle: row.final_candle as CandleDesign,
    },
    messages: [],
  }));
}

export async function sendAdminMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { ok: false, error: 'Connect Supabase to enable admin login.' };
  const { error } = await supabase!.auth.signInWithOtp({ email });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Sets, changes, or (with an empty string) clears the password required to
// view a cake's messages. Only works for a cake you own — enforced by
// set_cake_password() in schema.sql via auth.uid().
export async function setCakePassword(slug: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    if (password === '') {
      delete MOCK_PASSWORDS[slug];
    } else {
      MOCK_PASSWORDS[slug] = password;
    }
    return { ok: true };
  }
  const { data, error } = await supabase!.rpc('set_cake_password', { p_slug: slug, p_password: password });
  if (error) return { ok: false, error: error.message };
  if (data !== true) return { ok: false, error: 'Could not find that cake under your account.' };
  return { ok: true };
}
