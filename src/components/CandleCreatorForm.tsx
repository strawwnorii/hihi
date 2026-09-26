import type { ReactNode } from 'react';
import { CandleBody } from './CandleBody';
import { Flame } from './Flame';
import type { CandleColorName, CandleDesign, CandlePattern, CandleShape, FlameStyle } from '../types';
import { CANDLE_COLORS } from '../types';

interface CandleCreatorFormProps {
  design: CandleDesign;
  onChange: (design: CandleDesign) => void;
}

const SHAPES: { value: CandleShape; label: string }[] = [
  { value: 'classic', label: 'Classic' },
  { value: 'twisted', label: 'Twisted' },
  { value: 'heart', label: 'Heart' },
  { value: 'star', label: 'Star' },
  { value: 'slim', label: 'Slim' },
  { value: 'chunky', label: 'Chunky' },
];

const COLORS: CandleColorName[] = ['white', 'cream', 'blue', 'pink', 'yellow', 'green', 'purple'];

const PATTERNS: { value: CandlePattern; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'dots', label: 'Dots' },
];

const FLAMES: { value: FlameStyle; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'small', label: 'Small' },
  { value: 'sparkle', label: 'Sparkle' },
];

export function CandleCreatorForm({ design, onChange }: CandleCreatorFormProps) {
  function set<K extends keyof CandleDesign>(key: K, value: CandleDesign[K]) {
    onChange({ ...design, [key]: value });
  }

  return (
    <div className="grid gap-8 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-start">
      <div className="flex flex-col items-center gap-3 rounded-sm border border-white/10 bg-espresso-light py-8">
        <div className="flex h-10 items-end">
          <Flame style={design.flame} lit reducedMotion={false} />
        </div>
        <CandleBody shape={design.shape} color={design.color} pattern={design.pattern} width={26} height={68} />
        <p className="mt-2 text-xs text-muted">live preview</p>
      </div>

      <div className="flex flex-col gap-6">
        <Field label="Shape">
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <Chip key={s.value} active={design.shape === s.value} onClick={() => set('shape', s.value)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Color">
          <div className="flex flex-wrap gap-2.5">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                aria-label={`${c} candle color`}
                aria-pressed={design.color === c}
                className={[
                  'h-8 w-8 rounded-full border transition-transform',
                  design.color === c ? 'scale-110 border-ink' : 'border-white/20 hover:scale-105',
                ].join(' ')}
                style={{ backgroundColor: CANDLE_COLORS[c] }}
              />
            ))}
          </div>
        </Field>

        <Field label="Pattern">
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <Chip key={p.value} active={design.pattern === p.value} onClick={() => set('pattern', p.value)}>
                {p.label}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Flame">
          <div className="flex flex-wrap gap-2">
            {FLAMES.map((f) => (
              <Chip key={f.value} active={design.flame === f.value} onClick={() => set('flame', f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs tracking-wide text-muted">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold',
        active ? 'border-gold bg-gold/15 text-gold-light' : 'border-white/15 text-ink/80 hover:border-white/30',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
