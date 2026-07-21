import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeProgram, setActiveProgram] = useState(null)
  const [days, setDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(null)
  const [recentSession, setRecentSession] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const { data: program } = await supabase
      .from('programs')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (program) {
      setActiveProgram(program)
      const { data: programDays } = await supabase
        .from('program_days')
        .select('*')
        .eq('program_id', program.id)
        .order('day_order')
      setDays(programDays || [])
    }

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
      .insert({ user_id: user.id, program_day_id: day.id, day_name: day.name })
      .select()
      .single()
    if (error) { alert(error.message); setStarting(null); return }
    navigate(`/workout/${session.id}`)
  }

  function suggestedDayIndex() {
    if (!recentSession || !days.length) return 0
    const lastIdx = days.findIndex((d) => d.id === recentSession.program_day_id)
    return (lastIdx + 1) % days.length
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  if (loading) return (
    <div className="flex items-center justify-center h-full" style={{ background: 'var(--bg)' }}>
      <div className="w-7 h-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent' }} />
    </div>
  )

  const suggestedIdx = suggestedDayIndex()

  return (
    <div className="px-4 pt-14 pb-6 max-w-lg mx-auto" style={{ background: 'var(--bg)', minHeight: '100%' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-medium tracking-widest uppercase mb-0.5" style={{ color: 'var(--text-3)' }}>
            {today}
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            E1 Move
          </h1>
        </div>
        <button onClick={signOut} className="p-1">
          <Avatar size={42} />
        </button>
      </div>

      {!activeProgram ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p className="mb-4" style={{ color: 'var(--text-2)' }}>No active program.</p>
          <button
            onClick={() => navigate('/programs/new')}
            className="font-semibold px-6 py-3 rounded-xl"
            style={{ background: 'var(--green)', color: '#fff' }}
          >
            Create a program
          </button>
        </div>
      ) : (
        <>
          {/* Active program pill */}
          <div
            className="rounded-2xl px-4 py-3 mb-4 flex items-center justify-between"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-3)' }}>Active</p>
              <p className="font-semibold" style={{ color: 'var(--text)' }}>{activeProgram.name}</p>
            </div>
            <button
              onClick={() => navigate(`/programs/${activeProgram.id}/edit`)}
              className="text-sm"
              style={{ color: 'var(--text-3)' }}
            >
              Edit
            </button>
          </div>

          {/* Last session */}
          {recentSession && (
            <div
              className="rounded-xl px-4 py-2.5 mb-5 flex items-center gap-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--green)' }} />
              <div>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                  Last: <span style={{ color: 'var(--text)' }}>{recentSession.day_name || recentSession.program_days?.name}</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {new Date(recentSession.completed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {/* Day cards */}
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>
            Select workout
          </p>
          <div className="space-y-2.5">
            {days.map((day, idx) => {
              const isSuggested = idx === suggestedIdx
              return (
                <button
                  key={day.id}
                  onClick={() => startWorkout(day)}
                  disabled={!!starting}
                  className="w-full text-left rounded-2xl px-5 py-4 transition-all active:scale-95 flex items-center justify-between"
                  style={{
                    background: isSuggested ? 'var(--green-dim)' : 'var(--surface-2)',
                    border: `1px solid ${isSuggested ? 'var(--green-muted)' : 'var(--border)'}`,
                    opacity: starting && starting !== day.id ? 0.5 : 1,
                  }}
                >
                  <div>
                    {isSuggested && (
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--green-bright)' }}>
                        Up next
                      </p>
                    )}
                    <p className="font-semibold text-lg" style={{ color: 'var(--text)' }}>{day.name}</p>
                    <p className="text-sm" style={{ color: 'var(--text-3)' }}>Day {day.day_order}</p>
                  </div>
                  <div>
                    {starting === day.id ? (
                      <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--green)', borderTopColor: 'transparent' }} />
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: isSuggested ? 'var(--green-bright)' : 'var(--text-3)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
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
