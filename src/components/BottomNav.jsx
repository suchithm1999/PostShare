import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react';
import { useFollowRequests } from '../hooks/useFollowRequests';

export default function BottomNav() {
    const location = useLocation();
    const { count: notificationCount } = useFollowRequests();

    const navItems = [
        { path: '/', icon: Home, label: 'Feed' },
        { path: '/create', icon: PlusSquare, label: 'Create' },
        { path: '/follow-requests', icon: Heart, label: 'Requests', hasBadge: true },
        { path: '/profile', icon: User, label: 'Profile' }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 md:hidden pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${active
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="relative">
                                <Icon
                                    size={24}
                                    fill={
                                        item.hasBadge && notificationCount > 0
                                            ? "#ef4444" // red fill when there are requests
                                            : active && item.path !== '/create'
                                                ? "currentColor"
                                                : "none"
                                    }
                                    strokeWidth={active ? 2.5 : 2}
                                    className={item.hasBadge && notificationCount > 0 ? "text-red-500" : ""}
                                />
                                {item.hasBadge && notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white dark:border-slate-900">
                                        {notificationCount > 99 ? '99+' : notificationCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
