# MERN RBAC System - Setup & Testing Guide

## Prerequisites

You need MongoDB running. Choose one option:

### Option A: Local MongoDB Installation

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the installer for Windows
   - Install with default settings

2. **Start MongoDB Service**
   ```powershell
   # MongoDB should start automatically as a Windows service
   # To verify it's running:
   net start MongoDB
   ```

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster**
   - Create a free M0 cluster
   - Choose a region close to you

3. **Configure Access**
   - Add your IP address to IP Whitelist (or use 0.0.0.0/0 for testing)
   - Create a database user with username and password

4. **Get Connection String**
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Update `backend/.env` file:
     ```
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mern-rbac?retryWrites=true&w=majority
     ```

## Running the Application

### 1. Seed the Database

```powershell
cd backend
npm run seed
```

You should see:
```
Database cleared
Users created
Posts created
Database seeded successfully!

Login credentials:
Admin: username=admin, password=admin123
Editor: username=editor, password=editor123
Viewer: username=viewer, password=viewer123
```

### 2. Start Backend Server

```powershell
cd backend
npm run dev
```

Backend should run on: http://localhost:5001

### 3. Start Frontend Server (in a new terminal)

```powershell
cd frontend
npm start
```

Frontend should open automatically at: http://localhost:3000

## Testing the RBAC System

### Test Scenario 1: Viewer Role
1. Login with: `viewer` / `viewer123`
2. ✅ Can view all posts
3. ❌ Cannot see "Create New Post" button
4. ❌ Cannot see Edit/Delete buttons on any post
5. ❌ Cannot access Admin Panel (no link in navbar)

### Test Scenario 2: Editor Role
1. Login with: `editor` / `editor123`
2. ✅ Can view all posts
3. ✅ Can create new posts
4. ✅ Can edit/delete ONLY their own posts
5. ❌ Cannot edit/delete posts created by Admin
6. ❌ Cannot access Admin Panel

### Test Scenario 3: Admin Role
1. Login with: `admin` / `admin123`
2. ✅ Can view all posts
3. ✅ Can create new posts
4. ✅ Can edit/delete ALL posts (including Editor's posts)
5. ✅ Can access Admin Panel (link visible in navbar)
6. ✅ Can view list of all users and their roles

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Posts
- `GET /api/posts` - Get all posts (protected, requires login)
- `POST /api/posts` - Create post (protected, Editor/Admin only)
- `PUT /api/posts/:id` - Update post (protected, own posts or Admin)
- `DELETE /api/posts/:id` - Delete post (protected, own posts or Admin)

### Users
- `GET /api/users` - Get all users (protected, Admin only)

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check `.env` file has correct MONGODB_URI
- Verify port 5001 is not in use

### Frontend won't connect to backend
- Ensure backend is running on port 5001
- Check `frontend/package.json` has `"proxy": "http://localhost:5001"`
- Clear browser cache and reload

### Authentication issues
- Clear localStorage in browser DevTools
- Re-seed the database
- Check JWT_SECRET is set in `.env`

## Project Structure

```
fsproject/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Login, getMe
│   │   ├── postController.js     # CRUD operations for posts
│   │   └── userController.js     # Get all users (Admin)
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification, RBAC authorization
│   ├── models/
│   │   ├── userModel.js          # User schema with roles
│   │   └── postModel.js          # Post schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── postRoutes.js         # Post endpoints
│   │   └── userRoutes.js         # User endpoints
│   ├── .env                      # Environment variables
│   ├── .env.example              # Environment template
│   ├── package.json
│   ├── seed.js                   # Database seeder
│   └── server.js                 # Express server
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.js         # Navigation with RBAC
│   │   │   ├── PostItem.js       # Post display with RBAC controls
│   │   │   └── PrivateRoute.js   # Route guard
│   │   ├── context/
│   │   │   └── AuthContext.js    # Auth state, permissions hook
│   │   ├── pages/
│   │   │   ├── HomePage.js       # Posts list/create
│   │   │   ├── LoginPage.js      # Login form
│   │   │   └── AdminPage.js      # User management
│   │   ├── App.js                # Routes configuration
│   │   └── index.js
│   └── package.json
│
└── prd.md                        # Product Requirements Document
```

## Success Criteria (from PRD)

✅ Security: Passwords hashed with bcryptjs
✅ Authentication: JWT-based with protected routes
✅ RBAC: Three roles (Admin, Editor, Viewer) with distinct permissions
✅ Backend Enforcement: Middleware validates all protected endpoints
✅ Frontend Adaptation: UI changes based on user role
✅ Ownership Rules: Editors can only modify their own content
✅ Admin Capabilities: Full CRUD on all content, user management
