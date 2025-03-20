import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { TimelineEvent, LLMResponse } from './llmService';

// Configuration for the Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-pro';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(API_KEY);

// Function to generate a system prompt
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
 * Calls the Gemini API to generate a life story from the input text
 * @param inputText The raw text input from the user
 * @param existingEvents Optional array of existing timeline events for context
 * @returns Promise with the LLM response containing bio and timeline
 */
export const generateLifeStoryWithGemini = async (
  inputText: string, 
  existingEvents: TimelineEvent[] = []
): Promise<LLMResponse> => {
  try {
    // Default to mock data if API key is not available (for development)
    if (!API_KEY) {
      console.warn('No Gemini API key found, using mock data');
      return {
        bio: "A journey that began in 1990 in Chicago, blossoming into a bakery adventure in Paris by 2015.",
        timeline: [
          { date: "1990", title: "Born", description: "Born in Chicago, starting a journey of creativity and exploration." },
          { date: "2015", title: "Moved to Paris", description: "Relocated to Paris and fulfilled a lifelong dream by opening a charming bakery in Montmartre." },
        ]
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
    });

    // Prepare the prompt
    const prompt = `${generateSystemPrompt()}\n\n${generateUserPrompt(inputText, existingEvents)}`;

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