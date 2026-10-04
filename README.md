# College Media 🎓

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

> **Make your campus smaller.** A modern, full-stack college social media platform connecting students through real-time communication, campus communities, interactive feeds, and Gemini-powered creative assistance.

🌐 **Live Application**: [collegemedia-frontend.onrender.com](https://collegemedia-frontend.onrender.com)

---

## ✨ Features

### 📰 1. Campus Feed & Post Creation
- **Feed Composer**: Share thoughts, announcements, and campus updates.
- **Media Uploads**: Seamless photo attachments powered by Cloudinary.
- **Gemini AI Post Suggestion**: Integrated "AI Suggest" button in the composer to brainstorm engaging campus posts or refine your draft with Google Gemini.
- **Engagement**: Like, comment, and delete posts with instant optimistic UI updates.

### 💬 2. Real-Time Chat & Group Conversations
- **1-on-1 & Group Chats**: Real-time messaging powered by Socket.IO with WebSocket upgrade negotiation.
- **Dynamic Conversation Ordering**: Active conversations automatically elevate to the top (position 0) in real time when a new message is sent or received.
- **Rich Messaging**: Image attachments in chat, typing indicators, and user-scoped deletion.
- **Group Administration**: Promote members to admins, demote roles, and manage group membership.

### 👥 3. Campus Communities
- **Interest-Based Spaces**: Discover, join, and participate in niche campus clubs, academic departments, and student groups.
- **Role Management**: Community creator ownership permissions and member directories.

### 🔔 4. Smart Notifications & Interactive Deep Linking
- **Actionable Alerts**: Instant notifications for likes, comments, and new followers.
- **Deep Linking & Post Focus**:
  - Clicking a **Like** notification navigates directly to the target post in the feed, scrolls it into view, and highlights it with a glow ring.
  - Clicking a **Comment** notification navigates to the target post, highlights it, and automatically expands the comments section.
  - Clicking a **Follow** notification navigates directly to the student's profile.

### 👤 5. Student Profiles & Gemini AI Bio Generation
- **Academic Details**: Student branch/major, graduation year, followers, following, and post portfolio.
- **Independent Profile Updates**: Changing only the profile picture safely preserves existing name and bio without accidental overwrites.
- **Gemini AI Bio Generator**: Integrated "AI Suggest Bio" tool in the profile editor to generate authentic student bios tailored to your branch and interests.
- **Instant Avatar Sync**: Avatar updates synchronize across navigation, posts, and comments immediately without a page reload.

### 📱 6. Responsive Design & Mobile Navigation
- **Optimized for All Viewports**: Desktop, tablet, and mobile layouts.
- **Touch-Friendly Bottom Bar**: Quick access to **Home**, **Messages**, **Communities**, and **Notifications**.
- **Mobile "More" Drawer**: Smooth slide-up menu containing User Profile, Campus Search, Group Creation, and Accessible Mobile Logout.

### 🔒 7. Authentication & Security
- **JWT Architecture**: Access tokens with secure refresh token rotation and bcryptjs password encryption.
- **Password Reset Flow**: Hashed one-time reset tokens with expiration and single-use validation.
- **Safe Session Teardown**: Clean socket disconnection and auth cleanup preventing browser back-button re-entry.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, React Router v7, React Hot Toast, React Icons |
| **Backend** | Node.js, Express 5, TypeScript, Socket.IO, Prisma ORM, Multer |
| **Database** | PostgreSQL (Neon Serverless PostgreSQL) |
| **AI Integration** | Google Gemini 2.5 Flash (`@google/genai`) for post suggestions and profile bio generation |
| **Cloud Storage** | Cloudinary (Image uploads & CDN optimization) |
| **Email Service** | Nodemailer for password recovery |

---

## 📁 Repository Structure

```text
collegeMedia/
├── college-media-frontend/          # React + TypeScript client (Vite)
│   ├── src/
│   │   ├── components/              # UI, Post, Chat, Profile, and Community components
│   │   ├── layouts/                 # MainLayout & responsive Sidebar / Bottom Bar
│   │   ├── pages/                   # Feed, Messages, Profile, Communities, Notifications, etc.
│   │   ├── routes/                  # Protected routes and application router
│   │   ├── services/                # Axios API services, Socket.IO client, and Gemini helpers
│   │   ├── store/                   # Zustand authentication store
│   │   └── types/                   # TypeScript interfaces
│   └── package.json
│
├── college_media-backend/           # Express + TypeScript server
│   ├── src/
│   │   ├── config/                  # Cloudinary configuration
│   │   ├── controllers/             # Post, User, Chat, AI, Auth, and Community controllers
│   │   ├── middleware/              # JWT auth and Multer file upload middleware
│   │   ├── routes/                  # Express API route declarations
│   │   ├── services/                # Google Gemini GenAI and Email services
│   │   ├── socket/                  # Socket.IO connection and real-time event handlers
│   │   └── server.ts                # Application entrypoint
│   ├── prisma/
│   │   └── schema.prisma            # PostgreSQL Prisma schema definition
│   ├── scripts/                     # Automated test suites and regression scripts
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- PostgreSQL database (or free [Neon](https://neon.tech/) instance)
- Cloudinary account (for image uploads)
- Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

---

### 1. Clone the Repository
```bash
git clone https://github.com/lokeshkankarwal/collegeMedia.git
cd collegeMedia
```

---

### 2. Backend Setup

```bash
cd college_media-backend
npm install
```

Create a `.env` file in `college_media-backend`:
```env
PORT=8080
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

# JWT Secrets
JWT_SECRET=your_super_secret_key
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=7d
JWT_REFRESH_EXPIRES=7d

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (for password resets)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

Run database migrations:
```bash
npx prisma generate
npx prisma db push
```

Start backend development server:
```bash
npm run dev
```
The server will run on `http://localhost:8080`.

---

### 3. Frontend Setup

In a new terminal window:
```bash
cd college-media-frontend
npm install
```

Create a `.env` file in `college-media-frontend`:
```env
VITE_API_URL=http://localhost:8080/api
```

Start frontend development server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Testing & Verification

The backend includes automated verification suites for regression testing:

```bash
cd college_media-backend

# Test independent profile photo & bio updates
npx ts-node scripts/verify_profile_updates.ts

# Test notification navigation, composer, and conversation re-ordering
npx ts-node scripts/verify_suite_2.ts

# Master full-stack regression suite (Auth, follow, groups, communities, resets)
npx ts-node scripts/verify-all.ts
```

Frontend linting & production build:
```bash
cd college-media-frontend
npm run lint
npm run build
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
