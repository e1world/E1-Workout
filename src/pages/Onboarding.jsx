import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'

// ── Program bank ─────────────────────────────────────────────────────────────

const PROGRAMS = [
  {
    id: 'fullbody',
    name: 'Full Body 3×/week',
    description: 'Every muscle every session. Best starting point for building a foundation.',
    days: 3,
    tags: ['beginner', 'general', 'strength', 'hypertrophy'],
    days_data: [
      { name: 'Day A', exercises: [
        { name: 'Squat', sets: 3, rep_min: 5, rep_max: 8, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bench Press', sets: 3, rep_min: 5, rep_max: 8, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Barbell Row', sets: 3, rep_min: 5, rep_max: 8, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Overhead Press', sets: 2, rep_min: 8, rep_max: 12, current_weight: 35, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Day B', exercises: [
        { name: 'Deadlift', sets: 2, rep_min: 5, rep_max: 5, current_weight: 95, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Overhead Press', sets: 3, rep_min: 5, rep_max: 8, current_weight: 35, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Pull-up / Lat Pulldown', sets: 3, rep_min: 6, rep_max: 10, current_weight: 0, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bicep Curl', sets: 2, rep_min: 10, rep_max: 15, current_weight: 20, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Day C', exercises: [
        { name: 'Squat', sets: 3, rep_min: 5, rep_max: 8, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bench Press', sets: 3, rep_min: 5, rep_max: 8, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Barbell Row', sets: 3, rep_min: 5, rep_max: 8, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Tricep Pushdown', sets: 2, rep_min: 10, rep_max: 15, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
      ]},
    ],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower 4×/week',
    description: 'Hit each muscle twice a week. Optimal blend of volume and recovery for hypertrophy.',
    days: 4,
    tags: ['beginner', 'intermediate', 'hypertrophy', 'general'],
    days_data: [
      { name: 'Upper A', exercises: [
        { name: 'Bench Press', sets: 4, rep_min: 8, rep_max: 12, current_weight: 95, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Barbell Row', sets: 4, rep_min: 8, rep_max: 12, current_weight: 95, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Overhead Press', sets: 3, rep_min: 8, rep_max: 12, current_weight: 65, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bicep Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Tricep Pushdown', sets: 3, rep_min: 10, rep_max: 15, current_weight: 40, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Lower A', exercises: [
        { name: 'Squat', sets: 4, rep_min: 8, rep_max: 12, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Romanian Deadlift', sets: 3, rep_min: 10, rep_max: 12, current_weight: 95, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Leg Press', sets: 3, rep_min: 10, rep_max: 15, current_weight: 180, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Calf Raise', sets: 4, rep_min: 15, rep_max: 20, current_weight: 100, weight_unit: 'lbs', weight_increment: 10 },
      ]},
      { name: 'Upper B', exercises: [
        { name: 'Incline DB Press', sets: 4, rep_min: 10, rep_max: 15, current_weight: 45, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Cable Row', sets: 4, rep_min: 10, rep_max: 15, current_weight: 80, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Lateral Raise', sets: 4, rep_min: 12, rep_max: 20, current_weight: 15, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Face Pull', sets: 3, rep_min: 15, rep_max: 20, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Hammer Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 25, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Lower B', exercises: [
        { name: 'Leg Press', sets: 4, rep_min: 10, rep_max: 15, current_weight: 180, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Hip Thrust', sets: 4, rep_min: 10, rep_max: 15, current_weight: 95, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Leg Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 70, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Walking Lunge', sets: 3, rep_min: 10, rep_max: 15, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Calf Raise', sets: 4, rep_min: 15, rep_max: 20, current_weight: 100, weight_unit: 'lbs', weight_increment: 10 },
      ]},
    ],
  },
  {
    id: 'ppl',
    name: 'Push Pull Legs 6×/week',
    description: 'Maximum frequency and volume. Each muscle group twice a week. For the dedicated.',
    days: 6,
    tags: ['intermediate', 'advanced', 'hypertrophy'],
    days_data: [
      { name: 'Push', exercises: [
        { name: 'Bench Press', sets: 4, rep_min: 6, rep_max: 10, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Overhead Press', sets: 3, rep_min: 8, rep_max: 12, current_weight: 85, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Incline DB Press', sets: 3, rep_min: 10, rep_max: 15, current_weight: 50, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Lateral Raise', sets: 4, rep_min: 15, rep_max: 20, current_weight: 20, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Tricep Pushdown', sets: 3, rep_min: 12, rep_max: 15, current_weight: 50, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Pull', exercises: [
        { name: 'Deadlift', sets: 3, rep_min: 5, rep_max: 8, current_weight: 185, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Pull-up', sets: 4, rep_min: 6, rep_max: 10, current_weight: 0, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Cable Row', sets: 4, rep_min: 10, rep_max: 12, current_weight: 120, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Face Pull', sets: 3, rep_min: 15, rep_max: 20, current_weight: 40, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bicep Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 35, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Legs', exercises: [
        { name: 'Squat', sets: 4, rep_min: 6, rep_max: 10, current_weight: 185, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Romanian Deadlift', sets: 3, rep_min: 10, rep_max: 12, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Leg Press', sets: 3, rep_min: 10, rep_max: 15, current_weight: 270, weight_unit: 'lbs', weight_increment: 20 },
        { name: 'Leg Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 80, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Calf Raise', sets: 5, rep_min: 15, rep_max: 20, current_weight: 135, weight_unit: 'lbs', weight_increment: 10 },
      ]},
      { name: 'Push 2', exercises: [
        { name: 'Incline Bench Press', sets: 4, rep_min: 8, rep_max: 12, current_weight: 115, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'DB Shoulder Press', sets: 3, rep_min: 10, rep_max: 15, current_weight: 40, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Cable Fly', sets: 3, rep_min: 12, rep_max: 15, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Lateral Raise', sets: 4, rep_min: 15, rep_max: 20, current_weight: 20, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Overhead Tricep Extension', sets: 3, rep_min: 12, rep_max: 15, current_weight: 60, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Pull 2', exercises: [
        { name: 'Barbell Row', sets: 4, rep_min: 8, rep_max: 12, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Lat Pulldown', sets: 4, rep_min: 10, rep_max: 15, current_weight: 100, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Seated Row', sets: 3, rep_min: 12, rep_max: 15, current_weight: 100, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Rear Delt Fly', sets: 3, rep_min: 15, rep_max: 20, current_weight: 15, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Hammer Curl', sets: 3, rep_min: 12, rep_max: 15, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Legs 2', exercises: [
        { name: 'Leg Press', sets: 4, rep_min: 10, rep_max: 15, current_weight: 270, weight_unit: 'lbs', weight_increment: 20 },
        { name: 'Hip Thrust', sets: 4, rep_min: 10, rep_max: 12, current_weight: 135, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Bulgarian Split Squat', sets: 3, rep_min: 10, rep_max: 15, current_weight: 40, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Leg Curl', sets: 4, rep_min: 12, rep_max: 15, current_weight: 80, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Calf Raise', sets: 5, rep_min: 15, rep_max: 20, current_weight: 135, weight_unit: 'lbs', weight_increment: 10 },
      ]},
    ],
  },
  {
    id: 'strength',
    name: 'Strength 4×/week',
    description: 'Built around the big lifts. Progressive overload on squat, deadlift, bench, and press.',
    days: 4,
    tags: ['intermediate', 'advanced', 'strength'],
    days_data: [
      { name: 'Squat Day', exercises: [
        { name: 'Squat', sets: 5, rep_min: 3, rep_max: 5, current_weight: 185, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Romanian Deadlift', sets: 3, rep_min: 8, rep_max: 10, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Leg Press', sets: 3, rep_min: 10, rep_max: 15, current_weight: 225, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Leg Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 70, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Press Day', exercises: [
        { name: 'Overhead Press', sets: 5, rep_min: 3, rep_max: 5, current_weight: 95, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bench Press', sets: 3, rep_min: 6, rep_max: 10, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Barbell Row', sets: 3, rep_min: 6, rep_max: 10, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Tricep Pushdown', sets: 3, rep_min: 10, rep_max: 15, current_weight: 50, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Deadlift Day', exercises: [
        { name: 'Deadlift', sets: 5, rep_min: 3, rep_max: 5, current_weight: 225, weight_unit: 'lbs', weight_increment: 10 },
        { name: 'Squat', sets: 3, rep_min: 6, rep_max: 10, current_weight: 135, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Pull-up', sets: 3, rep_min: 6, rep_max: 10, current_weight: 0, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Face Pull', sets: 3, rep_min: 15, rep_max: 20, current_weight: 40, weight_unit: 'lbs', weight_increment: 5 },
      ]},
      { name: 'Bench Day', exercises: [
        { name: 'Bench Press', sets: 5, rep_min: 3, rep_max: 5, current_weight: 155, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Overhead Press', sets: 3, rep_min: 6, rep_max: 10, current_weight: 75, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Barbell Row', sets: 5, rep_min: 5, rep_max: 8, current_weight: 155, weight_unit: 'lbs', weight_increment: 5 },
        { name: 'Bicep Curl', sets: 3, rep_min: 10, rep_max: 15, current_weight: 30, weight_unit: 'lbs', weight_increment: 5 },
      ]},
    ],
  },
]

function filterPrograms(goal, experience) {
  return PROGRAMS.filter((p) => {
    const matchesGoal =
      goal === 'muscle_strength' ? p.tags.some((t) => ['hypertrophy', 'strength'].includes(t)) :
      goal === 'endurance'       ? p.tags.some((t) => ['general', 'endurance'].includes(t)) :
      p.tags.includes('general') || p.tags.includes('beginner')
    const matchesExp = experience === 'intermediate'
      ? p.tags.some((t) => ['beginner', 'intermediate'].includes(t))
      : p.tags.includes(experience)
    return matchesGoal && matchesExp
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeCode(name) {
  const first = name.trim()[0]?.toUpperCase()
  return first ? `${first}1` : ''
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding({ onComplete }) {
  const { user } = useAuth()
  const { updateProfile } = useProfile()

  const [step, setStep] = useState(0)
  const [avatar, setAvatar] = useState(null)      // 'm' | 'f'
  const [name, setName] = useState('')
  const [goal, setGoal] = useState(null)
  const [experience, setExperience] = useState(null)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [saving, setSaving] = useState(false)

  const STEPS = ['name', 'avatar', 'goal', 'experience', 'program', 'done']
  const totalSteps = STEPS.length - 1 // don't count 'done'
  const code = makeCode(name)

  async function finish() {
    setSaving(true)
    try {
      // Save profile
      await updateProfile({
        display_name: name.trim(),
        code,
        avatar_gender: avatar,
        goal,
        experience,
        onboarding_completed: true,
      })

      // Create the selected program
      if (selectedProgram) {
        // Deactivate any existing programs
        await supabase.from('programs').update({ is_active: false }).eq('user_id', user.id)

        const { data: prog } = await supabase
          .from('programs')
          .insert({ name: selectedProgram.name, user_id: user.id, is_active: true })
          .select().single()

        for (let i = 0; i < selectedProgram.days_data.length; i++) {
          const day = selectedProgram.days_data[i]
          const { data: insertedDay } = await supabase
            .from('program_days')
            .insert({ program_id: prog.id, day_order: i + 1, name: day.name })
            .select().single()

          if (day.exercises.length > 0) {
            await supabase.from('program_exercises').insert(
              day.exercises.map((ex, j) => ({
                program_day_id: insertedDay.id,
                exercise_order: j + 1,
                name: ex.name,
                sets: ex.sets,
                rep_min: ex.rep_min,
                rep_max: ex.rep_max,
                current_weight: ex.current_weight,
                weight_unit: ex.weight_unit,
                weight_increment: ex.weight_increment,
              }))
            )
          }
        }
      }

      onComplete()
    } catch (err) {
      alert(err.message)
      setSaving(false)
    }
  }

  const current = STEPS[step]

  return (
    <div style={{ background: '#000', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingTop: 'env(safe-area-inset-top, 0)' }}>

      {/* Progress bar (not on done step) */}
      {current !== 'done' && (
        <div style={{ padding: '16px 24px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {STEPS.slice(0, totalSteps).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 2, borderRadius: 1,
                background: i <= step ? '#f0ece4' : '#2e2e2e',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Name ── */}
      {current === 'name' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 40px' }}>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '32px', color: '#f0ece4', margin: '0 0 8px', letterSpacing: '0.02em' }}>What's your name?</h1>
          <p style={{ fontSize: '13px', color: '#525248', margin: '0 0 40px' }}>We'll generate your E1 code from it.</p>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="First name"
            autoFocus
            style={{
              background: '#111', border: '1px solid #2e2e2e', borderRadius: '12px',
              padding: '16px 18px', fontSize: '24px', color: '#f0ece4',
              fontFamily: "'Oxanium', sans-serif", fontWeight: 300,
              outline: 'none', width: '100%', letterSpacing: '0.04em',
            }}
          />

          {code && (
            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '13px', color: '#525248', letterSpacing: '0.1em' }}>YOUR CODE</span>
              <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '42px', fontWeight: 300, color: '#f0ece4', letterSpacing: '0.06em' }}>{code}</span>
            </div>
          )}

          <div style={{ marginTop: 'auto' }}>
            <button
              onClick={() => setStep(1)}
              disabled={!name.trim()}
              style={{
                width: '100%', padding: '16px',
                background: name.trim() ? '#f0ece4' : '#1c1c1c',
                color: name.trim() ? '#000' : '#525248',
                border: 'none', borderRadius: '14px',
                fontFamily: "'Oxanium', sans-serif", fontSize: '15px',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s, color 0.2s',
              }}
            >Continue</button>
          </div>
        </div>
      )}

      {/* ── Step: Avatar ── */}
      {current === 'avatar' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 40px' }}>
          <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#525248', margin: '0 0 8px' }}>E1 Movement</p>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '32px', color: '#f0ece4', margin: '0 0 32px', letterSpacing: '0.02em' }}>Choose your avatar</h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
            {[
              { key: 'm', src: '/splash.png', label: 'Male' },
              { key: 'f', src: '/splash_f.png', label: 'Female' },
            ].map(({ key, src, label }) => (
              <button
                key={key}
                onClick={() => { setAvatar(key); setStep(2) }}
                style={{
                  background: avatar === key ? '#1c1c1c' : '#0d0d0d',
                  border: `2px solid ${avatar === key ? '#f0ece4' : '#2e2e2e'}`,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  transition: 'border-color 0.2s',
                  padding: 0,
                }}
              >
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '200px' }}>
                  <img
                    src={src}
                    alt={label}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                  />
                  <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', minHeight: '200px', background: '#111' }}>
                    <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '48px', fontWeight: 300, color: '#2e2e2e' }}>{key.toUpperCase()}</p>
                  </div>
                </div>
                <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '11px', letterSpacing: '0.16em', textTransform: 'uppercase', color: avatar === key ? '#f0ece4' : '#525248', padding: '12px', margin: 0 }}>{label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step: Goal ── */}
      {current === 'goal' && (
        <PickStep
          title="What's your primary goal?"
          subtitle="This shapes your program recommendations."
          options={[
            { key: 'muscle_strength', label: 'Build muscle & strength', sub: 'Hypertrophy and strength combined' },
            { key: 'endurance', label: 'Endurance', sub: 'Conditioning and work capacity' },
            { key: 'general', label: 'General fitness', sub: 'Balanced strength and health' },
          ]}
          selected={goal}
          onSelect={(k) => { setGoal(k); setStep(3) }}
        />
      )}

      {/* ── Step: Experience ── */}
      {current === 'experience' && (
        <PickStep
          title="How long have you been training?"
          subtitle="Be honest — the right program makes all the difference."
          options={[
            { key: 'beginner', label: 'New to this', sub: 'Less than 1 year of consistent training' },
            { key: 'intermediate', label: 'Some experience', sub: '1–3 years, comfortable with the basics' },
            { key: 'advanced', label: 'Veteran', sub: '3+ years, know the lifts well' },
          ]}
          selected={experience}
          onSelect={(k) => { setExperience(k); setStep(4) }}
        />
      )}

      {/* ── Step: Program ── */}
      {current === 'program' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '32px 24px 32px', overflow: 'hidden' }}>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '28px', color: '#f0ece4', margin: '0 0 4px', letterSpacing: '0.02em', flexShrink: 0 }}>Choose a program</h1>
          <p style={{ fontSize: '13px', color: '#525248', margin: '0 0 20px', flexShrink: 0 }}>Matched to your goal and experience.</p>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px' }}>
            {filterPrograms(goal, experience).map((prog) => (
              <button
                key={prog.id}
                onClick={() => setSelectedProgram(prog)}
                style={{
                  textAlign: 'left', background: selectedProgram?.id === prog.id ? '#1c1c1c' : '#0d0d0d',
                  border: `2px solid ${selectedProgram?.id === prog.id ? '#f0ece4' : '#2e2e2e'}`,
                  borderRadius: '14px', padding: '16px 18px',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '16px', fontWeight: 400, color: '#f0ece4', margin: 0 }}>{prog.name}</p>
                  <span style={{ fontSize: '11px', color: '#525248', flexShrink: 0, marginLeft: '8px' }}>{prog.days}×/week</span>
                </div>
                <p style={{ fontSize: '13px', color: '#9a9a8a', margin: '0 0 10px' }}>{prog.description}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {prog.days_data.map((d) => (
                    <span key={d.name} style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#525248', background: '#1c1c1c', border: '1px solid #2e2e2e', borderRadius: '4px', padding: '2px 6px' }}>
                      {d.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(5)}
            disabled={!selectedProgram}
            style={{
              flexShrink: 0, width: '100%', padding: '16px',
              background: selectedProgram ? '#f0ece4' : '#1c1c1c',
              color: selectedProgram ? '#000' : '#525248',
              border: 'none', borderRadius: '14px',
              fontFamily: "'Oxanium', sans-serif", fontSize: '15px',
              cursor: selectedProgram ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            {selectedProgram ? `Start with ${selectedProgram.name}` : 'Select a program'}
          </button>
        </div>
      )}

      {/* ── Step: Done ── */}
      {current === 'done' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: '100%', height: '30vh', overflow: 'hidden', marginBottom: '32px' }}>
            <img
              src={avatar === 'f' ? '/splash_f.png' : '/splash.png'}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, #000)' }} />
          </div>

          <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#525248', margin: '0 0 8px' }}>Welcome</p>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '64px', color: '#f0ece4', margin: '0 0 8px', letterSpacing: '0.06em', lineHeight: 1 }}>{code}</h1>
          <p style={{ fontSize: '14px', color: '#9a9a8a', margin: '0 0 48px' }}>
            {selectedProgram?.name} · {goal} · {experience}
          </p>

          <button
            onClick={finish}
            disabled={saving}
            style={{
              width: '100%', padding: '18px',
              background: '#f0ece4', color: '#000',
              border: 'none', borderRadius: '14px',
              fontFamily: "'Oxanium', sans-serif", fontSize: '16px',
              letterSpacing: '0.06em', cursor: 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Setting up…' : "Let's go"}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Reusable pick step ────────────────────────────────────────────────────────

function PickStep({ title, subtitle, options, selected, onSelect }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 40px' }}>
      <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '28px', color: '#f0ece4', margin: '0 0 6px', letterSpacing: '0.02em' }}>{title}</h1>
      <p style={{ fontSize: '13px', color: '#525248', margin: '0 0 28px' }}>{subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSelect(opt.key)}
            style={{
              textAlign: 'left',
              background: selected === opt.key ? '#1c1c1c' : '#0d0d0d',
              border: `2px solid ${selected === opt.key ? '#f0ece4' : '#2e2e2e'}`,
              borderRadius: '14px', padding: '16px 18px',
              cursor: 'pointer', transition: 'border-color 0.15s',
            }}
          >
            <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '16px', color: '#f0ece4', margin: '0 0 3px', letterSpacing: '0.02em' }}>{opt.label}</p>
            <p style={{ fontSize: '12px', color: '#525248', margin: 0 }}>{opt.sub}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
