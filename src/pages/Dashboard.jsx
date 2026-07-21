import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeProgram, setActiveProgram] = useState(null)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null) // dayId being started
  const [recentSession, setRecentSession] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    // Load active program
    const { data: programs } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (programs) {
      setActiveProgram(programs)
      const { data: programDays } = await supabase
        .from('program_days')
        .select('*')
        .eq('program_id', programs.id)
        .order('day_order')
      setDays(programDays || [])
    }

    // Load most recent session
    const { data: session } = await supabase
      .from('workout_sessions')
      .select('*, program_days(name)')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()
    setRecentSession(session)

    setLoading(false)
  }

  async function startWorkout(day) {
    setStarting(day.id)
    const { data: session, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        program_day_id: day.id,
        day_name: day.name,
      })
      .select()
      .single()

    if (error) { alert(error.message); setStarting(null); return }
    navigate(`/workout/${session.id}`)
  }

  // Suggest the next day based on most recent session
  function suggestedDayIndex() {
    if (!recentSession || !days.length) return 0
    const lastDayId = recentSession.program_day_id
    const lastIdx = days.findIndex((d) => d.id === lastDayId)
    return (lastIdx + 1) % days.length
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const suggestedIdx = suggestedDayIndex()

  return (
    <div className="px-4 pt-12 pb-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Today</h1>
          <p className="text-gray-400 text-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={signOut} className="text-gray-500 hover:text-gray-300 text-sm">
          Sign out
        </button>
      </div>

      {!activeProgram ? (
        <div className="bg-gray-800 rounded-2xl p-6 text-center">
          <p className="text-gray-400 mb-4">No active program yet.</p>
          <button
            onClick={() => navigate('/programs/new')}
            className="bg-green-500 text-white font-semibold px-6 py-3 rounded-xl"
          >
            Create your first program
          </button>
        </div>
      ) : (
        <>
          {/* Active program banner */}
          <div className="bg-gray-800 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Active program</p>
              <p className="text-white font-semibold">{activeProgram.name}</p>
            </div>
            <button
              onClick={() => navigate(`/programs/${activeProgram.id}/edit`)}
              className="text-gray-500 hover:text-gray-300 text-sm"
            >
              Edit
            </button>
          </div>

          {/* Last session */}
          {recentSession && (
            <div className="bg-gray-800/60 rounded-xl px-4 py-2 mb-4 flex items-center gap-3">
              <span className="text-green-400 text-lg">✓</span>
              <div>
                <p className="text-gray-300 text-sm">Last: <span className="text-white">{recentSession.day_name || recentSession.program_days?.name}</span></p>
                <p className="text-gray-500 text-xs">
                  {new Date(recentSession.completed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {/* Day cards */}
          <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-3">Pick a workout</h2>
          <div className="space-y-3">
            {days.map((day, idx) => {
              const isSuggested = idx === suggestedIdx
              return (
                <button
                  key={day.id}
                  onClick={() => startWorkout(day)}
                  disabled={!!starting}
                  className={`w-full text-left rounded-2xl px-5 py-4 transition-all active:scale-95 ${
                    isSuggested
                      ? 'bg-green-500/20 border border-green-500/50'
                      : 'bg-gray-800 border border-gray-700'
                  } ${starting === day.id ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      {isSuggested && (
                        <span className="text-xs text-green-400 font-medium uppercase tracking-wide">
                          Up next
                        </span>
                      )}
                      <p className="text-white font-semibold text-lg">{day.name}</p>
                      <p className="text-gray-400 text-sm">Day {day.day_order}</p>
                    </div>
                    <div className="text-green-400">
                      {starting === day.id ? (
                        <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
