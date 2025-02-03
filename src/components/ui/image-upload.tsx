import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  render: (props: { preview: string }) => React.ReactNode
}

export function ImageUpload({ value, onChange, render }: ImageUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        // Here you would typically upload to your storage service
        // For now, we'll just create an object URL
        const url = URL.createObjectURL(file)
        onChange(url)
      }
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"]
    },
    maxFiles: 1
  })

  return (
    <div
      {...getRootProps()}
      className="relative cursor-pointer"
    >
      <input {...getInputProps()} />
      {render({ preview: value || "" })}
      {isDragActive && (
        <div className="absolute inset-0 bg-primary/20 rounded-full flex items-center justify-center">
          <Upload className="h-6 w-6 text-primary" />
        </div>
      )}
    </div>
  )
} 