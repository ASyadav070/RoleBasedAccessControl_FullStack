const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Post = require('./models/postModel');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const seedDatabase = async () => {
  try {
    // Delete all existing users and posts
    await User.deleteMany();
    await Post.deleteMany();
    console.log('Database cleared');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const editorPasswordHash = await bcrypt.hash('editor123', salt);
    const viewerPasswordHash = await bcrypt.hash('viewer123', salt);

    // Create three users
    const adminUser = await User.create({
      username: 'admin',
      passwordHash: adminPasswordHash,
      role: 'Admin',
    });

    const editorUser = await User.create({
      username: 'editor',
      passwordHash: editorPasswordHash,
      role: 'Editor',
    });

    const viewerUser = await User.create({
      username: 'viewer',
      passwordHash: viewerPasswordHash,
      role: 'Viewer',
    });

    console.log('Users created');

    // Create sample posts
    await Post.create({
      title: 'Welcome to the MERN RBAC System',
      content: 'This is a post created by the Admin user. It demonstrates the role-based access control system where different users have different permissions.',
      author: adminUser._id,
    });

    await Post.create({
      title: 'My First Post as an Editor',
      content: 'This post was created by the Editor user. Editors can create, edit, and delete their own posts, but cannot modify posts created by others.',
      author: editorUser._id,
    });

    console.log('Posts created');
    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('Editor: username=editor, password=editor123');
    console.log('Viewer: username=viewer, password=viewer123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
