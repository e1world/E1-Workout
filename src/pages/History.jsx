import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function History() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [sessionSets, setSessionSets] = useState({}) // sessionId -> set_logs[]

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    const { data } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(50)
    setSessions(data || [])
    setLoading(false)
  }

  async function loadSets(sessionId) {
    if (sessionSets[sessionId]) {
      setExpanded(expanded === sessionId ? null : sessionId)
      return
    }
    const { data } = await supabase
      .from('set_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('exercise_name')
      .order('set_number')

    setSessionSets((prev) => ({ ...prev, [sessionId]: data || [] }))
    setExpanded(sessionId)
  }

  function durationStr(start, end) {
    if (!start || !end) return ''
    const mins = Math.round((new Date(end) - new Date(start)) / 60000)
    return `${mins} min`
  }

  function groupByExercise(sets) {
    const groups = {}
    for (const s of sets) {
      if (!groups[s.exercise_name]) groups[s.exercise_name] = []
      groups[s.exercise_name].push(s)
    }
    return groups
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-12 pb-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">History</h1>

      {sessions.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-400">No workouts logged yet.</p>
          <p className="text-gray-500 text-sm mt-1">Start a workout from the Today tab.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => {
            const isOpen = expanded === sess.id
            const sets = sessionSets[sess.id] || []
            const grouped = groupByExercise(sets)

            return (
              <div
                key={sess.id}
                className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700"
              >
                <button
                  className="w-full text-left px-5 py-4"
                  onClick={() => loadSets(sess.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{sess.day_name}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(sess.completed_at).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric',
                        })}
                        {sess.started_at && (
                          <span className="text-gray-500 ml-2">· {durationStr(sess.started_at, sess.completed_at)}</span>
                        )}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-700 px-5 pb-4 pt-3">
                    {Object.entries(grouped).map(([exName, exSets]) => (
                      <div key={exName} className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-white text-sm font-medium">{exName}</p>
                          <button
                            onClick={() => {
                              // Find the exercise ID from the first set
                              const exId = exSets[0]?.program_exercise_id
                              if (exId) navigate(`/exercise/${exId}`)
                            }}
                            className="text-green-400 text-xs hover:text-green-300"
                          >
                            Progress →
                          </button>
                        </div>
                        <div className="space-y-1">
                          {exSets.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 text-sm">
                              <span className="text-gray-500 w-6">#{s.set_number}</span>
                              <span className="text-white">{s.weight} {s.weight_unit}</span>
                              <span className="text-gray-400">×</span>
                              <span className={`font-medium ${
                                s.actual_reps >= s.target_reps ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {s.actual_reps} reps
                              </span>
                              {s.actual_reps >= s.target_reps && (
                                <span className="text-green-400 text-xs">✓ max</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
