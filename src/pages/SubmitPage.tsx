import { useState, type FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CandleCreatorForm } from '../components/CandleCreatorForm';
import { Candle } from '../components/Candle';
import { validateSubmission, sanitizeText, MAX_MESSAGE_LENGTH, MAX_NAME_LENGTH } from '../lib/sanitize';
import { submitMessage } from '../lib/cakeStore';
import { DEFAULT_CANDLE_DESIGN } from '../types';
import type { CandleDesign } from '../types';

export function SubmitPage() {
  const { slug = '' } = useParams();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [design, setDesign] = useState<CandleDesign>(DEFAULT_CANDLE_DESIGN);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationError = validateSubmission(name, message);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStatus('sending');
    const result = await submitMessage(slug, {
      sender: sanitizeText(name, MAX_NAME_LENGTH),
      message: sanitizeText(message, MAX_MESSAGE_LENGTH),
      candle: design,
    });
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong.');
      setStatus('idle');
      return;
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-espresso px-6 text-center">
        <div className="flex h-16 items-end justify-center">
          <Candle
            message={{ id: 'preview', sender: name, message, candle: design, read: false, createdAt: '' }}
            selected={false}
            onOpen={() => {}}
            reducedMotion={false}
            size="large"
          />
        </div>
        <h1 className="font-display text-2xl italic text-ink">Your candle is lit.</h1>
        <p className="max-w-xs text-sm text-muted">
          It'll appear on the cake for them to find. Thank you for taking the time.
        </p>
        <Link to={`/cake/${slug}`} className="mt-2 text-sm text-gold-light underline underline-offset-4">
          View the cake
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-espresso px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-xl">
        <p className="text-xs tracking-[0.15em] text-muted">leave a candle</p>
        <h1 className="mt-2 font-display text-3xl italic text-ink sm:text-4xl">Add your message to the cake</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Write a short note and design the candle it arrives on. It'll sit lit on the cake until they read it.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
          <div className="flex flex-col gap-5 sm:flex-row">
            <label className="flex flex-1 flex-col gap-2">
              <span className="text-xs tracking-wide text-muted">Your name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Alex"
                className="rounded-sm border border-white/15 bg-espresso-light px-3 py-2.5 text-ink placeholder:text-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs tracking-wide text-muted">Birthday message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MAX_MESSAGE_LENGTH}
              rows={5}
              placeholder="Happy birthday!"
              className="resize-none rounded-sm border border-white/15 bg-espresso-light px-3 py-2.5 text-ink placeholder:text-muted/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            />
            <span className="self-end text-[11px] text-muted">{message.length}/{MAX_MESSAGE_LENGTH}</span>
          </label>

          <div>
            <p className="mb-4 text-xs tracking-wide text-muted">Design your candle</p>
            <CandleCreatorForm design={design} onChange={setDesign} />
          </div>

          {error && <p className="text-sm text-flame">{error}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="self-start rounded-sm bg-flame/90 px-5 py-2.5 text-sm font-medium text-espresso-dark transition-colors hover:bg-flame disabled:opacity-60"
          >
            {status === 'sending' ? 'Lighting your candle…' : 'Light this candle'}
          </button>
        </form>
      </div>
    </div>
  );
}
