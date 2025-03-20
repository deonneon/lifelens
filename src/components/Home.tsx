import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Modal from './Modal';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleStoryGenerated = () => {
    setIsModalOpen(false);
    navigate('/timeline'); // Redirect to timeline after submission
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 min-h-[calc(100vh-80px)]">
      <div className="max-w-2xl text-center space-y-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent-primary to-accent-secondary inline-block text-transparent bg-clip-text">
          Your Life, Your Story, Reimagined
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Create a unique timeline of your life using advanced AI technology. Turn your experiences into a beautiful journey.
        </p>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="btn-primary"
          aria-label="Start your story"
          tabIndex={0}
        >
          Start Your Story
        </button>
      </div>
      
      {isModalOpen && (
        <Modal 
          setIsModalOpen={setIsModalOpen} 
          onStoryGenerated={handleStoryGenerated} 
        />
      )}
    </div>
  );
};

export default Home;