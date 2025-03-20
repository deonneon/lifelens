import { useState } from 'react';

interface InputFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

const InputForm = ({ onSubmit, isLoading }: InputFormProps) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          className="w-full h-40 px-4 py-3 bg-dark-700 border border-dark-500 focus:border-accent-primary rounded-md text-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
          placeholder="Paste text or link about the subject..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          aria-label="Biography input"
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading || !inputText.trim()}
        className="w-full px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-dark-500 disabled:text-gray-400 text-white font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-800"
      >
        {isLoading ? (
          <div className="flex justify-center items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          'Extract Information'
        )}
      </button>
    </form>
  );
};

export default InputForm; 