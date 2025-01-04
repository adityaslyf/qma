import { createContext, useContext, useState, ReactNode } from 'react'
import { Profile } from '@/types/profile'

interface ProfileContextType {
  profile: Profile | null
  setProfile: (profile: Profile) => void
  updateProfile: (updates: Partial<Profile>) => void
  loading: boolean
  error: string | null
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

const initialProfile: Profile = {
  id: crypto.randomUUID(),
  name: '',
  title: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  desiredRole: '',
  socialLinks: [],
  education: [],
  experience: [],
  projects: [],
  skills: [],
  achievements: []
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = (updates: Partial<Profile>) => {
    try {
      setLoading(true)
      setProfile(prev => ({ ...prev, ...updates }))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateProfile, loading, error }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
} 