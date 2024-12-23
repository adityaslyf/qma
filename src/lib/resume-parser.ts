import { pdfjs } from './pdf-config'
import * as mammoth from 'mammoth'
import { Profile, Experience, Education, Project } from '@/types/profile'

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
  const skillsSection = text.split(/SKILLS/i)[1]?.split(/VOLUNTEER|PROJECTS/i)[0] || ''
  
  const skillCategories = {
    'Languages': ['JavaScript', 'TypeScript'],
    'Frameworks / Libraries': [
      'Next.js', 'React.js', 'Tailwind CSS',
      'Gsap', 'Three.JS', 'Web3.js', 'Vue',
      'Node.js', 'express.js', 'Redux',
      'Chakra-ui', 'Supabase'
    ],
    'Tools': ['Postman', 'Vercel', 'Git', 'Github', 'Linux'],
    'Databases': ['PostgreSQL', 'MongoDB', 'Firebase']
  }

  const allSkills = Object.values(skillCategories).flat()
  return allSkills.filter(skill => 
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(skillsSection)
  )
}

// Helper function to extract and standardize dates
function extractDates(text: string): { startDate: string; endDate: string } {
  // Common date formats
  const datePatterns = [
    // MM/YYYY or MM-YYYY
    /(?:(?:0?[1-9]|1[0-2])[\/\-]\d{4})/g,
    // Month YYYY
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}/g,
    // YYYY
    /\b(20\d{2}|19\d{2})\b/g,
    // Present or Current
    /\b(?:Present|Current)\b/gi,
  ]

  let allDates: string[] = []
  
  // Extract all dates using different patterns
  datePatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      allDates = [...allDates, ...matches]
    }
  })

  // Sort dates chronologically
  allDates = allDates
    .filter(date => date.toLowerCase() !== 'present' && date.toLowerCase() !== 'current')
    .sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA.getTime() - dateB.getTime()
    })

  const hasPresent = text.match(/\b(?:Present|Current)\b/i)

  return {
    startDate: allDates[0] || '',
    endDate: hasPresent ? 'Present' : (allDates[allDates.length - 1] || '')
  }
}

function extractEducation(text: string): Education[] {
  const educationSection = text.split(/EDUCATION/i)[1] || ''
  const lines = educationSection.split('\n').map(line => line.trim()).filter(Boolean)
  
  const education: Education[] = []
  let currentEntry: Partial<Education> = {}

  // Fields of study mapping
  const fieldPatterns = {
    'Information Technology': /(Information Technology|IT)/i,
    'Computer Science': /(Computer Science|CSE)/i,
    'Electronics': /(Electronics|ECE)/i,
    'Mechanical': /(Mechanical|ME)/i,
    'Civil': /(Civil|CE)/i,
    'Electrical': /(Electrical|EE)/i
  }

  for (const line of lines) {
    if (line.includes('B.Tech') || line.includes('M.Tech')) {
      if (Object.keys(currentEntry).length > 0) {
        education.push(currentEntry as Education)
      }
      currentEntry = {
        degree: line.includes('B.Tech') ? 'B.Tech' : 'M.Tech',
        field: Object.entries(fieldPatterns).find(([_, pattern]) => 
          pattern.test(line)
        )?.[0] || 'Information Technology'
      }
    } else if (line.includes('KIET') || line.includes('College') || line.includes('University')) {
      currentEntry.institution = line.trim()
    } else if (/\d{4}\s*-\s*\d{4}/.test(line)) {
      const dates = line.match(/(\d{4})\s*-\s*(\d{4})/)
      currentEntry.startDate = dates?.[1] || ''
      currentEntry.endDate = dates?.[2] || ''
    }
  }

  if (Object.keys(currentEntry).length > 0) {
    education.push(currentEntry as Education)
  }

  return education
}

function extractExperience(text: string): Experience[] {
  const experienceSection = text.split(/EXPERIENCE/i)[1]?.split(/PROJECTS/i)[0] || ''
  const entries = experienceSection.split(/(?=•\s*[A-Z]|\n\s*[A-Z][a-z]+\s*•)/g)
  
  return entries.filter(Boolean).map(entry => {
    const lines = entry.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length < 2) return null

    // Extract company and location
    const companyLine = lines[0]
    const companyMatch = companyLine?.match(/(.*?)(?:\s*•\s*(Remote|India|\(.*?\)))?$/)
    const company = companyMatch?.[1]?.trim() || ''
    const location = companyMatch?.[2]?.trim() || ''

    // Extract role and dates
    const roleLine = lines[1]
    const roleMatch = roleLine?.match(/(.*?)\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2}\s*-\s*(?:Present|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2})))/)
    const role = roleMatch?.[1]?.trim() || ''
    const dates = roleMatch?.[2]?.trim() || ''

    // Extract description points
    const description = lines.slice(2)
      .filter(line => line.startsWith('•'))
      .map(line => line.replace(/^•\s*/, ''))
      .join('\n')

    return {
      company,
      role,
      startDate: dates.split('-')[0]?.trim() || '',
      endDate: dates.split('-')[1]?.trim() || '',
      description,
      technologies: extractTechnologiesFromText(description)
    }
  }).filter(Boolean) as Experience[]
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
  const commonTechnologies = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP',
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'HTML', 'CSS', 'Sass', 'Linux', 'Agile',
    'Next.js', 'Tailwind CSS', 'Web3.js', 'Solana', 'Blockchain'
  ]

  return commonTechnologies.filter(tech => 
    new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  )
}

