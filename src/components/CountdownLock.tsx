import { useEffect, useState } from 'react';

interface CountdownLockProps {
  unlockAt: string;
  cakeTitle: string;
  recipientName: string;
  messageCount: number;
  onUnlocked: () => void;
}

function splitRemaining(ms: number) {
  const total = Math.floor(Math.max(0, ms) / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function CountdownLock({ unlockAt, cakeTitle, recipientName, messageCount, onUnlocked }: CountdownLockProps) {
  const target = new Date(unlockAt).getTime();
  const [remainingMs, setRemainingMs] = useState(() => target - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const next = target - Date.now();
      setRemainingMs(next);
      if (next <= 0) {
        clearInterval(id);
        onUnlocked();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onUnlocked]);

  const { days, hours, minutes, seconds } = splitRemaining(remainingMs);
  const teaser =
    messageCount === 0
      ? 'The first candle is on its way.'
      : messageCount === 1
      ? '1 candle is already waiting.'
      : `${messageCount} candles are already waiting.`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-espresso px-6 text-center">
      <p className="text-xs tracking-[0.15em] text-muted">{cakeTitle}</p>
      <h1 className="max-w-md font-display text-3xl italic text-ink sm:text-4xl">
        {recipientName}&rsquo;s cake isn&rsquo;t ready to open yet
      </h1>
      <p className="text-sm text-gold-light">{teaser}</p>
      <div className="mt-2 flex items-end gap-4 sm:gap-6" role="timer" aria-live="off">
        <TimeUnit value={days} label="days" />
        <TimeUnit value={hours} label="hrs" />
        <TimeUnit value={minutes} label="min" />
        <TimeUnit value={seconds} label="sec" />
      </div>
      <p className="max-w-xs text-sm text-muted">Come back when the countdown ends to light your first candle.</p>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-display text-3xl italic text-ink sm:text-4xl">{String(value).padStart(2, '0')}</span>
      <span className="text-[11px] tracking-wide text-muted">{label}</span>
    </div>
  );
}
