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

### CSS design tokens (in `src/index.css`)
```
--bg          #141414   near-black background
--surface     #1c1c1c   card background
--surface-2   #242424   elevated surface
--surface-3   #2c2c2c   highlighted surface
--border      #2e2e2e   default border
--border-2    #3a3a3a   emphasized border
--text        #f0ece4   off-white / cream (primary + accent)
--text-2      #9a9a8a   warm mid-gray
--text-3      #525248   dimmed / labels
```

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
programs           — user's workout programs
program_days       — days within a program (Day 1, Day 2…)
program_exercises  — exercises per day (sets, rep_min, rep_max, weight, increment)
workout_sessions   — one row per completed workout
set_logs           — individual set results (reps, weight, completed)
```

---

## Infrastructure

| Service | Purpose | Notes |
|---------|---------|-------|
| GitHub | Source control | `e1world/E1-Workout`, branch: `main` |
| Vercel | Hosting + CI/CD | Auto-deploys on push to `main` |
| Supabase | DB + Auth hosting | Free tier |

### Environment variables (set in Vercel)
```
VITE_SUPABASE_URL       Supabase project URL
VITE_SUPABASE_ANON_KEY  Supabase publishable key
```

---

## Key logic

### Progressive overload — double progression (`src/lib/progression.js`)
1. Each exercise has `rep_min`, `rep_max`, `weight_increment`
2. After finishing a workout, `checkProgression()` checks every exercise
3. If all completed sets hit `>= rep_max` reps → exercise is flagged
4. `current_weight += weight_increment` is written back to `program_exercises`
5. Next session auto-fills the new higher weight
6. Celebration screen shows which lifts went up

### Auth flow
- `AuthContext` wraps the whole app
- `RequireAuth` component guards all routes except `/auth`
- Supabase handles session persistence via localStorage

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
