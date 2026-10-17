import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CakePage } from './CakePage';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

// Signed-in creators only: shows the cake exactly as the recipient will see
// it, without the password or countdown, and without saving read progress.
export function AdminPreview() {
  const [signedIn, setSignedIn] = useState<boolean | null>(isSupabaseConfigured ? null : true);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase!.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);

  if (signedIn === null) {
    return <div className="flex min-h-screen items-center justify-center bg-espresso text-muted">Loading&hellip;</div>;
  }
  if (!signedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-espresso px-6 text-center">
        <p className="font-display text-xl italic text-ink">Sign in to preview this cake.</p>
        <Link to="/admin" className="text-sm text-gold-light underline underline-offset-4">
          Go to admin sign in
        </Link>
      </div>
    );
  }
  return <CakePage preview />;
}
