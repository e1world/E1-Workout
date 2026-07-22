import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeProgram, setActiveProgram] = useState(null)
  const [recentSession, setRecentSession] = useState(null)
  const [totalSessions, setTotalSessions] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: program } = await supabase
      .from('programs').select('*').eq('user_id', user.id).eq('is_active', true).limit(1).single()
    setActiveProgram(program)

    const { data: session } = await supabase
      .from('workout_sessions').select('*, program_days(name)')
      .eq('user_id', user.id).not('completed_at', 'is', null)
      .order('completed_at', { ascending: false }).limit(1).single()
    setRecentSession(session)

    const { count } = await supabase
      .from('workout_sessions').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).not('completed_at', 'is', null)
    setTotalSessions(count || 0)

    setLoading(false)
  }

  const modules = [
    {
      id: 'program',
      label: 'Active Program',
      sub: loading ? '—' : (activeProgram ? activeProgram.name : 'No active program'),
      detail: loading ? '' : (recentSession
        ? `Last: ${recentSession.day_name || recentSession.program_days?.name}`
        : 'Start your first session'),
      action: () => navigate('/workout-picker'),
    },
    {
      id: 'progress',
      label: 'Progress',
      sub: loading ? '—' : `${totalSessions} session${totalSessions !== 1 ? 's' : ''} logged`,
      detail: 'Analytics + progress photos',
      action: () => navigate('/progress'),
    },
    {
      id: 'create',
      label: 'Create Program',
      sub: 'Build a new program',
      detail: 'Set days, exercises, weights',
      action: () => navigate('/programs/new'),
    },
  ]

  return (
    <div style={{ background: '#000', height: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* Truncated splash illustration */}
      <div style={{ height: '44vh', flexShrink: 0, position: 'relative', overflow: 'hidden', marginTop: '20px' }}>
        <img
          src="/splash.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
        {/* Sun accent */}
        <div style={{
          position: 'absolute',
          width: '48vw', height: '48vw',
          borderRadius: '50%',
          background: '#8b1a1a',
          top: 'calc(-24vw)', right: 'calc(-24vw)',
          zIndex: 2,
          mixBlendMode: 'screen',
        }} />
        {/* Fade into content */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
          background: 'linear-gradient(to bottom, transparent, #0d0d0d)',
          zIndex: 3, pointerEvents: 'none',
        }} />
      </div>

      {/* Content — fills remaining screen, cards spaced to bottom */}
      <div style={{ flex: 1, background: '#0d0d0d', padding: '0 20px', paddingBottom: 'env(safe-area-inset-bottom, 24px)', display: 'flex', flexDirection: 'column' }}>

        {/* E1 title */}
        <div style={{ padding: '10px 0 0' }}>
          <h1 style={{
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 300, fontSize: '34px',
            color: '#f0ece4', letterSpacing: '0.04em',
            margin: '0 0 2px', lineHeight: 1,
          }}>E1</h1>
          <p style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: '10px', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#525248', margin: 0,
          }}>Movement</p>
        </div>

        {/* Module cards — fill remaining space evenly */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', paddingBottom: '8px' }}>
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={mod.action}
              style={{
                width: '100%', textAlign: 'left',
                background: '#1c1c1c',
                border: '1px solid #2e2e2e',
                borderRadius: '14px',
                padding: '16px 18px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}
            >
              <div>
                <p style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: '10px', letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: '#525248',
                  margin: '0 0 4px',
                }}>{mod.label}</p>
                <p style={{
                  fontFamily: "'Oxanium', sans-serif",
                  fontSize: '17px', fontWeight: 400,
                  color: '#f0ece4', margin: '0 0 2px', letterSpacing: '0.02em',
                }}>{mod.sub}</p>
                <p style={{ fontSize: '12px', color: '#525248', margin: 0, fontFamily: 'system-ui' }}>
                  {mod.detail}
                </p>
              </div>
              <svg width="18" height="18" fill="none" stroke="#525248" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
