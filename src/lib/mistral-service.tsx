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
      Analyze the following resume text in two steps:

      1. First, create a professional first-person bio (2-3 sentences) that:
         - Starts with "I am" or similar first-person introduction
         - Highlights key expertise and experience
         - Mentions significant achievements
         - Includes relevant technologies/skills
         - Maintains a professional yet engaging tone

      2. Then, parse the resume into JSON format with the following structure:
      {
        "name": "Full name",
        "title": "Current/most recent job title",
        "bio": "The professional bio you created in step 1",
        "email": "Email address if present",
        "phone": "Phone number if present",
        "location": "Location if present",
        "socialLinks": [
          {
            "platform": "LinkedIn/GitHub/etc",
            "url": "Profile URL"
          }
        ],
        "education": [
          {
            "institution": "School name",
            "degree": "Degree type",
            "field": "Field of study",
            "startDate": "Start date",
            "endDate": "End date"
          }
        ],
        "experience": [
          {
            "company": "Company name",
            "role": "Job title",
            "startDate": "Start date",
            "endDate": "End date",
            "description": "Job description",
            "technologies": ["Technologies used"]
          }
        ],
        "skills": ["List of technical and professional skills"],
        "projects": [
          {
            "title": "Project name",
            "description": "Project description",
            "technologies": ["Technologies used"]
          }
        ],
        "achievements": [
          {
            "title": "Achievement title",
            "description": "Achievement description"
          }
        ]
      }

      Resume text to parse:
      ${text}

      Return only the JSON object with the generated bio included in the "bio" field. No additional text.
    `;

    try {
      const response = await this.callMistralAPI(prompt);
      const parsedData = JSON.parse(response);
      
      // Ensure bio exists and is properly formatted
      if (!parsedData.bio || parsedData.bio.trim().length === 0) {
        // Fallback bio generation if the first attempt failed
        const bioPrompt = `
          Create a professional first-person bio (2-3 sentences) for someone with the following details:
          Name: ${parsedData.name}
          Title: ${parsedData.title}
          Skills: ${parsedData.skills?.join(', ')}
          Experience: ${parsedData.experience?.[0]?.company} as ${parsedData.experience?.[0]?.role}
          
          Make it engaging and professional, starting with "I am" or similar.
        `;
        
        const bioPart = await this.callMistralAPI(bioPrompt);
        parsedData.bio = bioPart.trim();
      }

      return parsedData;
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }
}
