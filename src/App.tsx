import { ThemeProvider } from "./components/theme-provider"
import { Header } from "./components/header"
import { ResumeDropzone } from "./components/resume-dropzone"
import { CustomToaster } from "./components/ui/custom-toaster"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useResume } from './contexts/resume-context'
import { parseResume } from "./lib/resume-parser"
import { useAuth } from '@/hooks/user-auth'
import { AuthProvider } from '@/contexts/auth-context'
import { ProfileProvider } from '@/contexts/profile-context'

function App() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const { setParsedResume } = useResume()
  const { userDetails } = useAuth()

  useEffect(() => {
    // If user has profile data, redirect to profile page
    if (userDetails?.hasProfile) {
      navigate('/profile')
    }
  }, [userDetails, navigate])

  const handleResumeParse = async (file: File) => {
    try {
      setIsProcessing(true)
      const parsedData = await parseResume(file)
      
      if (parsedData) {
        console.log('Parsed resume data:', parsedData)
        setParsedResume(parsedData)
        navigate('/profile')
      } else {
        throw new Error('No data returned from resume parser')
      }
    } catch (error) {
      console.error('Resume parsing error:', error)
      toast.error('Failed to parse resume')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <AuthProvider>
      <ProfileProvider>
        <ThemeProvider defaultTheme="system">
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-6">
                  Upload Your Resume
                </h1>
                <ResumeDropzone 
                  onParse={handleResumeParse} 
                  isProcessing={isProcessing} 
                />
              </div>
            </main>
            <CustomToaster />
          </div>
        </ThemeProvider>
      </ProfileProvider>
    </AuthProvider>
  )
}

export default App
