import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import followService from '../services/followService';
import FollowRequestCard from '../components/FollowRequestCard';

/**
 * SentRequests Page
 * Displays and manages outgoing follow requests sent by the current user
 */
export default function SentRequests() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchRequests();
    }, [user, navigate]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await followService.getSentRequests();
            setRequests(data.requests || []);
        } catch (err) {
            console.error('Failed to fetch sent requests:', err);
            setError(err.message || 'Failed to load sent requests');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (requestId) => {
        try {
            setActionLoading(requestId);
            await followService.cancelSentRequest(requestId);

            // Remove from local state
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) {
            console.error('Failed to cancel request:', err);
            setError(err.message || 'Failed to cancel follow request');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Go back"
                    >
                        <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Sent Requests
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {requests.length} pending request{requests.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Requests List */}
                        {requests.length > 0 ? (
                            <div className="space-y-3">
                                {requests.map(request => (
                                    <FollowRequestCard
                                        key={request._id}
                                        request={request}
                                        variant="outgoing"
                                        onCancel={handleCancel}
                                        loading={actionLoading === request._id}
                                    />
                                ))}
                            </div>
                        ) : (
                            /* Empty State */
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Send size={40} className="text-gray-400 dark:text-gray-600" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    No pending requests
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                                    When you send a follow request, it will appear here until the person accepts or declines.
                                </p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Discover People
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
