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

// Add types for API requests
export type ProfileRequest = {
  action: 'create' | 'update' | 'delete'
  data: ProfileUpdate
}

// Add types for resume parsing
export type ParsedResume = Partial<Profile>

// Add types for file upload
export type FileUpload = {
  file: File
  type: 'avatar' | 'resume' | 'projectImage'
}

// Add types for search and filtering
export type ProfileFilter = {
  skills?: string[]
  location?: string
  experience?: number
  role?: string
}

// Add types for sorting
export type ProfileSort = {
  field: keyof Profile
  direction: 'asc' | 'desc'
}

// Add types for pagination
export type PaginationParams = {
  page: number
  limit: number
}

// Add types for profile statistics
export type ProfileStats = {
  totalProfiles: number
  averageExperience: number
  topSkills: { skill: string; count: number }[]
  locationDistribution: { location: string; count: number }[]
}

// Add types for profile visibility settings
export type PrivacySettings = {
  isPublic: boolean
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
}

// Add types for profile completion status
export type CompletionStatus = {
  [K in keyof Profile]: boolean
}

// Add types for profile import/export
export type ProfileExport = {
  version: string
  data: Profile
  exportDate: string
}

// Add types for profile notifications
export type ProfileNotification = {
  type: 'update' | 'reminder' | 'alert'
  message: string
  date: string
  read: boolean
}
