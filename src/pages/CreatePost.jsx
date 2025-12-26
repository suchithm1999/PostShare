import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostForm from '../components/PostForm';
import { BlogService } from '../services/blogService';

export default function CreatePost() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleCreatePost = async (dto) => {
        setIsSubmitting(true);
        setSubmitError('');

        try {
            await BlogService.createPost(dto);
            navigate('/');
        } catch (error) {
            console.error(error);
            setSubmitError(error.message || 'Failed to create post');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-4 md:py-8 px-4">
            <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Create New Post
            </h1>

            {submitError && (
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 border border-red-100 dark:border-red-900/20">
                    {submitError}
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 p-4 md:p-8 rounded-2xl shadow-xl shadow-gray-300/50 dark:shadow-none border border-gray-200 dark:border-slate-700">
                <PostForm onSubmit={handleCreatePost} isSubmitting={isSubmitting} />
            </div>
        </div>
    );
}
