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

**How to Deploy:**
1. Deploy backend to Render, set up environment variables (MongoDB URI, JWT secret, etc.).
2. Deploy frontend to Vercel, set `VITE_API_BASE_URL` to your Render backend URL with `/api`.
3. Add your Vercel frontend URL to the backend CORS config.
4. Add `0.0.0.0/0` to MongoDB Atlas IP Access List for demo/testing.
5. Test the deployed app at your Vercel URL.

## Customization

- Update Tailwind config for custom colors or safelisting dynamic classes.
- See `frontend/src/pages/ProjectDetail.jsx` for status color logic.

## License

MIT
