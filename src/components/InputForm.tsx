import { useState, useEffect } from 'react';
import { isCrawlerBackendAvailable } from '../api/crawlerService';

interface InputFormProps {
  onSubmit: (text: string) => void;
  onCrawlUrl: (url: string) => void;
  isLoading: boolean;
}

const InputForm = ({ onSubmit, onCrawlUrl, isLoading }: InputFormProps) => {
  const [inputText, setInputText] = useState('');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [isCrawlerAvailable, setIsCrawlerAvailable] = useState(false);
  
  // Check if crawler backend is available on component mount
  useEffect(() => {
    const checkCrawlerAvailability = async () => {
      const available = await isCrawlerBackendAvailable();
      setIsCrawlerAvailable(available);
    };
    
    checkCrawlerAvailability();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    if (inputType === 'url') {
      onCrawlUrl(inputText.trim());
    } else {
      onSubmit(inputText.trim());
    }
  };
  
  // Function to check if a string is a valid URL
  const isValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };
  
  // Auto-detect URLs in the input
  useEffect(() => {
    if (inputText.trim() && isValidUrl(inputText.trim())) {
      setInputType('url');
    } else {
      setInputType('text');
    }
  }, [inputText]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-4 mb-2">
        <button
          type="button"
          onClick={() => setInputType('text')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            inputType === 'text'
              ? 'bg-accent-primary text-white'
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          }`}
        >
          Text
        </button>
        
        <button
          type="button"
          onClick={() => setInputType('url')}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            inputType === 'url'
              ? 'bg-accent-primary text-white'
              : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
          } ${!isCrawlerAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isCrawlerAvailable}
          title={!isCrawlerAvailable ? 'Crawler backend is not available' : 'Crawl a website for content'}
        >
          Website URL
        </button>
      </div>
      
      <div>
        <textarea
          className="w-full h-40 px-4 py-3 bg-dark-700 border border-dark-500 focus:border-accent-primary rounded-md text-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
          placeholder={inputType === 'url' ? "Enter website URL to crawl..." : "Paste text about the subject..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          aria-label="Biography input"
        />
      </div>
      
      {!isCrawlerAvailable && inputType === 'url' && (
        <div className="p-3 bg-yellow-900/20 border border-yellow-800 rounded-md text-yellow-300 text-sm">
          The crawler backend is not available. Make sure the Python server is running.
        </div>
      )}
      
      <button
        type="submit"
        disabled={isLoading || !inputText.trim() || (inputType === 'url' && !isCrawlerAvailable)}
        className="w-full px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-dark-500 disabled:text-gray-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-800"
      >
        {isLoading ? (
          <div className="flex justify-center items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{inputType === 'url' ? 'Crawling & Processing...' : 'Processing...'}</span>
          </div>
        ) : (
          inputType === 'url' ? 'Crawl & Extract Information' : 'Extract Information'
        )}
      </button>
    </form>
  );
};

export default InputForm; 