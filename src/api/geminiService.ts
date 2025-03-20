import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { LLMResponse } from './llmService';

// Configuration for the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to generate a system prompt
const generateSystemPrompt = () => {
  return `You are an assistant that transforms a user's freeform text about their life into a structured biography.

Your primary focus should be on generating a HIGHLY DETAILED and comprehensive biography. The biography should be thorough, informative, and as long as necessary to include all relevant details from the input text. Use rich, descriptive language and maintain a coherent narrative flow.

Format the response as a JSON object with:
1. A "bio" field containing a detailed, comprehensive paragraph (or paragraphs) summarizing their life. This should be the most substantial part of your response.

The biography should include all meaningful information from the input, elaborating on context, motivations, achievements, and significant life details. Don't be concerned about length - longer is better if it means capturing more information.

The response should be valid JSON only, with no additional text or explanation.`;
};

// Function to generate a user prompt from the input text
const generateUserPrompt = (inputText: string) => {
  let prompt = `Parse this text into a detailed, comprehensive biography: "${inputText}"`;
  return prompt;
};

/**
 * Calls the Gemini API to generate a life story from the input text
 * @param inputText The raw text input from the user
 * @returns Promise with the LLM response containing bio
 */
export const generateLifeStoryWithGemini = async (
  inputText: string
): Promise<LLMResponse> => {
  try {
    // Default to mock data if API key is not available (for development)
    if (!API_KEY) {
      console.warn('No Gemini API key found, using mock data');
      return {
        bio: "A journey that began in 1990 in Chicago, blossoming into a bakery adventure in Paris by 2015. The formative years in Chicago were spent exploring creative pursuits and developing a passion for baking under the guidance of a grandmother who had mastered traditional European pastry techniques. After completing culinary school in 2010 with honors, there followed a period of apprenticeship at several noted establishments, including a year at a historic bakery in Vienna that specialized in Viennoiserie. The dream of opening a personal bakery grew during these years, culminating in the bold decision to relocate to Paris in 2015. The charming bakery in Montmartre quickly became known for its fusion of American creativity and European tradition, earning recognition in local food publications and developing a loyal neighborhood following. The small establishment now serves as both a community gathering space and a laboratory for innovative pastry development."
      };
    }

    // Get the model
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096, // Allow for longer outputs to capture more detailed biographies
      },
    });

    // Prepare the prompt
    const prompt = `${generateSystemPrompt()}\n\n${generateUserPrompt(inputText)}`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Attempt to extract and parse JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                      text.match(/```\n([\s\S]*?)\n```/) || 
                      text.match(/{[\s\S]*}/);
    
    const jsonString = jsonMatch ? jsonMatch[0].replace(/```json\n|```\n|```/g, '') : text;
    
    try {
      // Parse the response as JSON
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse Gemini response as JSON:', e);
      console.log('Raw response:', text);
      throw new Error('Failed to parse the generated response. Please try again.');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate life story. Please try again.');
  }
}; 