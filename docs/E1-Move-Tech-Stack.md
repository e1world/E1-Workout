# E1 Move — Tech Stack

> Reference doc for every tool, library, and service in the project.

---

## Frontend

| Layer | Tool | Version | Notes |
|-------|------|---------|-------|
| Framework | React | 18.3 | Functional components, hooks only |
| Build tool | Vite | 5.2 | Fast HMR, auto-detects on Vercel |
| Routing | React Router | v6 | `<Routes>`, `<Outlet>`, `useNavigate` |
| Styling | Tailwind CSS | 3.4 | Utility classes + CSS custom properties for theme tokens |
| Charts | Recharts | 2.12 | LineChart on Exercise Progress page |
| Language | JavaScript (JSX) | ES modules | No TypeScript — kept simple |
| Font | Oxanium | Google Fonts | wght@300;400;600 — loaded in `index.html`; used for all UI headings, labels, codes |

### CSS design tokens (in `src/index.css`)
```
--bg          #141414   near-black background (also used as #0d0d0d inline in some panels)
--surface     #1c1c1c   card background
--surface-2   #242424   elevated surface
--surface-3   #2c2c2c   highlighted surface
--border      #2e2e2e   default border
--border-2    #3a3a3a   emphasized border
--text        #f0ece4   off-white / cream (primary + accent)
--text-2      #9a9a8a   warm mid-gray
--text-3      #525248   dimmed / labels
```

Note: many components apply styles inline (not via Tailwind) using these values directly.

---

## Backend

| Layer | Tool | Notes |
|-------|------|-------|
| Database | Supabase (PostgreSQL) | Hosted, managed |
| Auth | Supabase Auth | Email/password, session via `onAuthStateChange` |
| API | Supabase JS client | Auto-generated REST via `@supabase/supabase-js` |
| RLS | Supabase Row Level Security | All tables locked to `auth.uid()` |

### Database schema

```
programs           — user's workout programs (name, is_active)
program_days       — days within a program (day_number, name, day_type)
program_exercises  — exercises per day (sets, rep_min, rep_max, weight, weight_increment, order_index)
workout_sessions   — one row per completed or in-progress workout
set_logs           — individual set results (reps, weight, completed)
user_profiles      — user metadata: display_name, code, avatar_gender, goal, experience, onboarding_completed
```

#### user_profiles table (added Session 3)
```sql
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text,
  code text,                                          -- e.g. "E1", "B1" (first initial + "1")
  avatar_gender text default 'm' check (avatar_gender in ('m', 'f')),
  goal text check (goal in ('muscle_strength', 'endurance', 'general')),
  experience text check (experience in ('beginner', 'intermediate', 'advanced')),
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);
```
RLS: users can only read/write their own row.

---

## Application architecture

### Context providers
| Context | File | Provides |
|---------|------|---------|
| AuthContext | `src/context/AuthContext.jsx` | `user`, `signIn`, `signUp`, `signOut` |
| ProfileContext | `src/context/ProfileContext.jsx` | `profile`, `profileLoading`, `updateProfile`, `loadProfile` |

`ProfileProvider` wraps `AppRoutes` inside `AuthProvider` in `App.jsx`.

### Route / page structure
| Route | Component | Description |
|-------|-----------|-------------|
| `/auth` | `Auth.jsx` | Landing (red circle + two buttons) → login or signup form |
| `/` | `Dashboard.jsx` | Home screen — avatar illustration + 3 module cards |
| `/workout-picker` | `WorkoutPicker.jsx` | Day selection — shows program days, starts session |
| `/workout/:sessionId` | `ActiveWorkout.jsx` | Live workout logger, full-screen, no nav |
| `/progress` | `Progress.jsx` | Stats + history + progress photos placeholder |
| `/programs` | `Programs.jsx` | List/activate/delete programs |
| `/programs/new` | `ProgramBuilder.jsx` | Create a program |
| `/programs/:id/edit` | `ProgramBuilder.jsx` | Edit existing program |

Routes are guarded by `RequireAuth`. Onboarding is shown as an overlay when `user && !profile?.onboarding_completed`.

### Onboarding flow (`src/pages/Onboarding.jsx`)
Steps: `name → avatar → goal → experience → program → done`

- `makeCode(name)`: takes first character of name, uppercases it, appends "1" (e.g., Eli → E1)
- Goal options: `muscle_strength` / `endurance` / `general`
- Experience: `beginner` / `intermediate` / `advanced`
- Program bank: 4 pre-built programs; `filterPrograms(goal, experience)` selects subset
- On finish: upserts `user_profiles` with `onboarding_completed: true`, creates program rows

### Progressive overload — double progression (`src/lib/progression.js`)
1. Each exercise has `rep_min`, `rep_max`, `weight_increment`
2. After finishing a workout, `checkProgression()` checks every exercise
3. If all completed sets hit `>= rep_max` reps → exercise is flagged
4. `current_weight += weight_increment` is written back to `program_exercises`
5. Next session auto-fills the new higher weight

### Active Workout — swipeable exercise cards
Each exercise card is a horizontal scroll container:
- Left panel: exercise history (last 3 sessions)
- Right panel: live logging (default on mount)
- CSS scroll snap: `scrollSnapType: x mandatory`, panels `flex: 0 0 100%`
- `useEffect` sets `scrollLeft = scrollWidth / 2` on mount to start on live panel

### Auth flow
- `AuthContext` wraps the whole app
- `RequireAuth` component guards all routes except `/auth`
- Auth page: `mode` state controls `'landing' | 'login' | 'signup'` — three distinct views in one component

---

## PWA configuration

| File | Purpose |
|------|---------|
| `public/manifest.json` | Web app manifest — name "Move", standalone display, black theme |
| `public/icon-180.png` | Apple touch icon (180×180) |
| `public/icon-192.png` | PWA icon (192×192) |
| `public/icon-512.png` | PWA icon (512×512) |
| `index.html` | Links manifest, sets `apple-touch-icon-precomposed`, `theme-color: #000000` |

Icon design: large centered red circle (`#8b1a1a`) on near-black background (`#0d0d0d`).
Note: iOS adds its own depth/shadow to web clip (PWA) icons — this is system behavior and cannot be overridden without a native App Store app.

---

## Avatars / illustrations

| File | Description |
|------|-------------|
| `public/splash.png` | Male line-art figure on pure black background |
| `public/splash_f.png` | Female line-art figure (processed for black background via PIL) |

Both shown on Dashboard and during Onboarding avatar selection. Female avatar is mirrored in CSS (`transform: scaleX(-1)`) — no separate image needed. Sun position also flipped conditionally: right for male, left for female.

---

## Infrastructure

| Service | Purpose | Notes |
|---------|---------|-------|
| GitHub | Source control | `e1world/E1-Workout`, branch: `main` |
| Vercel | Hosting + CI/CD | Auto-deploys on push to `main` |
| Supabase | DB + Auth hosting | Free tier |

### Environment variables (set in Vercel + local `.env`)
```
VITE_SUPABASE_URL       Supabase project URL
VITE_SUPABASE_ANON_KEY  Supabase publishable key
```

---

## Local development

```bash
cd "E1 Workout"
npm install
cp .env.example .env   # fill in Supabase credentials
npm run dev            # http://localhost:5173
```

## Deploy
```bash
git add . && git commit -m "your message" && git push
# Vercel auto-deploys in ~60s
```

## End-of-session commit
```bash
# Run from your Mac Terminal (not the sandbox — no git credentials there)
cd ~/path/to/E1\ Workout
rm -f .git/index.lock .git/HEAD.lock   # clear locks if needed
git push origin main
```
