import { useState } from 'react'
import { useProfile } from '@/contexts/profile-context'
import { useTemplates } from '@/hooks/use-template'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Loader2, Copy} from 'lucide-react'
import { TemplateEditor } from './template-editor'
import {  TemplateType } from '@/lib/template-service'
import { showToast } from '@/lib/toast-utils'

const TEMPLATE_TYPES: { label: string; value: TemplateType }[] = [
  { label: 'Cold Email', value: 'cold-email' },
  { label: 'Follow Up', value: 'follow-up' },
  { label: 'Thank You', value: 'thank-you' },
  { label: 'Connection Request', value: 'connection-request' },
  { label: 'Interview Request', value: 'interview-request' },
  { label: 'Salary Negotiation', value: 'salary-negotiation' },
]

export function TemplateGenerator() {
  const { profile } = useProfile()
  const { 
    generateTemplate, 
    templates, 
    isGenerating, 
    updateTemplate,
  } = useTemplates()
  const [targetRole, setTargetRole] = useState(profile?.basic_info.desiredRole || '')
  const [company, setCompany] = useState('')
  const [type, setType] = useState<TemplateType>('cold-email')

  const handleGenerate = async () => {
    if (!profile) return
    await generateTemplate(profile, type, targetRole, company)
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast.success('Template copied to clipboard')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Target Role"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
        <Input
          placeholder="Company Name (Optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Select value={type} onValueChange={(value: TemplateType) => setType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select template type" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_TYPES.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={handleGenerate}
        disabled={isGenerating || !targetRole}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Template...
          </>
        ) : (
          'Generate Email Template'
        )}
      </Button>

      <div className="space-y-4">
        {templates.map(template => (
          <Card key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">Subject: {template.subject}</h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(`Subject: ${template.subject}\n\n${template.body}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <TemplateEditor
                  template={template}
                  onSave={(updated) => updateTemplate(updated)}
                  isDialog
                />
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm">{template.body}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {template.company ? `For ${template.company} • ` : ''}{template.role}
              {template.lastEdited && ` • Edited ${new Date(template.lastEdited).toLocaleDateString()}`}
              {template.isCustom && ' • Custom'}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
