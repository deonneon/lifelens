import { useState, useEffect } from 'react';
import { generateLifeStory } from '../api/llmService';
import { LLMResponse } from '../api/llmService';
import InputForm from './InputForm.tsx';
import BiographySummary from './BiographySummary.tsx';
import SaveLoadPanel from './SaveLoadPanel.tsx';

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [biography, setBiography] = useState<LLMResponse | null>(null);

  // Load biography from local storage on initial render
  useEffect(() => {
    const savedBio = localStorage.getItem('currentBiography');
    if (savedBio) {
      try {
        setBiography(JSON.parse(savedBio));
      } catch (e) {
        console.error('Failed to parse saved biography', e);
      }
    }
  }, []);

  // Save biography to local storage when it changes
  useEffect(() => {
    if (biography) {
      localStorage.setItem('currentBiography', JSON.stringify(biography));
    }
  }, [biography]);

  const handleInputSubmit = async (text: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateLifeStory(text);
      
      if (biography) {
        // Update the biography with new content
        setBiography({
          bio: result.bio || biography.bio // Use new bio if available
        });
      } else {
        // First time - just set the result directly
        setBiography(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error generating biography:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBiography = (name: string) => {
    if (!biography) return;
    
    const savedBiographies = JSON.parse(localStorage.getItem('savedBiographies') || '[]');
    const newSavedBio = {
      id: crypto.randomUUID(),
      name,
      bio: biography.bio,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('savedBiographies', JSON.stringify([...savedBiographies, newSavedBio]));
  };

  const handleLoadBiography = (id: string) => {
    const savedBiographies = JSON.parse(localStorage.getItem('savedBiographies') || '[]');
    const bioToLoad = savedBiographies.find((bio: any) => bio.id === id);
    
    if (bioToLoad) {
      setBiography({
        bio: bioToLoad.bio
      });
    }
  };

  const handleClearBiography = () => {
    if (window.confirm('Are you sure you want to clear the current biography?')) {
      setBiography(null);
      localStorage.removeItem('currentBiography');
    }
  };

  return (
    <div className="py-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input and control panel - 3 cols on large screens */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-dark-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Add Information</h2>
            <InputForm onSubmit={handleInputSubmit} isLoading={loading} />
            
            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-red-300">
                {error}
              </div>
            )}
          </div>
          
          <div className="bg-dark-800 rounded-lg p-6 shadow-lg">
            <SaveLoadPanel 
              onSave={handleSaveBiography}
              onLoad={handleLoadBiography}
              onClear={handleClearBiography}
              hasBiography={!!biography}
            />
          </div>
        </div>
        
        {/* Biography - 9 cols on large screens */}
        <div className="lg:col-span-9 space-y-6">
          {biography && (
            <div className="bg-dark-800 rounded-lg p-6 shadow-lg">
              <BiographySummary bio={biography.bio} />
            </div>
          )}
          
          {!biography && !loading && (
            <div className="bg-dark-800 rounded-lg p-12 shadow-lg flex flex-col items-center justify-center text-center h-96">
              <h3 className="text-2xl font-medium text-white mb-4">
                Start Building Your Biography
              </h3>
              <p className="text-gray-400 max-w-md mb-8">
                Paste text or a link into the input area to begin extracting biographical information
              </p>
              <div className="w-16 h-16 rounded-full bg-dark-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
