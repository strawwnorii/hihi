import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame } from './Flame';
import { Smoke } from './Smoke';
import { CandleBody } from './CandleBody';
import type { CandleMessage } from '../types';

interface CandleProps {
  message: CandleMessage;
  isFinal?: boolean;
  selected: boolean;
  onOpen: (id: string) => void;
  reducedMotion: boolean;
  size?: 'normal' | 'large';
}

const BODY_SIZE: Record<NonNullable<CandleProps['size']>, { w: number; h: number }> = {
  normal: { w: 22, h: 58 },
  large: { w: 30, h: 78 },
};

export function Candle({ message, isFinal, selected, onOpen, reducedMotion, size = 'normal' }: CandleProps) {
  const { w, h } = BODY_SIZE[size];
  const [flameLit, setFlameLit] = useState(!message.read);
  const [dying, setDying] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const wasRead = useRef(message.read);

  useEffect(() => {
    if (!wasRead.current && message.read) {
      // Just transitioned from lit -> read. Play the short "goes out" beat
      // before actually removing the flame, then puff smoke.
      setDying(true);
      const t1 = setTimeout(() => {
        setFlameLit(false);
        setDying(false);
        setSmoking(true);
      }, reducedMotion ? 60 : 420);
      const t2 = setTimeout(() => setSmoking(false), reducedMotion ? 60 : 420 + 1400);
      wasRead.current = true;
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
    wasRead.current = message.read;
  }, [message.read, reducedMotion]);

  const lit = flameLit;
  const label = message.read
    ? `${isFinal ? "Final message from " + message.sender : "Message from " + message.sender}, already read`
    : `${isFinal ? "Final message from " + message.sender : "Message from " + message.sender}, unread — tap to read`;

  return (
    <button
      type="button"
      onClick={() => lit && !dying && onOpen(message.id)}
      disabled={!lit || dying}
      aria-label={label}
      aria-pressed={selected}
      className={[
        'group relative flex flex-col items-center bg-transparent p-1 outline-none',
        lit ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      <motion.div
        className="relative flex flex-col items-center"
        animate={
          reducedMotion
            ? undefined
            : {
                y: lit ? [0, -2, 0] : 0,
                scale: selected ? 1.08 : dying ? [1, 1.02, 0.99, 1] : 1,
              }
        }
        transition={{ duration: dying ? 0.5 : 3.2, repeat: lit && !dying ? Infinity : 0, ease: 'easeInOut' }}
        whileHover={lit && !reducedMotion ? { scale: 1.08 } : undefined}
        whileTap={lit ? { scale: 0.97 } : undefined}
      >
        <div className="relative -mb-1 flex h-10 items-end justify-center">
          <Flame style={dying ? 'small' : message.candle.flame} lit={lit} reducedMotion={reducedMotion || dying} />
          <Smoke show={smoking} />
        </div>
        <div
          className={[
            'rounded-[2px] transition-shadow duration-300',
            lit ? (isFinal ? 'shadow-goldglow' : 'shadow-glow') : '',
            selected ? 'ring-2 ring-flame-hot ring-offset-2 ring-offset-espresso' : '',
          ].join(' ')}
        >
          <CandleBody
            shape={message.candle.shape}
            color={message.candle.color}
            pattern={message.candle.pattern}
            width={w}
            height={h}
          />
        </div>
      </motion.div>
    </button>
  );
}
