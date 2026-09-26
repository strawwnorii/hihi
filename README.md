# A cake, lit for you

An interactive birthday page: friends leave messages that appear as personalized candles on a cake. The recipient reads them one at a time by "blowing out" each candle. Once every candle is read, one final, hidden message — from whoever made the cake — unlocks.

Runs entirely on mock data out of the box. Supabase is optional and only needed once you want real persistence and a shareable link that works for anyone.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Try:

- `/cake/maria` — the demo cake, pre-populated with 9 messages and one locked final message
- `/submit/maria` — the candle-creation form
- `/admin` — the creator dashboard

In mock mode there's no real database: submitted messages live in memory for the current browser tab (refreshing resets them), and read state is saved to `localStorage`, so closing and reopening the tab keeps your progress on `/cake/maria`. This is enough to fully feel out the experience before wiring up Supabase.

## 2. Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run everything in `supabase/schema.sql`. This creates the `cakes`, `messages`, and `read_state` tables and their Row Level Security policies.
3. In your Supabase project settings, find your Project URL and anon/public API key.
4. Copy `.env.example` to `.env.local` and fill in both values:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Restart `npm run dev`. The app now reads/writes Supabase instead of mock data — nothing else changes, because every component talks to `src/lib/cakeStore.ts`, which picks the backend automatically based on whether those env vars are set.
6. In Supabase Auth settings, make sure email OTP / magic link sign-in is enabled (it is by default) — that's how you'll sign in to `/admin`.

## 3. Create a birthday cake

1. Go to `/admin` and sign in with your email (you'll get a magic link — no password).
2. Click **+ New cake** and fill in:
   - the link slug (e.g. `maria` → `/cake/maria`)
   - the recipient's name and an optional cake title
   - your name and your hidden final message
3. Save. You'll see the cake in your list with **Copy submit link** and **Copy cake link** buttons.

## 4. How friends submit messages

Send friends the **submit link** (`/submit/<slug>`), not the cake link. They:

1. Enter their name and message.
2. Design their candle — shape, color, pattern, and flame — with a live preview.
3. Submit. No account needed.

Their message immediately appears as a new lit candle on the cake.

## 5. How read/unread state works

The recipient never signs in either — the cake link itself is what they're trusted with, the same way an unlisted Google Doc link works. So "which candles has this person already read" is tracked per **device**, not per account:

- The first time anyone opens a cake page, a random device ID is generated and saved to `localStorage`.
- Reading a message (pressing **Blow out candle**) marks that message read against that device ID — in `localStorage` in mock mode, or in the `read_state` table in Supabase mode.
- Reopening the same cake link on the same device later shows the same candles as unlit. Opening it on a *different* device shows every candle lit again, since read state doesn't follow the recipient, it follows the browser.

This is a deliberate trade-off, documented in `supabase/schema.sql`: because there's no login, Supabase's Row Level Security can't cryptographically verify "this device owns this read row." The practical risk is low — at worst, someone with the link could mark a candle read that isn't theirs to touch — but if you need a real guarantee, put the whole cake behind Supabase Auth for the recipient too.

The final message stays locked until every normal message's `read` state is true, and once unlocked it stays unlocked (it's a `finalUnlocked` flag that only ever flips one direction, checked against all-messages-read on each load).

## 6. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Import it in [Vercel](https://vercel.com/new).
3. Vercel auto-detects Vite — no config needed. Framework preset: "Vite".
4. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Environment Variables in the Vercel project settings (Project → Settings → Environment Variables), matching `.env.local`.
5. Deploy. Because routes like `/cake/maria` are client-side (React Router), Vercel's default static handling for Vite already serves `index.html` for unknown paths correctly — no extra rewrite config needed for the standard Vercel + Vite integration.

## Project structure

```
src/
  components/     Cake, Candle, CandleBody, Flame, Smoke, modal, forms, progress
  pages/          CakePage (recipient), SubmitPage (friends), AdminPage (creator)
  lib/            cakeStore (mock/Supabase switch), adminStore, supabase client,
                  device-scoped read state, sanitization/validation
  data/           mock cake + demo messages
  hooks/          reduced-motion + synthesized sound effects
supabase/
  schema.sql      tables + RLS policies, with reasoning in comments
```

## Notes on some choices

- **Sound** is synthesized in the browser (`src/hooks/useSound.ts`) rather than shipped as audio files, so there's nothing to host — and it's off until the recipient taps the toggle, per browser autoplay rules.
- **Reduced motion** is respected globally: flicker, smoke, and the final reveal all shorten to simple fades when the OS-level `prefers-reduced-motion` is set.
- **Spam/validation** on submissions is client-side UX only (`src/lib/sanitize.ts`). The actual security boundary is Supabase RLS plus the `check` constraints in `schema.sql` — never trust the client.
