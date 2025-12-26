import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/apiClient';
import ErrorMessage from '../components/ErrorMessage';
import { validateEmail, validateUsername, validatePassword, validateDisplayName } from '../utils/validators';

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        displayName: '',
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Update password strength indicator
        if (name === 'password' && value) {
            const validation = validatePassword(value);
            setPasswordStrength(validation.strength);
        } else if (name === 'password') {
            setPasswordStrength(null);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        if (!value) return;

        let validation;
        switch (name) {
            case 'email':
                validation = validateEmail(value);
                break;
            case 'username':
                validation = validateUsername(value);
                break;
            case 'password':
                validation = validatePassword(value);
                break;
            case 'displayName':
                validation = validateDisplayName(value);
                break;
            default:
                return;
        }

        if (!validation.valid) {
            setErrors(prev => ({ ...prev, [name]: validation.error }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // Use our comprehensive validators
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.valid) {
            newErrors.email = emailValidation.error;
        }

        const usernameValidation = validateUsername(formData.username);
        if (!usernameValidation.valid) {
            newErrors.username = usernameValidation.error;
        }

        const displayNameValidation = validateDisplayName(formData.displayName);
        if (!displayNameValidation.valid) {
            newErrors.displayName = displayNameValidation.error;
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.valid) {
            newErrors.password = passwordValidation.error;
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await api.post('/auth/signup', formData, { skipAuth: true });

            // Signup successful - update auth context
            login(response);

            // Redirect to home
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Signup error:', err);

            // Handle API errors
            if (err.details) {
                setErrors(err.details);
            } else {
                setErrors({ general: err.message || 'Signup failed. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (!passwordStrength) return 'bg-gray-200';
        if (passwordStrength === 'weak') return 'bg-red-500';
        if (passwordStrength === 'medium') return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthWidth = () => {
        if (!passwordStrength) return '0%';
        if (passwordStrength === 'weak') return '33%';
        if (passwordStrength === 'medium') return '66%';
        return '100%';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h1>
                    <p className="text-gray-600 dark:text-gray-300">Join PostShare and start sharing</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Display Name */}
                        <div>
                            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Display Name
                            </label>
                            <input
                                id="displayName"
                                name="displayName"
                                type="text"
                                value={formData.displayName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.displayName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                                    } focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="John Doe"
                                disabled={isLoading}
                                aria-invalid={!!errors.displayName}
                            />
                            {errors.displayName && <ErrorMessage message={errors.displayName} />}
                        </div>

                        {/* Username */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={formData.username}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                                    } focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="johndoe"
                                disabled={isLoading}
                                aria-invalid={!!errors.username}
                            />
                            {errors.username && <ErrorMessage message={errors.username} />}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                3-20 characters, alphanumeric, underscore, or hyphen
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                                    } focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="you@example.com"
                                disabled={isLoading}
                                aria-invalid={!!errors.email}
                            />
                            {errors.email && <ErrorMessage message={errors.email} />}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700 text-gray-900 dark:text-white ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400'
                                    } focus:ring-2 focus:border-transparent transition-all`}
                                placeholder="••••••••"
                                disabled={isLoading}
                                aria-invalid={!!errors.password}
                            />
                            {errors.password && <ErrorMessage message={errors.password} />}

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                                            style={{ width: getPasswordStrengthWidth() }}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 capitalize">
                                        Strength: {passwordStrength || 'Enter password'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* General Error */}
                        {errors.general && <ErrorMessage message={errors.general} />}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                'Create dì/account'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
