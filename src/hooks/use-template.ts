import { useState, useEffect } from 'react'
import { EmailTemplate, TemplateService } from '@/lib/template-service'
import { Profile } from '@/types/profile'
import { showToast } from '@/lib/toast-utils'

export function useTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedTemplates')
    if (saved) {
      setSavedTemplates(JSON.parse(saved))
    }
  }, [])

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
      
      setTemplates(prev => [template, ...prev].slice(0, 10)) // Keep last 10 templates
      showToast.success('Email template generated successfully')
      return template
    } catch (error) {
      console.error('Template generation error:', error)
      showToast.error(error instanceof Error ? error.message : 'Failed to generate template')
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  const updateTemplate = (updatedTemplate: EmailTemplate) => {
    // Update in recent templates
    setTemplates(prev => 
      prev.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
    )

    // Update in saved templates if it exists there
    setSavedTemplates(prev => {
      const updated = prev.map(template => 
        template.id === updatedTemplate.id ? updatedTemplate : template
      )
      localStorage.setItem('savedTemplates', JSON.stringify(updated))
      return updated
    })
  }

  const saveTemplate = (template: EmailTemplate) => {
    setSavedTemplates(prev => {
      const updated = [template, ...prev]
      localStorage.setItem('savedTemplates', JSON.stringify(updated))
      return updated
    })
    showToast.success('Template saved successfully')
  }

  const deleteTemplate = (templateId: string, isSaved: boolean = false) => {
    if (isSaved) {
      setSavedTemplates(prev => {
        const updated = prev.filter(t => t.id !== templateId)
        localStorage.setItem('savedTemplates', JSON.stringify(updated))
        return updated
      })
    } else {
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    }
    showToast.success('Template deleted')
  }

  return {
    templates,
    savedTemplates,
    isGenerating,
    generateTemplate,
    updateTemplate,
    saveTemplate,
    deleteTemplate
  }
}
