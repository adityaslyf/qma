import { Experience, Skill, Achievement } from '@/types/profile'

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
      if (!import.meta.env.VITE_MISTRAL_API_KEY) {
        throw new Error('Missing Mistral API key');
      }

      console.log('Sending prompt to Mistral:', prompt);

      const response = await fetch(MISTRAL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'mistral-small',
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
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mistral API error response:', errorText);
        throw new Error(`API call failed: ${response.status} - ${response.statusText}`);
      }

      const data: MistralResponse = await response.json();
      
      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to call Mistral API');
    }
  }

  static async parseResume(text: string) {
    try {
      const prompt = `
        Please parse this resume text and extract the following information in JSON format:
        {
          "name": "Full Name",
          "title": "Current/Most Recent Job Title",
          "email": "Email Address",
          "phone": "Phone Number",
          "location": "Location",
          "desiredRole": "Desired Role/Position",
          "bio": "Professional Summary",
          "experience": [
            {
              "id": "unique-id",
              "company": "Company Name",
              "title": "Job Title",
              "startDate": "Start Date",
              "endDate": "End Date",
              "description": "Job Description",
              "technologies": ["Tech1", "Tech2"]
            }
          ],
          "education": [
            {
              "id": "unique-id",
              "institution": "School Name",
              "degree": "Degree Type",
              "field": "Field of Study",
              "startDate": "Start Date",
              "endDate": "End Date",
              "grade": "Grade/GPA"
            }
          ],
          "projects": [
            {
              "id": "unique-id",
              "name": "Project Name",
              "description": "Project Description",
              "technologies": ["Tech1", "Tech2"],
              "url": "Project URL"
            }
          ],
          "skills": [
            {
              "id": "unique-id",
              "category": "Skill Category",
              "items": ["Skill1", "Skill2"]
            }
          ],
          "achievements": [
            {
              "id": "unique-id",
              "title": "Achievement Title",
              "description": "Achievement Description",
              "date": "Achievement Date"
            }
          ]
        }

        Resume Text:
        ${text}

        Please ensure:
        1. All dates are in YYYY-MM-DD format
        2. Empty arrays for sections with no information
        3. Empty strings for missing fields
        4. Generate a professional bio/summary if none exists
      `;

      const response = await this.callMistralAPI(prompt);
      console.log('Raw API response:', response);
      
      // Look for JSON content between curly braces
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('No JSON found in response:', response);
        throw new Error('Invalid response format: No JSON found');
      }

      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        return this.validateAndEnrichData(parsedData, text);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed JSON content:', jsonMatch[0]);
        throw new Error('Failed to parse response as JSON');
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }

  private static async validateAndEnrichData(parsedData: any, originalText: string) {
    // Ensure all required fields exist
    const requiredFields = ['name', 'email', 'phone', 'location', 'title', 'desiredRole', 'bio'];
    requiredFields.forEach(field => {
      if (!parsedData[field]) {
        parsedData[field] = '';
      }
    });

    // Ensure arrays exist
    const requiredArrays = [
      'education', 'experience', 'projects', 'skills', 
      'achievements', 'languages', 'certifications'
    ];
    requiredArrays.forEach(field => {
      parsedData[field] = Array.isArray(parsedData[field]) ? parsedData[field] : [];
    });

    // Add IDs to all array items
    requiredArrays.forEach(field => {
      parsedData[field] = parsedData[field].map((item: any) => ({
        ...item,
        id: item.id || crypto.randomUUID()
      }));
    });

    return parsedData;
  }
}
