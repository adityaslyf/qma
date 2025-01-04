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
        "socialLinks": [],
        "education": [],
        "experience": [],
        "skills": [],
        "projects": [],
        "achievements": []
      }

      Resume text to parse:
      ${text}

      Return only valid JSON with the generated bio included in the "bio" field. Ensure all string values are properly escaped.
    `;

    try {
      const response = await this.callMistralAPI(prompt);
      console.log('Raw API response:', response);
      
      // Try to find JSON content within the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      try {
        const parsedData = JSON.parse(jsonMatch[0]);
        
        // Validate required fields
        if (!parsedData.bio || parsedData.bio.trim().length === 0) {
          // Generate fallback bio
          const bioPrompt = `
            Create a professional first-person bio (2-3 sentences) for someone with the following details:
            Name: ${parsedData.name || 'Unknown'}
            Title: ${parsedData.title || 'Professional'}
            Skills: ${parsedData.skills?.join(', ') || 'Various skills'}
            Experience: ${parsedData.experience?.[0]?.company || ''} as ${parsedData.experience?.[0]?.role || ''}
            
            Make it engaging and professional, starting with "I am" or similar.
          `;
          
          const bioPart = await this.callMistralAPI(bioPrompt);
          parsedData.bio = bioPart.trim();
        }

        // Ensure all arrays exist
        parsedData.socialLinks = parsedData.socialLinks || [];
        parsedData.education = parsedData.education || [];
        parsedData.experience = parsedData.experience || [];
        parsedData.skills = parsedData.skills || [];
        parsedData.projects = parsedData.projects || [];
        parsedData.achievements = parsedData.achievements || [];

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
