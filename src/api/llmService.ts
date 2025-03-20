import axios from 'axios';
import { generateLifeStoryWithGemini } from './geminiService';

export interface LLMResponse {
  bio: string;
}

// Configuration for the LLM API
const OPENAI_API_KEY = import.meta.env.VITE_LLM_API_KEY;
const OPENAI_API_URL = import.meta.env.VITE_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Function to generate a properly formatted system prompt
const generateSystemPrompt = () => {
  return `You are an assistant that transforms a user's freeform text about their life into a structured biography. 
Extract key life information and create a concise, well-written biography. Format the response as a JSON object with:
A "bio" field containing a comprehensive paragraph summarizing their life

The response should be valid JSON only, with no additional text or explanation.`;
};

// Function to generate a user prompt from the input text
const generateUserPrompt = (inputText: string) => {
  let prompt = `Parse this text into a comprehensive biography: "${inputText}"`;
  return prompt;
};

/**
 * Calls the OpenAI API to generate a life story from the input text
 * This is kept as a fallback option
 * @param inputText The raw text input from the user
 * @returns Promise with the LLM response containing bio
 */
export const generateLifeStoryWithOpenAI = async (
  inputText: string
): Promise<LLMResponse> => {
  try {
    // Default to mock data if API key is not available (for development)
    if (!OPENAI_API_KEY) {
      console.warn('No OpenAI API key found, using mock data');
      return getMockData();
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo", // Default to GPT-3.5 Turbo but can be changed to use other models
        messages: [
          { role: "system", content: generateSystemPrompt() },
          { role: "user", content: generateUserPrompt(inputText) }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    // Parse the response from the LLM
    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate life story. Please try again.');
  }
};

/**
 * Generate mock data for development without API keys
 */
const getMockData = (): LLMResponse => {
  return {
    bio: "A journey that began in 1990 in Chicago, blossoming into a bakery adventure in Paris by 2015. Born in Chicago, starting a journey of creativity and exploration. Later relocated to Paris and fulfilled a lifelong dream by opening a charming bakery in Montmartre."
  };
};

/**
 * Main function to generate a life story, using Gemini AI by default
 * Falls back to OpenAI if Gemini is not available
 * @param inputText The raw text input from the user
 * @returns Promise with the LLM response containing bio
 */
export const generateLifeStory = async (
  inputText: string
): Promise<LLMResponse> => {
  // Use Gemini if API key is available
  if (GEMINI_API_KEY) {
    try {
      return await generateLifeStoryWithGemini(inputText);
    } catch (error) {
      console.warn('Gemini API call failed, falling back to OpenAI or mock data:', error);
      // Fall back to OpenAI or mock data
    }
  }

  // Fall back to OpenAI if Gemini is not available or fails
  if (OPENAI_API_KEY) {
    return generateLifeStoryWithOpenAI(inputText);
  }

  // Fall back to mock data if no API keys are available
  console.warn('No API keys found, using mock data');
  return getMockData();
}; 