import { useState, useEffect } from 'react'
import { EmailTemplate } from '@/lib/template-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/custom-toaster'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface TemplateEditorProps {
  template: EmailTemplate
  onSave: (updatedTemplate: EmailTemplate) => void
  onClose?: () => void
  isDialog?: boolean
}

export function TemplateEditor({ 
  template, 
  onSave, 
  onClose,
  isDialog = false 
}: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate>(template)
  const [isDirty, setIsDirty] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setEditedTemplate(template)
  }, [template])

  const handleChange = (
    field: keyof Pick<EmailTemplate, 'subject' | 'body'>,
    value: string
  ) => {
    setEditedTemplate(prev => ({
      ...prev,
      [field]: value,
      lastEdited: new Date(),
      isCustom: true
    }))
    setIsDirty(true)
  }

  const handleSave = () => {
    onSave(editedTemplate)
    setIsDirty(false)
    toast({
      title: 'Success',
      description: 'Template saved successfully'
    })
    onClose?.()
  }

  const EditorContent = () => (
    <>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Subject</label>
          <Input
            value={editedTemplate.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Body</label>
          <Textarea
            value={editedTemplate.body}
            onChange={(e) => handleChange('body', e.target.value)}
            className="mt-1 min-h-[200px]"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-4">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSave}
          disabled={!isDirty}
        >
          Save Changes
        </Button>
      </div>
    </>
  )

  if (isDialog) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Template</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <EditorContent />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Edit Template</h3>
      </CardHeader>
      <CardContent>
        <EditorContent />
      </CardContent>
    </Card>
  )
}
