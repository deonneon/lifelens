import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.tsx';

const App: React.FC = () => {
  return (
    <Router>
      <div className="font-mono bg-dark-900 text-gray-100 min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 z-[-1]" />
        <header className="py-4 border-b border-dark-700">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-center">
              <span className="text-accent-primary">Life</span>Lens
              <span className="text-gray-400 text-sm ml-2">Comprehensive Biographies</span>
            </h1>
          </div>
        </header>
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;