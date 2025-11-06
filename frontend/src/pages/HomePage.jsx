import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PostItem from '../components/PostItem';
import { Plus } from 'lucide-react';
import { usePermissions } from '../context/AuthContext';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuth();
  const { can } = usePermissions();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/posts');
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await api.post('/api/posts', newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(posts.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handleDeletePost = (deletedPostId) => {
    setPosts(posts.filter((post) => post._id !== deletedPostId));
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to MERN RBAC System
          </h2>
          <p className="text-gray-600 mb-4">
            Please log in to view and manage posts.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Posts</h1>
        
        {can('posts:create') && (
          <div className="mb-4">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                <span>Create New Post</span>
              </button>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Create New Post</h3>
                <form onSubmit={handleCreatePost}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      Content
                    </label>
                    <textarea
                      id="content"
                      required
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                    >
                      {isCreating ? 'Creating...' : 'Create Post'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewPost({ title: '', content: '' });
                      }}
                      disabled={isCreating}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-xl text-gray-600">Loading posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No posts available. Create the first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
