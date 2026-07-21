import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { checkProgression, repStatusClass } from '../lib/progression'

export default function ActiveWorkout() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([])
  const [setLogs, setSetLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [progressions, setProgressions] = useState([])
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const startRef = useRef(Date.now())

  useEffect(() => {
    loadWorkout()
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [])

  async function loadWorkout() {
    const { data: sess } = await supabase
      .from('workout_sessions')
      .select('*, program_days(*)')
      .eq('id', sessionId)
      .single()

    if (!sess) { navigate('/'); return }
    setSession(sess)

    const { data: exs } = await supabase
      .from('program_exercises')
      .select('*')
      .eq('program_day_id', sess.program_day_id)
      .order('exercise_order')

    setExercises(exs || [])

    const logs = {}
    for (const ex of exs || []) {
      logs[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        set_number: i + 1,
        actual_reps: null,
        weight: parseFloat(ex.current_weight),
        completed: false,
      }))
    }
    setSetLogs(logs)
    setLoading(false)
  }

  function updateSet(exerciseId, setIdx, field, value) {
    setSetLogs((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((s, i) =>
        i === setIdx ? { ...s, [field]: value === '' ? null : Number(value) } : s
      ),
    }))
  }

  function toggleComplete(exerciseId, setIdx) {
    setSetLogs((prev) => {
      const sets = [...prev[exerciseId]]
      const set = sets[setIdx]
      if (set.actual_reps === null && !set.completed) {
        const ex = exercises.find((e) => e.id === exerciseId)
        sets[setIdx] = { ...set, actual_reps: ex?.rep_max ?? set.actual_reps, completed: true }
      } else {
        sets[setIdx] = { ...set, completed: !set.completed }
      }
      return { ...prev, [exerciseId]: sets }
    })
  }

  function formatTime(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function exerciseProgress(exerciseId) {
    const sets = setLogs[exerciseId] || []
    return { done: sets.filter((s) => s.completed).length, total: sets.length }
  }

  function totalProgress() {
    let done = 0, total = 0
    for (const ex of exercises) {
      const p = exerciseProgress(ex.id)
      done += p.done; total += p.total
    }
    return { done, total }
  }

  const isRestDay = !loading && exercises.length === 0

  async function finishWorkout() {
    setFinishing(true)
    try {
      const allLogs = []
      for (const ex of exercises) {
        for (const s of setLogs[ex.id] || []) {
          if (s.completed) {
            allLogs.push({
              session_id: sessionId,
              program_exercise_id: ex.id,
              exercise_name: ex.name,
              set_number: s.set_number,
              target_reps: ex.rep_max,
              actual_reps: s.actual_reps,
              weight: s.weight,
              weight_unit: ex.weight_unit,
              completed: true,
            })
          }
        }
      }

      if (allLogs.length > 0) await supabase.from('set_logs').insert(allLogs)

      await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId)

      const progs = checkProgression(allLogs, exercises)
      for (const p of progs) {
        await supabase
          .from('program_exercises')
          .update({ current_weight: p.newWeight })
          .eq('id', p.exerciseId)
      }

      if (progs.length > 0) setProgressions(progs)
      else navigate('/')
    } catch (err) {
      alert(err.message)
      setFinishing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg)' }}>
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--text)', borderTopColor: 'transparent' }} />
    </div>
  )

  // Progression celebration
  if (progressions.length > 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--bg)' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Nice work.</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>Weights increased for next session:</p>
        <div className="w-full max-w-sm space-y-3 mb-10">
          {progressions.map((p) => (
            <div key={p.exerciseId} className="rounded-2xl px-5 py-4 text-left" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{p.exerciseName}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
                {p.oldWeight} <span style={{ color: 'var(--text-3)' }}>→</span> <span className="font-bold" style={{ color: 'var(--text)' }}>{p.newWeight} {p.unit}</span>
                <span className="ml-2" style={{ color: 'var(--text-3)' }}>(+{p.newWeight - p.oldWeight})</span>
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/')}
          className="font-bold px-10 py-4 rounded-2xl text-base"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          Done
        </button>
      </div>
    )
  }

  // Rest / run day — no exercises
  if (isRestDay) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
        <div className="sticky top-0 z-10 px-4 pt-12 pb-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <button onClick={() => { if (confirm('Abandon session?')) navigate('/') }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-2)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="text-center">
              <h1 className="font-bold" style={{ color: 'var(--text)' }}>{session?.day_name}</h1>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatTime(elapsed)}</p>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-4xl mb-4">—</p>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>{session?.day_name}</h2>
          <p className="text-sm mb-10" style={{ color: 'var(--text-3)' }}>No exercises — log this day as complete.</p>
          <button
            onClick={finishWorkout}
            disabled={finishing}
            className="font-bold px-10 py-4 rounded-2xl text-base disabled:opacity-40"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {finishing ? 'Saving...' : 'Mark Complete'}
          </button>
        </div>
      </div>
    )
  }

  const { done, total } = totalProgress()
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 pt-12 pb-3" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => { if (confirm('Abandon workout?')) navigate('/') }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-2)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="font-bold" style={{ color: 'var(--text)' }}>{session?.day_name}</h1>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>{formatTime(elapsed)}</p>
          </div>
          <button
            onClick={finishWorkout}
            disabled={finishing || done === 0}
            className="text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-30"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            {finishing ? '...' : 'Finish'}
          </button>
        </div>
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: 'var(--text)' }} />
        </div>
        <p className="text-right text-xs mt-1" style={{ color: 'var(--text-3)' }}>{done}/{total} sets</p>
      </div>

      {/* Exercises */}
      <div className="flex-1 px-4 py-4 pb-10 space-y-4 max-w-lg mx-auto w-full">
        {exercises.map((ex) => {
          const sets = setLogs[ex.id] || []
          const { done: exDone, total: exTotal } = exerciseProgress(ex.id)
          const allDone = exDone === exTotal && exTotal > 0
          return (
            <div key={ex.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface-2)', border: `1px solid ${allDone ? 'var(--border-2)' : 'var(--border)'}` }}>
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{ex.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {ex.sets} sets · {ex.rep_min}–{ex.rep_max} reps · {ex.current_weight} {ex.weight_unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {allDone && <span className="text-sm font-bold" style={{ color: 'var(--text-2)' }}>✓</span>}
                  <button onClick={() => navigate(`/exercise/${ex.id}`)} style={{ color: 'var(--text-3)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="grid grid-cols-12 gap-1 text-xs mb-1 px-1" style={{ color: 'var(--text-3)' }}>
                  <span className="col-span-1">SET</span>
                  <span className="col-span-4 text-center">WEIGHT</span>
                  <span className="col-span-4 text-center">REPS</span>
                  <span className="col-span-3 text-center">DONE</span>
                </div>

                {sets.map((set, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-1 items-center mb-1.5 rounded-xl px-1 py-1.5"
                    style={{ background: set.completed ? 'rgba(240,236,228,0.06)' : 'var(--surface-3)' }}
                  >
                    <span className="col-span-1 text-sm font-medium" style={{ color: set.completed ? 'var(--text)' : 'var(--text-3)' }}>
                      {idx + 1}
                    </span>

                    <div className="col-span-4">
                      <input
                        type="number"
                        value={set.weight ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'weight', e.target.value)}
                        className="w-full text-center rounded-lg py-1.5 text-sm focus:outline-none"
                        style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
                        placeholder={`${ex.current_weight}`}
                        step="2.5" min="0" inputMode="decimal"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        value={set.actual_reps ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'actual_reps', e.target.value)}
                        className={`w-full text-center rounded-lg py-1.5 text-sm focus:outline-none ${
                          set.actual_reps !== null ? repStatusClass(set.actual_reps, ex.rep_min, ex.rep_max) : ''
                        }`}
                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: set.actual_reps === null ? 'var(--text-3)' : undefined }}
                        placeholder={`${ex.rep_min}–${ex.rep_max}`}
                        min="0" max="100" inputMode="numeric"
                      />
                    </div>

                    <div className="col-span-3 flex justify-center">
                      <button
                        onClick={() => toggleComplete(ex.id, idx)}
                        className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-90"
                        style={{
                          background: set.completed ? 'var(--text)' : 'transparent',
                          borderColor: set.completed ? 'var(--text)' : 'var(--border-2)',
                          color: set.completed ? 'var(--bg)' : 'transparent',
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {allDone && sets.every((s) => s.actual_reps >= ex.rep_max) && (
                  <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-2)' }}>
                    All sets at max — weight increases {ex.weight_increment}{ex.weight_unit} next session
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom finish */}
      <div className="sticky bottom-0 px-4 py-4 safe-bottom" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={finishWorkout}
          disabled={finishing || done === 0}
          className="w-full font-bold py-4 rounded-2xl text-base disabled:opacity-30"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          {finishing ? 'Saving...' : `Finish Workout (${done}/${total} sets)`}
        </button>
      </div>
    </div>
  )
}
