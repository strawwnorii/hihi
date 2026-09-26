// Lightweight client-side guardrails. These make the form pleasant to use;
// they are NOT the security boundary. The real boundary is Supabase RLS
// (supabase/schema.sql) plus re-validating on write — never trust the client.

export const MAX_NAME_LENGTH = 40;
export const MAX_MESSAGE_LENGTH = 500;

export function stripTags(value: string): string {
  return value.replace(/<[^>]*>/g, '');
}

export function sanitizeText(value: string, maxLength: number): string {
  return stripTags(value).trim().slice(0, maxLength);
}

// Extremely small heuristic spam guard: repeated-character floods and raw
// URLs are the two most common low-effort spam patterns for a form like this.
export function looksLikeSpam(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (/(.)\1{9,}/.test(trimmed)) return true;
  const urlMatches = trimmed.match(/https?:\/\//gi);
  if (urlMatches && urlMatches.length > 1) return true;
  return false;
}

export function validateSubmission(name: string, message: string): string | null {
  const cleanName = sanitizeText(name, MAX_NAME_LENGTH);
  const cleanMessage = sanitizeText(message, MAX_MESSAGE_LENGTH);
  if (!cleanName) return 'Add your name so they know who this is from.';
  if (!cleanMessage) return "Write a message — it's the whole point.";
  if (cleanMessage.length < 3) return 'Your message is a little too short.';
  if (looksLikeSpam(cleanName) || looksLikeSpam(cleanMessage)) {
    return "That message didn't look right — try rewriting it.";
  }
  return null;
}
