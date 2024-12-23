import { ThemeProvider } from "./components/theme-provider"
import { Header } from "./components/header"
import { Toaster } from 'react-hot-toast'
import { ResumeDropzone } from "./components/resume-dropzone"
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'

function App() {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleResumeParse = async () => {
    try {
      setIsProcessing(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Resume parsed successfully!')
      navigate('/profile')
    } catch (error) {
      toast.error('Failed to parse resume')
      console.error('Resume parsing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
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
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-background text-foreground border border-border',
            success: {
              className: 'bg-background text-foreground border-green-500',
              iconTheme: {
                primary: '#22c55e',
                secondary: 'white',
              },
            },
            error: {
              className: 'bg-background text-foreground border-red-500',
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white',
              },
            },
          }}
        />
      </div>
    </ThemeProvider>
  )
}

export default App
