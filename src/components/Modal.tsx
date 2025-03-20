import { useState } from 'react';
import { generateLifeStory, LLMResponse } from '../api/llmService';
import { TimelineEvent } from '../api/llmService';

interface ModalProps {
  setIsModalOpen: (open: boolean) => void;
  onStoryGenerated: () => void;
}

const Modal: React.FC<ModalProps> = ({ setIsModalOpen, onStoryGenerated }) => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if Gemini API key is available
  const isGeminiEnabled = !!import.meta.env.VITE_GEMINI_API_KEY;

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter your life story text.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Retrieve existing stories from localStorage
      const existingStories = localStorage.getItem('lifeStory');
      const parsedData = existingStories ? JSON.parse(existingStories) : { bio: '', timeline: [] };
      
      // Generate story with Gemini if available, otherwise use structured mock data
      let storyResponse: LLMResponse;
      
      if (isGeminiEnabled) {
        // Use Gemini API to process story
        storyResponse = await generateLifeStory(inputText);
      } else {
        // Using structured mock data if Gemini API key is not available
        console.log('Using mock data as no Gemini API key is available');
        
        // Function to extract a likely year from strings like '1990s', '2005'
        const extractYear = (dateStr: string): number => {
          if (!dateStr) return 2000;
          
          // Extract 4-digit years
          const yearMatch = dateStr.match(/\b(19|20)\d{2}\b/);
          if (yearMatch) return parseInt(yearMatch[0]);
          
          // Handle decades
          const decadeMatch = dateStr.match(/\b(19|20)\d{0}s\b/);
          if (decadeMatch) {
            const prefix = decadeMatch[1];
            return parseInt(`${prefix}00`);
          }
          
          // Default to 2000 if no year found
          return 2000;
        };
        
        // Generate 10 timeline events based on the input text
        const keywords = inputText.split(/\W+/).filter(w => w.length > 4);
        const events: TimelineEvent[] = [];
        
        // Create timeline with mocked data
        for (let i = 0; i < Math.min(10, Math.max(5, keywords.length / 10)); i++) {
          const year = 1980 + i * 4;
          const keyword = keywords[(i * 7) % keywords.length] || 'event';
          events.push({
            date: `${year}`,
            title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} milestone`,
            description: `This significant ${keyword} event shaped my perspective and future path.`
          });
        }
        
        // Sort events by date
        events.sort((a, b) => extractYear(a.date) - extractYear(b.date));
        
        storyResponse = {
          bio: `A life journey with focus on ${keywords.slice(0, 3).join(', ')}.`,
          timeline: events
        };
      }
      
      // Save to localStorage
      localStorage.setItem('lifeStory', JSON.stringify(storyResponse));
      
      // Notify parent component that generation is complete
      onStoryGenerated();
    } catch (err) {
      console.error('Error generating life story:', err);
      setError('Failed to generate your life story. Please try again.');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsModalOpen(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-dark-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50" 
      onClick={() => setIsModalOpen(false)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div 
        className="card max-w-2xl w-full mx-4 relative p-6" 
        onClick={e => e.stopPropagation()}
      >
        <button 
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          onClick={() => setIsModalOpen(false)}
          aria-label="Close modal"
          tabIndex={0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-accent-primary to-accent-secondary inline-block text-transparent bg-clip-text">Create Your Life Story</h2>
        
        <p className="text-gray-400 mb-5">
          Enter details about yourself, your experiences, major events, or anything else you'd like included in your life story.
          {!isGeminiEnabled && (
            <span className="block mt-2 text-yellow-500 text-sm">
              Note: Running in demo mode without Gemini API key. Results will be randomly generated.
            </span>
          )}
        </p>
        
        <textarea 
          className="w-full h-48 p-3 bg-dark-700 text-gray-200 border border-dark-500 rounded-md focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors resize-none"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="I was born in 1990 in New York. I grew up with two siblings and developed a passion for computer science at an early age..."
          aria-label="Your life story details"
          tabIndex={0}
        ></textarea>
        
        {error && <p className="text-red-500 mt-2">{error}</p>}
        
        <div className="flex gap-4 mt-4">
          <button 
            className="btn-primary"
            onClick={handleSubmit}
            disabled={isLoading}
            aria-label={isLoading ? "Generating story..." : "Generate life story"}
            tabIndex={0}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : "Generate Life Story"}
          </button>
          <button 
            className="px-6 py-3 bg-dark-600 hover:bg-dark-500 text-gray-300 rounded-md transition-colors"
            onClick={() => setIsModalOpen(false)}
            aria-label="Cancel"
            tabIndex={0}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;