import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CandleMessage } from '../types';
import { CANDLE_COLORS } from '../types';

interface MessageModalProps {
  message: CandleMessage | null;
  isFinal?: boolean;
  onFinish: (id: string) => void;
  onClose: () => void;
  reducedMotion: boolean;
}

export function MessageModal({ message, isFinal, onFinish, onClose, reducedMotion }: MessageModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (message) closeRef.current?.focus();
  }, [message]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.05 : 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-modal-title"
          onClick={onClose}
        >
          <motion.div
            className={[
              'relative w-full max-w-md rounded-sm border p-8 shadow-2xl',
              isFinal ? 'border-gold/40 bg-espresso-light' : 'border-white/10 bg-espresso-light',
            ].join(' ')}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0.05 : 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              className="mb-4 block h-[2px] w-8 rounded-full"
              style={{ backgroundColor: CANDLE_COLORS[message.candle.color] }}
            />
            <p className="text-xs tracking-[0.18em] text-muted">from</p>
            <h2 id="message-modal-title" className="mt-1 font-display text-2xl italic text-ink">
              {message.sender}
            </h2>
            <p className="mt-5 whitespace-pre-line font-body text-[15px] leading-relaxed text-ink/90">
              {message.message}
            </p>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-sm px-3 py-2 text-sm text-muted transition-colors hover:text-ink"
              >
                Read later
              </button>
              <button
                ref={closeRef}
                type="button"
                onClick={() => onFinish(message.id)}
                className="rounded-sm bg-flame/90 px-4 py-2 text-sm font-medium text-espresso-dark transition-colors hover:bg-flame focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Blow out candle
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
