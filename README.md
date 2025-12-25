# PostShare

A modern, feature-rich social feed application built as an experiment with [GitHub's spec-kit](https://github.com/google/spec-kit) methodology.

## 📝 About This Project

PostShare was created to explore and demonstrate the **spec-kit** development approach - a specification-driven workflow that emphasizes:

- **Specification-first development**: Features are fully specified before implementation
- **Structured planning**: Each feature has detailed research, data models, and task breakdowns
- **Incremental delivery**: Features are implemented as independent, testable units
- **Documentation-driven**: All features are documented in `/specs` with specifications, plans, and contracts

This project serves as a real-world example of how spec-kit can streamline the development process from idea to implementation.

## ✨ Features

PostShare is a complete social feed platform with the following capabilities:

### Core Functionality
- **📝 Create Posts**: Write and share posts with text content
- **🖼️ Image Support**: Attach images to posts with automatic compression (<300KB)
- **✏️ Edit Posts**: Modify post content and images after publishing
- **🗑️ Delete Posts**: Remove individual posts or clear entire feed
- **👁️ View Images**: Click images to view in full-screen modal
- **🌓 Dark Mode**: Toggle between light and dark themes with system preference sync

### Authentication & Security
- **🔐 JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **📧 Email/Password Signup & Login**: Traditional authentication with strong password requirements
- **🔑 Google OAuth**: Sign in with Google for seamless authentication
- **🐙 GitHub OAuth**: Sign in with GitHub for developer-friendly login
- **🔗 Account Linking**: Automatically links OAuth and password authentication methods
- **🛡️ Protected Routes**: Route-level authentication guards for secure access
- **🔄 Automatic Token Refresh**: Seamless session management with refresh token rotation
- **🚫 Rate Limiting**: Login attempt throttling with account lockout protection

### Technical Features
- **💾 Database Storage**: MongoDB with Vercel integration for persistent data
- **🌐 Full-Stack Architecture**: Express backend API + React frontend
- **📱 Responsive Design**: Beautiful UI that works on all screen sizes
- **🎨 Image Optimization**: Automatic compression using `browser-image-compression`
- **✨ Modern UI**: Glassmorphism effects, smooth animations, gradient accents
- **⚡ Real-time Updates**: Optimistic UI updates without page reloads
- **🌙 Complete Dark Mode**: Full dark theme support across all pages and components

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Image Processing**: browser-image-compression
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js 18+ with Express
- **Database**: MongoDB with connection pooling
- **Authentication**: JWT (jsonwebtoken) + OAuth 2.0
- **Password Hashing**: bcrypt
- **Image Storage**: Cloudinary integration
- **Environment**: dotenv for configuration

### Deployment
- **Platform**: Vercel (serverless functions)
- **Database**: MongoDB Atlas
- **CDN**: Cloudinary for image hosting

## 📁 Project Structure

```
PostShare/
├── api/                    # Backend API routes (Vercel serverless)
│   ├── auth/
│   │   ├── login.js
│   │   ├── signup.js
│   │   ├── refresh.js
│   │   ├── logout.js
│   │   └── oauth/
│   │       ├── google.js
│   │       ├── github.js
│   │       └── [provider]/callback.js
│   ├── posts/
│   └── images/
├── lib/                    # Shared utilities
│   ├── auth.js            # JWT & password hashing
│   ├── mongodb.js         # Database connection
│   ├── cloudinary.js      # Image upload
│   ├── errors.js          # Error handling
│   └── middleware.js      # Request validation
├── src/
│   ├── components/        # React components
│   │   ├── Navbar.jsx
│   │   ├── PostCard.jsx
│   │   ├── PostForm.jsx
│   │   ├── EditPostModal.jsx
│   │   ├── ImageModal.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/             # Route pages
│   │   ├── Feed.jsx
│   │   ├── CreatePost.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── OAuthCallback.jsx
│   ├── services/          # API client
│   │   └── apiClient.js
│   ├── contexts/          # React Context
│   │   └── AuthContext.jsx
│   └── hooks/             # Custom hooks
│       └── useAuth.js
├── specs/                 # Feature specifications
│   ├── 001-static-blog-page/
│   ├── 002-clear-feed/
│   ├── 003-ui-revamp-theme/
│   ├── 004-delete-post-image-opt/
│   ├── 005-view-edit-feed/
│   └── 006-vercel-db-storage/  # ← Authentication & Database
└── .specify/              # spec-kit configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Google OAuth credentials (optional, for Google login)
- GitHub OAuth app (optional, for GitHub login)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PostShare
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/postshare

   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # OAuth - Google (optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # OAuth - GitHub (optional)
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Initialize the database**
   ```bash
   node lib/initDb.js
   ```

5. **Start development servers**
   
   For local development with OAuth:
   ```bash
   # Terminal 1: Start backend API
   node start-server.js

   # Terminal 2: Start frontend dev server
   npm run dev
   ```

   Or use Vercel's dev environment:
   ```bash
   vercel dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5174` (or port shown in terminal)

### Available Scripts

- `npm run dev` - Start Vite development server (frontend only)
- `node start-server.js` - Start Express backend server (port 3000)
- `vercel dev` - Start full-stack dev environment (recommended)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### OAuth Setup (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add to authorized redirect URIs:
   - `http://localhost:3000/api/auth/oauth/google/callback` (local)
   - Your production URL

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth app
3. Set authorization callback URL:
   - `http://localhost:3000/api/auth/oauth/github/callback` (local)
   - Your production URL

## 🎯 Feature Development with spec-kit

Each feature in PostShare follows the spec-kit workflow:

### 1. Specification (`/speckit.specify`)
Define what the feature should do from a user perspective:
- User stories and acceptance criteria
- Success metrics
- Functional requirements

### 2. Planning (`/speckit.plan`)
Technical design and architecture:
- Research decisions
- Data models
- API contracts
- Implementation structure

### 3. Task Generation (`/speckit.tasks`)
Break down into actionable tasks:
- Phase-based organization
- Dependency tracking
- Parallel execution opportunities

### 4. Implementation (`/speckit.implement`)
Execute tasks systematically:
- Sequential and parallel task execution
- Validation at each phase
- Progress tracking

### Example Feature: View & Edit Posts (005)

```
specs/005-view-edit-feed/
├── spec.md              # User-facing specification
├── plan.md              # Technical implementation plan
├── research.md          # Technology decisions
├── data-model.md        # Data structure design
├── contracts/           # API interfaces
│   └── BlogService.ts
├── quickstart.md        # Testing guide
└── tasks.md             # Implementation checklist
```

## 📚 Feature History

1. **001-static-blog-page**: Initial post feed and creation (LocalStorage)
2. **002-clear-feed**: Bulk delete functionality
3. **003-ui-revamp-theme**: Dark mode and modern design system
4. **004-delete-post-image-opt**: Single post deletion + image compression
5. **005-view-edit-feed**: Image viewing modal + post editing
6. **006-vercel-db-storage**: **Full authentication system** ✅
   - MongoDB database integration
   - JWT authentication with refresh tokens
   - Email/password signup & login
   - Google OAuth 2.0 integration
   - GitHub OAuth 2.0 integration  
   - Account linking (OAuth ↔ password)
   - Protected routes & session management
   - Rate limiting & security features

## 🔍 Key Learnings from spec-kit

### Benefits Experienced:
- ✅ **Clear scope**: Each feature has well-defined boundaries
- ✅ **Better planning**: Design decisions documented before coding
- ✅ **Easier debugging**: Specifications provide reference for expected behavior
- ✅ **Incremental progress**: Features can be developed independently
- ✅ **Self-documenting**: Specs serve as living documentation

### Challenges:
- 📝 Initial overhead in creating detailed specifications
- 🔄 Learning curve for the workflow commands
- 📊 Maintaining consistency across specification documents

## 🤝 Contributing

This is an experimental project, but contributions are welcome! Please:

1. Follow the spec-kit workflow for new features
2. Create a specification before implementing
3. Update relevant documentation
4. Ensure all tasks are completed

## 📄 License

This project is open source and available for learning purposes.

## 🙏 Acknowledgments

- **spec-kit** by Google for the specification-driven development methodology
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for blazing-fast development experience
- **Lucide** for beautiful icons

---

**Note**: This project was built entirely using the spec-kit methodology as an experiment in specification-driven development. Each feature was carefully planned, documented, and implemented following the workflows provided by spec-kit.
