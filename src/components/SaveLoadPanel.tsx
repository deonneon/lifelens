import { useState, useEffect } from 'react';

interface SavedBio {
  id: string;
  name: string;
  lastUpdated: string;
}

interface SaveLoadPanelProps {
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onClear: () => void;
  hasBiography: boolean;
}

const SaveLoadPanel = ({ onSave, onLoad, onClear, hasBiography }: SaveLoadPanelProps) => {
  const [saveName, setSaveName] = useState('');
  const [savedBios, setSavedBios] = useState<SavedBio[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved biographies from local storage
  useEffect(() => {
    const loadSavedBiographies = () => {
      try {
        const savedData = localStorage.getItem('savedBiographies');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const formattedData = parsedData.map((bio: any) => ({
            id: bio.id,
            name: bio.name,
            lastUpdated: bio.lastUpdated
          }));
          setSavedBios(formattedData);
        }
      } catch (error) {
        console.error('Error loading saved biographies:', error);
      }
    };
    
    loadSavedBiographies();
    
    // Add event listener to watch for storage changes in other tabs
    window.addEventListener('storage', loadSavedBiographies);
    return () => window.removeEventListener('storage', loadSavedBiographies);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim()) {
      onSave(saveName.trim());
      setSaveName('');
      setIsSaving(false);
      
      // Refresh saved biographies list
      const savedData = localStorage.getItem('savedBiographies');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const formattedData = parsedData.map((bio: any) => ({
          id: bio.id,
          name: bio.name,
          lastUpdated: bio.lastUpdated
        }));
        setSavedBios(formattedData);
      }
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this saved biography?')) {
      const savedData = localStorage.getItem('savedBiographies');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const updatedData = parsedData.filter((bio: any) => bio.id !== id);
        localStorage.setItem('savedBiographies', JSON.stringify(updatedData));
        setSavedBios(updatedData.map((bio: any) => ({
          id: bio.id,
          name: bio.name,
          lastUpdated: bio.lastUpdated
        })));
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-white">Manage Biographies</h2>
      
      {isSaving ? (
        <form onSubmit={handleSave} className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Enter a name..."
              className="flex-grow px-3 py-2 bg-dark-700 border border-dark-500 focus:border-accent-primary rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
            <button
              type="submit"
              disabled={!saveName.trim()}
              className="px-3 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-dark-500 disabled:text-gray-400 text-white text-sm font-medium rounded-md focus:outline-none"
            >
              Save
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-4 flex space-x-2">
          <button
            onClick={() => setIsSaving(true)}
            disabled={!hasBiography}
            className="px-3 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-dark-500 disabled:text-gray-400 text-white text-sm font-medium rounded-md flex-grow focus:outline-none"
          >
            Save Current Biography
          </button>
          
          <button
            onClick={onClear}
            disabled={!hasBiography}
            className="px-3 py-2 bg-dark-600 hover:bg-dark-700 disabled:bg-dark-800 disabled:text-gray-600 text-white text-sm font-medium rounded-md focus:outline-none"
          >
            Clear
          </button>
        </div>
      )}
      
      {savedBios.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {savedBios.map((bio) => (
            <div key={bio.id} className="flex items-center justify-between bg-dark-700 p-3 rounded-md">
              <div className="flex-grow">
                <div className="font-medium text-white text-sm">{bio.name}</div>
                <div className="text-gray-400 text-xs">{formatDate(bio.lastUpdated)}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onLoad(bio.id)}
                  className="text-accent-primary hover:text-accent-primary/80 focus:outline-none"
                  aria-label={`Load ${bio.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(bio.id)}
                  className="text-red-400 hover:text-red-300 focus:outline-none"
                  aria-label={`Delete ${bio.name}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm">
          No saved biographies yet
        </div>
      )}
    </div>
  );
};

export default SaveLoadPanel; 