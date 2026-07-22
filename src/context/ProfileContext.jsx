import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (user) loadProfile()
    else { setProfile(null); setProfileLoading(false) }
  }, [user?.id])

  async function loadProfile() {
    setProfileLoading(true)
    const { data } = await supabase
      .from('user_profiles').select('*').eq('user_id', user.id).single()
    setProfile(data || null)
    setProfileLoading(false)
  }

  async function updateProfile(updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
      .select().single()
    if (!error) setProfile(data)
    return { data, error }
  }

  return (
    <ProfileContext.Provider value={{ profile, profileLoading, updateProfile, loadProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  return useContext(ProfileContext)
}
