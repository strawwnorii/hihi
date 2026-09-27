import { motion } from 'framer-motion';
import type { FlameStyle } from '../types';

interface FlameProps {
  style: FlameStyle;
  lit: boolean;
  reducedMotion: boolean;
}

const SIZE: Record<FlameStyle, number> = {
  small: 14,
  normal: 20,
  sparkle: 20,
  steady: 20,
  firework: 24,
  rainbow: 22,
  confetti: 22,
};

const FIREWORK_COLORS = ['#FFD166', '#FF6B6B', '#4ECDC4', '#C77DFF', '#FFFFFF'];
const RAINBOW_COLORS = ['#FF6B6B', '#FFD166', '#4ECDC4', '#6EA8FF', '#C77DFF'];
const CONFETTI_COLORS = ['#FFD166', '#FF6B6B', '#4ECDC4', '#C77DFF'];

export function Flame({ style, lit, reducedMotion }: FlameProps) {
  const size = SIZE[style];
  if (!lit) return null;

  if (style === 'firework') {
    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 1.4 }}>
        <div
          className="absolute h-2 w-2 rounded-full bg-white"
          style={{ boxShadow: '0 0 8px 3px rgba(255,255,255,0.8)' }}
        />
        {!reducedMotion &&
          FIREWORK_COLORS.map((color, i) => {
            const angle = (i / FIREWORK_COLORS.length) * Math.PI * 2;
            const dx = Math.cos(angle) * (size * 0.7);
            const dy = Math.sin(angle) * (size * 0.7) - size * 0.2;
            return <FireworkSpark key={i} delay={i * 0.18} color={color} x={dx} y={dy} />;
          })}
        <div
          className="absolute inset-0 rounded-full blur-md"
          style={{ background: 'radial-gradient(circle, rgba(255,214,102,0.5), transparent 70%)' }}
        />
      </div>
    );
  }

  const isCalm = style === 'steady' || reducedMotion;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size * 1.4 }}>
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '50% 100%' }}
        animate={isCalm ? undefined : { rotate: [-2, 2, -1, 1.5, -2], scaleY: [1, 1.05, 0.97, 1.02, 1] }}
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
      {style === 'rainbow' && !reducedMotion && (
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          {RAINBOW_COLORS.map((color, i) => {
            const angle = (i / RAINBOW_COLORS.length) * Math.PI * 2;
            const r = size * 0.55;
            return (
              <div
                key={color}
                className="absolute h-1 w-1 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  backgroundColor: color,
                  boxShadow: `0 0 3px 1px ${color}`,
                  transform: `translate(${Math.cos(angle) * r}px, ${Math.sin(angle) * r}px)`,
                }}
              />
            );
          })}
        </motion.div>
      )}
      {style === 'confetti' && !reducedMotion && (
        <>
          {CONFETTI_COLORS.map((color, i) => (
            <ConfettiPiece key={color} delay={i * 0.35} color={color} x={(i - 1.5) * 6} />
          ))}
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

function FireworkSpark({ delay, color, x, y }: { delay: number; color: string; x: number; y: number }) {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full"
      style={{ left: '50%', top: '50%', backgroundColor: color, boxShadow: `0 0 4px 1px ${color}` }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
      animate={{ opacity: [0, 1, 1, 0], x: [0, x], y: [0, y], scale: [0.3, 1, 1, 0.4] }}
      transition={{ duration: 1.1, repeat: Infinity, delay, ease: 'easeOut' }}
    />
  );
}

function ConfettiPiece({ delay, color, x }: { delay: number; color: string; x: number }) {
  return (
    <motion.div
      className="absolute h-1 w-1.5"
      style={{ left: '50%', top: '15%', backgroundColor: color, marginLeft: x }}
      initial={{ opacity: 0, y: -4, rotate: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: [-4, 20], rotate: [0, 180] }}
      transition={{ duration: 1.6, repeat: Infinity, delay, ease: 'easeIn' }}
    />
  );
}
