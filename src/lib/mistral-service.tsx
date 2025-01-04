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
      Analyze the following resume text comprehensively, with special focus on:

      1. Basic Information (extract carefully):
         - Full name
         - Email address (look for email patterns)
         - Phone number (any format)
         - Current location (city, state, country)
         - Current or desired job title
         - Desired role or career objective
         - Professional summary/bio

      2. Education Details (for each institution):
         - Institution name
         - Degree type (e.g., BS, MS, PhD)
         - Field of study/Major
         - Dates of attendance
         - GPA or grades if mentioned
         - Relevant coursework
         - Academic achievements

      3. Work Experience, Projects, and Other Details
         [Previous comprehensive extraction logic]

      Parse into this JSON structure:
      {
        "name": "Full name",
        "email": "Email address",
        "phone": "Phone number",
        "location": "Current location",
        "title": "Current job title",
        "desiredRole": "Target position or career objective",
        "bio": "Professional summary",
        "summary": "Career objective or professional summary",
        "availability": "Immediate/Notice period/etc",
        "preferredWorkType": "remote/onsite/hybrid",
        
        "education": [
          {
            "id": "unique-id",
            "institution": "Full institution name",
            "degree": "Complete degree name",
            "field": "Detailed field of study/Major",
            "startDate": "YYYY-MM-DD",
            "endDate": "YYYY-MM-DD",
            "grade": "GPA or grades if available",
            "activities": "Extracurricular activities",
            "description": "Program details",
            "location": "Institution location",
            "achievements": ["Academic achievements"]
          }
        ],

        "experience": [
          // Previous experience structure
        ],
        "projects": [
          // Previous projects structure
        ],
        "achievements": [
          // Previous achievements structure
        ],
        // ... other sections ...
      }

      Resume text to parse:
      ${text}

      Important Guidelines:
      1. Extract ALL contact information carefully (email, phone, location)
      2. Look for career objectives or desired roles
      3. For education, include ALL details about field of study and degree
      4. Ensure dates are in YYYY-MM-DD format
      5. Generate unique UUIDs for each entry
      6. Make reasonable assumptions for missing data based on context
      7. Don't skip any educational qualifications mentioned
      8. Extract both current title and desired role if mentioned
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
        
        // Additional validation for basic info
        if (!parsedData.email || !parsedData.email.includes('@')) {
          // Try to find email specifically
          const emailPrompt = `
            Find ONLY the email address in this text. 
            Return just the email address, nothing else.
            Text: ${text}
          `;
          const emailResponse = await this.callMistralAPI(emailPrompt);
          const emailMatch = emailResponse.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
          if (emailMatch) {
            parsedData.email = emailMatch[0];
          }
        }

        // Validate phone number
        if (!parsedData.phone) {
          const phonePrompt = `
            Find ONLY the phone number in this text.
            Return just the phone number, nothing else.
            Text: ${text}
          `;
          const phoneResponse = await this.callMistralAPI(phonePrompt);
          const phoneMatch = phoneResponse.match(/[\d\s()+.-]{10,}/);
          if (phoneMatch) {
            parsedData.phone = phoneMatch[0];
          }
        }

        // If education field is missing or incomplete
        if (!parsedData.education?.[0]?.field) {
          const educationPrompt = `
            Analyze this text for education details.
            Focus on finding:
            - Field of study/Major
            - Complete degree name
            - Institution details
            Return in JSON format.
            Text: ${text}
          `;
          const educationResponse = await this.callMistralAPI(educationPrompt);
          const educationMatch = educationResponse.match(/\{[\s\S]*\}/);
          if (educationMatch) {
            const educationData = JSON.parse(educationMatch[0]);
            if (educationData.education?.length > 0) {
              parsedData.education = educationData.education;
            }
          }
        }

        // Ensure all required basic fields exist
        const requiredFields = ['name', 'email', 'phone', 'location', 'title', 'desiredRole', 'bio'];
        requiredFields.forEach(field => {
          if (!parsedData[field]) {
            parsedData[field] = '';
          }
        });

        // Validate and ensure required fields
        const ensureArrays = [
          'socialLinks', 'education', 'experience', 'projects', 
          'skills', 'achievements', 'languages', 'certifications',
          'publications', 'volunteering', 'interests', 'references'
        ];

        ensureArrays.forEach(field => {
          parsedData[field] = parsedData[field] || [];
        });

        // If we got limited data, try to extract more
        if (parsedData.experience.length <= 1 || 
            parsedData.projects.length <= 1 || 
            parsedData.achievements.length <= 1) {
          
          // Additional prompt to focus on finding more entries
          const detailPrompt = `
            Analyze this resume text again, focusing ONLY on finding ALL instances of:
            1. Work experiences (including internships and part-time roles)
            2. Projects (both professional and personal)
            3. Achievements and awards

            For each category, list ALL entries found, no matter how minor.
            Don't summarize or combine similar entries.
            Return in the same JSON format as before.

            Resume text:
            ${text}
          `;
          
          const detailResponse = await this.callMistralAPI(detailPrompt);
          const detailMatch = detailResponse.match(/\{[\s\S]*\}/);
          
          if (detailMatch) {
            const detailData = JSON.parse(detailMatch[0]);
            
            // Merge additional entries if found
            if (detailData.experience?.length > parsedData.experience.length) {
              parsedData.experience = detailData.experience;
            }
            if (detailData.projects?.length > parsedData.projects.length) {
              parsedData.projects = detailData.projects;
            }
            if (detailData.achievements?.length > parsedData.achievements.length) {
              parsedData.achievements = detailData.achievements;
            }
          }
        }

        // Generate fallback bio if missing
        if (!parsedData.bio?.trim()) {
          const bioPrompt = `
            Create a professional first-person bio (3-4 sentences) for someone with:
            Name: ${parsedData.name || 'Unknown'}
            Title: ${parsedData.title || 'Professional'}
            Experience: ${parsedData.experience.map(e => `${e.role} at ${e.company}`).join(', ')}
            Skills: ${parsedData.skills?.map((s: any) => s.name).join(', ') || 'Various skills'}
            Achievements: ${parsedData.achievements.map(a => a.title).join(', ')}
            
            Make it engaging and professional, starting with "I am" or similar.
          `;
          
          const bioPart = await this.callMistralAPI(bioPrompt);
          parsedData.bio = bioPart.trim();
        }

        // Ensure all IDs are unique UUIDs
        ensureArrays.forEach(field => {
          parsedData[field] = parsedData[field].map((item: any) => ({
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
