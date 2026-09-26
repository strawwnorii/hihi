import { useCallback, useRef, useState } from 'react';

// Browsers block audio until a user gesture. Sound also defaults to off per
// the brief, so we only ever create the AudioContext lazily, inside a click
// handler, once the user has explicitly opted in.
type SoundKind = 'select' | 'extinguish' | 'reveal';

export function useSound() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    return ctxRef.current;
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (next) getCtx().resume();
      return next;
    });
  }, [getCtx]);

  const play = useCallback(
    (kind: SoundKind) => {
      if (!enabled) return;
      const ctx = getCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (kind === 'select') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (kind === 'extinguish') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.35);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.09, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else {
        osc.type = 'sine';
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const t = now + i * 0.14;
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, t);
          g.gain.setValueAtTime(0.001, t);
          g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 0.55);
        });
        osc.disconnect();
        return;
      }
    },
    [enabled, getCtx]
  );

  return { enabled, toggle, play };
}
