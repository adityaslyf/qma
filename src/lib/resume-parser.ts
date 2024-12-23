import { pdfjs } from './pdf-config'
import * as mammoth from 'mammoth'
import { Profile, Experience, Education, Project, SocialLink } from '@/types/profile'

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
// function extractDates(text: string): { startDate: string; endDate: string } {
//   // Common date formats
//   const datePatterns = [
//     // MM/YYYY or MM-YYYY
//     /(?:(?:0?[1-9]|1[0-2])[\/\-]\d{4})/g,
//     // Month YYYY
//     /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}/g,
//     // YYYY
//     /\b(20\d{2}|19\d{2})\b/g,
//     // Present or Current
//     /\b(?:Present|Current)\b/gi,
//   ]

//   let allDates: string[] = []
  
//   // Extract all dates using different patterns
//   datePatterns.forEach(pattern => {
//     const matches = text.match(pattern)
//     if (matches) {
//       allDates = [...allDates, ...matches]
//     }
//   })

//   // Sort dates chronologically
//   allDates = allDates
//     .filter(date => date.toLowerCase() !== 'present' && date.toLowerCase() !== 'current')
//     .sort((a, b) => {
//       const dateA = new Date(a)
//       const dateB = new Date(b)
//       return dateA.getTime() - dateB.getTime()
//     })

//   const hasPresent = text.match(/\b(?:Present|Current)\b/i)

//   return {
//     startDate: allDates[0] || '',
//     endDate: hasPresent ? 'Present' : (allDates[allDates.length - 1] || '')
//   }
// }

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

  return education.map(edu => ({
    institution: edu.institution,
    degree: edu.degree,
    field: edu.field,
    startDate: edu.startDate,
    endDate: edu.endDate,
    grade: edu.grade
  }))
}

function extractExperience(text: string): Experience[] {
  // Find the experience section
  const experienceSection = text.split(/EXPERIENCE/i)[1]?.split(/PROJECTS|VOLUNTEER/i)[0] || ''
  
  // Split into individual experiences
  const entries = experienceSection
    .split(/(?=(?:^|\n)(?:[•\-]\s*)?[A-Z][^•\n]*(?:Remote|India|\([^)]*\))?$)/m)
    .filter(Boolean)
    .map(entry => entry.trim())

  return entries
    .filter(entry => entry.length > 0)
    .map(entry => {
      const lines = entry.split('\n').map(line => line.trim()).filter(Boolean)
      if (lines.length < 2) return null

      // Extract company and location
      const companyLine = lines[0]
      const companyMatch = companyLine.match(/^(?:[•\-]\s*)?(.*?)(?:\s*[•\-]\s*(Remote|India|\(.*?\)))?$/)
      const company = companyMatch?.[1]?.trim() || ''

      // Extract role and dates
      const roleLine = lines[1]
      const roleMatch = roleLine.match(/^(?:[•\-]\s*)?(.*?)\s+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2}\s*-\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2}))/)
      
      const role = roleMatch?.[1]?.trim() || roleLine.split(/\s+(?=(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2})/)[0]?.trim() || ''
      const dateRange = roleMatch?.[2] || roleLine.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2}\s*-\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*\d{2})/)?.[0] || ''

      // Extract description points
      const description = lines
        .slice(2)
        .filter(line => line.startsWith('•') || line.startsWith('-'))
        .map(line => line.replace(/^[•\-]\s*/, ''))
        .join('\n')

      // Extract and format dates
      let [startDate, endDate] = dateRange.split(/\s*-\s*/)
      
      // Convert date format from "Sep' 24" to "2024-09"
      const monthMap: Record<string, string> = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      }

      function formatDate(dateStr: string): string {
        if (!dateStr) return ''
        if (dateStr.toLowerCase() === 'present') return ''
        
        const match = dateStr.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)'?\s*(\d{2})/)
        if (match) {
          const month = monthMap[match[1]]
          const year = `20${match[2]}`
          return `${year}-${month}`
        }
        return ''
      }

      startDate = formatDate(startDate)
      endDate = formatDate(endDate)

      // Extract technologies from description
      const technologies = extractTechnologiesFromText(description)

      if (!company && !role) return null

      return {
        company,
        role,
        startDate,
        endDate,
        description,
        technologies
      }
    })
    .filter(Boolean) as Experience[]
}

