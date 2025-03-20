import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Timeline from './components/Timeline';
import Home from './components/Home';
// Now using Tailwind CSS instead of App.css

const App: React.FC = () => {
  return (
    <Router>
      <div className="font-mono bg-dark-900 text-gray-100 min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 z-[-1]" />
        <Header />
        <main className="container mx-auto px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timeline" element={<Timeline />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;