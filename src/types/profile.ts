export type SocialLink = {
  platform: "github" | "linkedin" | "twitter" | "portfolio";
  url: string;
};

export type Education = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  grade?: string;
  activities?: string;
  description?: string;
  location?: string;
  achievements?: string[];
};

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'

export type Experience = {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  employmentType: EmploymentType;
  technologies: string[];
  highlights?: string[];
  achievements?: string[];
  responsibilities?: string[];
};

export type Project = {
  id?: string;
  title?: string;
  name: string;
  url: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  image?: string;
  shortDescription?: string;
  images?: string[];
  highlights?: string[];
  status?: "planned" | "in-progress" | "completed";
  category?: "personal" | "professional" | "open-source";
};

export type Achievement = {
  id?: string; // Add id for list management
  title: string;
  description: string;
  date: string;
  category: "other" | "award" | "certification" | "publication" | "recognition" | "volunteering" | "other";
  url: string;
  issuer: string;
  impact: string;
};

export type Certificate = {
  id?: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
};

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
  id?: string;
  user_id: string;
  full_name?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  desiredRole?: string;
  summary?: string;
  availability?: string;
  preferredWorkType?: string;
  basic_info: BasicInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  achievements: Achievement[];
  skills?: string[];
  certifications?: Certificate[];
  languages?: string[];
  socialLinks?: SocialLink[];
  created_at?: string;
  updated_at?: string;
  interests?: string[];
}

export interface Skill {
  id: string;
  name: string;
  level: string;
}

export const initialProfile: Profile = {
  user_id: "",
  basic_info: {
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    desiredRole: "",
  },
  education: [],
  experience: [],
  projects: [],
  achievements: [],
};

// Add validation types for form fields
export type ProfileValidation = {
  [K in keyof Profile]?: string;
};

// Add types for API responses
export type ProfileResponse = {
  success: boolean;
  data?: Profile;
  error?: string;
};

// Add types for profile updates
export type ProfileUpdate = Partial<Profile>;

// Add types for section-specific updates
export type SectionUpdate<T> = {
  index: number;
  data: Partial<T>;
};

export type ParsedResume = Partial<Profile>;

// interface User {
//   id: string;
//   email: string;
//   user_id: string;
//   hasProfile?: boolean;
// }

