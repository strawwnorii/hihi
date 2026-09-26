import { Link } from 'react-router-dom';
import { Flame } from '../components/Flame';

export function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-espresso px-6 text-center">
      {/* soft ambient glow behind the flame */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-flame/20 blur-3xl" />

      <div className="relative flex flex-col items-center gap-6">
        <Flame style="normal" lit reducedMotion={false} />

        <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
          A little something, lit for someone.
        </h1>

        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Hello! Welcome to this mini project I developed with the help of Claude AI. This
          website was made for a special person I have, and was meant to be a private project.
          But I decided to open it up so others can use it too.
        </p>

        <p className="max-w-sm text-sm leading-relaxed text-muted">
          Just hit me up on Instagram{' '}
          <a
            href="https://instagram.com/strawwnorii"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline underline-offset-4 hover:text-gold-light"
          >
            @strawwnorii
          </a>{' '}
          to get a custom link with a custom password made just for you.
        </p>

        <p className="font-display text-lg italic text-flame">Ty! 🕯️</p>

        <Link
          to="/admin"
          className="mt-6 text-xs text-muted underline underline-offset-4 hover:text-ink"
        >
          Admin login
        </Link>
      </div>
    </div>
  );
}
