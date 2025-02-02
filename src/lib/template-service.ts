import { Profile } from '@/types/profile'
import { MistralService } from './mistral-service'

export type TemplateType = 
  | 'cold-email' 
  | 'follow-up' 
  | 'thank-you' 
  | 'connection-request'
  | 'interview-request'
  | 'salary-negotiation'

export interface EmailTemplate {
  id: string
  subject: string
  body: string
  type: TemplateType
  role: string
  company?: string
  lastEdited?: Date
  isCustom?: boolean
}

export class TemplateService {
  static async generateEmailTemplate(
    profile: Profile,
    type: TemplateType,
    targetRole: string,
    company?: string
  ): Promise<EmailTemplate> {
    const prompt = `You are a professional email template generator. Create a ${type} email template for a job application.
    
    Return ONLY a JSON object with exactly this format:
    {
      "subject": "Brief and engaging email subject line",
      "body": "Professional email body content"
    }

    Use these details to personalize the email:
    - Candidate Name: ${profile.basic_info.name}
    - Current Title: ${profile.basic_info.title}
    - Target Role: ${targetRole}
    - Key Skills: ${profile.skills?.join(', ') || 'Not specified'}
    - Years of Experience: ${profile.experience?.length || 0}
    ${company ? `- Target Company: ${company}` : ''}

    Experience Highlights:
    ${profile.experience?.slice(0, 2).map(exp => 
      `- ${exp.role || 'Role'} at ${exp.company}: ${exp.description?.slice(0, 100) || 'Not specified'}...`
    ).join('\n')}

    Requirements:
    1. Keep it concise (max 200 words)
    2. Highlight relevant experience and skills
    3. Show enthusiasm and cultural fit
    4. Include a clear call to action
    5. Maintain professional tone
    6. Do not include any other text or explanation, ONLY the JSON object
    `

    try {
      const response = await MistralService.generateEmailTemplate(prompt)
      
      // Clean the response to ensure it only contains the JSON object
      const jsonStr = response.trim().replace(/```json\s*|\s*```/g, '')
      
      // Find the JSON object in the response
      const match = jsonStr.match(/\{[\s\S]*\}/)
      if (!match) {
        throw new Error('No valid JSON found in response')
      }

      let parsedResponse
      try {
        parsedResponse = JSON.parse(match[0])
      } catch (parseError) {
        // If parsing fails, try to clean the string further
        const cleanedStr = match[0]
          .replace(/[\u0000-\u001F]+/g, '') // Remove control characters
          .replace(/\\([^"\/bfnrtu])/g, '$1') // Remove invalid escapes
        parsedResponse = JSON.parse(cleanedStr)
      }

      // Validate the response structure
      if (!parsedResponse.subject || !parsedResponse.body) {
        throw new Error('Invalid template format')
      }

      return {
        id: crypto.randomUUID(),
        subject: parsedResponse.subject,
        body: parsedResponse.body,
        type,
        role: targetRole,
        company
      }
    } catch (error) {
      console.error('Template generation error:', error)
      throw new Error('Failed to generate email template')
    }
  }
}
