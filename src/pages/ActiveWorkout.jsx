import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { checkProgression, repStatusClass } from '../lib/progression'

export default function ActiveWorkout() {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [session, setSession] = useState(null)
  const [exercises, setExercises] = useState([]) // program_exercises for this day
  // setLogs: { [exerciseId]: [{set_number, actual_reps, weight, completed, id}] }
  const [setLogs, setSetLogs] = useState({})
  const [loading, setLoading] = useState(true)
  const [finishing, setFinishing] = useState(false)
  const [progressions, setProgressions] = useState([]) // shown after finish
  const [elapsed, setElapsed] = useState(0)
  const [editingCell, setEditingCell] = useState(null) // "exId-setNum-field"
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

    // Pre-populate set logs with current_weight and target reps
    const logs = {}
    for (const ex of exs || []) {
      logs[ex.id] = Array.from({ length: ex.sets }, (_, i) => ({
        set_number: i + 1,
        actual_reps: null,
        weight: parseFloat(ex.current_weight),
        completed: false,
        id: null, // no DB row yet
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
      // Can only complete if reps filled in
      if (set.actual_reps === null && !set.completed) {
        // Auto-fill with rep_max as a nudge
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
    const done = sets.filter((s) => s.completed).length
    return { done, total: sets.length }
  }

  function totalProgress() {
    let done = 0, total = 0
    for (const ex of exercises) {
      const p = exerciseProgress(ex.id)
      done += p.done; total += p.total
    }
    return { done, total }
  }

  async function finishWorkout() {
    setFinishing(true)
    try {
      // Save all completed sets
      const allLogs = []
      for (const ex of exercises) {
        const sets = setLogs[ex.id] || []
        for (const s of sets) {
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

      if (allLogs.length > 0) {
        await supabase.from('set_logs').insert(allLogs)
      }

      // Mark session complete
      await supabase
        .from('workout_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId)

      // Run progression check
      const completedSets = allLogs
      const progs = checkProgression(completedSets, exercises)

      // Apply weight increases
      for (const p of progs) {
        await supabase
          .from('program_exercises')
          .update({ current_weight: p.newWeight })
          .eq('id', p.exerciseId)
      }

      if (progs.length > 0) {
        setProgressions(progs)
      } else {
        navigate('/')
      }
    } catch (err) {
      alert(err.message)
      setFinishing(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-8 h-8 border-4 border-white/30 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Progression celebration screen
  if (progressions.length > 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Nice work!</h1>
        <p className="text-gray-400 mb-8">You hit new PRs — weights increased for next session:</p>
        <div className="w-full max-w-sm space-y-3 mb-10">
          {progressions.map((p) => (
            <div key={p.exerciseId} className="bg-gray-800 rounded-2xl px-5 py-4 text-left">
              <p className="text-white font-semibold">{p.exerciseName}</p>
              <p className="text-gray-200 text-sm mt-1">
                {p.oldWeight} → <span className="font-bold">{p.newWeight} {p.unit}</span>
                <span className="text-gray-500 ml-2">(+{p.newWeight - p.oldWeight})</span>
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-white text-white font-bold px-10 py-4 rounded-2xl text-base"
        >
          Done
        </button>
      </div>
    )
  }

  const { done, total } = totalProgress()
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-4 pt-12 pb-3 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => { if (confirm('Abandon workout?')) navigate('/') }}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-white font-bold">{session?.day_name}</h1>
            <p className="text-gray-400 text-xs">{formatTime(elapsed)}</p>
          </div>
          <button
            onClick={finishWorkout}
            disabled={finishing || done === 0}
            className="bg-white hover:bg-white active:bg-gray-200 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40"
          >
            {finishing ? '…' : 'Finish'}
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{done}/{total} sets</p>
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-4 py-4 pb-10 space-y-4 max-w-lg mx-auto w-full">
        {exercises.map((ex) => {
          const sets = setLogs[ex.id] || []
          const { done: exDone, total: exTotal } = exerciseProgress(ex.id)
          const allDone = exDone === exTotal && exTotal > 0
          return (
            <div
              key={ex.id}
              className={`bg-gray-800 rounded-2xl overflow-hidden border ${
                allDone ? 'border-white/15' : 'border-gray-700'
              }`}
            >
              {/* Exercise header */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="text-white font-semibold">{ex.name}</h3>
                  <p className="text-gray-400 text-xs">
                    {ex.sets} sets · {ex.rep_min}–{ex.rep_max} reps · {ex.current_weight} {ex.weight_unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {allDone && <span className="text-gray-200 text-lg">✓</span>}
                  <button
                    onClick={() => navigate(`/exercise/${ex.id}`)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Set table */}
              <div className="px-4 pb-4">
                {/* Column headers */}
                <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 mb-1 px-1">
                  <span className="col-span-1">SET</span>
                  <span className="col-span-4 text-center">WEIGHT</span>
                  <span className="col-span-4 text-center">REPS</span>
                  <span className="col-span-3 text-center">DONE</span>
                </div>

                {sets.map((set, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-1 items-center mb-1.5 rounded-xl px-1 py-1.5 transition-colors ${
                      set.completed ? 'bg-white/5' : 'bg-gray-700/40'
                    }`}
                  >
                    {/* Set number */}
                    <span className={`col-span-1 text-sm font-medium ${set.completed ? 'text-gray-200' : 'text-gray-400'}`}>
                      {idx + 1}
                    </span>

                    {/* Weight input */}
                    <div className="col-span-4 flex items-center justify-center">
                      <input
                        type="number"
                        value={set.weight ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'weight', e.target.value)}
                        className="w-full text-center bg-gray-700 text-white rounded-lg py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white"
                        placeholder={`${ex.current_weight}`}
                        step="2.5"
                        min="0"
                        inputMode="decimal"
                      />
                    </div>

                    {/* Reps input */}
                    <div className="col-span-4 flex items-center justify-center">
                      <input
                        type="number"
                        value={set.actual_reps ?? ''}
                        onChange={(e) => updateSet(ex.id, idx, 'actual_reps', e.target.value)}
                        className={`w-full text-center bg-gray-700 rounded-lg py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-white ${
                          set.actual_reps !== null
                            ? repStatusClass(set.actual_reps, ex.rep_min, ex.rep_max)
                            : 'text-gray-400'
                        }`}
                        placeholder={`${ex.rep_min}–${ex.rep_max}`}
                        min="0"
                        max="100"
                        inputMode="numeric"
                      />
                    </div>

                    {/* Complete toggle */}
                    <div className="col-span-3 flex justify-center">
                      <button
                        onClick={() => toggleComplete(ex.id, idx)}
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
                          set.completed
                            ? 'bg-white border-white/30 text-white'
                            : 'border-gray-600 text-transparent'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Progression hint */}
                {allDone && sets.every((s) => s.actual_reps >= ex.rep_max) && (
                  <p className="text-gray-200 text-xs mt-2 text-center">
                    🔥 All sets at max reps — weight goes up {ex.weight_increment}{ex.weight_unit} next session!
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Finish button (bottom) */}
      <div className="sticky bottom-0 px-4 py-4 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800 safe-bottom">
        <button
          onClick={finishWorkout}
          disabled={finishing || done === 0}
          className="w-full bg-white hover:bg-white active:bg-gray-200 disabled:opacity-40 text-white font-bold py-4 rounded-2xl text-base transition-colors"
        >
          {finishing ? 'Saving…' : `Finish Workout (${done}/${total} sets)`}
        </button>
      </div>
    </div>
  )
}
