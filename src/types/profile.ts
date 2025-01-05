export interface Profile {
  basic_info: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    desiredRole?: string;
    bio?: string;
  };
  experience: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  education: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
  projects: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
  }>;
  achievements: Array<{
    title?: string;
    description?: string;
    date?: string;
  }>;
}

export const initialProfile: Profile = {
  basic_info: {
    name: '',
    email: '',
    phone: '',
    location: '',
    desiredRole: '',
    bio: ''
  },
  experience: [],
  education: [],
  projects: [],
  achievements: []
}
