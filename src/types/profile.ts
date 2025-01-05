export type SocialLink = {
  platform: 'github' | 'linkedin' | 'twitter' | 'portfolio'
  url: string
}

export type Education = {
  id?: string // Add id for list management
  institution: string
  degree: string
  field: string
  startDate: string
  endDate: string
  grade?: string
}

export type Experience = {
  id?: string // Add id for list management
  company: string
  role: string
  startDate: string
  endDate: string
  description: string
  technologies: string[]
  current: boolean
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'internship'
}

export type Project = {
  id?: string // Add id for list management
  title: string
  name: string
  url: string
  description: string
  technologies: string[]
  liveUrl?: string
  githubUrl?: string
  image?: string
}

export type Achievement = {
  id?: string // Add id for list management
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

export interface BasicInfo {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatar?: string;
  desiredRole: string;
}

export interface Profile {
  basic_info: BasicInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  achievements: Achievement[];
  skills?: string[];
  certificates?: Certificate[];
  socialLinks?: SocialLink[];
}

export const initialProfile: Profile = {
  basic_info: {
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    desiredRole: ''
  },
  education: [],
  experience: [],
  projects: [],
  achievements: []
}

// Add validation types for form fields
export type ProfileValidation = {
  [K in keyof Profile]?: string
}

// Add types for API responses
export type ProfileResponse = {
  success: boolean
  data?: Profile
  error?: string
}

// Add types for profile updates
export type ProfileUpdate = Partial<Profile>

// Add types for section-specific updates
export type SectionUpdate<T> = {
  index: number
  data: Partial<T>
}

export type ParsedResume = Partial<Profile>

