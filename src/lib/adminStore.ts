import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_CAKES } from '../data/mockCakes';
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
