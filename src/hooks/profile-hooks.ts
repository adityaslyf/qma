import { useState } from 'react'
import { Profile } from '@/types/profile'

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
      
      setProfile(prev => {
        const newProfile = {
          ...prev,
          ...updatedProfile,
          basic_info: {
            ...prev.basic_info,
            ...(updatedProfile.basic_info || {})
          },
          education: updatedProfile.education || prev.education,
          experience: updatedProfile.experience || prev.experience,
          projects: updatedProfile.projects || prev.projects,
          achievements: updatedProfile.achievements || prev.achievements
        }
        return newProfile
      })
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