function extractProjects(text: string): Project[] {
  const projectSection = text.split(/PROJECTS/i)[1]?.split(/VOLUNTEER|ACHIEVEMENTS/i)[0] || ''
  const entries = projectSection.split(/(?=•\s*[A-Z]|[A-Z][a-zA-Z]+\s*\()/g)
  
  return entries.filter(Boolean).map(entry => {
    const lines = entry.split('\n').map(line => line.trim()).filter(Boolean)
    if (lines.length === 0) return null

    // Extract title and type
    const titleLine = lines[0]
    const titleMatch = titleLine?.match(/(.*?)(?:\s*\((.*?)\))?$/)
    const title = titleMatch?.[1]?.replace(/^[•\s-]+/, '').trim() || ''
    const projectType = titleMatch?.[2]?.trim() || ''

    // Extract tech stack
    const techStackLine = lines.find(line => 
      /Tech\s*Stack:/i.test(line)
    )
    const technologies = techStackLine
      ?.replace(/^.*?:\s*/, '')
      .split(/,\s*/)
      .map(tech => tech.trim())
      .filter(Boolean) || []

    // Extract description with better handling of bullet points
    const descriptionLines = lines
      .filter(line => 
        (line.startsWith('•') || line.startsWith('-')) && 
        !line.includes('Tech Stack:') &&
        !line.includes('User:') &&
        !line.includes('Admin:')
      )
      .map(line => line.replace(/^[•\-]\s*/, ''))

    // Extract URLs
    const githubUrl = lines
      .find(line => line.includes('github.com'))
      ?.match(/https?:\/\/github\.com\/[^\s]+/)?.[0] || ''

    const liveUrl = lines
      .find(line => /https?:\/\/(?!github\.com)/.test(line))
      ?.match(/https?:\/\/[^\s]+/)?.[0] || ''

    return {
      title,
      description: descriptionLines.join('\n'),
      technologies,
      githubUrl,
      liveUrl,
      image: ''
    }
  }).filter(Boolean) as Project[]
}

// Add function to extract name and basic info
function extractBasicInfo(text: string) {
  const lines = text.split('\n')
  
  // Extract name (usually first large text)
  const name = lines[0]?.trim() || ''

  // Extract contact details
  const contactPatterns = {
    phone: /\(\+\d{2}\)\s*\d{10}/,
    email: /[\w.-]+@[\w.-]+\.\w+/,
    github: /github\.com\/[\w-]+/,
    linkedin: /linkedin\.com\/[\w-]+/,
    twitter: /twitter\.com\/[\w-]+/
  }

  return {
    name,
    contacts: Object.entries(contactPatterns).reduce((acc, [key, pattern]) => {
      const match = text.match(pattern)?.[0] || ''
      return { ...acc, [key]: match }
    }, {} as Record<string, string>)
  }
}

// Add function to extract full name and generate bio
function extractFullNameAndBio(text: string): { fullName: string; bio: string } {
  const lines = text.split('\n')
  
  // Extract full name (usually first line)
  const fullName = lines[0]?.trim() || ''

  // Generate bio based on experience and projects
  const experienceSection = text.split(/EXPERIENCE/i)[1]?.split(/PROJECTS/i)[0] || ''
  const projectsSection = text.split(/PROJECTS/i)[1]?.split(/VOLUNTEER|ACHIEVEMENTS/i)[0] || ''
  
  const currentRole = experienceSection
    .split('\n')
    .find(line => /(Engineer|Developer|Architect|Designer)/i.test(line))
    ?.replace(/^[•\-]\s*/, '')
    .trim() || ''

  const foundTechnologies = extractTechnologiesFromText(experienceSection + projectsSection)
  const keyTechnologies = foundTechnologies.length > 0 
    ? foundTechnologies.slice(0, 3).join(', ')
    : 'web technologies'

  const bio = currentRole 
    ? `${currentRole} with expertise in ${keyTechnologies}. Passionate about building innovative solutions and delivering high-quality software.`
    : `Software developer with expertise in ${keyTechnologies}. Passionate about building innovative solutions and delivering high-quality software.`

  return { fullName, bio }
}

export async function parseResume(file: File): Promise<Partial<Profile>> {
  try {
    const text = await extractTextFromFile(file)
    
    const { fullName, bio } = extractFullNameAndBio(text)
    const skills = extractSkills(text)
    const experience = extractExperience(text)
    const projects = extractProjects(text)
    const education = extractEducation(text)

    // Extract contact info
    const email = extractEmail(text)
    const phone = extractPhone(text)
    const githubUrl = text.match(/github\.com\/[\w-]+/)?.[0] || ''
    const linkedinUrl = text.match(/linkedin\.com\/[\w-]+/)?.[0] || ''
    const twitterUrl = text.match(/twitter\.com\/[\w-]+/)?.[0] || ''

    // Construct partial profile
    const parsedProfile: Partial<Profile> = {
      name: fullName,
      bio,
      email,
      phone,
      socialLinks: [
        { platform: 'github', url: githubUrl },
        { platform: 'linkedin', url: linkedinUrl },
        { platform: 'twitter', url: twitterUrl }
      ].filter(link => link.url),
      skills,
      techStack: skills,
      experience,
      education,
      projects
    }

    console.log('Parsed Profile:', parsedProfile)
    return parsedProfile
  } catch (error) {
    console.error('Error parsing resume:', error)
    throw error
  }
}
