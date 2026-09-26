import { motion, AnimatePresence } from 'framer-motion';

interface FinalRevealOverlayProps {
  phase: 'celebrating' | 'announcing' | null;
  reducedMotion: boolean;
}

export function FinalRevealOverlay({ phase, reducedMotion }: FinalRevealOverlayProps) {
  return (
    <AnimatePresence>
      {phase && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 0.6 }}
        >
          <div className="absolute inset-0 bg-espresso-dark/55" />
          {phase === 'celebrating' &&
            !reducedMotion &&
            Array.from({ length: 14 }).map((_, i) => (
              <motion.span
                key={i}
                className="absolute h-1 w-1 rounded-full bg-gold-light"
                style={{ left: `${50 + (Math.random() - 0.5) * 50}%`, top: '58%' }}
                initial={{ opacity: 0, y: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], y: -140 - Math.random() * 80, scale: [0.4, 1, 0.6] }}
                transition={{ duration: 1.6 + Math.random(), delay: i * 0.04, ease: 'easeOut' }}
              />
            ))}
          {phase === 'announcing' && (
            <motion.p
              className="relative font-display text-2xl italic tracking-wide text-gold-light sm:text-3xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.1 : 0.7, ease: 'easeOut' }}
            >
              There&rsquo;s one more&hellip;
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
