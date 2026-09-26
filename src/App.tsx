import { Routes, Route, Link } from 'react-router-dom';
import { CakePage } from './pages/CakePage';
import { SubmitPage } from './pages/SubmitPage';
import { AdminPage } from './pages/AdminPage';

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-espresso px-6 text-center">
      <p className="text-xs tracking-[0.2em] text-muted">a cake, lit for you</p>
      <h1 className="max-w-md font-display text-3xl italic text-ink sm:text-4xl">
        A birthday cake made of everyone who showed up for you
      </h1>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/cake/maria"
          className="rounded-sm bg-flame/90 px-5 py-2.5 text-sm font-medium text-espresso-dark hover:bg-flame"
        >
          View the demo cake
        </Link>
        <Link
          to="/submit/maria"
          className="rounded-sm border border-white/15 px-5 py-2.5 text-sm text-ink hover:border-white/30"
        >
          Leave a demo message
        </Link>
      </div>
      <Link to="/admin" className="mt-2 text-xs text-muted underline underline-offset-4 hover:text-ink">
        Creator sign in
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cake/:slug" element={<CakePage />} />
      <Route path="/submit/:slug" element={<SubmitPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