// Helper function to extract grade
// function extractGrade(line1: string, line2: string = ''): string | undefined {
//   const gradePatterns = [
//     /GPA:\s*([\d.]+)/i,
//     /CGPA:\s*([\d.]+)/i,
//     /Grade:\s*([\d.]+)/i,
//     /([\d.]+)\s*GPA/i,
//     /([\d.]+)\s*CGPA/i
//   ]

//   for (const pattern of gradePatterns) {
//     const match1 = line1.match(pattern)
//     if (match1) return match1[1]
    
//     const match2 = line2?.match(pattern)
//     if (match2) return match2[1]
//   }

//   return undefined
// }

// Helper function to extract technologies from text
function extractTechnologiesFromText(text: string): string[] {
  const commonTechnologies = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift',
    'Kotlin', 'Dart', 'C#', 'Scala', 'R', 'MATLAB', 'Shell', 'Perl', 'Haskell', 'Lua',
    
    // Frontend
    'React', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby', 'HTML', 'CSS',
    'SASS', 'LESS', 'Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI', 'Redux',
    'MobX', 'GraphQL', 'Apollo', 'jQuery',
    
    // Backend
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails',
    'ASP.NET', 'FastAPI', 'NestJS', 'Strapi', 'WordPress',
    
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic', 'Cordova',
    
    // Databases
    'MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Elasticsearch', 'Cassandra',
    'DynamoDB', 'Oracle', 'SQL Server',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
    'Terraform', 'Ansible', 'Prometheus', 'Grafana',
    
    // Tools & Others
    'Git', 'REST API', 'WebSocket', 'Linux', 'Agile', 'Scrum', 'Jira', 'Figma',
    'Adobe XD', 'Sketch', 'Postman', 'Swagger', 'WebRTC', 'Socket.io',
    
    // Web3 & Blockchain
    'Web3.js', 'Solidity', 'Ethereum', 'Solana', 'Smart Contracts', 'Blockchain',
    
    // AI & ML
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenCV', 'Natural Language Processing',
    'Machine Learning', 'Deep Learning', 'Computer Vision'
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
    // const projectType = titleMatch?.[2]?.trim() || ''

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
      image: undefined
    }
  }).filter(Boolean) as Project[]
}

// Add function to extract name and basic info
// function extractBasicInfo(text: string) {
//   const lines = text.split('\n')
  
//   // Extract name (usually first large text)
//   const name = lines[0]?.trim() || ''

//   // Extract contact details
//   const contactPatterns = {
//     phone: /\(\+\d{2}\)\s*\d{10}/,
//     email: /[\w.-]+@[\w.-]+\.\w+/,
//     github: /github\.com\/[\w-]+/,
//     linkedin: /linkedin\.com\/[\w-]+/,
//     twitter: /twitter\.com\/[\w-]+/
//   }

//   return {
//     name,
//     contacts: Object.entries(contactPatterns).reduce((acc, [key, pattern]) => {
//       const match = text.match(pattern)?.[0] || ''
//       return { ...acc, [key]: match }
//     }, {} as Record<string, string>)
//   }
// }

