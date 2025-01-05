import { createContext, useContext, useState } from 'react'
import { Profile } from '@/types/profile'

interface ProfileContextType {
  profile: Profile | null
  loading: boolean
  error: string | null
  updateProfile: (data: Partial<Profile>) => void
}

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

  const updateProfile = (data: Partial<Profile>) => {
    console.log('Updating profile with:', data);
    setProfile(prevProfile => {
      const updatedProfile = {
        ...prevProfile,
        ...data,
        basic_info: {
          ...(prevProfile?.basic_info || initialProfile.basic_info),
          ...(data.basic_info || {})
        },
        experience: data.experience || prevProfile?.experience || [],
        education: data.education || prevProfile?.education || [],
        projects: data.projects || prevProfile?.projects || [],
        achievements: data.achievements || prevProfile?.achievements || []
      };
      console.log('Updated profile:', updatedProfile);
      return updatedProfile;
    })
  }

  return (
    <ProfileContext.Provider value={{ profile, loading, error, updateProfile }}>
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