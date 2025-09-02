import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    let mode: 'light' | 'dark';
    if (stored === 'light' || stored === 'dark') {
      mode = stored;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      mode = prefersDark ? 'dark' : 'light';
    }
    setIsDarkMode(mode === 'dark');
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow mb-6" role="banner">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-3 py-2 rounded">Skip to content</a>
      <div className="container mx-auto flex justify-between items-center py-4">
        <h1 className="text-xl font-bold">
          <Link to="/" className="text-primary dark:text-primary-light">OpenVulog</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li><Link to="/" className="hover:underline">Dashboard</Link></li>
            <li><Link to="/help" className="hover:underline">Help</Link></li>
            <li><Link to="/users" className="hover:underline">User Management</Link></li>
          </ul>
        </nav>
        <button 
          onClick={toggleDarkMode} 
          className="ml-4 px-4 py-2 bg-secondary text-white rounded hover:bg-accent dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100">
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </header>
  );
}
