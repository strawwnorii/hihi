interface ProgressBarProps {
  read: number;
  total: number;
}

export function ProgressBar({ read, total }: ProgressBarProps) {
  if (total === 0) return null;
  const remaining = total - read;
  return (
    <div className="flex flex-col items-center gap-1.5 text-muted">
      <div className="h-px w-24 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-gold/70 transition-[width] duration-700 ease-out"
          style={{ width: `${(read / total) * 100}%` }}
        />
      </div>
      <p className="text-[11px] tracking-wide">
        {remaining === 0
          ? `all ${total} read`
          : remaining === 1
          ? '1 candle still glowing'
          : `${remaining} candles still glowing`}
      </p>
    </div>
  );
}
