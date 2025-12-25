import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <main className="container mx-auto px-4 pb-12">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/create" element={<CreatePost />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
