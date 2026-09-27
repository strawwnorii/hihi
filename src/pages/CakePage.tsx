import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Cake } from '../components/Cake';
import { MessageModal } from '../components/MessageModal';
import { ProgressBar } from '../components/ProgressBar';
import { SoundToggle } from '../components/SoundToggle';
import { FinalRevealOverlay } from '../components/FinalRevealOverlay';
import {
  fetchCake,
  fetchCakeSummary,
  fetchFinalMessage,
  fetchMessageText,
  markMessageRead,
  resetReadState,
  verifyCakePassword,
} from '../lib/cakeStore';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useSound } from '../hooks/useSound';
import { DEFAULT_CANDLE_DESIGN } from '../types';
import type { BirthdayCake } from '../types';

type RevealPhase = 'celebrating' | 'announcing' | null;

function unlockKey(slug: string) {
  return `cake_unlocked_${slug}`;
}

export function CakePage() {
  const { slug = '' } = useParams();
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(unlockKey(slug)) === '1');
  const [summary, setSummary] = useState<{ recipientName: string; cakeTitle: string } | null | undefined>(undefined);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [checkingPassword, setCheckingPassword] = useState(false);

  const [cake, setCake] = useState<BirthdayCake | null | undefined>(undefined);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [finalRead, setFinalRead] = useState(false);
  const [revealPhase, setRevealPhase] = useState<RevealPhase>(null);
  const [finalUnlocked, setFinalUnlocked] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const sound = useSound();
  const hasCheckedInitialState = useRef(false);

  // Before we know whether this visitor has the password, only fetch
  // enough to show a title on the gate screen — never the messages.
  useEffect(() => {
    if (unlocked) return;
    let active = true;
    fetchCakeSummary(slug).then((s) => {
      if (active) setSummary(s);
    });
    return () => {
      active = false;
    };
  }, [slug, unlocked]);

  useEffect(() => {
    if (!unlocked) return;
    let active = true;
    fetchCake(slug).then((c) => {
      if (!active) return;
      setCake(c);
      // If every message was already read in a previous visit, the final
      // candle should just be there — no replaying the reveal animation.
      if (c && c.messages.length > 0 && c.messages.every((m) => m.read)) {
        setFinalUnlocked(true);
      }
      hasCheckedInitialState.current = true;
    });
    return () => {
      active = false;
    };
  }, [slug, unlocked]);

  const allRead = useMemo(() => !!cake && cake.messages.length > 0 && cake.messages.every((m) => m.read), [cake]);
  const readCount = cake ? cake.messages.filter((m) => m.read).length : 0;

  // The final message's text isn't fetched until every other candle is
  // read — this is the moment it's actually allowed to reach the browser.
  useEffect(() => {
    if (allRead && cake && !cake.finalMessage) {
      fetchFinalMessage(slug).then((fm) => {
        if (fm) setCake((prev) => (prev ? { ...prev, finalMessage: fm } : prev));
      });
    }
  }, [allRead, cake, slug]);

  useEffect(() => {
    if (allRead && !finalUnlocked) {
      const t1 = setTimeout(() => setRevealPhase('celebrating'), reducedMotion ? 100 : 500);
      const t2 = setTimeout(() => setRevealPhase('announcing'), reducedMotion ? 300 : 1600);
      const t3 = setTimeout(() => {
        setRevealPhase(null);
        setFinalUnlocked(true);
        sound.play('reveal');
      }, reducedMotion ? 700 : 3200);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRead, finalUnlocked, reducedMotion]);

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setCheckingPassword(true);
    setPasswordError(null);
    const ok = await verifyCakePassword(slug, passwordInput);
    setCheckingPassword(false);
    if (!ok) {
      setPasswordError("That's not it — try again.");
      return;
    }
    localStorage.setItem(unlockKey(slug), '1');
    setUnlocked(true);
  }

  if (!unlocked) {
    if (summary === undefined) {
      return <CenteredNote>Loading&hellip;</CenteredNote>;
    }
    if (summary === null) {
      return (
        <CenteredNote>
          This cake doesn&rsquo;t exist yet.{' '}
          <Link to="/" className="underline decoration-gold/50 underline-offset-4 hover:text-gold-light">
            Go home
          </Link>
        </CenteredNote>
      );
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-espresso px-6 text-center">
        <p className="text-xs tracking-[0.15em] text-muted">{summary.cakeTitle}</p>
        <h1 className="max-w-md font-display text-3xl italic text-ink sm:text-4xl">
          A cake for {summary.recipientName}
        </h1>
        <Link
          to={`/submit/${slug}`}
          className="rounded-sm bg-flame/90 px-5 py-2.5 text-sm font-medium text-espresso-dark hover:bg-flame"
        >
          Send a message
        </Link>

        <form onSubmit={handlePasswordSubmit} className="mt-4 flex w-full max-w-xs flex-col gap-3">
          <label className="flex flex-col gap-2 text-left">
            <span className="text-xs tracking-wide text-muted">
              {summary.recipientName}? Enter the password to read your messages.
            </span>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="rounded-sm border border-white/15 bg-espresso-light px-3 py-2.5 text-ink placeholder:text-muted/60"
            />
          </label>
          {passwordError && <p className="text-sm text-flame">{passwordError}</p>}
          <button
            type="submit"
            disabled={checkingPassword}
            className="rounded-sm border border-white/15 px-4 py-2.5 text-sm hover:border-white/30 disabled:opacity-50"
          >
            {checkingPassword ? 'Checking…' : 'View messages'}
          </button>
        </form>
      </div>
    );
  }

  if (cake === undefined) {
    return <CenteredNote>Lighting the candles&hellip;</CenteredNote>;
  }
  if (cake === null) {
    return (
      <CenteredNote>
        This cake doesn&rsquo;t exist yet.{' '}
        <Link to="/" className="underline decoration-gold/50 underline-offset-4 hover:text-gold-light">
          Go home
        </Link>
      </CenteredNote>
    );
  }

  const selectedMessage =
    selectedId === 'final'
      ? cake.finalMessage
        ? { id: 'final', sender: cake.finalMessage.sender, message: cake.finalMessage.message, candle: cake.finalMessage.candle, read: finalRead, createdAt: '' }
        : null
      : cake.messages.find((m) => m.id === selectedId) ?? null;

  const currentCake = cake;

  async function handleOpen(id: string) {
    if (id !== 'final') {
      const target = currentCake.messages.find((m) => m.id === id);
      // Text for this candle hasn't been requested yet — fetch it now,
      // right as it's opened, rather than having had it all along.
      if (target && !target.message) {
        const text = await fetchMessageText(slug, id);
        setCake((prev) =>
          prev ? { ...prev, messages: prev.messages.map((m) => (m.id === id ? { ...m, message: text ?? '' } : m)) } : prev
        );
      }
    }
    setSelectedId(id);
    sound.play('select');
  }

  async function handleFinish(id: string) {
    if (id === 'final') {
      setFinalRead(true);
    } else {
      setCake((prev) => (prev ? { ...prev, messages: prev.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) } : prev));
      await markMessageRead(slug, id);
    }
    sound.play('extinguish');
    setSelectedId(null);
  }

  // Relights every candle so the recipient can go through all the messages
  // again from the start. This only clears read markers for THIS device —
  // the messages themselves are never deleted or changed.
  async function handleReadAgain() {
    const ids = currentCake.messages.map((m) => m.id);
    await resetReadState(slug, ids);
    setFinalUnlocked(false);
    setFinalRead(false);
    setRevealPhase(null);
    setSelectedId(null);
    setCake((prev) =>
      prev ? { ...prev, messages: prev.messages.map((m) => ({ ...m, read: false, message: '' })) } : prev
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-espresso">
      <Grain reducedMotion={reducedMotion} />
      <FinalRevealOverlay phase={revealPhase} reducedMotion={reducedMotion} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col items-center px-5 py-10 sm:py-14">
        <div className="mb-8 flex w-full items-center justify-between sm:mb-10">
          <p className="text-xs tracking-[0.15em] text-muted">{cake.cakeTitle}</p>
          <SoundToggle enabled={sound.enabled} onToggle={sound.toggle} />
        </div>

        <h1 className="text-center font-display text-4xl italic text-ink sm:text-5xl">
          Happy birthday, {cake.recipientName}
        </h1>
        <p className="mt-3 max-w-xs text-center text-sm text-muted">
          {cake.messages.length === 0
            ? 'No candles yet — check back once the first message arrives.'
            : 'Tap a lit candle to read what they left you.'}
        </p>

        <div className="my-10 flex-1 sm:my-14">
          <Cake
            messages={cake.messages}
            finalMessage={cake.finalMessage ?? { sender: '', message: '', candle: DEFAULT_CANDLE_DESIGN }}
            finalUnlocked={finalUnlocked && !!cake.finalMessage}
            finalRead={finalRead}
            selectedId={selectedId}
            onOpen={handleOpen}
            reducedMotion={reducedMotion}
          />
        </div>

        <ProgressBar read={readCount} total={cake.messages.length} />

        {finalUnlocked && finalRead && (
          <button
            type="button"
            onClick={handleReadAgain}
            className="mt-6 text-xs text-muted underline underline-offset-4 hover:text-ink"
          >
            Read again?
          </button>
        )}
      </div>

      <MessageModal
        message={selectedMessage}
        isFinal={selectedId === 'final'}
        onFinish={handleFinish}
        onClose={() => setSelectedId(null)}
        reducedMotion={reducedMotion}
      />
    </div>
  );
}

function CenteredNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-espresso px-6 text-center text-ink/80">
      <p className="font-display text-xl italic">{children}</p>
    </div>
  );
}

function Grain({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 opacity-[0.05] ${reducedMotion ? '' : 'animate-grain'}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
