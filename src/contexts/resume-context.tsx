import { createContext, useContext, useState } from 'react'
import { Profile } from '@/types/profile'

interface ResumeContextType {
  parsedResume: Partial<Profile> | null
  setParsedResume: (data: Partial<Profile> | null) => void
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [parsedResume, setParsedResume] = useState<Partial<Profile> | null>(null)

  return (
    <ResumeContext.Provider value={{ parsedResume, setParsedResume }}>
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (undefined === context) {
    throw new Error('useResume must be used within a ResumeProvider')
  }
  return context
}
