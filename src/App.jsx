import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import CreatePost from './pages/CreatePost';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import FollowRequests from './pages/FollowRequests';
import SentRequests from './pages/SentRequests';

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
      <AuthProvider>
        <div className="min-h-screen">
          <Navbar theme={theme} toggleTheme={toggleTheme} />

          <main className="container mx-auto px-4 pb-12">
            <Routes>
              {/* Public Routes (Login/Signup) */}
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                }
              />

              {/* OAuth Callback Route */}
              <Route path="/auth/callback" element={<OAuthCallback />} />

              {/* Protected Routes (Require Authentication) */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Feed />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreatePost />
                  </ProtectedRoute>
                }
              />

              {/* Profile Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/edit"
                element={
                  <ProtectedRoute>
                    <EditProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Follow Requests Route */}
              <Route
                path="/follow-requests"
                element={
                  <ProtectedRoute>
                    <FollowRequests />
                  </ProtectedRoute>
                }
              />

              {/* Sent Requests Route */}
              <Route
                path="/sent-requests"
                element={
                  <ProtectedRoute>
                    <SentRequests />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all: Redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
