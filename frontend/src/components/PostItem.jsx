import React, { useState } from 'react';
import axios from 'axios';
import { usePermissions } from '../context/AuthContext';
import { Edit2, Trash2, Save, X } from 'lucide-react';

const PostItem = ({ post, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPost, setEditedPost] = useState({ title: post.title, content: post.content });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { can } = usePermissions();

  // Check permissions using the ownerId (post.author._id)
  const canUpdate = can('posts:update', post.author._id);
  const canDelete = can('posts:delete', post.author._id);

  const handleUpdate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.put(`/api/posts/${post._id}`, editedPost);
      onUpdate(response.data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update post');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await axios.delete(`/api/posts/${post._id}`);
      onDelete(post._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete post');
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPost({ title: post.title, content: post.content });
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isEditing ? (
        <div>
          <div className="mb-4">
            <label htmlFor={`edit-title-${post._id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id={`edit-title-${post._id}`}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={editedPost.title}
              onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor={`edit-content-${post._id}`} className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              id={`edit-content-${post._id}`}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={editedPost.content}
              onChange={(e) => setEditedPost({ ...editedPost, content: e.target.value })}
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleUpdate}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isLoading}
              className="flex items-center space-x-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
            <p className="text-sm text-gray-600">
              By <span className="font-semibold">{post.author.username}</span> •{' '}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

          {/* Crucial RBAC Logic (F-RBAC-05, F-RBAC-06) */}
          <div className="flex space-x-2">
            {canUpdate ? (
              <button
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : null}

            {canDelete ? (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostItem;
