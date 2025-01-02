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
          model: 'mistral-tiny', // or 'mistral-small', 'mistral-medium'
          messages: [
            {
              role: 'system',
              content: 'You are a professional resume parser. Extract information accurately and return it in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
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
      Parse the following resume text and extract information in JSON format with the following structure:
      {
        "name": "Full name",
        "title": "Current/most recent job title",
        "bio": "Brief professional summary",
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

      Return only the JSON object, no additional text.
    `;

    try {
      const response = await this.callMistralAPI(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }
}
