import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Progress() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, thisMonth: 0 })
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [sessionSets, setSessionSets] = useState({})

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [{ count: total }, { count: thisWeek }, { count: thisMonth }, { data: allSessions }] = await Promise.all([
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).not('completed_at', 'is', null),
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).not('completed_at', 'is', null).gte('completed_at', weekAgo),
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).not('completed_at', 'is', null).gte('completed_at', monthAgo),
      supabase.from('workout_sessions').select('*')
        .eq('user_id', user.id).not('completed_at', 'is', null)
        .order('completed_at', { ascending: false }).limit(50),
    ])

    setStats({ total: total || 0, thisWeek: thisWeek || 0, thisMonth: thisMonth || 0 })
    setSessions(allSessions || [])
    setLoading(false)
  }

  async function loadSets(sessionId) {
    if (sessionSets[sessionId]) {
      setExpanded(expanded === sessionId ? null : sessionId)
      return
    }
    const { data } = await supabase
      .from('set_logs').select('*').eq('session_id', sessionId)
      .order('exercise_name').order('set_number')
    setSessionSets((prev) => ({ ...prev, [sessionId]: data || [] }))
    setExpanded(sessionId)
  }

  function groupByExercise(sets) {
    const groups = {}
    for (const s of sets) {
      if (!groups[s.exercise_name]) groups[s.exercise_name] = []
      groups[s.exercise_name].push(s)
    }
    return groups
  }

  function durationStr(start, end) {
    if (!start || !end) return ''
    const mins = Math.round((new Date(end) - new Date(start)) / 60000)
    return `${mins} min`
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '28px 20px 60px', paddingTop: 'max(28px, env(safe-area-inset-top, 28px))' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-3)', margin: '0 0 4px' }}>E1</p>
        <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '26px', fontWeight: 300, color: 'var(--text)', margin: 0, letterSpacing: '0.02em' }}>Progress</h1>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '28px' }}>
        {[
          { label: 'Total', value: loading ? '—' : stats.total },
          { label: 'This month', value: loading ? '—' : stats.thisMonth },
          { label: 'This week', value: loading ? '—' : stats.thisWeek },
        ].map((s) => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 12px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '26px', fontWeight: 400, color: 'var(--text)', margin: '0 0 4px', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress photos */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px' }}>Progress Photos</p>
        <div
          style={{ background: 'var(--surface)', border: '1px dashed var(--border-2)', borderRadius: '14px', padding: '24px 20px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => alert('Photo uploads coming soon')}
        >
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
            <svg width="18" height="18" fill="none" stroke="var(--text-3)" strokeWidth="1.6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', margin: '0 0 2px' }}>Add a progress photo</p>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>Track your physique over time</p>
        </div>
      </div>

      {/* History */}
      <div>
        <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px' }}>History</p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid var(--text-3)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-3)', fontSize: '14px', margin: 0 }}>No workouts logged yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {sessions.map((sess) => {
              const isOpen = expanded === sess.id
              const sets = sessionSets[sess.id] || []
              const grouped = groupByExercise(sets)

              return (
                <div key={sess.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <button
                    onClick={() => loadSets(sess.id)}
                    style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <p style={{ fontSize: '15px', color: 'var(--text)', margin: '0 0 2px' }}>{sess.day_name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>
                        {new Date(sess.completed_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {sess.started_at && ` · ${durationStr(sess.started_at, sess.completed_at)}`}
                      </p>
                    </div>
                    <svg width="14" height="14" fill="none" stroke="var(--text-3)" strokeWidth="2" viewBox="0 0 24 24"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px 16px' }}>
                      {Object.entries(grouped).map(([exName, exSets]) => (
                        <div key={exName} style={{ marginBottom: '14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text)', margin: 0, fontWeight: 500 }}>{exName}</p>
                            <button
                              onClick={() => { const exId = exSets[0]?.program_exercise_id; if (exId) navigate(`/exercise/${exId}`) }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: 'var(--text-3)', padding: 0 }}
                            >
                              Progress →
                            </button>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {exSets.map((s, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                <span style={{ color: 'var(--text-3)', width: '20px' }}>#{s.set_number}</span>
                                <span style={{ color: 'var(--text)' }}>{s.weight} {s.weight_unit}</span>
                                <span style={{ color: 'var(--text-3)' }}>×</span>
                                <span style={{ color: s.actual_reps >= s.target_reps ? 'var(--text)' : '#c8a84b' }}>{s.actual_reps} reps</span>
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
    </div>
  )
}
