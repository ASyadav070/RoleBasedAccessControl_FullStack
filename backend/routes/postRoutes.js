const express = require('express');
const {
  getPosts,
  createPost,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/posts
router.get('/', protect, authorize('posts:read'), getPosts);

// POST /api/posts
router.post('/', protect, authorize('posts:create'), createPost);

// PUT /api/posts/:id
router.put('/:id', protect, updatePost);

// DELETE /api/posts/:id
router.delete('/:id', protect, deletePost);

module.exports = router;
