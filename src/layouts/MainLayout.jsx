import PropTypes from 'prop-types';
import BottomNav from '../components/BottomNav';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';

export default function MainLayout({ children, theme, toggleTheme }) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-slate-900 transition-colors duration-200">
            {/* Top Navigation - Always present but simplified on mobile */}
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            {/* Main Content Area */}
            {/* 
                pb-20 adds padding at the bottom for mobile so content isn't hidden behind BottomNav 
                md:pb-0 removes this padding on desktop where BottomNav is hidden
                pt-16 accounts for the fixed top Navbar
            */}
            <main className="pt-20 md:pt-16 pb-20 md:pb-0 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Bottom Navigation - Only visible on mobile/tablet when authenticated */}
            {user && <BottomNav />}
        </div>
    );
}

MainLayout.propTypes = {
    children: PropTypes.node.isRequired,
    theme: PropTypes.string,
    toggleTheme: PropTypes.func,
};
