import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ParsingStatus } from './parsing-status'

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
        "border-2 border-dashed rounded-lg p-8 text-center transition-colors min-h-[300px] flex items-center justify-center",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
        isProcessing ? "cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
      )}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <ParsingStatus status={status} />
      ) : (
        <div className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-full inline-block">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? "Drop your resume here" : "Upload your resume"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag & drop or click to select
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Supports PDF, DOC, DOCX
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
