import { Label } from "./label"
import { Input } from "./input"
import { Textarea } from "./textarea"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  value?: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

interface TextFieldProps extends FormFieldProps {
  type?: string
}

interface TextAreaFieldProps extends FormFieldProps {
  rows?: number
}

export function TextField({ 
  label, 
  value, 
  onChange, 
  type = "text",
  error,
  className 
}: TextFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export function TextAreaField({ 
  label, 
  value, 
  onChange, 
  rows = 3,
  error,
  className 
}: TextAreaFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={error ? "border-red-500" : ""}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
} 