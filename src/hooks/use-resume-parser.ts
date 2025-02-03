import { useState } from 'react'
import { Profile } from '@/types/profile'
import { parseResume } from '@/lib/resume-parser'
import toast from 'react-hot-toast'

export function useResumeParser() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState('')

  const processResume = async (file: File): Promise<Partial<Profile> | null> => {
    const toastId = toast.loading('Processing resume...')
    
    try {
      setIsProcessing(true)
      setStatus('Extracting text from document...')

      const parsedData = await parseResume(file)
      
      setStatus('Analyzing with Mistral AI...')
      
      toast.success('Resume parsed successfully!', { id: toastId })
      return parsedData
    } catch (error) {
      let errorMessage = 'Failed to parse resume'
      
      if (error instanceof Error) {
        if (error.message.includes('API')) {
          errorMessage = 'AI service temporarily unavailable. Please try again.'
        } else if (error.message.includes('PDF')) {
          errorMessage = 'Error reading PDF file. Please try a different format.'
        }
      }
      
      toast.error(errorMessage, { id: toastId })
      return null
    } finally {
      setIsProcessing(false)
      setStatus('')
    }
  }

  return {
    parseResume: processResume,
    isProcessing,
    status
  }
}
