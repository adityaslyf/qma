import { pdfjs } from './pdf-config'
import * as mammoth from 'mammoth'
import { Profile, Experience, Education } from '@/types/profile'

// Helper function to extract text based on file type
async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer))
      const pdf = await loadingTask.promise
      let fullText = ''
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }
      
      console.log('Extracted Text:', fullText)
      return fullText.trim()
    } catch (error) {
      console.error('PDF parsing error:', error)
      throw new Error('Failed to parse PDF file')
    }
  } else if (
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value.trim()
    } catch (error) {
      console.error('Word document parsing error:', error)
      throw new Error('Failed to parse Word document')
    }
  }

  throw new Error('Unsupported file type')
}

// Helper functions to extract specific information
function extractEmail(text: string): string {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi
  const matches = text.match(emailRegex)
  return matches ? matches[0] : ''
}

function extractPhone(text: string): string {
  const phoneRegex = /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g
  const matches = text.match(phoneRegex)
  return matches ? matches[0] : ''
}

function extractSkills(text: string): string[] {
  // Common programming languages and technologies
  const commonTechnologies = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'Ruby', 'PHP', // Escaped C++
    'React', 'Angular', 'Vue', 'Node\\.js', 'Express', 'Django', 'Flask', // Escaped Node.js
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'HTML', 'CSS', 'Sass', 'Linux', 'Agile'
  ]

  // Helper function to escape special characters in regex
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  return commonTechnologies.filter(tech => {
    try {
      const regex = new RegExp(`\\b${escapeRegExp(tech)}\\b`, 'i')
      return regex.test(text)
    } catch (error) {
      console.warn(`Invalid regex for technology: ${tech}`)
      return false
    }
  })
}

function extractExperience(text: string): Experience[] {
  // This is a basic implementation. You might want to enhance it based on your needs
  const experienceRegex = /(?:experience|work|employment).*?\n([\s\S]*?)(?=\n\s*(?:education|skills|projects|$))/i
  const match = text.match(experienceRegex)
  
  if (!match) return []

  const experienceText = match[1]
  const experiences: Experience[] = []
  
  // Split by date patterns to identify different positions
  const datePattern = /(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4})/g
  const sections = experienceText.split(datePattern)
  
  sections.forEach((section, _index) => {
    if (section.trim()) {
      const lines = section.split('\n').filter(line => line.trim())
      if (lines.length >= 2) {
        experiences.push({
          company: lines[0].trim(),
          role: lines[1].trim(),
          startDate: '', // You'll need to enhance this to properly extract dates
          endDate: '',
          description: lines.slice(2).join('\n').trim(),
          technologies: extractSkills(section)
        })
      }
    }
  })

  return experiences
}

function extractEducation(text: string): Education[] {
  const educationRegex = /(?:education|academic).*?\n([\s\S]*?)(?=\n\s*(?:experience|skills|projects|$))/i
  const match = text.match(educationRegex)
  
  if (!match) return []

  const educationText = match[1]
  const education: Education[] = []
  
  const sections = educationText.split('\n\n')
  
  sections.forEach(section => {
    const lines = section.split('\n').filter(line => line.trim())
    if (lines.length >= 2) {
      education.push({
        institution: lines[0].trim(),
        degree: lines[1].trim(),
        field: lines[1].trim(), // You might want to enhance this to better separate degree and field
        startDate: '', // You'll need to enhance this to properly extract dates
        endDate: ''
      })
    }
  })

  return education
}

export async function parseResume(file: File): Promise<Partial<Profile>> {
  try {
    const text = await extractTextFromFile(file)
    
    // Extract and log each piece of information
    const email = extractEmail(text)
    console.log('Extracted Email:', email)

    const phone = extractPhone(text)
    console.log('Extracted Phone:', phone)

    const skills = extractSkills(text)
    console.log('Extracted Skills:', skills)

    const experience = extractExperience(text)
    console.log('Extracted Experience:', experience)

    const education = extractEducation(text)
    console.log('Extracted Education:', education)

    // Construct partial profile
    const parsedProfile: Partial<Profile> = {
      email,
      phone,
      skills,
      techStack: skills,
      experience,
      education
    }

    console.log('Final Parsed Profile:', parsedProfile)
    return parsedProfile
  } catch (error) {
    console.error('Error parsing resume:', error)
    throw error
  }
}
