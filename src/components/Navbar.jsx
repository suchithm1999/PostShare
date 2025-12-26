import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, ChevronDown, Heart, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFollowRequests } from '../hooks/useFollowRequests';
import UserAvatar from './UserAvatar';
import NotificationBadge from './NotificationBadge';

export default function Navbar({ theme, toggleTheme }) {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Poll for follow requests (only when authenticated)
    const { count: notificationCount } = useFollowRequests(30000); // Poll every 30 seconds

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNotificationClick = () => {
        navigate('/follow-requests');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="fixed w-full py-4 border-b border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md top-0 z-10 transition-colors duration-300">
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
                        className="p-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors mr-2"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link to="/" className="btn btn-secondary hidden md:inline-flex">
                                Feed
                            </Link>

                            {/* Notification Badge - Hidden on mobile as it is in BottomNav */}
                            <div className="hidden md:block">
                                <NotificationBadge
                                    count={notificationCount}
                                    onClick={handleNotificationClick}
                                />
                            </div>

                            <Link to="/create" className="btn btn-primary hidden md:inline-flex">
                                New Post
                            </Link>

                            {/* User Menu Dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <UserAvatar
                                        src={user?.avatarUrl}
                                        alt={user?.displayName}
                                        size="sm"
                                    />
                                    <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.displayName}
                                    </span>
                                    <ChevronDown
                                        size={16}
                                        className={`text-gray-600 dark:text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-2">
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <User size={18} />
                                            <span>Profile</span>
                                        </Link>

                                        <hr className="my-2 border-gray-200 dark:border-slate-700" />
                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
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

