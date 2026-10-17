import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { createCake, deleteCake, deleteMessage, listMyCakes, sendAdminMagicLink, setCakePassword, updateCakeSettings } from '../lib/adminStore';
import { fetchCakeForAdmin } from '../lib/cakeStore';
import { DEFAULT_THEME, THEME_OPTIONS } from '../lib/themes';
import { MessageModal } from '../components/MessageModal';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { CandleCreatorForm } from '../components/CandleCreatorForm';
import { DEFAULT_CANDLE_DESIGN } from '../types';
import type { BirthdayCake, CakeTheme, CandleDesign, CandleMessage } from '../types';

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
                className="rounded-sm bg-flame/90 px-4 py-2.5 text-sm font-medium text-onaccent hover:bg-flame disabled:opacity-50"
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
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    const list = await listMyCakes();
    setCakes(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoadingDetail(true);
    fetchCakeForAdmin(selectedSlug).then((d) => {
      if (!active) return;
      setDetail(d);
      setLoadingDetail(false);
    });
    return () => {
      active = false;
    };
  }, [selectedSlug]);

  async function handleDeleteCake(slug: string) {
    const res = await deleteCake(slug);
    if (!res.ok) {
      alert(res.error ?? 'Could not delete that cake.');
      return;
    }
    setSelectedSlug(null);
    await refresh();
  }

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
            <div
              key={c.slug}
              className={[
                'flex items-center justify-between rounded-sm border px-4 py-3 transition-colors',
                selectedSlug === c.slug ? 'border-gold/50 bg-espresso-light' : 'border-white/10 hover:border-white/25',
              ].join(' ')}
            >
              <button type="button" onClick={() => setSelectedSlug(c.slug)} className="flex-1 text-left">
                <span className="block font-medium">{c.recipientName}</span>
                <span className="block text-xs text-muted">/cake/{c.slug}</span>
              </button>
              <span className="mr-3 text-xs text-muted">
                {selectedSlug === c.slug && loadingDetail ? 'Loading…' : 'manage →'}
              </span>
              <DeleteCakeButton slug={c.slug} onConfirmed={() => handleDeleteCake(c.slug)} />
            </div>
          ))}
          {cakes.length === 0 && !creating && <p className="text-sm text-muted">No cakes yet. Create one above.</p>}
        </div>

        {selectedSlug && loadingDetail && !detail && (
          <p className="mt-10 text-sm text-muted">Loading cake…</p>
        )}
        {detail && selectedSlug && <CakeDetail cake={detail} onChanged={() => fetchCakeForAdmin(selectedSlug).then(setDetail)} />}
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
  const [viewPassword, setViewPassword] = useState('');
  const [theme, setTheme] = useState<CakeTheme>(DEFAULT_THEME);
  const [unlockLocal, setUnlockLocal] = useState('');
  const [candleDesign, setCandleDesign] = useState<CandleDesign>({ ...DEFAULT_CANDLE_DESIGN, flame: 'firework' });
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
        if (!viewPassword) {
          setError('Set a view password so only the recipient can read the messages.');
          return;
        }
        const res = await createCake({
          slug: cleanSlug,
          recipientName,
          cakeTitle: cakeTitle || `Happy Birthday, ${recipientName}`,
          finalSender: finalSender || 'You',
          finalMessage,
          finalCandle: candleDesign,
          theme,
          unlockAt: unlockLocal ? new Date(unlockLocal).toISOString() : null,
        });
        if (!res.ok) {
          setError(res.error ?? 'Could not create the cake.');
          return;
        }
        const pwRes = await setCakePassword(cleanSlug, viewPassword);
        if (!pwRes.ok) {
          setError(`Cake created, but the password could not be set: ${pwRes.error ?? 'unknown error'}`);
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
      <label className="flex flex-col gap-2">
        <span className="text-xs tracking-wide text-muted">
          View password <span className="text-muted/70">(only the recipient should get this)</span>
        </span>
        <input
          type="text"
          value={viewPassword}
          onChange={(e) => setViewPassword(e.target.value)}
          placeholder="e.g. a word only they'd know"
          className="rounded-sm border border-white/15 bg-espresso px-3 py-2.5 text-ink placeholder:text-muted/60"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-xs tracking-wide text-muted">
          Your final candle <span className="text-muted/70">(the last one they'll light — make it yours)</span>
        </span>
        <CandleCreatorForm design={candleDesign} onChange={setCandleDesign} exclusiveFlames exclusiveColors />
      </div>
      <ThemePicker value={theme} onChange={setTheme} />
      <UnlockField value={unlockLocal} onChange={setUnlockLocal} />
      {error && <p className="text-sm text-flame">{error}</p>}
      <button type="submit" className="self-start rounded-sm bg-flame/90 px-4 py-2 text-sm font-medium text-onaccent hover:bg-flame">
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
  const [newPassword, setNewPassword] = useState('');
  const [pwStatus, setPwStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pwError, setPwError] = useState<string | null>(null);
  const [theme, setTheme] = useState<CakeTheme>(cake.theme);
  const [unlockLocal, setUnlockLocal] = useState(toLocalInput(cake.unlockAt));
  const [settingsStatus, setSettingsStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [settingsError, setSettingsError] = useState<string | null>(null);
  // "Read again": view any message (or the final one) without needing the
  // recipient's password and without marking anything read.
  const [preview, setPreview] = useState<{ message: CandleMessage; isFinal: boolean } | null>(null);

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setSettingsStatus('saving');
    setSettingsError(null);
    const res = await updateCakeSettings(cake.slug, {
      theme,
      unlockAt: unlockLocal ? new Date(unlockLocal).toISOString() : null,
    });
    if (!res.ok) {
      setSettingsStatus('error');
      setSettingsError(res.error ?? 'Could not save.');
      return;
    }
    setSettingsStatus('saved');
    setTimeout(() => setSettingsStatus('idle'), 1500);
  }

  function openFinalPreview() {
    if (!cake.finalMessage) return;
    setPreview({
      isFinal: true,
      message: { id: 'final', sender: cake.finalMessage.sender, message: cake.finalMessage.message, candle: cake.finalMessage.candle, read: false, createdAt: '' },
    });
  }

  function copy(url: string, which: 'share' | 'view') {
    navigator.clipboard.writeText(url);
    setCopied(which);
    setTimeout(() => setCopied(null), 1500);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwStatus('saving');
    setPwError(null);
    const res = await setCakePassword(cake.slug, newPassword);
    if (!res.ok) {
      setPwStatus('error');
      setPwError(res.error ?? 'Could not save the password.');
      return;
    }
    setPwStatus('saved');
    setNewPassword('');
    setTimeout(() => setPwStatus('idle'), 1500);
  }

  return (
    <div className="mt-10 rounded-sm border border-white/10 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <LinkChip label={copied === 'share' ? 'Copied!' : 'Copy submit link'} onClick={() => copy(shareUrl, 'share')} />
        <LinkChip label={copied === 'view' ? 'Copied!' : 'Copy cake link'} onClick={() => copy(viewUrl, 'view')} />
        <Link to={`/admin/preview/${cake.slug}`} className="text-xs text-gold-light underline underline-offset-4">
          Preview as she&rsquo;ll see it
        </Link>
        <Link to={`/cake/${cake.slug}`} className="text-xs text-muted underline underline-offset-4 hover:text-ink">
          Open public link
        </Link>
      </div>

      <form onSubmit={savePassword} className="mt-6 flex flex-wrap items-end gap-3 rounded-sm border border-white/10 bg-espresso-light p-4">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-xs tracking-wide text-muted">
            View password <span className="text-muted/70">(recipient needs this to open the cake link)</span>
          </span>
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Set a new password…"
            className="rounded-sm border border-white/15 bg-espresso px-3 py-2.5 text-ink placeholder:text-muted/60"
          />
        </label>
        <button
          type="submit"
          disabled={pwStatus === 'saving'}
          className="rounded-sm border border-white/15 px-3 py-2.5 text-xs hover:border-white/30 disabled:opacity-50"
        >
          {pwStatus === 'saving' ? 'Saving…' : pwStatus === 'saved' ? 'Saved!' : 'Save password'}
        </button>
        <button
          type="button"
          onClick={async () => {
            setPwStatus('saving');
            setPwError(null);
            const res = await setCakePassword(cake.slug, '');
            setPwStatus(res.ok ? 'saved' : 'error');
            if (!res.ok) setPwError(res.error ?? 'Could not clear the password.');
            setNewPassword('');
            setTimeout(() => setPwStatus('idle'), 1500);
          }}
          className="text-xs text-muted underline underline-offset-4 hover:text-ink"
        >
          Remove password
        </button>
        {pwError && <p className="w-full text-sm text-flame">{pwError}</p>}
      </form>

      <form onSubmit={saveSettings} className="mt-4 flex flex-col gap-4 rounded-sm border border-white/10 bg-espresso-light p-4">
        <ThemePicker value={theme} onChange={setTheme} />
        <UnlockField value={unlockLocal} onChange={setUnlockLocal} />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={settingsStatus === 'saving'}
            className="rounded-sm border border-white/15 px-3 py-2.5 text-xs hover:border-white/30 disabled:opacity-50"
          >
            {settingsStatus === 'saving' ? 'Saving…' : settingsStatus === 'saved' ? 'Saved!' : 'Save theme & unlock time'}
          </button>
          {settingsError && <p className="text-sm text-flame">{settingsError}</p>}
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs tracking-wide text-muted">
          {cake.messages.filter((m) => m.read).length} of {cake.messages.length} read
        </p>
        <button
          type="button"
          onClick={openFinalPreview}
          className="text-xs text-gold-light underline underline-offset-4 hover:text-ink"
        >
          Read your final message
        </button>
      </div>

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
            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setPreview({ message: m, isFinal: false })}
                className="text-xs text-gold-light hover:text-ink"
              >
                Read
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteMessage(m.id);
                  onChanged();
                }}
                className="text-xs text-muted hover:text-flame"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {cake.messages.length === 0 && (
          <li className="py-3 text-sm text-muted">No messages yet.</li>
        )}
      </ul>

      <MessageModal
        message={preview?.message ?? null}
        isFinal={preview?.isFinal}
        previewOnly
        onFinish={() => {}}
        onClose={() => setPreview(null)}
        reducedMotion={false}
      />
    </div>
  );
}

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ThemePicker({ value, onChange }: { value: CakeTheme; onChange: (t: CakeTheme) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs tracking-wide text-muted">Cake theme</span>
      <div className="flex flex-wrap gap-2">
        {THEME_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            aria-pressed={value === t.value}
            title={t.blurb}
            className={[
              'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
              value === t.value ? 'border-gold bg-gold/15 text-gold-light' : 'border-white/15 text-ink/80 hover:border-white/30',
            ].join(' ')}
          >
            <span
              className="h-4 w-4 rounded-full border border-white/30"
              style={{ background: `linear-gradient(135deg, ${t.swatch.bg} 55%, ${t.swatch.accent} 55%)` }}
            />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UnlockField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-xs tracking-wide text-muted">
        Unlock time <span className="text-muted/70">(optional. Friends can submit early, but she can&rsquo;t open the cake until then)</span>
      </span>
      <div className="flex items-center gap-3">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-sm border border-white/15 bg-espresso px-3 py-2.5 text-ink"
        />
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-muted underline underline-offset-4 hover:text-ink">
            Clear
          </button>
        )}
      </div>
    </label>
  );
}

function DeleteCakeButton({ slug, onConfirmed }: { slug: string; onConfirmed: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (deleting) {
    return <span className="shrink-0 text-xs text-muted">Deleting…</span>;
  }

  if (confirming) {
    return (
      <span className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-muted">Delete /{slug}?</span>
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            setDeleting(true);
            await onConfirmed();
          }}
          className="text-xs font-medium text-flame hover:underline"
        >
          Yes, delete
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setConfirming(false);
          }}
          className="text-xs text-muted hover:text-ink"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setConfirming(true);
      }}
      className="shrink-0 text-xs text-muted hover:text-flame"
    >
      Delete
    </button>
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