// Add function to extract full name and generate bio
function extractFullNameAndBio(text: string): { fullName: string; title: string; bio: string } {
  // Get the first few lines of text
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  
  // Look for a name in the first few lines
  // Usually the name is one of the first lines and contains only alphabets and spaces
  let fullName = ''
  for (const line of lines.slice(0, 3)) { // Check first 3 lines
    // Clean the line of common separators and contact info
    const cleanedLine = line
      .split(/[|•,\/\\\(\)\[\]\{\}@]/) // Split by common separators
      .map(part => part.trim())
      .filter(part => {
        // Filter out parts that look like contact info
        return !part.includes('@') && // email
          !part.includes('.com') && // websites
          !part.includes('+') && // phone
          !part.match(/\d{6,}/) && // numbers
          !part.match(/https?:\/\//) && // urls
          part.length > 0
      })[0] || ''

    // Check if the cleaned line looks like a name
    if (
      cleanedLine &&
      cleanedLine.length >= 2 && // At least 2 characters
      cleanedLine.length <= 50 && // Not too long
      /^[A-Za-z\s\.-]+$/.test(cleanedLine) && // Only letters, spaces, dots, and hyphens
      cleanedLine.split(' ').length >= 1 && // At least one word
      cleanedLine.split(' ').length <= 5 // Not too many words
    ) {
      fullName = cleanedLine
      break
    }
  }

  // Extract title from experience section
  const title = text.match(/(?:Title|Position):\s*([^,\n]+)/i)?.[1]?.trim() || 'Software Developer'

  // Generate bio based on experience and skills
  const experienceSection = text.split(/EXPERIENCE/i)[1]?.split(/PROJECTS|EDUCATION|SKILLS/i)[0] || ''
  const projectsSection = text.split(/PROJECTS/i)[1]?.split(/VOLUNTEER|ACHIEVEMENTS|EDUCATION|SKILLS/i)[0] || ''
  
  // Find current/most recent role
  const currentRole = experienceSection
    .split('\n')
    .find(line => 
      /(Software|Frontend|Backend|Full Stack|Mobile|iOS|Android|Web|DevOps|ML|AI|Data|Cloud|Security|QA|Test|UI\/UX)\s*(Developer|Engineer|Architect|Designer|Specialist|Analyst|Consultant)/i
      .test(line)
    )
    ?.replace(/^[•\-]\s*/, '')
    .trim() || 'Software Developer'

  // Extract key technologies
  const foundTechnologies = extractTechnologiesFromText(experienceSection + projectsSection)
  const keyTechnologies = foundTechnologies.length > 0 
    ? foundTechnologies.slice(0, 3).join(', ')
    : 'modern technologies'

  // Generate bio
  const bio = `${currentRole} with expertise in ${keyTechnologies}. Passionate about building innovative solutions and delivering high-quality software.`

  return { 
    fullName: fullName || 'Name Not Found',
    title,
    bio 
  }
}

export async function parseResume(file: File): Promise<Partial<Profile>> {
  try {
    const text = await extractTextFromFile(file)
    
    const { fullName, title, bio } = extractFullNameAndBio(text)
    const skills = extractSkills(text)
    const experience = extractExperience(text)
    const projects = extractProjects(text)
    const education = extractEducation(text)

    // Extract contact info
    const email = extractEmail(text)
    const phone = extractPhone(text)

    // Extract location (if available)
    const location = text.match(/(?:Location|Address|Based in):\s*([^,\n]+)/i)?.[1]?.trim() || ''

    // Create properly typed socialLinks
    const socialLinks: SocialLink[] = [
      { 
        platform: 'github', 
        url: text.match(/(?:github\.com\/[\w-]+)/i)?.[0] || '' 
      },
      { 
        platform: 'linkedin', 
        url: text.match(/(?:linkedin\.com\/(?:in\/)?[\w-]+)/i)?.[0] || '' 
      },
      { 
        platform: 'twitter', 
        url: text.match(/(?:twitter\.com\/[\w-]+)/i)?.[0] || '' 
      }
    ].filter(link => link.url.length > 0) as SocialLink[]

    // Portfolio URL extraction
    const portfolioUrl = text.match(/(?:portfolio|website):\s*(https?:\/\/[^\s]+)/i)?.[1] || undefined

    // Construct partial profile with correct types
    const parsedProfile: Partial<Profile> = {
      name: fullName,
      title,
      bio,
      email,
      phone,
      location,
      portfolioUrl,
      socialLinks,
      education,
      skills,
      techStack: skills,
      experience,
      projects,
      achievements: [], // Initialize empty as it's harder to reliably parse
      certificates: [], // Initialize empty as it's harder to reliably parse
      desiredRole: title // Use current role as desired role if not found
    }

    console.log('Parsed Profile:', parsedProfile)
    return parsedProfile
  } catch (error) {
    console.error('Error parsing resume:', error)
    throw error
  }
}
