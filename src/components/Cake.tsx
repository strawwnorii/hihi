import { Candle } from './Candle';
import type { CandleMessage, FinalMessage } from '../types';

interface CakeProps {
  messages: CandleMessage[];
  finalMessage: FinalMessage;
  finalUnlocked: boolean;
  finalRead: boolean;
  selectedId: string | null;
  onOpen: (id: string, isFinal?: boolean) => void;
  reducedMotion: boolean;
}

export function Cake({ messages, finalMessage, finalUnlocked, finalRead, selectedId, onOpen, reducedMotion }: CakeProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-xl flex-col items-center">
      {/* candles */}
      <div className="relative z-10 mb-[-14px] flex w-full flex-wrap items-end justify-center gap-x-3 gap-y-2 px-4 pb-1">
        {messages.map((m) => (
          <Candle
            key={m.id}
            message={m}
            selected={selectedId === m.id}
            onOpen={(id) => onOpen(id)}
            reducedMotion={reducedMotion}
          />
        ))}
        {finalUnlocked && (
          <Candle
            message={{
              id: 'final',
              sender: finalMessage.sender,
              message: finalMessage.message,
              candle: finalMessage.candle,
              read: finalRead,
              createdAt: new Date().toISOString(),
            }}
            isFinal
            size="large"
            selected={selectedId === 'final'}
            onOpen={(id) => onOpen(id, true)}
            reducedMotion={reducedMotion}
          />
        )}
      </div>

      {/* cake body */}
      <div className="relative w-full">
        <div className="absolute left-1/2 top-2 h-6 w-[86%] -translate-x-1/2 rounded-[50%] bg-black/30 blur-xl" />
        <div className="relative rounded-[18px] bg-gradient-to-b from-buttercream to-buttercream-dark px-5 pb-7 pt-5 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.55)]">
          <div className="h-2 w-full rounded-full bg-white/40" />
          <div className="mt-4 h-16 w-full rounded-[10px] bg-gradient-to-b from-buttercream-dark to-buttercream-darker sm:h-20" />
        </div>
        <div className="relative -mt-2 rounded-[16px] bg-gradient-to-b from-buttercream-darker to-[#C6AE87] px-6 pb-6 pt-4 shadow-[0_16px_30px_-8px_rgba(0,0,0,0.5)]">
          <div className="h-20 w-full rounded-[8px] bg-gradient-to-b from-[#C6AE87] to-[#B69A72] sm:h-24" />
        </div>
      </div>
    </div>
  );
}
