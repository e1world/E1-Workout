import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Programs from './pages/Programs'
import ProgramBuilder from './pages/ProgramBuilder'
import ActiveWorkout from './pages/ActiveWorkout'
import History from './pages/History'
import ExerciseProgress from './pages/ExerciseProgress'

function SplashScreen({ opacity }) {
  return (
    <div style={{ background: '#000', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity, transition: 'opacity 0.5s ease' }}>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <img
          src="/splash.png"
          alt=""
          style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
        />
        {/* Sun circle — on top with screen blend, glows through black bg */}
        <div style={{
          position: 'absolute',
          width: '65vw',
          height: '65vw',
          borderRadius: '50%',
          background: '#8b1a1a',
          top: 'calc(-65vw / 2)',
          right: 'calc(-65vw / 2)',
          zIndex: 2,
          mixBlendMode: 'screen',
        }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '140px', background: 'linear-gradient(to bottom, transparent, #0d0d0d)', pointerEvents: 'none', zIndex: 3 }} />
      </div>
      <div style={{ padding: '16px 28px 52px', background: '#0d0d0d', flexShrink: 0 }}>
        <h1 style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 300, fontSize: '40px', color: '#f0ece4', letterSpacing: '0.06em', margin: '0 0 4px', lineHeight: 1 }}>E1 Move</h1>
        <p style={{ fontFamily: "'Oxanium', sans-serif", fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#525248', margin: 0 }}>Train · Track · Progress</p>
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--text)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { user, loading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [splashOpacity, setSplashOpacity] = useState(0)

  useEffect(() => {
    const fadeIn  = setTimeout(() => setSplashOpacity(1), 50)
    const fadeOut = setTimeout(() => setSplashOpacity(0), 1800)
    const done    = setTimeout(() => setShowSplash(false), 2400)
    return () => { clearTimeout(fadeIn); clearTimeout(fadeOut); clearTimeout(done) }
  }, [])

  if (showSplash) return <SplashScreen opacity={splashOpacity} />

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg)' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid var(--text)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />

      <Route path="/" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        <Route path="programs" element={<Programs />} />
        <Route path="programs/new" element={<ProgramBuilder />} />
        <Route path="programs/:id/edit" element={<ProgramBuilder />} />
        <Route path="history" element={<History />} />
        <Route path="exercise/:exerciseId" element={<ExerciseProgress />} />
      </Route>

      <Route path="/workout/:sessionId" element={<RequireAuth><ActiveWorkout /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
