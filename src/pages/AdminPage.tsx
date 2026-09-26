import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createCake, deleteMessage, listMyCakes, sendAdminMagicLink } from '../lib/adminStore';
import { fetchCake } from '../lib/cakeStore';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { DEFAULT_CANDLE_DESIGN } from '../types';
import type { BirthdayCake } from '../types';

// Optional: restrict /admin to a single email address. Leave VITE_ADMIN_EMAIL
// unset in .env.local to allow any email to sign up as a creator.
const ALLOWED_ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim().toLowerCase();

export function AdminPage() {
  const [authed, setAuthed] = useState(!isSupabaseConfigured);
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [notAllowed, setNotAllowed] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    function checkSession(session: { user?: { email?: string | null } } | null) {
      const userEmail = session?.user?.email?.trim().toLowerCase();
      if (session && ALLOWED_ADMIN_EMAIL && userEmail !== ALLOWED_ADMIN_EMAIL) {
        // Signed in, but not the allowed address — kick them out. Don't clear
        // notAllowed here: signOut() below fires this same handler again with
        // session = null, and that call must NOT wipe the message we're
        // about to show.
        setNotAllowed(true);
        setAuthed(false);
        setLinkSent(false);
        supabase!.auth.signOut();
        return;
      }
      if (session) setNotAllowed(false); // only clear on an actually-allowed session
      setAuthed(!!session);
    }

    supabase!.auth.getSession().then(({ data }) => checkSession(data.session));
    const { data: sub } = supabase!.auth.onAuthStateChange((_event, session) => checkSession(session));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-espresso px-6">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl italic text-ink">Creator sign in</h1>
          <p className="mt-2 text-sm text-muted">We'll email you a one-time link — no password needed.</p>
          {notAllowed && (
            <p className="mt-4 text-sm text-flame">That email isn't authorized for admin access.</p>
          )}
          {sendError && <p className="mt-4 text-sm text-flame">{sendError}</p>}
          {linkSent ? (
            <div className="mt-6">
              <p className="text-sm text-gold-light">Check your email for a sign-in link.</p>
              <button
                type="button"
                onClick={() => {
                  setLinkSent(false);
                  setSendError(null);
                }}
                className="mt-3 text-xs text-muted underline underline-offset-4 hover:text-ink"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form
              className="mt-6 flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setSendError(null);
                setNotAllowed(false);
                setSending(true);
                const res = await sendAdminMagicLink(email);
                setSending(false);
                if (res.ok) {
                  setLinkSent(true);
                } else {
                  // Surface the real reason instead of failing silently —
                  // this is most often Supabase's rate limit on OTP emails
                  // (roughly one request per 60s on the free tier).
                  setSendError(res.error ?? 'Could not send the sign-in link. Please try again.');
                }
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="rounded-sm border border-white/15 bg-espresso-light px-3 py-2.5 text-ink placeholder:text-muted/60"
              />
              <button
                type="submit"
                disabled={sending}
                className="rounded-sm bg-flame/90 px-4 py-2.5 text-sm font-medium text-espresso-dark hover:bg-flame disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send sign-in link'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [cakes, setCakes] = useState<BirthdayCake[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [detail, setDetail] = useState<BirthdayCake | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const list = await listMyCakes();
    setCakes(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    fetchCake(selectedSlug).then(setDetail);
  }, [selectedSlug]);

  return (
    <div className="min-h-screen bg-espresso px-5 py-12 text-ink sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl italic">Your cakes</h1>
          <button
            type="button"
            onClick={() => setCreating((v) => !v)}
            className="rounded-sm border border-white/15 px-3 py-2 text-sm hover:border-white/30"
          >
            {creating ? 'Cancel' : '+ New cake'}
          </button>
        </div>

        {creating && (
          <NewCakeForm
            onCreated={() => {
              setCreating(false);
              refresh();
            }}
          />
        )}

        <div className="mt-8 flex flex-col gap-3">
          {cakes.map((c) => (
            <button
              key={c.slug}
              onClick={() => setSelectedSlug(c.slug)}
              className={[
                'flex items-center justify-between rounded-sm border px-4 py-3 text-left transition-colors',
                selectedSlug === c.slug ? 'border-gold/50 bg-espresso-light' : 'border-white/10 hover:border-white/25',
              ].join(' ')}
            >
              <span>
                <span className="block font-medium">{c.recipientName}</span>
                <span className="block text-xs text-muted">/cake/{c.slug}</span>
              </span>
              <span className="text-xs text-muted">manage →</span>
            </button>
          ))}
          {cakes.length === 0 && !creating && <p className="text-sm text-muted">No cakes yet. Create one above.</p>}
        </div>

        {detail && selectedSlug && <CakeDetail cake={detail} onChanged={() => fetchCake(selectedSlug).then(setDetail)} />}
      </div>
    </div>
  );
}

function NewCakeForm({ onCreated }: { onCreated: () => void }) {
  const [slug, setSlug] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [cakeTitle, setCakeTitle] = useState('');
  const [finalSender, setFinalSender] = useState('');
  const [finalMessage, setFinalMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="mt-6 flex flex-col gap-4 rounded-sm border border-white/10 bg-espresso-light p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
        if (!cleanSlug || !recipientName || !finalMessage) {
          setError('Fill in the link, recipient name, and your final message.');
          return;
        }
        const res = await createCake({
          slug: cleanSlug,
          recipientName,
          cakeTitle: cakeTitle || `Happy Birthday, ${recipientName}`,
          finalSender: finalSender || 'You',
          finalMessage,
          finalCandle: { ...DEFAULT_CANDLE_DESIGN, flame: 'sparkle' },
        });
        if (!res.ok) {
          setError(res.error ?? 'Could not create the cake.');
          return;
        }
        onCreated();
      }}
    >
      <TextField label="Shareable link (/cake/…)" value={slug} onChange={setSlug} placeholder="maria" />
      <TextField label="Recipient's name" value={recipientName} onChange={setRecipientName} placeholder="Maria" />
      <TextField label="Cake title (optional)" value={cakeTitle} onChange={setCakeTitle} placeholder="Happy Birthday, Maria" />
      <TextField label="Your name (final message sender)" value={finalSender} onChange={setFinalSender} placeholder="Josh" />
      <label className="flex flex-col gap-2">
        <span className="text-xs tracking-wide text-muted">Your hidden final message</span>
        <textarea
          value={finalMessage}
          onChange={(e) => setFinalMessage(e.target.value)}
          rows={4}
          className="resize-none rounded-sm border border-white/15 bg-espresso px-3 py-2.5 text-ink"
        />
      </label>
      {error && <p className="text-sm text-flame">{error}</p>}
      <button type="submit" className="self-start rounded-sm bg-flame/90 px-4 py-2 text-sm font-medium text-espresso-dark hover:bg-flame">
        Create cake
      </button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs tracking-wide text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-sm border border-white/15 bg-espresso px-3 py-2.5 text-ink placeholder:text-muted/60"
      />
    </label>
  );
}

