const Post = require('../models/postModel');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private (posts:read)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Get posts error:', error);
    }
    
    res.status(500).json({ 
      message: 'Server error fetching posts',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private (posts:create)
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      return res.status(400).json({ 
        message: 'Please provide both title and content' 
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      author: req.user._id,
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'username');

    res.status(201).json(populatedPost);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Create post error:', error);
    }
    
    res.status(500).json({ 
      message: 'Server error creating post',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (posts:update:own or posts:update:any)
const updatePost = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate input
    if (!title && !content) {
      return res.status(400).json({ 
        message: 'Please provide title or content to update' 
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // RBAC Logic: Check permissions
    const isAdmin = req.user.role === 'Admin';
    const isOwner = post.author.toString() === req.user._id.toString();
    const isEditor = req.user.role === 'Editor';

    // Admin can update any post
    // Editor can only update their own posts
    if (!isAdmin && !(isEditor && isOwner)) {
      return res.status(403).json({
        message: 'Forbidden: You can only update your own posts',
      });
    }

    // Update post fields
    if (title) post.title = title.trim();
    if (content) post.content = content.trim();

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('author', 'username');

    res.status(200).json({ post: populatedPost });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Update post error:', error);
    }
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid post ID format' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error updating post',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (posts:delete:own or posts:delete:any)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ 
        message: 'Post not found' 
      });
    }

    // RBAC Logic: Check permissions
    const isAdmin = req.user.role === 'Admin';
    const isOwner = post.author.toString() === req.user._id.toString();
    const isEditor = req.user.role === 'Editor';

    // Admin can delete any post
    // Editor can only delete their own posts
    if (!isAdmin && !(isEditor && isOwner)) {
      return res.status(403).json({
        message: 'Forbidden: You can only delete your own posts',
      });
    }

    await Post.deleteOne({ _id: req.params.id });

    res.json({ 
      message: 'Post deleted successfully',
      deletedId: req.params.id 
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Delete post error:', error);
    }
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid post ID format' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error deleting post',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message })
    });
  }
};

module.exports = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
};
