import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/apiClient';
import UserAvatar from '../components/UserAvatar';
import { Camera, Save, X } from 'lucide-react';
import imageCompression from 'browser-image-compression';

/**
 * EditProfile Page
 * Allows users to update their display name, bio, and avatar
 */
export default function EditProfile() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Fetch current profile data
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const profile = await api.get('/users/me');
            setFormData({
                displayName: profile.displayName || '',
                bio: profile.bio || '',
            });
            setAvatarPreview(profile.avatarUrl);
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile data');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 2MB before compression)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        try {
            // Compress image
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 2,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
                setAvatarFile(reader.result);
                setError('');
            };
            reader.readAsDataURL(compressedFile);
        } catch (err) {
            console.error('Image compression failed:', err);
            setError('Failed to process image');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update profile info
            const updatedProfile = await api.put('/users/me', {
                displayName: formData.displayName,
                bio: formData.bio || null,
            });

            // Upload avatar if changed
            if (avatarFile) {
                const avatarResult = await api.post('/users/me/avatar', {
                    imageData: avatarFile,
                });
                updatedProfile.avatarUrl = avatarResult.avatarUrl;
            }

            // Update auth context with new user data
            if (updateUser) {
                updateUser({
                    ...user,
                    displayName: updatedProfile.displayName,
                    bio: updatedProfile.bio,
                    avatarUrl: updatedProfile.avatarUrl,
                });
            }

            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            console.error('Profile update failed:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Edit Profile
                        </h1>
                        <button
                            onClick={() => navigate('/profile')}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <UserAvatar
                                src={avatarPreview}
                                alt="Profile picture"
                                size="xl"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                <Camera size={18} />
                                Change Avatar
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Max size: 2MB
                            </p>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label
                                htmlFor="displayName"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                            >
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                value={formData.displayName}
                                onChange={handleChange}
                                maxLength={50}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all"
                                placeholder="Your display name"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {formData.displayName.length}/50 characters
                            </p>
                        </div>

                        {/* Bio */}
                        <div>
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2"
                            >
                                Bio
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                maxLength={160}
                                rows={4}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all resize-none"
                                placeholder="Tell us about yourself..."
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {formData.bio.length}/160 characters
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                                {success}
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
