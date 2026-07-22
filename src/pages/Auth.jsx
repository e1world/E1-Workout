import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Put your line-art illustration at: public/splash.png
// (the public/ folder is in the project root, next to src/)

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
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
        setSuccessMsg('Check your email to confirm, then log in.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#000', minHeight: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Sun */}
      <div style={{ height: '38vh', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div style={{ width: '52vw', height: '52vw', borderRadius: '50%', background: '#8b1a1a' }} />
      </div>

      {/* Bottom — app name + login form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 28px 48px', background: '#0d0d0d' }}>

        {/* App name */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 300,
            fontSize: '40px',
            color: '#f0ece4',
            letterSpacing: '0.06em',
            margin: '0 0 4px',
            lineHeight: 1,
          }}>
            E1 Move
          </h1>
          <p style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#525248',
            margin: 0,
          }}>
            Train · Track · Progress
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontFamily: "'Oxanium', sans-serif",
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9a9a8a',
              marginBottom: '6px',
            }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                background: '#1c1c1c',
                border: '1px solid #2e2e2e',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '15px',
                color: '#f0ece4',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, sans-serif',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontFamily: "'Oxanium', sans-serif",
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#9a9a8a',
              marginBottom: '6px',
            }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                background: '#1c1c1c',
                border: '1px solid #2e2e2e',
                borderRadius: '10px',
                padding: '12px 14px',
                fontSize: '15px',
                color: '#f0ece4',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'system-ui, sans-serif',
              }}
            />
          </div>

          {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '2px 0 0' }}>{error}</p>}
          {successMsg && <p style={{ color: '#9a9a8a', fontSize: '13px', margin: '2px 0 0' }}>{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#f0ece4',
              color: '#0d0d0d',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '15px',
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 600,
              letterSpacing: '0.08em',
              marginTop: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? '...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#525248',
          marginTop: '18px',
          fontFamily: "'Oxanium', sans-serif",
        }}>
          {mode === 'login' ? 'No account? ' : 'Have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}
            style={{
              background: 'none',
              border: 'none',
              color: '#9a9a8a',
              fontSize: '13px',
              fontFamily: "'Oxanium', sans-serif",
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