function CakeDetail({ cake, onChanged }: { cake: BirthdayCake; onChanged: () => void }) {
  const shareUrl = `${window.location.origin}/submit/${cake.slug}`;
  const viewUrl = `${window.location.origin}/cake/${cake.slug}`;
  const [copied, setCopied] = useState<'share' | 'view' | null>(null);

  function copy(url: string, which: 'share' | 'view') {
    navigator.clipboard.writeText(url);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="mt-10 rounded-sm border border-white/10 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <LinkChip label={copied === 'share' ? 'Copied!' : 'Copy submit link'} onClick={() => copy(shareUrl, 'share')} />
        <LinkChip label={copied === 'view' ? 'Copied!' : 'Copy cake link'} onClick={() => copy(viewUrl, 'view')} />
        <Link to={`/cake/${cake.slug}`} className="text-xs text-gold-light underline underline-offset-4">
          Preview cake
        </Link>
      </div>

      <p className="mt-6 text-xs tracking-wide text-muted">
        {cake.messages.filter((m) => m.read).length} of {cake.messages.length} read
      </p>

      <ul className="mt-3 flex flex-col divide-y divide-white/10">
        {cake.messages.map((m) => (
          <li key={m.id} className="flex items-start justify-between gap-4 py-3">
            <div>
              <p className="text-sm font-medium">
                {m.sender}{' '}
                <span className="ml-2 text-[11px] font-normal text-muted">{m.read ? 'read' : 'unread'}</span>
              </p>
              <p className="mt-1 max-w-md text-sm text-ink/80">{m.message}</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                await deleteMessage(m.id);
                onChanged();
              }}
              className="shrink-0 text-xs text-muted hover:text-flame"
            >
              Delete
            </button>
          </li>
        ))}
        {cake.messages.length === 0 && (
          <li className="py-3 text-sm text-muted">No messages yet.</li>
        )}
      </ul>
    </div>
  );
}

function LinkChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:border-white/30"
    >
      {label}
    </button>
  );
}
