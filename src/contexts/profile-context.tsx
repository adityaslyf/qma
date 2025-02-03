import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { Profile } from '@/types/profile'
import { isEqual } from '@/lib/utils'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: string | null
  updateProfile: (data: Partial<Profile>) => void
}

const initialProfile: Profile = {
  user_id: '',
  basic_info: {
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    desiredRole: ''
  },
  experience: [],
  education: [],
  projects: [],
  achievements: []
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = useCallback((data: Partial<Profile>) => {
    setLoading(true)
    try {
      setProfile(prevProfile => {
        const updatedProfile = {
          ...prevProfile,
          basic_info: {
            ...prevProfile.basic_info,
            ...(data.basic_info || {})
          },
          experience: data.experience || prevProfile.experience,
          education: data.education || prevProfile.education,
          projects: data.projects || prevProfile.projects,
          achievements: data.achievements || prevProfile.achievements
        }

        // Only update if there are actual changes
        if (isEqual(prevProfile, updatedProfile)) {
          return prevProfile
        }

        console.log('Profile updated:', updatedProfile)
        return updatedProfile
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const value = useMemo(() => ({
    profile,
    loading,
    error,
    updateProfile
  }), [profile, loading, error, updateProfile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
} 