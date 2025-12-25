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
- **🌓 Dark Mode**: Toggle between light and dark themes

### Technical Features
- **Client-side Storage**: All data stored in browser's LocalStorage
- **Responsive Design**: Beautiful UI that works on all screen sizes
- **Image Optimization**: Automatic compression using `browser-image-compression`
- **Modern UI**: Glassmorphism effects, smooth animations, gradient accents
- **Real-time Updates**: Optimistic UI updates without page reloads

## 🛠️ Tech Stack

- **Framework**: React 18+ with Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Image Processing**: browser-image-compression
- **Date Formatting**: date-fns

## 📁 Project Structure

```
PostShare/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── Navbar.jsx
│   │   ├── PostCard.jsx
│   │   ├── PostForm.jsx
│   │   ├── EditPostModal.jsx
│   │   └── ImageModal.jsx
│   ├── pages/              # Route pages
│   │   ├── Feed.jsx
│   │   └── CreatePost.jsx
│   ├── services/           # Business logic
│   │   └── blogService.js
│   └── utils/              # Utility functions
│       ├── fileHelpers.js
│       └── imageHelpers.js
├── specs/                  # Feature specifications (spec-kit)
│   ├── 001-static-blog-page/
│   ├── 002-clear-feed/
│   ├── 003-ui-revamp-theme/
│   ├── 004-delete-post-image-opt/
│   └── 005-view-edit-feed/
└── .specify/               # spec-kit configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm

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

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

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

1. **001-static-blog-page**: Initial post feed and creation
2. **002-clear-feed**: Bulk delete functionality
3. **003-ui-revamp-theme**: Dark mode and modern design system
4. **004-delete-post-image-opt**: Single post deletion + image compression
5. **005-view-edit-feed**: Image viewing modal + post editing

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
