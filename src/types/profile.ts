export interface Profile {
  basic_info: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    summary?: string;
    // add other basic info fields as needed
  };
  experience: Array<{
    company?: string;
    position?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    // add other experience fields as needed
  }>;
  education: Array<{
    institution?: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
    // add other education fields as needed
  }>;
  projects: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    // add other project fields as needed
  }>;
  achievements: Array<{
    title?: string;
    description?: string;
    date?: string;
    // add other achievement fields as needed
  }>;
}
