# Project Manager App

A full-stack project management application with user authentication, project/task/member management, and a modern, responsive UI.

## Features

- **User Authentication:** Register, login, and secure session management (JWT, cookies).
- **Project Management:** Create, edit, delete projects; set status (active, on-hold, completed, cancelled) and priority.
- **Task Management:** Add, edit, delete tasks; assign to members; set status and priority; filter and view tasks.
- **Member Management:** Add/remove project members; only project owners can remove members.
- **Role-based Access:** Only project owners can delete projects or remove members; only task assigners can change task status.
- **UI/UX:** Responsive React frontend with modals, tabs, and color-coded statuses using Tailwind CSS.
- **API Integration:** RTK Query for efficient data fetching and caching.
- **Error Handling:** User-friendly error messages and validation.
- **Testing Checklist:** (see `TESTING_CHECKLIST.md` for manual test scenarios).

## Tech Stack

### Frontend

- **React 19** (with hooks)
- **Redux Toolkit** (state management, RTK Query)
- **React Router DOM** (routing)
- **Tailwind CSS** (utility-first styling)
- **Vite** (build tool)
- **ESLint** (linting)

### Backend

- **Node.js** (ES modules)
- **Express 5**
- **MongoDB** (with Mongoose)
- **JWT** (authentication)
- **bcryptjs** (password hashing)
- **dotenv** (env config)
- **CORS, cookie-parser** (middleware)

## Folder Structure

```
project-manager-app/
  backend/
    controllers/
    models/
    routes/
    config/
    index.js
    package.json
  frontend/
    src/
      components/
      pages/
      store/
      App.jsx
      main.jsx
    public/
    package.json
    vite.config.js
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB

### Backend

```bash
cd backend
npm install
npm run dev
```

- Configure environment variables in `.env` (see `.env.example` if present).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

- For production: `npm run build` and deploy the `dist` folder.


## Deployment

### Production Deployment (Recommended for Submission)

- **Frontend:** Deployed on [Vercel](https://vercel.com/)
- **Backend:** Deployed on [Render](https://render.com/)
- **Database:** MongoDB Atlas (cloud-hosted)

**Frontend Environment Variable:**
```
VITE_API_BASE_URL=https://<your-backend-app>.onrender.com/api
```

**Backend CORS:**
- CORS is configured to allow requests from the deployed Vercel frontend URL.

**Authentication Cookies:**
- Cookies are set with `secure: true` and `sameSite: 'none'` for cross-origin authentication over HTTPS.
- This is required for Vercel/Render deployments.

**Note:**
- Local development will not persist login cookies unless you use HTTPS locally, due to browser security with `secure: true` cookies.
- For project submission, this is the correct and secure setup.

**How it was Deployed:**
-(split the project into 2 repos , a frontend repo and a backend repo)
1. Deployed backend to Render, set up environment variables (MongoDB URI, JWT secret, etc.).
2. Deployed frontend to Vercel, set `VITE_API_BASE_URL` to your Render backend URL with `/api`.
3. Added my Vercel frontend URL to the backend CORS config.
4. Added `0.0.0.0/0` to MongoDB Atlas IP Access List for demo/testing.
5. Tested the deployed app at your Vercel URL.

## What More Can Be Done

- Add drag-and-drop task sorting (using dnd-kit or similar)
- Implement notifications (email, in-app, or push)
- Add user profile editing and avatar upload
- Integrate project export (PDF/CSV)
- Add project activity logs/history
- Add dark mode toggle
- Add admin dashboard for analytics
- Better cleanup of the analytics
- Better styling

## User Guidelines & Tips

- **Refresh the page** after making changes (like creating/editing/deleting projects or tasks) to see the latest updates, especially on cloud deployments.
- **Wait a few seconds** after actions—free cloud instances (Render, Vercel) may take time to wake up or process requests due to cold starts.
- If you see a delay or error, try refreshing or waiting and retrying the action.
- For best experience, use Chrome or Firefox on desktop or mobile.
- If you encounter login issues, make sure cookies are enabled and you are using the deployed URLs.
-link to frontend repo : https://github.com/Datman701/Project-manager-frontend.
-link to backend repo  : https://github.com/Datman701/Project-manager-backend.

