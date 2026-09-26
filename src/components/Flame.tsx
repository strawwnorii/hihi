import { motion } from 'framer-motion';
import type { FlameStyle } from '../types';

interface FlameProps {
  style: FlameStyle;
  lit: boolean;
  reducedMotion: boolean;
}

const SIZE: Record<FlameStyle, number> = { small: 14, normal: 20, sparkle: 20 };

export function Flame({ style, lit, reducedMotion }: FlameProps) {
  const size = SIZE[style];
  if (!lit) return null;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size * 1.4 }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '50% 100%' }}
        animate={reducedMotion ? undefined : { rotate: [-2, 2, -1, 1.5, -2], scaleY: [1, 1.05, 0.97, 1.02, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 20 28" width={size} height={size * 1.4} fill="none">
          <defs>
            <radialGradient id="flameCore" cx="50%" cy="70%" r="60%">
              <stop offset="0%" stopColor="#FFF3D6" />
              <stop offset="55%" stopColor="#FFB454" />
              <stop offset="100%" stopColor="#E8823D" />
            </radialGradient>
          </defs>
          <path
            d="M10 1C10 1 3 10.5 3 17.5C3 22.7 6.5 27 10 27C13.5 27 17 22.7 17 17.5C17 10.5 10 1 10 1Z"
            fill="url(#flameCore)"
          />
          <path
            d="M10 9C10 9 7 13.8 7 18.2C7 21.1 8.4 23.5 10 23.5C11.6 23.5 13 21.1 13 18.2C13 13.8 10 9 10 9Z"
            fill="#FFF3D6"
            opacity="0.85"
          />
        </svg>
      </motion.div>
      {style === 'sparkle' && !reducedMotion && (
        <>
          <Sparkle delay={0} x={-8} y={-2} />
          <Sparkle delay={0.6} x={8} y={2} />
          <Sparkle delay={1.1} x={0} y={-8} />
        </>
      )}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{ background: 'radial-gradient(circle, rgba(255,180,84,0.55), transparent 70%)' }}
      />
    </div>
  );
}

function Sparkle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-flame-hot"
      style={{ left: '50%', top: '50%' }}
      initial={{ opacity: 0, x, y, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], x: x * 1.6, y: y * 1.6 - 6, scale: [0.4, 1, 0.4] }}
      transition={{ duration: 1.8, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}
