# Lift — Workout Tracker

Mobile-first progressive overload tracker. Built with React + Vite + Supabase, deployed on Vercel.

## Features

- **Program builder** — create multi-day programs with exercises, sets, rep ranges, and starting weights
- **Workout logger** — log every set in real time; inputs auto-fill with your current weight
- **Double progression** — when you hit the top of your rep range on ALL sets, weight auto-increases next session
- **Progress charts** — per-exercise weight-over-time chart with Recharts
- **History** — full session log with set-by-set breakdown

---

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the entire contents of `supabase/schema.sql`
3. Copy your **Project URL** and **anon public key** from Settings → API

### 2. Local development

```bash
git clone <your-repo>
cd workout-tracker
npm install

# Create env file
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm run dev
```

### 3. Deploy to Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy — Vercel auto-detects Vite

### 4. Mobile (add to home screen)

On iPhone: open the deployed URL in Safari → Share → **Add to Home Screen**

---

## Progressive Overload Logic

The app uses **double progression**:

| Step | What happens |
|------|-------------|
| You log a session | Sets are saved with actual reps and weight |
| On "Finish Workout" | App checks each exercise: did ALL sets hit `rep_max`? |
| If yes | `current_weight += weight_increment` is saved to the exercise |
| Next session | New weight is pre-filled in the logger |
| You see a 🎉 screen | Showing exactly which lifts went up and by how much |

### Configuring progression per exercise

In the Program Builder, each exercise has:
- **Min reps / Max reps** — your target rep range (e.g. 8–12)
- **+lbs on progress** — how much weight to add when you hit the top (e.g. 5 lbs upper body, 10 lbs lower body)

### Rep color coding in the logger

| Color | Meaning |
|-------|---------|
| 🟢 Green | At or above `rep_max` — ready to progress |
| 🟡 Yellow | Within range (`rep_min` to `rep_max`) |
| 🔴 Red | Below `rep_min` — weight may be too heavy |

---

## File structure

```
src/
├── context/AuthContext.jsx     Auth state + sign in/out helpers
├── lib/
│   ├── supabase.js             Supabase client
│   └── progression.js          Double progression logic
├── pages/
│   ├── Auth.jsx                Login / signup
│   ├── Dashboard.jsx           Today tab — pick a workout
│   ├── Programs.jsx            Program list
│   ├── ProgramBuilder.jsx      Create / edit programs
│   ├── ActiveWorkout.jsx       Live workout logger
│   ├── History.jsx             Past sessions
│   └── ExerciseProgress.jsx    Per-exercise chart
└── components/
    └── Layout.jsx              Bottom navigation shell
```

