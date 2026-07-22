import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// mode: 'landing' | 'login' | 'signup'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setSuccessMsg('Check your email to confirm your account, then sign in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#000', minHeight: '100dvh', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top, 0)' }}>

      {/* Sun */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ width: '72vw', height: '72vw', borderRadius: '50%', background: '#8b1a1a' }} />
      </div>

      {/* Bottom panel */}
      <div style={{ padding: '24px 28px', paddingBottom: 'max(40px, env(safe-area-inset-bottom, 40px))', background: '#0d0d0d' }}>

        {/* App name */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '40px', color: '#f0ece4', letterSpacing: '0.06em', margin: '0 0 4px', lineHeight: 1 }}>
            Move
          </h1>
          <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#525248', margin: 0 }}>
            Train · Track · Progress
          </p>
        </div>

        {/* Landing — two buttons */}
        {mode === 'landing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setMode('signup')}
              style={{ width: '100%', padding: '16px', background: '#f0ece4', color: '#000', border: 'none', borderRadius: '12px', fontFamily: "'Oxanium', sans-serif", fontSize: '15px', letterSpacing: '0.06em', cursor: 'pointer' }}
            >
              Create account
            </button>
            <button
              onClick={() => setMode('login')}
              style={{ width: '100%', padding: '16px', background: 'transparent', color: '#f0ece4', border: '1px solid #2e2e2e', borderRadius: '12px', fontFamily: "'Oxanium', sans-serif", fontSize: '15px', letterSpacing: '0.06em', cursor: 'pointer' }}
            >
              Sign in
            </button>
          </div>
        )}

        {/* Login / Signup form */}
        {(mode === 'login' || mode === 'signup') && (
          <>
            <button
              onClick={() => { setMode('landing'); setError(''); setSuccessMsg('') }}
              style={{ background: 'none', border: 'none', color: '#525248', fontSize: '13px', fontFamily: "'Oxanium', sans-serif", cursor: 'pointer', padding: '0 0 20px', letterSpacing: '0.06em' }}
            >
              ← Back
            </button>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoFocus
                style={{ width: '100%', background: '#1c1c1c', border: '1px solid #2e2e2e', borderRadius: '10px', padding: '14px', fontSize: '15px', color: '#f0ece4', outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                style={{ width: '100%', background: '#1c1c1c', border: '1px solid #2e2e2e', borderRadius: '10px', padding: '14px', fontSize: '15px', color: '#f0ece4', outline: 'none', boxSizing: 'border-box', fontFamily: 'system-ui' }}
              />

              {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '2px 0 0' }}>{error}</p>}
              {successMsg && <p style={{ color: '#9a9a8a', fontSize: '13px', margin: '2px 0 0' }}>{successMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: '#f0ece4', color: '#0d0d0d', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontFamily: "'Oxanium', sans-serif", letterSpacing: '0.06em', marginTop: '4px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
              >
                {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
