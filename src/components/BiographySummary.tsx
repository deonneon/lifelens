interface BiographySummaryProps {
  bio: string;
}

const BiographySummary = ({ bio }: BiographySummaryProps) => {
  // Function to format paragraphs
  const formatBiography = (text: string) => {
    // Split by double newlines or periods followed by spaces (to create paragraphs)
    const paragraphs = text.split(/\n\n|\.\s+/g).filter(Boolean);
    
    if (paragraphs.length <= 1) {
      // If there's just one paragraph or none, return the original text
      return <p className="text-gray-300 leading-relaxed">{text}</p>;
    }
    
    return (
      <>
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-300 leading-relaxed mb-4">
            {/* Add back the period if we split by periods */}
            {paragraph}{!paragraph.endsWith('.') && paragraph.length > 0 ? '.' : ''}
          </p>
        ))}
      </>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Biography</h2>
        <button 
          onClick={() => navigator.clipboard.writeText(bio)}
          className="text-sm text-accent-primary hover:text-accent-primary/80 flex items-center space-x-1 focus:outline-none"
          aria-label="Copy biography to clipboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Copy</span>
        </button>
      </div>
      
      <div className="prose prose-invert prose-lg max-w-none">
        {formatBiography(bio)}
      </div>
      
      {/* Expandable section for very long biographies */}
      {bio.length > 500 && (
        <div className="mt-6">
          <details className="group">
            <summary className="list-none flex items-center cursor-pointer text-accent-primary hover:text-accent-primary/90">
              <span className="mr-2">See full details</span>
              <svg 
                className="h-5 w-5 transform group-open:rotate-180 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="mt-4 bg-dark-700 rounded-lg p-4 shadow-inner">
              <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm overflow-auto max-h-96">
                {bio}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default BiographySummary; 