import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Programs() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPrograms() }, [])

  async function loadPrograms() {
    const { data } = await supabase
      .from('programs')
      .select('*, program_days(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setPrograms(data || [])
    setLoading(false)
  }

  async function setActive(programId) {
    // Deactivate all then activate selected
    await supabase.from('programs').update({ is_active: false }).eq('user_id', user.id)
    await supabase.from('programs').update({ is_active: true }).eq('id', programId)
    loadPrograms()
  }

  async function deleteProgram(programId) {
    if (!confirm('Delete this program?')) return
    await supabase.from('programs').delete().eq('id', programId)
    loadPrograms()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-white/30 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 pt-12 pb-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Programs</h1>
        <button
          onClick={() => navigate('/programs/new')}
          className="bg-white text-white text-sm font-semibold px-4 py-2 rounded-xl active:bg-gray-200"
        >
          + New
        </button>
      </div>

      {programs.length === 0 ? (
        <div className="bg-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-400 mb-4">No programs yet.</p>
          <button
            onClick={() => navigate('/programs/new')}
            className="bg-white text-white font-semibold px-6 py-3 rounded-xl"
          >
            Create your first program
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <div
              key={p.id}
              className={`bg-gray-800 rounded-2xl px-5 py-4 border ${
                p.is_active ? 'border-white/20' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {p.is_active && (
                      <span className="text-xs bg-white/5 text-gray-200 px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                    <h3 className="text-white font-semibold truncate">{p.name}</h3>
                  </div>
                  {p.description && (
                    <p className="text-gray-400 text-sm mt-0.5 line-clamp-1">{p.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {p.program_days?.[0]?.count ?? 0} days
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/programs/${p.id}/edit`)}
                    className="text-gray-400 hover:text-white text-sm px-2 py-1"
                  >
                    Edit
                  </button>
                  {!p.is_active && (
                    <button
                      onClick={() => setActive(p.id)}
                      className="text-gray-200 hover:text-gray-300 text-sm px-2 py-1"
                    >
                      Activate
                    </button>
                  )}
                  <button
                    onClick={() => deleteProgram(p.id)}
                    className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
