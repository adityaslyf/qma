export interface Profile {
  id: string
  name: string
  avatar?: string
  title: string
  bio: string
  email: string
  phone: string
  location: string
  desiredRole: string
  summary: string
  availability: string
  preferredWorkType: 'remote' | 'onsite' | 'hybrid'
  salary?: {
    min: number
    max: number
    currency: string
  }
  socialLinks: SocialLink[]
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: Skill[]
  achievements: Achievement[]
  languages: Language[]
  certifications: Certification[]
  publications: Publication[]
  volunteering: Volunteering[]
  interests: string[]
  references: Reference[]
}

export interface SocialLink {
  id: string
  platform: 'github' | 'linkedin' | 'twitter' | 'portfolio' | 'other'
  url: string
  username?: string
}

export interface Education {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
  activities?: string
  description?: string
  location?: string
  achievements?: string[]
}

export interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  description: string
  location?: string
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
  technologies: string[]
  highlights: string[]
  achievements: string[]
  teamSize?: number
  responsibilities: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  shortDescription: string
  technologies: string[]
  url?: string
  githubUrl?: string
  images?: string[]
  startDate?: string
  endDate?: string
  highlights: string[]
  role?: string
  teamSize?: number
  status: 'completed' | 'in-progress' | 'planned'
  category: 'professional' | 'personal' | 'academic' | 'open-source'
}

export interface Skill {
  id: string
  category: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  yearsOfExperience?: number
  lastUsed?: string
  items: string[]
  endorsements?: number
}

export interface Achievement {
  id: string
  title: string
  date: string
  description: string
  url?: string
  issuer?: string
  category: 'award' | 'recognition' | 'publication' | 'other'
  impact?: string
}

export interface Language {
  id: string
  name: string
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'native'
  speaking?: 'basic' | 'intermediate' | 'advanced' | 'native'
  writing?: 'basic' | 'intermediate' | 'advanced' | 'native'
  reading?: 'basic' | 'intermediate' | 'advanced' | 'native'
  certification?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  description?: string
  skills: string[]
}

export interface Publication {
  id: string
  title: string
  publisher: string
  date: string
  url?: string
  description: string
  authors: string[]
  type: 'article' | 'blog' | 'paper' | 'book' | 'other'
  citations?: number
}

export interface Volunteering {
  id: string
  organization: string
  role: string
  startDate: string
  endDate?: string
  current: boolean
  description: string
  location?: string
  cause?: string
  impact?: string
  highlights: string[]
}

export interface Reference {
  id: string
  name: string
  title: string
  company: string
  email?: string
  phone?: string
  relationship: string
  recommendation?: string
}
