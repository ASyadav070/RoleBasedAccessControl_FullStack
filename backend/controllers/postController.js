const Post = require('../models/postModel');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private (posts:read)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (posts:create)
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Please provide title and content' });
    }

    const post = await Post.create({
      title,
      content,
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id).populate('author', 'username');

    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (posts:update:own or posts:update:any)
const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Crucial RBAC Logic (F-RBAC-03)
    const isAdmin = req.user.role === 'Admin';
    const isOwner = post.author.toString() === req.user._id.toString();
    const isEditor = req.user.role === 'Editor';

    // Admin can update any post
    if (isAdmin) {
      // Allow update
    }
    // Editor can only update their own posts
    else if (isEditor && isOwner) {
      // Allow update
    }
    // Otherwise, deny access
    else {
      return res.status(403).json({
        message: 'Forbidden: You can only update your own posts',
      });
    }

    // Update post fields
    if (title) post.title = title;
    if (content) post.content = content;

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id).populate('author', 'username');

    res.status(200).json({ post: populatedPost });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (posts:delete:own or posts:delete:any)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Crucial RBAC Logic (F-RBAC-03)
    const isAdmin = req.user.role === 'Admin';
    const isOwner = post.author.toString() === req.user._id.toString();
    const isEditor = req.user.role === 'Editor';

    // Admin can delete any post
    if (isAdmin) {
      // Allow delete
    }
    // Editor can only delete their own posts
    else if (isEditor && isOwner) {
      // Allow delete
    }
    // Otherwise, deny access
    else {
      return res.status(403).json({
        message: 'Forbidden: You can only delete your own posts',
      });
    }

    await Post.deleteOne({ _id: req.params.id });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
};
