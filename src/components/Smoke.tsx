import { motion, AnimatePresence } from 'framer-motion';

export function Smoke({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-muted/40 blur-[2px]"
              style={{ width: 6 + i * 3, height: 6 + i * 3, left: -3 - i, top: -2 }}
              initial={{ opacity: 0.5, y: 0, scale: 0.6 }}
              animate={{ opacity: 0, y: -26 - i * 6, scale: 1.6 + i * 0.3, x: (i - 1) * 8 }}
              transition={{ duration: 1.4, delay: i * 0.08, ease: 'easeOut' }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
