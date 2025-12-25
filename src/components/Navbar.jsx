import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export default function Navbar({ theme, toggleTheme }) {
    return (
        <header className="py-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
            <nav className="container mx-auto px-4 flex justify-between items-center">
                <Link
                    to="/"
                    className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                    PostShare
                </Link>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mr-2"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link to="/" className="btn btn-secondary">
                        Feed
                    </Link>
                    <Link to="/create" className="btn btn-primary">
                        New Post
                    </Link>
                </div>
            </nav>
        </header>
    );
}
