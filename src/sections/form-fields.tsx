import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Button } from "../components/ui/button"
import { Trash2 } from "lucide-react"

interface FieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  rows?: number
}

export function TextField({ label, value, onChange, type = "text" }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export function TextAreaField({ label, value, onChange, rows = 3 }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  )
}

export function TechStackField({ 
  label, 
  technologies, 
  onAdd, 
  onRemove 
}: {
  label: string
  technologies: string[]
  onAdd: (tech: string) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, index) => (
          <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded-md">
            <span>{tech}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Input
          placeholder="Add technology"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const input = e.target as HTMLInputElement
              onAdd(input.value)
              input.value = ''
            }
          }}
          className="w-32"
        />
      </div>
    </div>
  )
}
