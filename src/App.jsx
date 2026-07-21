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

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  return user ? children : <Navigate to="/auth" replace />
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
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

      {/* Full-screen workout — no bottom nav */}
      <Route
        path="/workout/:sessionId"
        element={<RequireAuth><ActiveWorkout /></RequireAuth>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
