import { useState } from "react"
import { Label } from "./label"
import { Input } from "./input"
import { Button } from "./button"
import { Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface TechStackFieldProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  error?: string
  className?: string
}

export function TechStackField({
  label,
  value = [],
  onChange,
  error,
  className
}: TechStackFieldProps) {
  const [input, setInput] = useState("")

  const handleAdd = () => {
    if (input.trim()) {
      onChange([...value, input.trim()])
      setInput("")
    }
  }

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        {value.map((tech, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md"
          >
            <span className="text-sm">{tech}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4"
              onClick={() => handleRemove(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
          placeholder="Add technology..."
          className={error ? "border-red-500" : ""}
        />
        <Button 
          type="button"
          variant="outline" 
          size="icon"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
} 