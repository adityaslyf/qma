import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Plus, Trash2 } from "lucide-react"

interface FormSectionProps<T> {
  items: T[]
  onAdd: () => void
  onRemove: (index: number) => void
  renderItem: (item: T, index: number) => React.ReactNode
  addButtonText: string
}

export function FormSection<T>({ 
  items, 
  onAdd, 
  onRemove, 
  renderItem,
  addButtonText,
}: FormSectionProps<T>) {
  return (
    <div className="space-y-6">
      {items?.map((item, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            {renderItem(item, index)}
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => onRemove(index)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-2" />
        {addButtonText}
      </Button>
    </div>
  )
}