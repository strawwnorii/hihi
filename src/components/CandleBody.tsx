import { useId } from 'react';
import type { CandleColorName, CandlePattern, CandleShape } from '../types';
import { CANDLE_COLORS } from '../types';

interface CandleBodyProps {
  shape: CandleShape;
  color: CandleColorName;
  pattern: CandlePattern;
  width: number;
  height: number;
}

// Each shape is drawn in its own local viewBox, then scaled to the requested
// box so every candle sits at the same visual "waist height" on the cake
// regardless of silhouette.
const SHAPE_PATH: Record<CandleShape, { viewBox: string; d: string }> = {
  classic: { viewBox: '0 0 24 64', d: 'M4 4H20V60C20 62.2 18.2 64 16 64H8C5.8 64 4 62.2 4 60V4Z' },
  twisted: {
    viewBox: '0 0 24 64',
    d: 'M6 4C6 4 20 8 6 14C-6 20 20 26 6 32C-6 38 20 44 6 50C6 50 5 58 8 62C9 63.3 10.5 64 12 64C13.5 64 15 63.3 16 62C18.5 59.5 18 51 18 51C18 51 4 45 18 39C30 33 4 27 18 21C30 15 4 9 18 4H6Z',
  },
  heart: {
    viewBox: '0 0 28 26',
    d: 'M14 26C14 26 2 17.5 2 9.5C2 4.8 5.6 2 9.3 2C11.6 2 13.3 3.2 14 5C14.7 3.2 16.4 2 18.7 2C22.4 2 26 4.8 26 9.5C26 17.5 14 26 14 26Z',
  },
  star: {
    viewBox: '0 0 28 28',
    d: 'M14 1L17.5 10.2L27 10.8L19.6 16.9L22.1 26L14 20.6L5.9 26L8.4 16.9L1 10.8L10.5 10.2Z',
  },
  slim: { viewBox: '0 0 14 64', d: 'M4 4H10V60C10 62.2 8.2 64 6 64H8C5.8 64 4 62.2 4 60V4Z' },
  chunky: { viewBox: '0 0 32 56', d: 'M4 4H28V52C28 54.2 26.2 56 24 56H8C5.8 56 4 54.2 4 52V4Z' },
};

export function CandleBody({ shape, color, pattern, width, height }: CandleBodyProps) {
  const uid = useId();
  const base = CANDLE_COLORS[color];
  const { viewBox, d } = SHAPE_PATH[shape];
  const patternId = `pat-${uid}`;

  return (
    <svg width={width} height={height} viewBox={viewBox} aria-hidden="true">
      <defs>
        <linearGradient id={`shade-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="black" stopOpacity="0.16" />
          <stop offset="18%" stopColor="black" stopOpacity="0" />
          <stop offset="82%" stopColor="black" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.16" />
        </linearGradient>
        {pattern === 'stripes' && (
          <pattern id={patternId} width="6" height="6" patternTransform="rotate(15)" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill={base} />
            <rect width="3" height="6" fill="black" opacity="0.12" />
          </pattern>
        )}
        {pattern === 'dots' && (
          <pattern id={patternId} width="7" height="7" patternUnits="userSpaceOnUse">
            <rect width="7" height="7" fill={base} />
            <circle cx="3.5" cy="3.5" r="1.3" fill="black" opacity="0.16" />
          </pattern>
        )}
      </defs>
      <path d={d} fill={pattern === 'plain' ? base : `url(#${patternId})`} />
      <path d={d} fill={`url(#shade-${uid})`} />
    </svg>
  );
}
