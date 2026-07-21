import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { progressionTip } from '../lib/progression'

const DEFAULT_EXERCISE = {
  name: '',
  sets: 3,
  rep_min: 8,
  rep_max: 12,
  current_weight: 0,
  weight_unit: 'lbs',
  weight_increment: 5,
  notes: '',
}

export default function ProgramBuilder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams() // edit mode if id present

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [days, setDays] = useState([])          // [{name, exercises:[...]}]
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!id)
  const [expandedDay, setExpandedDay] = useState(0)
  const [expandedExercise, setExpandedExercise] = useState(null) // "dayIdx-exIdx"

  useEffect(() => {
    if (id) loadProgram()
  }, [id])

  async function loadProgram() {
    const { data: prog } = await supabase
      .from('programs')
      .select(`*, program_days(*, program_exercises(*))`)
      .eq('id', id)
      .single()

    if (!prog) { navigate('/programs'); return }

    setName(prog.name)
    setDescription(prog.description || '')
    setIsActive(prog.is_active)

    const loadedDays = (prog.program_days || [])
      .sort((a, b) => a.day_order - b.day_order)
      .map((d) => ({
        id: d.id,
        name: d.name,
        exercises: (d.program_exercises || [])
          .sort((a, b) => a.exercise_order - b.exercise_order)
          .map((ex) => ({ ...DEFAULT_EXERCISE, ...ex })),
      }))
    setDays(loadedDays)
    setLoading(false)
  }

  function addDay() {
    const newDays = [...days, { name: `Day ${days.length + 1}`, exercises: [] }]
    setDays(newDays)
    setExpandedDay(newDays.length - 1)
  }

  function removeDay(idx) {
    setDays(days.filter((_, i) => i !== idx))
  }

  function updateDayName(idx, val) {
    const d = [...days]; d[idx] = { ...d[idx], name: val }; setDays(d)
  }

  function addExercise(dayIdx) {
    const d = [...days]
    d[dayIdx] = { ...d[dayIdx], exercises: [...d[dayIdx].exercises, { ...DEFAULT_EXERCISE }] }
    setDays(d)
    setExpandedExercise(`${dayIdx}-${d[dayIdx].exercises.length - 1}`)
  }

  function removeExercise(dayIdx, exIdx) {
    const d = [...days]
    d[dayIdx].exercises = d[dayIdx].exercises.filter((_, i) => i !== exIdx)
    setDays(d)
  }

  function updateExercise(dayIdx, exIdx, field, value) {
    const d = [...days]
    d[dayIdx].exercises[exIdx] = { ...d[dayIdx].exercises[exIdx], [field]: value }
    setDays(d)
  }

  async function save() {
    if (!name.trim()) { alert('Program name is required'); return }
    if (days.length === 0) { alert('Add at least one day'); return }
    setSaving(true)
    try {
      let programId = id

      if (id) {
        // Update program
        await supabase.from('programs').update({ name, description, is_active: isActive }).eq('id', id)

        // Delete existing days (cascade deletes exercises)
        await supabase.from('program_days').delete().eq('program_id', id)
      } else {
        // If activating this program, deactivate others first
        if (isActive) {
          await supabase.from('programs').update({ is_active: false }).eq('user_id', user.id)
        }
        const { data: prog } = await supabase
          .from('programs')
          .insert({ name, description, user_id: user.id, is_active: isActive })
          .select()
          .single()
        programId = prog.id
      }

      // Insert days
      for (let i = 0; i < days.length; i++) {
        const day = days[i]
        const { data: insertedDay } = await supabase
          .from('program_days')
          .insert({ program_id: programId, day_order: i + 1, name: day.name })
          .select()
          .single()

        // Insert exercises
        if (day.exercises.length > 0) {
          await supabase.from('program_exercises').insert(
            day.exercises.map((ex, j) => ({
              program_day_id: insertedDay.id,
              exercise_order: j + 1,
              name: ex.name,
              sets: Number(ex.sets),
              rep_min: Number(ex.rep_min),
              rep_max: Number(ex.rep_max),
              current_weight: Number(ex.current_weight),
              weight_unit: ex.weight_unit,
              weight_increment: Number(ex.weight_increment),
              notes: ex.notes || null,
            }))
          )
        }
      }

      navigate('/programs')
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-white/30 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-12 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-white">{id ? 'Edit Program' : 'New Program'}</h1>
      </div>

      {/* Program info */}
      <div className="bg-gray-800 rounded-2xl p-4 mb-4 space-y-3">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Program Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 4-Day Upper/Lower"
            className="w-full mt-1 bg-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white text-base"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wide">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Hypertrophy focus, 4× per week"
            className="w-full mt-1 bg-gray-700 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white text-base"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsActive(!isActive)}
            className={`relative w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-white' : 'bg-gray-600'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-gray-300 text-sm">Set as active program</span>
        </label>
      </div>

      {/* Days */}
      <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-3">Workout Days</h2>
      <div className="space-y-3 mb-4">
        {days.map((day, dayIdx) => (
          <div key={dayIdx} className="bg-gray-800 rounded-2xl overflow-hidden">
            {/* Day header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer"
              onClick={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={day.name}
                  onChange={(e) => { e.stopPropagation(); updateDayName(dayIdx, e.target.value) }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-transparent text-white font-semibold w-full focus:outline-none text-base"
                  placeholder={`Day ${dayIdx + 1}`}
                />
                <p className="text-gray-500 text-xs">{day.exercises.length} exercise{day.exercises.length !== 1 ? 's' : ''}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeDay(dayIdx) }}
                className="text-red-400 hover:text-red-300 text-sm px-2"
              >✕</button>
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${expandedDay === dayIdx ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Exercises */}
            {expandedDay === dayIdx && (
              <div className="border-t border-gray-700 px-4 pb-4">
                {day.exercises.length === 0 && (
                  <p className="text-gray-500 text-sm py-3 text-center">No exercises yet</p>
                )}
                {day.exercises.map((ex, exIdx) => {
                  const key = `${dayIdx}-${exIdx}`
                  const isOpen = expandedExercise === key
                  return (
                    <div key={exIdx} className="mt-3 bg-gray-700/60 rounded-xl overflow-hidden">
                      <div
                        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                        onClick={() => setExpandedExercise(isOpen ? null : key)}
                      >
                        <span className="text-gray-400 text-sm w-4 flex-shrink-0">{exIdx + 1}</span>
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => { e.stopPropagation(); updateExercise(dayIdx, exIdx, 'name', e.target.value) }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Exercise name"
                          className="flex-1 bg-transparent text-white focus:outline-none text-base"
                        />
                        <span className="text-gray-500 text-xs flex-shrink-0">
                          {ex.sets}×{ex.rep_min}–{ex.rep_max} @ {ex.current_weight}{ex.weight_unit}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeExercise(dayIdx, exIdx) }}
                          className="text-red-400 text-sm ml-1"
                        >✕</button>
                      </div>

                      {isOpen && (
                        <div className="px-3 pb-3 border-t border-gray-600 pt-3 grid grid-cols-2 gap-2">
                          <NumField label="Sets" value={ex.sets} onChange={(v) => updateExercise(dayIdx, exIdx, 'sets', v)} />
                          <NumField label="Min reps" value={ex.rep_min} onChange={(v) => updateExercise(dayIdx, exIdx, 'rep_min', v)} />
                          <NumField label="Max reps" value={ex.rep_max} onChange={(v) => updateExercise(dayIdx, exIdx, 'rep_max', v)} />
                          <div>
                            <label className="text-xs text-gray-400">Unit</label>
                            <select
                              value={ex.weight_unit}
                              onChange={(e) => updateExercise(dayIdx, exIdx, 'weight_unit', e.target.value)}
                              className="w-full bg-gray-600 text-white rounded-lg px-2 py-1.5 mt-1 focus:outline-none text-sm"
                            >
                              <option value="lbs">lbs</option>
                              <option value="kg">kg</option>
                            </select>
                          </div>
                          <NumField
                            label={`Starting weight (${ex.weight_unit})`}
                            value={ex.current_weight}
                            onChange={(v) => updateExercise(dayIdx, exIdx, 'current_weight', v)}
                            step="2.5"
                          />
                          <NumField
                            label={`+${ex.weight_unit} on progress`}
                            value={ex.weight_increment}
                            onChange={(v) => updateExercise(dayIdx, exIdx, 'weight_increment', v)}
                            step="2.5"
                          />
                          <div className="col-span-2">
                            <p className="text-xs text-gray-200/80 mt-1">
                              💡 {progressionTip(ex.rep_min, ex.rep_max, ex.weight_increment, ex.weight_unit)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <button
                  onClick={() => addExercise(dayIdx)}
                  className="mt-3 w-full border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 rounded-xl py-2 text-sm transition-colors"
                >
                  + Add exercise
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={addDay}
          className="w-full border-2 border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-2xl py-4 font-medium transition-colors"
        >
          + Add day
        </button>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full bg-white hover:bg-white active:bg-gray-200 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-50 text-base"
      >
        {saving ? 'Saving…' : id ? 'Save changes' : 'Create program'}
      </button>
    </div>
  )
}

function NumField({ label, value, onChange, step = '1' }) {
  return (
    <div>
      <label className="text-xs text-gray-400">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        step={step}
        min="0"
        className="w-full mt-1 bg-gray-600 text-white rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-white text-sm"
      />
    </div>
  )
}
