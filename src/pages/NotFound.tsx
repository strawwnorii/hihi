import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-espresso px-6 text-center">
      <h1 className="font-display text-2xl italic text-ink">This link isn't quite right.</h1>
      <p className="max-w-xs text-sm text-muted">
        Make sure you're using the exact link someone sent you — it should look like
        /submit/something or /cake/something.
      </p>
      <Link to="/" className="text-xs text-muted underline underline-offset-4 hover:text-ink">
        Back to home
      </Link>
    </div>
  );
}
