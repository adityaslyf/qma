import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ParsingStatus } from './parsing-status'
import { motion, AnimatePresence } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'

interface ResumeDropzoneProps {
  onParse: (file: File) => void
  isProcessing?: boolean
  status?: string
}

export function ResumeDropzone({ 
  onParse, 
  isProcessing = false,
  status = ''
}: ResumeDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onParse(acceptedFiles[0])
    }
  }, [onParse])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isProcessing
  })

  // Separate the motion props from dropzone props
  const motionProps: HTMLMotionProps<"div"> = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  }

  return (
    <div className="relative">
      <motion.div
        {...motionProps}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-10 transition-all",
          "bg-gradient-to-b from-background to-secondary/20",
          "shadow-lg hover:shadow-xl",
          isDragActive ? "border-primary scale-102 bg-primary/5" : "border-muted-foreground/25",
          isDragReject ? "border-red-500 bg-red-500/5" : "",
          isProcessing ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-primary/50",
          "group"
        )}
      >
        <div {...getRootProps()} className="relative z-10">
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <ParsingStatus status={status} />
            ) : (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full transform -translate-y-1/2 opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-background/80 p-6 rounded-2xl backdrop-blur-sm border border-border/50 shadow-inner">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative bg-secondary/50 p-4 rounded-full">
                          <Upload className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl font-semibold mb-2">
                          {isDragActive ? "Drop your resume here" : "Upload your resume"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Drag & drop or click to select
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-6">
                  {['PDF', 'DOC', 'DOCX'].map((format) => (
                    <div 
                      key={format}
                      className="flex items-center space-x-2 bg-secondary/50 px-4 py-2 rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">{format}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  <span>Maximum file size: 10MB</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Decorative background element */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent blur-3xl rounded-full transform -translate-y-1/2 opacity-20" />
    </div>
  )
}
