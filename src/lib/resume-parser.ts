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
  const experience: Experience[] = []
  
  // Common job title keywords
  const jobTitles = [
    'Software Engineer', 'Developer', 'Engineer', 'Intern', 'Manager',
    'Lead', 'Architect', 'Consultant', 'Associate', 'Analyst'
  ]

  // Common company indicators
  const companyIndicators = ['at', 'with', '-', '|', '@']

  // Split text into lines and clean them
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Look for lines containing job titles
    const hasJobTitle = jobTitles.some(title => 
      line.toLowerCase().includes(title.toLowerCase())
    )

    if (hasJobTitle) {
      // Try to extract dates from the current or next line
      const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})|(?:\d{1,2}\/\d{4})|(?:\d{4})/gi
      const dates = line.match(datePattern) || (lines[i + 1] || '').match(datePattern) || []
      
      // Try to extract company name
      let company = ''
      for (const indicator of companyIndicators) {
        const parts = line.split(indicator)
        if (parts.length > 1) {
          company = parts[1].trim()
          break
        }
      }

      // Try to extract role
      let role = ''
      for (const title of jobTitles) {
        if (line.toLowerCase().includes(title.toLowerCase())) {
          role = title
          break
        }
      }

      // Look for description in subsequent lines
      let description = ''
      let j = i + 1
      while (j < lines.length && j < i + 5) { // Look at next 4 lines max
        if (!lines[j].match(datePattern)) {
          description += lines[j] + ' '
        }
        j++
      }

      if (role) {
        experience.push({
          company: company || 'Unknown Company',
          role: role,
          startDate: dates[0] || '',
          endDate: dates[1] || 'Present',
          description: description.trim(),
          technologies: extractTechnologiesFromText(description)
        })
      }
    }
  }

  console.log('Extracted Experience:', experience)
  return experience
}

function extractEducation(text: string): Education[] {
  const education: Education[] = []
  
  // Common education keywords
  const eduKeywords = [
    'Bachelor', 'Master', 'PhD', 'B.Tech', 'M.Tech', 'B.E.', 'M.E.',
    'B.Sc', 'M.Sc', 'BSc', 'MSc', 'College', 'University', 'Institute',
    'School'
  ]

  // Common degree patterns
  const degreePatterns = [
    'Bachelor[s]?\\s+(?:of|in)\\s+[\\w\\s]+',
    'Master[s]?\\s+(?:of|in)\\s+[\\w\\s]+',
    'B\\.?Tech',
    'M\\.?Tech',
    'B\\.?E',
    'M\\.?E',
    'PhD',
    'Doctorate'
  ]

  // Split text into lines and clean them
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if line contains education keywords
    const hasEduKeyword = eduKeywords.some(keyword => 
      line.toLowerCase().includes(keyword.toLowerCase())
    )

    if (hasEduKeyword) {
      // Try to extract dates
      const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})|(?:\d{1,2}\/\d{4})|(?:\d{4})/gi
      const dates = line.match(datePattern) || (lines[i + 1] || '').match(datePattern) || []

      // Try to extract institution
      let institution = ''
      for (const keyword of eduKeywords) {
        if (line.includes(keyword)) {
          const parts = line.split(keyword)
          institution = (parts[0] || parts[1] || '').trim()
          if (institution) break
        }
      }

      // Try to extract degree
      let degree = ''
      for (const pattern of degreePatterns) {
        const match = line.match(new RegExp(pattern, 'i'))
        if (match) {
          degree = match[0]
          break
        }
      }

      // Try to extract field of study
      const fields = [
        'Computer Science', 'Information Technology', 'Engineering',
        'Mathematics', 'Physics', 'Business', 'Management'
      ]
      let field = ''
      for (const f of fields) {
        if (line.toLowerCase().includes(f.toLowerCase())) {
          field = f
          break
        }
      }

      if (institution || degree) {
        education.push({
          institution: institution || 'Unknown Institution',
          degree: degree || 'Unknown Degree',
          field: field || degree || 'Unknown Field',
          startDate: dates[0] || '',
          endDate: dates[1] || dates[0] || '',
          grade: extractGrade(lines[i], lines[i + 1])
        })
      }
    }
  }

  console.log('Extracted Education:', education)
  return education
}

// Helper function to extract grade
function extractGrade(line1: string, line2: string = ''): string | undefined {
  const gradePatterns = [
    /GPA:\s*([\d.]+)/i,
    /CGPA:\s*([\d.]+)/i,
    /Grade:\s*([\d.]+)/i,
    /([\d.]+)\s*GPA/i,
    /([\d.]+)\s*CGPA/i
  ]

  for (const pattern of gradePatterns) {
    const match1 = line1.match(pattern)
    if (match1) return match1[1]
    
    const match2 = line2?.match(pattern)
    if (match2) return match2[1]
  }

  return undefined
}

// Helper function to extract technologies from text
function extractTechnologiesFromText(text: string): string[] {
  return extractSkills(text)
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
