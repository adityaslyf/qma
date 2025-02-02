import { useState } from 'react'
import { EmailTemplate, TemplateService } from '@/lib/template-service'
import { Profile } from '@/types/profile'
import { useToast } from '@/components/ui/custom-toaster'

export function useTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateTemplate = async (
    profile: Profile,
    type: EmailTemplate['type'],
    role: string,
    company?: string
  ) => {
    try {
      setIsGenerating(true)
      const template = await TemplateService.generateEmailTemplate(
        profile,
        type,
        role,
        company
      )
      
      setTemplates(prev => [...prev, template])
      
      toast({
        title: 'Success',
        description: 'Email template generated successfully',
      })
      
      return template
    } catch (error) {
      console.error('Template generation error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate template',
        variant: 'destructive',
      })
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const updateTemplate = (updatedTemplate: EmailTemplate) => {
    setTemplates(prev => 
      prev.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    )
  }

  const deleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId))
  }

  return {
    templates,
    isGenerating,
    generateTemplate,
    updateTemplate,
    deleteTemplate
  }
}
