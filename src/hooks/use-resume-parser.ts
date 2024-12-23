import { useState } from 'react'
import { Profile } from '@/types/profile'
import { parseResume } from '@/lib/resume-parser'

export function useResumeParser() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processResume = async (file: File): Promise<Partial<Profile> | null> => {
    try {
      console.log('Processing file:', file.name, file.type)
      setIsProcessing(true)
      setError(null)

      const parsedData = await parseResume(file)
      console.log('Processed Resume Data:', parsedData)
      return parsedData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse resume'
      console.error('Resume processing error:', errorMessage)
      setError(errorMessage)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    parseResume: processResume,
    isProcessing,
    error
  }
}
