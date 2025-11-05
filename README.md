# MERN RBAC System V2

A full-stack MERN (MongoDB, Express, React, Node.js) application with Role-Based Access Control (RBAC), featuring secure authentication, permission management, and comprehensive API security.

## 🚀 Features

- 🔐 **Secure Authentication** - JWT access & refresh tokens with httpOnly cookies
- 👥 **Role-Based Access Control** - Admin, Editor, and Viewer roles with granular permissions
- 📝 **Post Management** - Create, read, update, and delete posts with ownership controls
- 🛡️ **API Security** - Rate limiting, input validation, and CORS protection
- 🔄 **Automatic Token Refresh** - Seamless user experience with token auto-renewal
- ✅ **Unit Testing** - Comprehensive tests with Jest & Supertest
- 📊 **Admin Panel** - User role management interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Context API** - State management
- **Vite** - Build tool

### Backend
- **Node.js & Express** - Server framework
- **MongoDB & Mongoose** - Database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-rate-limit** - API rate limiting
- **express-validator** - Input validation
- **cookie-parser** - Cookie handling
- **Jest & Supertest** - Testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mern-rbac-v2.git
cd mern-rbac-v2
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

**Generate secure secrets** using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run the command three times to generate different secrets for:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`

**Edit `.env` file** with your values:

```env
PORT=5001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=<your-generated-secret>
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=<your-generated-secret>
SESSION_SECRET=<your-generated-secret>
NODE_ENV=development
```

### 4. Frontend Setup

```bash
cd ../frontend
npm install
```

If you need custom API URL, create `.env`:

```bash
cp .env.example .env
```

### 5. Seed the Database (Optional)

Create test users:

```bash
cd backend
npm run seed
```

**Test Users Created:**
- **Admin** - username: `admin`, password: `admin123`
- **Editor** - username: `editor`, password: `editor123`
- **Viewer** - username: `viewer`, password: `viewer123`

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5001`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
# Serve the build folder with your preferred static server
```

## 🧪 Running Tests

```bash
cd backend
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## 📁 Project Structure

```
mern-rbac-v2/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── postController.js  # Post CRUD operations
│   │   └── userController.js  # User management
│   ├── middleware/
│   │   ├── authMiddleware.js  # JWT verification & authorization
│   │   ├── rateLimiter.js     # Rate limiting configuration
│   │   └── validationMiddleware.js  # Input validation
│   ├── models/
│   │   ├── postModel.js       # Post schema
│   │   └── userModel.js       # User schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   ├── postRoutes.js      # Post endpoints
│   │   └── userRoutes.js      # User endpoints
│   ├── tests/
│   │   ├── setup.js           # Test configuration
│   │   ├── auth.test.js       # Auth tests
│   │   └── posts.test.js      # Post tests
│   ├── .env                   # Environment variables (not in git)
│   ├── .env.example           # Example environment file
│   ├── package.json
│   ├── seed.js                # Database seeder
│   └── server.js              # Express app setup
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── NavBar.jsx     # Navigation component
│   │   │   ├── PostItem.jsx   # Post display component
│   │   │   └── PrivateRoute.jsx  # Protected route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state management
│   │   ├── pages/
│   │   │   ├── AdminPage.jsx     # Admin dashboard
│   │   │   ├── HomePage.jsx      # Posts listing
│   │   │   └── LoginPage.jsx     # Login form
│   │   ├── services/
│   │   │   └── api.js            # Axios instance & interceptors
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── prdV2.md                   # Product requirements
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh` | Refresh access token | Refresh Token |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Posts
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/posts` | Get all posts | All authenticated |
| POST | `/api/posts` | Create new post | Editor, Admin |
| PUT | `/api/posts/:id` | Update post | Owner or Admin |
| DELETE | `/api/posts/:id` | Delete post | Owner or Admin |

### Users (Admin Only)
| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/users` | Get all users | Admin |
| PUT | `/api/users/:id/role` | Update user role | Admin |

## 🔐 Security Features

- ✅ **httpOnly Cookies** - Refresh tokens stored securely
- ✅ **Rate Limiting** - 1000 req/15min global, 10 req/15min for auth
- ✅ **Input Validation** - Express-validator sanitization
- ✅ **CORS Configuration** - Credentials-enabled cross-origin
- ✅ **Password Hashing** - Bcrypt with salt rounds
- ✅ **JWT Tokens** - 15min access tokens, 7-day refresh tokens
- ✅ **Automatic Token Refresh** - Transparent 401 handling
- ✅ **Request Queuing** - Prevents race conditions during refresh

## 👥 Permission Matrix

| Action | Admin | Editor | Viewer |
|--------|-------|--------|--------|
| View Posts | ✅ | ✅ | ✅ |
| Create Posts | ✅ | ✅ | ❌ |
| Update Own Posts | ✅ | ✅ | ❌ |
| Update Any Posts | ✅ | ❌ | ❌ |
| Delete Own Posts | ✅ | ✅ | ❌ |
| Delete Any Posts | ✅ | ❌ | ❌ |
| View Users | ✅ | ❌ | ❌ |
| Manage User Roles | ✅ | ❌ | ❌ |

## 🚀 Deployment

### Backend Deployment (Railway, Render, Heroku)

1. Set environment variables in platform dashboard
2. Set `NODE_ENV=production`
3. Update CORS origin to production frontend URL
4. Whitelist deployment IP in MongoDB Atlas

### Frontend Deployment (Vercel, Netlify)

1. Build the application:
   ```bash
   npm run build
   ```

2. Set environment variable:
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   ```

3. Deploy the `dist` or `build` folder

## 🐛 Troubleshooting

### 401 Unauthorized Errors
- Clear browser cookies
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Verify backend is running on correct port
- Check access token in Network tab

### CORS Errors
- Verify backend CORS origin matches frontend URL
- Ensure `withCredentials: true` in API service
- Check browser console for specific CORS error

### MongoDB Connection Issues
- Whitelist your IP address in MongoDB Atlas
- Verify connection string format
- Check username/password special characters are URL-encoded
- Test connection with MongoDB Compass

### Token Refresh Loop
- Clear all cookies for localhost
- Check that refresh endpoint isn't being intercepted
- Verify `originalRequest._retry` flag is working

## 📝 Environment Variables Reference

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Access token secret | Generated 64-byte hex |
| `JWT_EXPIRE` | Access token expiry | `15m` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Generated 64-byte hex |
| `SESSION_SECRET` | Session secret | Generated 64-byte hex |
| `NODE_ENV` | Environment | `development` or `production` |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:5001` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built following MERN stack best practices
- Implements security guidelines from OWASP
- Token refresh pattern inspired by industry standards

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**⚠️ Security Warning:** Never commit `.env` files or expose sensitive credentials. Always use environment variables for secrets and API keys.
