import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Navbar({ theme, toggleTheme }) {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

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

                    {isAuthenticated ? (
                        <>
                            {/* Show user info */}
                            {user && (
                                <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
                                    {user.displayName}
                                </span>
                            )}

                            <Link to="/" className="btn btn-secondary">
                                Feed
                            </Link>
                            <Link to="/create" className="btn btn-primary">
                                New Post
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn btn-secondary flex items-center gap-2"
                                title="Logout"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}
