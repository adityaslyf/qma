const MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

interface MistralResponse {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class MistralService {
  private static async callMistralAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-small', // Using small for better quality
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume parser and bio writer. Extract information accurately and create engaging professional summaries.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7, // Increased for more creative bio generation
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data: MistralResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API error:', error);
      throw error;
    }
  }

  static async parseResume(text: string) {
    const prompt = `
      Analyze the following resume text comprehensively in two steps:

      1. First, create a professional first-person bio (3-4 sentences) that:
         - Starts with "I am" or similar first-person introduction
         - Highlights key expertise and experience
         - Mentions significant achievements
         - Includes relevant technologies/skills
         - Describes career goals and work preferences
         - Maintains a professional yet engaging tone

      2. Then, parse the resume into a detailed JSON format with the following structure:
      {
        "name": "Full name",
        "title": "Current/most recent job title",
        "bio": "The professional bio created in step 1",
        "summary": "Brief career summary",
        "email": "Email address",
        "phone": "Phone number",
        "location": "Location details",
        "desiredRole": "Target position or role",
        "availability": "Immediate/2 weeks/etc",
        "preferredWorkType": "remote/onsite/hybrid",
        "salary": {
          "min": number,
          "max": number,
          "currency": "USD/EUR/etc"
        },
        "socialLinks": [{
          "id": "unique-id",
          "platform": "github/linkedin/twitter/portfolio/other",
          "url": "profile URL",
          "username": "optional username"
        }],
        "education": [{
          "id": "unique-id",
          "institution": "School/University name",
          "degree": "Degree type",
          "field": "Field of study",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "grade": "GPA or grade",
          "activities": "Extracurricular activities",
          "description": "Program description",
          "location": "Institution location",
          "achievements": ["Notable academic achievements"]
        }],
        "experience": [{
          "id": "unique-id",
          "company": "Company name",
          "role": "Job title",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "current": boolean,
          "description": "Role description",
          "location": "Job location",
          "employmentType": "full-time/part-time/contract/internship/freelance",
          "technologies": ["Tech stack used"],
          "highlights": ["Key accomplishments"],
          "achievements": ["Measurable results"],
          "teamSize": number,
          "responsibilities": ["Key duties"]
        }],
        "projects": [{
          "id": "unique-id",
          "name": "Project name",
          "description": "Detailed description",
          "shortDescription": "Brief overview",
          "technologies": ["Technologies used"],
          "url": "Live project URL",
          "githubUrl": "Source code URL",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "highlights": ["Key features/achievements"],
          "role": "Your role in project",
          "teamSize": number,
          "status": "completed/in-progress/planned",
          "category": "professional/personal/academic/open-source"
        }],
        "skills": [{
          "id": "unique-id",
          "category": "Skill category",
          "name": "Skill name",
          "level": "beginner/intermediate/advanced/expert",
          "yearsOfExperience": number,
          "lastUsed": "YYYY-MM",
          "items": ["Related technologies/tools"],
          "endorsements": number
        }],
        "achievements": [{
          "id": "unique-id",
          "title": "Achievement title",
          "date": "YYYY-MM-DD",
          "description": "Detailed description",
          "url": "Related URL",
          "issuer": "Awarding organization",
          "category": "award/recognition/publication/other",
          "impact": "Measurable impact"
        }],
        "languages": [{
          "id": "unique-id",
          "name": "Language name",
          "proficiency": "basic/intermediate/advanced/native",
          "speaking": "proficiency level",
          "writing": "proficiency level",
          "reading": "proficiency level",
          "certification": "Language certification if any"
        }],
        "certifications": [{
          "id": "unique-id",
          "name": "Certification name",
          "issuer": "Issuing organization",
          "issueDate": "YYYY-MM-DD",
          "expiryDate": "YYYY-MM-DD",
          "credentialId": "Certification ID",
          "credentialUrl": "Verification URL",
          "description": "Certification details",
          "skills": ["Related skills"]
        }],
        "publications": [{
          "id": "unique-id",
          "title": "Publication title",
          "publisher": "Publisher name",
          "date": "YYYY-MM-DD",
          "url": "Publication URL",
          "description": "Publication details",
          "authors": ["Author names"],
          "type": "article/blog/paper/book/other",
          "citations": number
        }],
        "volunteering": [{
          "id": "unique-id",
          "organization": "Organization name",
          "role": "Your role",
          "startDate": "YYYY-MM-DD",
          "endDate": "YYYY-MM-DD",
          "current": boolean,
          "description": "Role description",
          "location": "Location",
          "cause": "Area of impact",
          "impact": "Measurable results",
          "highlights": ["Key contributions"]
        }],
        "interests": ["Personal/professional interests"],
        "references": [{
          "id": "unique-id",
          "name": "Reference name",
          "title": "Job title",
          "company": "Company name",
          "email": "Contact email",
          "phone": "Contact phone",
          "relationship": "Professional relationship",
          "recommendation": "Reference text"
        }]
      }

      Resume text to parse:
      ${text}

      Return only valid JSON. Ensure all IDs are unique UUIDs, dates are in YYYY-MM-DD format, and all arrays exist (empty if no data).
      Make reasonable assumptions for missing data based on context. Maintain consistency in formatting.
    `;

    try {
      const response = await this.callMistralAPI(prompt);
      console.log('Raw API response:', response);
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate and ensure required fields
        const ensureArrays = [
          'socialLinks', 'education', 'experience', 'projects', 
          'skills', 'achievements', 'languages', 'certifications',
          'publications', 'volunteering', 'interests', 'references'
        ];

        ensureArrays.forEach(field => {
          parsedData[field] = parsedData[field] || [];
        });

        // Generate fallback bio if missing
        if (!parsedData.bio?.trim()) {
          const bioPrompt = `
            Create a professional first-person bio (3-4 sentences) for someone with:
            Name: ${parsedData.name || 'Unknown'}
            Title: ${parsedData.title || 'Professional'}
            Experience: ${parsedData.experience?.[0]?.company || ''} as ${parsedData.experience?.[0]?.role || ''}
            Skills: ${parsedData.skills?.map(s => s.name).join(', ') || 'Various skills'}
            Achievements: ${parsedData.achievements?.[0]?.title || ''}
            
            Make it engaging and professional, starting with "I am" or similar.
          `;
          
          const bioPart = await this.callMistralAPI(bioPrompt);
          parsedData.bio = bioPart.trim();
        }

        // Ensure all IDs are unique UUIDs
        ensureArrays.forEach(field => {
          parsedData[field] = parsedData[field].map(item => ({
            ...item,
            id: item.id || crypto.randomUUID()
          }));
        });

        return parsedData;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Raw response:', response);
        throw new Error('Failed to parse API response as JSON');
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }
}
