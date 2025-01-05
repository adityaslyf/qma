import { useState } from 'react'
import { Profile } from '@/types/profile'

const initialProfile: Profile = {
  id: crypto.randomUUID(),
  name: '',
  title: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  desiredRole: '',
  summary: '',
  availability: '',
  preferredWorkType: 'remote',
  socialLinks: [],
  education: [],
  skills: [],
  experience: [],
  achievements: [],
  projects: [],
  languages: [],
  certifications: [],
  publications: [],
  volunteering: [],
  interests: [],
  references: []
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
