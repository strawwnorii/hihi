import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-espresso px-6 text-center">
      <h1 className="font-display text-3xl italic text-ink">A candle, lit for someone.</h1>
      <p className="max-w-sm text-sm text-muted">
        This is a small birthday cake page — friends light a candle with a message, and the
        birthday person unwraps them one by one. You'll need a link from whoever's cake it is to
        add a message or view one.
      </p>
      <p className="max-w-sm text-xs text-muted">
        Got a submit link? Open it directly — this page can't guess which cake you mean.
      </p>
      <Link to="/admin" className="mt-4 text-xs text-muted underline underline-offset-4 hover:text-ink">
        Admin login
      </Link>
    </div>
  );
}
