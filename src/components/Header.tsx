import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-dark-800 bg-opacity-80 backdrop-blur-sm sticky top-0 z-10 border-b border-dark-600">
      <h1 className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary inline-block text-transparent bg-clip-text">LifeLens</h1>
      <ul className="flex gap-6 list-none">
        <li>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-300" tabIndex={0} aria-label="Go to Home">
            Home
          </Link>
        </li>
        <li>
          <Link to="/timeline" className="text-gray-300 hover:text-white transition-colors duration-300" tabIndex={0} aria-label="Go to Timeline">
            Timeline
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Header;