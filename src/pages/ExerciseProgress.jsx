import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'

export default function ExerciseProgress() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const [exercise, setExercise] = useState(null)
  const [history, setHistory] = useState([]) // chart data points
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [exerciseId])

  async function loadData() {
    // Load exercise meta
    const { data: ex } = await supabase
      .from('program_exercises')
      .select('*, program_days(name, programs(name))')
      .eq('id', exerciseId)
      .single()
    setExercise(ex)

    // Load all set logs for this exercise across sessions
    const { data: logs } = await supabase
      .from('set_logs')
      .select('*, workout_sessions(started_at, completed_at)')
      .eq('program_exercise_id', exerciseId)
      .eq('completed', true)
      .order('logged_at', { ascending: true })

    if (logs) {
      // Group by session, take max weight per session
      const bySession = {}
      for (const log of logs) {
        const date = (log.workout_sessions?.completed_at || log.logged_at).split('T')[0]
        if (!bySession[date]) {
          bySession[date] = { date, maxWeight: 0, totalReps: 0, sets: 0, allReps: [] }
        }
        bySession[date].maxWeight = Math.max(bySession[date].maxWeight, log.weight || 0)
        bySession[date].totalReps += log.actual_reps || 0
        bySession[date].sets += 1
        bySession[date].allReps.push(log.actual_reps || 0)
      }
      setHistory(Object.values(bySession).sort((a, b) => a.date.localeCompare(b.date)))
    }
    setLoading(false)
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm shadow-xl">
        <p className="text-gray-400 mb-1">{formatDate(label)}</p>
        <p className="text-white font-semibold">{d.maxWeight} {exercise?.weight_unit}</p>
        <p className="text-gray-400">{d.sets} sets · {Math.round(d.totalReps / d.sets)} avg reps</p>
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-8 h-8 border-4 border-white/30 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!exercise) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <p className="text-gray-400">Exercise not found.</p>
    </div>
  )

  const firstWeight = history[0]?.maxWeight
  const lastWeight = history[history.length - 1]?.maxWeight
  const gained = history.length > 1 ? lastWeight - firstWeight : 0

  return (
    <div className="min-h-screen bg-gray-900 px-4 pt-12 pb-10 max-w-lg mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-1">{exercise.name}</h1>
      <p className="text-gray-400 text-sm mb-6">
        {exercise.program_days?.programs?.name} · {exercise.program_days?.name}
      </p>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Current" value={`${exercise.current_weight} ${exercise.weight_unit}`} />
        <StatCard label="Sessions" value={history.length} />
        <StatCard
          label="Total gain"
          value={gained !== 0 ? `+${gained} ${exercise.weight_unit}` : '—'}
          green={gained > 0}
        />
      </div>

      {/* Chart */}
      {history.length < 2 ? (
        <div className="bg-gray-800 rounded-2xl p-8 text-center mb-6">
          <p className="text-gray-400">Log at least 2 sessions to see your progress chart.</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-2xl p-4 mb-6">
          <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-4">Weight Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={history} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="maxWeight"
                stroke="var(--text)"
                strokeWidth={2.5}
                dot={{ fill: 'var(--text)', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: 'var(--text)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session history table */}
      <h2 className="text-gray-400 text-xs uppercase tracking-wide mb-3">Session Log</h2>
      <div className="space-y-2">
        {[...history].reverse().map((d, i) => (
          <div key={i} className="bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white text-sm">{formatDate(d.date)}</p>
              <p className="text-gray-500 text-xs">{d.sets} sets</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">{d.maxWeight} {exercise.weight_unit}</p>
              <p className="text-gray-400 text-xs">{Math.round(d.totalReps / d.sets)} avg reps</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, green }) {
  return (
    <div className="bg-gray-800 rounded-2xl px-3 py-3 text-center">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className={`font-bold text-sm ${green ? 'text-gray-200' : 'text-white'}`}>{value}</p>
    </div>
  )
}
