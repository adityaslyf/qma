export type SocialLink = {
  platform: 'github' | 'linkedin' | 'twitter' | 'portfolio'
  url: string
}

export type Education = {
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
}

export type Experience = {
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
  technologies: string[]
}

export type Project = {
  title: string
  description: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  image?: string
}

export type Achievement = {
  title: string
  description: string
  date: string
}

export type Certificate = {
  name: string
  issuer: string
  date: string
  url?: string
}

export type Profile = {
  id: string
  name: string
  title: string
  bio: string
  email: string
  phone: string
  location: string
  avatar?: string
  portfolioUrl?: string
  socialLinks: SocialLink[]
  education: Education[]
  skills: string[]
  techStack: string[]
  experience: Experience[]
  achievements: Achievement[]
  projects: Project[]
  certificates: Certificate[]
  desiredRole: string
}
