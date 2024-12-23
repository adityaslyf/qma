import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ResumeDropzoneProps {
  onParse: (file: File) => void
  isProcessing?: boolean
}

export function ResumeDropzone({ onParse, isProcessing = false }: ResumeDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onParse(acceptedFiles[0])
    }
  }, [onParse])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isProcessing
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        {isDragActive
          ? "Drop your resume here"
          : isProcessing
          ? "Processing resume..."
          : "Drag & drop your resume here, or click to select"}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        Supports PDF, DOC, DOCX
      </p>
    </div>
  )
}
