import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Progress() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, thisWeek: 0, thisMonth: 0 })
  const [recentSessions, setRecentSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()

    const [{ count: total }, { count: thisWeek }, { count: thisMonth }, { data: recent }] = await Promise.all([
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).not('completed_at', 'is', null),
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).not('completed_at', 'is', null).gte('completed_at', weekAgo),
      supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).not('completed_at', 'is', null).gte('completed_at', monthAgo),
      supabase.from('workout_sessions').select('*, program_days(name)')
        .eq('user_id', user.id).not('completed_at', 'is', null)
        .order('completed_at', { ascending: false }).limit(5),
    ])

    setStats({ total: total || 0, thisWeek: thisWeek || 0, thisMonth: thisMonth || 0 })
    setRecentSessions(recent || [])
    setLoading(false)
  }

  function fmtDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', padding: '24px 20px 60px' }}>

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

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px' }}>Recent</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {recentSessions.map((s) => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '14px', color: 'var(--text)', margin: 0 }}>{s.day_name || s.program_days?.name || 'Session'}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>{fmtDate(s.completed_at)}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/history')}
            style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--text-2)', fontSize: '13px', cursor: 'pointer', padding: '4px 0', fontFamily: 'system-ui' }}
          >
            View full history →
          </button>
        </div>
      )}

      {/* Progress photos section */}
      <div>
        <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px' }}>Progress Photos</p>
        <div
          style={{ background: 'var(--surface)', border: '1px dashed var(--border-2)', borderRadius: '14px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer' }}
          onClick={() => alert('Photo uploads coming soon')}
        >
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="20" height="20" fill="none" stroke="var(--text-3)" strokeWidth="1.6" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-2)', margin: '0 0 4px' }}>Add a progress photo</p>
          <p style={{ fontSize: '12px', color: 'var(--text-3)', margin: 0 }}>Track your physique over time</p>
        </div>
      </div>
    </div>
  )
}
