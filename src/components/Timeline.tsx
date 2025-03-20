import React, { useEffect, useState } from 'react';
import { TimelineEvent } from '../api/llmService';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

interface TimelineProps {
  refreshKey?: number; // Optional prop to trigger re-render
}

const Timeline: React.FC<TimelineProps> = ({ refreshKey = 0 }) => {
  const [bio, setBio] = useState<string>('');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load data from localStorage when component mounts or refreshKey changes
    setIsLoading(true);
    const lifeStoryData = localStorage.getItem('lifeStory');
    
    if (lifeStoryData) {
      try {
        const parsedData = JSON.parse(lifeStoryData);
        setBio(parsedData.bio || '');
        setEvents(parsedData.timeline || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing life story data:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [refreshKey]);

  const handleCreateNew = () => {
    setIsModalOpen(true);
  };

  const handleStoryGenerated = () => {
    setIsModalOpen(false);
    // Reload the current data from localStorage
    const lifeStoryData = localStorage.getItem('lifeStory');
    if (lifeStoryData) {
      try {
        const parsedData = JSON.parse(lifeStoryData);
        setBio(parsedData.bio || '');
        setEvents(parsedData.timeline || []);
      } catch (error) {
        console.error('Error parsing life story data:', error);
      }
    }
  };

  // Fixed action button that's always visible
  const FixedActionButton = () => (
    <button 
      onClick={handleCreateNew} 
      className="fixed bottom-6 right-6 btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-neon z-20"
      aria-label="Create new story"
      tabIndex={0}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
    </button>
  );

  if (isLoading) {
    return (
      <div className="p-8 mt-8">
        <div className="flex justify-center items-center h-40">
          <div className="animate-pulse text-accent-primary text-xl">Loading your timeline...</div>
        </div>
        <FixedActionButton />
        {isModalOpen && (
          <Modal 
            setIsModalOpen={setIsModalOpen} 
            onStoryGenerated={handleStoryGenerated} 
          />
        )}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-8 mt-8">
        <div className="card p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-accent-primary to-accent-secondary inline-block text-transparent bg-clip-text">Your Timeline</h2>
          <p className="mb-8 text-gray-400">No timeline events yet. Generate your story first!</p>
          <button 
            onClick={handleCreateNew} 
            className="btn-primary"
            aria-label="Create new story"
            tabIndex={0}
          >
            Create New Story
          </button>
        </div>
        <FixedActionButton />
        {isModalOpen && (
          <Modal 
            setIsModalOpen={setIsModalOpen} 
            onStoryGenerated={handleStoryGenerated} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-8 mt-8">
      <div className="card p-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-accent-primary to-accent-secondary inline-block text-transparent bg-clip-text">Your Timeline</h2>
        {bio && <p className="mb-8 text-gray-300 text-lg">{bio}</p>}
        <div className="relative">
          {events.map((event, index) => (
            <div key={index} className="border-l-2 border-accent-primary pl-6 mb-8 relative pb-2">
              <div className="absolute left-[-5px] top-0 w-8 h-8 bg-dark-700 rounded-full border-2 border-accent-primary flex items-center justify-center shadow-neon">
                <span className="text-sm">{index + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-200">{event.date}</h3>
              <h4 className="text-xl font-semibold mb-2 text-accent-secondary">{event.title}</h4>
              <p className="text-gray-400">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
      <FixedActionButton />
      {isModalOpen && (
        <Modal 
          setIsModalOpen={setIsModalOpen} 
          onStoryGenerated={handleStoryGenerated} 
        />
      )}
    </div>
  );
};

export default Timeline;