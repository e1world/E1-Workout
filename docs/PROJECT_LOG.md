# E1 Move — Project Log

> Master record of every session, decision, and build. Updated at end of every session.

---

## Session 1 — 2026-07-20

### What was built

**Full app scaffolded from scratch** — React + Vite + Tailwind + Supabase + Vercel.

#### Project structure
- `package.json` — React 18, React Router v6, Recharts, Supabase JS client
- `vite.config.js`, `tailwind.config.js`, `postcss.config.js`
- `index.html` — PWA meta tags, no-zoom viewport, theme color, "E1 Move" title
- `.env.example` — documents required env vars

#### Database (Supabase)
- `supabase/schema.sql` — full schema with RLS policies and indexes
- Tables: `programs`, `program_days`, `program_exercises`, `workout_sessions`, `set_logs`
- Row Level Security: every table locked to `auth.uid()` — users only see their own data
- Indexes on all foreign keys and `started_at DESC` for history queries

#### Core library
- `src/lib/supabase.js` — Supabase client init from env vars
- `src/lib/progression.js` — **Double progression logic**:
  - `checkProgression()` — after a session, checks if all sets hit `rep_max`; if yes, returns list of exercises to increment
  - `progressionTip()` — human-readable tip shown in program builder
  - `repStatusClass()` — returns color class (white/yellow/red) based on reps vs range
- `src/context/AuthContext.jsx` — user session, signIn, signUp, signOut

#### Pages built
| Page | File | Description |
|------|------|-------------|
| Auth | `src/pages/Auth.jsx` | Login / signup, Supabase auth |
| Dashboard | `src/pages/Dashboard.jsx` | Today tab — picks workout day, shows "up next", last session |
| Programs | `src/pages/Programs.jsx` | List programs, activate/delete |
| Program Builder | `src/pages/ProgramBuilder.jsx` | Create/edit programs — days, exercises, rep ranges, weight increments |
| Active Workout | `src/pages/ActiveWorkout.jsx` | Live logger — log sets, auto-fill weight, toggle complete, finish + progression check |
| History | `src/pages/History.jsx` | Past sessions, expandable set-by-set breakdown |
| Exercise Progress | `src/pages/ExerciseProgress.jsx` | Per-exercise weight-over-time chart (Recharts), stats row |

#### Components
- `src/components/Layout.jsx` — shell with bottom nav (Today / Programs / History)
- `src/components/Avatar.jsx` — E1 monogram avatar (placeholder until custom illustration)

#### Routing (`src/App.jsx`)
- Protected routes via `<RequireAuth>` wrapper
- Active Workout (`/workout/:sessionId`) is full-screen, no bottom nav
- Auth redirects handled

### Program seeded via SQL
Full "E1 Workout Program #1" inserted directly into Supabase for user `1b138130-4f7f-4f58-8b6f-95e754b2e275`:
- Day 1: Legs Heavy (4 exercises)
- Day 2: Upper Push (4 exercises)
- Day 3: Run
- Day 4: Upper Pull (5 exercises)
- Day 5: Lower 2 (4 exercises)
- Day 6: Run
- Day 7: Recovery

### Deployment
- GitHub: `e1world/E1-Workout`
- Vercel: auto-deploys on push to `main`
- Supabase: project created, schema applied, auth configured
- Supabase Site URL set to Vercel production URL (fixes post-login redirect)
- Production URL: `e1-workout.vercel.app` (exact URL TBC)
- Added to iPhone home screen as PWA

### Design decisions
- **Double progression** chosen for hypertrophy focus: hit rep_max on all sets → weight auto-increases by `weight_increment` on next session
- Rep color coding during workout: off-white = at max, yellow = in range, red = below min
- **B&W / off-white palette** — `#141414` bg, `#f0ece4` text, no color accents
- No emojis anywhere in the UI
- `user-scalable=no` in viewport — feels like a native app

### Known issues / to-dos
- [ ] Avatar: placeholder E1 monogram — replace with custom line-art illustration when ready (prompt for Midjourney/Firefly ready)
- [ ] Active Workout: no rest timer between sets
- [ ] No body weight / bodyweight exercise support (weight = 0 stays 0)
- [ ] No notes field exposed in the workout logger UI
- [ ] Programs page: Edit route uses `:id` param but ProgramBuilder loads via edit mode — verify edit flow end-to-end
- [ ] Progression celebration screen uses "🎉" emoji — remove to match no-emoji rule
- [ ] Consider adding RPE (Rate of Perceived Exertion) field per set

---

## End-of-session prompt (copy-paste this every session)

```
Commit all uncommitted changes with an accurate message describing what changed. Push to origin/main. Then run git log --oneline for the full commit history. Cross-reference every commit against docs/PROJECT_LOG.md — identify anything built or changed in the code that is missing or incomplete in the log. Update PROJECT_LOG.md to fill in any gaps across all sessions and all time. Also update docs/E1-Move-Tech-Stack.md and any other briefing docs if anything in them is stale or incomplete. Don't rewrite entries that are already accurate — only add or correct what's missing. Be thorough, this is the master record for the whole project. Commit and push the updated docs when done.
```
