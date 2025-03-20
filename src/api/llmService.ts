import axios from 'axios';
import { generateLifeStoryWithGemini } from './geminiService';

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface LLMResponse {
  bio: string;
  timeline: TimelineEvent[];
}

// Configuration for the LLM API
const OPENAI_API_KEY = import.meta.env.VITE_LLM_API_KEY;
const OPENAI_API_URL = import.meta.env.VITE_LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Function to generate a properly formatted system prompt
const generateSystemPrompt = () => {
  return `You are an assistant that transforms a user's freeform text about their life into a structured biography and timeline. 
Extract key life events with dates, titles, and brief descriptions. Format the response as a JSON object with:
1. A "bio" field containing a concise paragraph summarizing their life
2. A "timeline" array with objects containing "date", "title", and "description" fields

Make sure each timeline event is unique - don't duplicate events that happened on the same date with the same title.
The timeline should be chronologically ordered by date.
Focus on extracting only new information from the input text, and create concise timeline entries from it.

The response should be valid JSON only, with no additional text or explanation.`;
};

// Function to generate a user prompt from the input text
const generateUserPrompt = (inputText: string, existingEvents: TimelineEvent[] = []) => {
  let prompt = `Parse this text into a bio and timeline events: "${inputText}"`;
  
  // Add context about existing events if available
  if (existingEvents.length > 0) {
    prompt += `\n\nExisting timeline events (for reference, don't duplicate these):\n`;
    existingEvents.forEach(event => {
      prompt += `- ${event.date}: ${event.title} - ${event.description}\n`;
    });
    prompt += `\nExtract only new events from the input text that aren't already in the existing timeline.`;
  }
  
  return prompt;
};

/**
 * Calls the OpenAI API to generate a life story from the input text
 * This is kept as a fallback option
 * @param inputText The raw text input from the user
 * @param existingEvents Optional array of existing timeline events for context
 * @returns Promise with the LLM response containing bio and timeline
 */
export const generateLifeStoryWithOpenAI = async (
  inputText: string,
  existingEvents: TimelineEvent[] = []
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
          { role: "user", content: generateUserPrompt(inputText, existingEvents) }
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
    bio: "A journey that began in 1990 in Chicago, blossoming into a bakery adventure in Paris by 2015.",
    timeline: [
      { date: "1990", title: "Born", description: "Born in Chicago, starting a journey of creativity and exploration." },
      { date: "2015", title: "Moved to Paris", description: "Relocated to Paris and fulfilled a lifelong dream by opening a charming bakery in Montmartre." },
    ]
  };
};

/**
 * Main function to generate a life story, using Gemini AI by default
 * Falls back to OpenAI if Gemini is not available
 * @param inputText The raw text input from the user
 * @param existingEvents Optional array of existing timeline events for context
 * @returns Promise with the LLM response containing bio and timeline
 */
export const generateLifeStory = async (
  inputText: string,
  existingEvents: TimelineEvent[] = []
): Promise<LLMResponse> => {
  // Use Gemini if API key is available
  if (GEMINI_API_KEY) {
    try {
      return await generateLifeStoryWithGemini(inputText, existingEvents);
    } catch (error) {
      console.warn('Gemini API call failed, falling back to OpenAI or mock data:', error);
      // Fall back to OpenAI or mock data
    }
  }

  // Fall back to OpenAI if Gemini is not available or fails
  if (OPENAI_API_KEY) {
    return generateLifeStoryWithOpenAI(inputText, existingEvents);
  }

  // Fall back to mock data if no API keys are available
  console.warn('No API keys found, using mock data');
  return getMockData();
}; 