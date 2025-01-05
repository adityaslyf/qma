import { useState } from 'react'
import { Profile } from '@/types/profile'

const initialProfile: Profile = {
  basic_info: {
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    desiredRole: ''
  },
  education: [],
  experience: [],
  projects: [],
  achievements: []
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = (updatedProfile: Partial<Profile>) => {
    try {
      setLoading(true)
      setError(null)
      setProfile(prev => ({ ...prev, ...updatedProfile }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile
  }
}
