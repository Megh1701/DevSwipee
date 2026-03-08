# DevSwipee 🚀

> A Tinder-like matching platform for developers and their projects

## Overview

**DevSwipee** connects developers through their projects. Create project profiles, swipe on others' work, match with like-minded developers, and collaborate in real-time.

## ✨ Features

### Core Features
- 🔐 **Authentication** - Secure signup/login with JWT
- 📁 **Project Profiles** - Showcase your work with descriptions, tech stack, and URLs
- 💝 **Swipe Feed** - Browse and swipe on other developers' projects
- 🤝 **Matching System** - Mutual interest creates instant matches
- 💬 **Real-time Chat** - Socket.io-powered messaging with matched developers
- 🖼️ **Image Upload** - Cloudinary integration for project thumbnails

### 🆕 ATS Score Dashboard (NEW!)
- 📊 **Performance Analytics** - Track how users engage with your projects
- 🤖 **AI-Powered Insights** - Gemini API analyzes project quality
- 🎯 **Actionable Suggestions** - Get tips to improve your score
- 📈 **Detailed Breakdowns** - Understand what drives your score (0-100)
- 🎓 **Guided Tours** - Driver.js walkthroughs for new users

**Scoring Formula:**
- **60%** Swipe Performance (interest rate, acceptance rate, match rate)
- **40%** Project Quality (AI analysis of description, tech depth, completeness)

[Learn more about ATS Scoring →](./ATS_FEATURE_README.md)

## 🛠️ Tech Stack

### Frontend
- React + Vite
- TailwindCSS
- Framer Motion
- Socket.io-client
- Driver.js

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- Socket.io
- Cloudinary
- Google Gemini API

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB
- Cloudinary account
- Gemini API key (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd DevSwipee
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your credentials
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create `backend/.env` with:
```env
DATABASE_URI=mongodb://localhost:27017/devswipee
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key  # Get from https://makersuite.google.com/app/apikey
NODE_ENV=development
PORT=3000
```

## 📖 Usage

1. **Sign up** and create your developer profile
2. **Create a project** with detailed description (150+ words recommended)
3. **Browse the feed** and swipe on projects you like
4. **Match** with developers and start chatting
5. **Check your ATS Score** to see how your projects perform
6. **Follow AI suggestions** to improve your visibility

## 🎯 Project Structure

```
DevSwipee/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Helper functions
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── utils/          # Helper functions
│   └── index.html
└── README.md
```

## 📚 Documentation

- [ATS Feature Guide](./ATS_FEATURE_README.md) - Detailed ATS scoring documentation
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [API Routes](./backend/apiroutes.md) - Backend API reference

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Gemini API** - AI-powered project quality analysis
- **Driver.js** - Interactive guided tours
- **Framer Motion** - Smooth animations
- **Socket.io** - Real-time communication