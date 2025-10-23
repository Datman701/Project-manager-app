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

1. Build the frontend: `npm run build` (in `frontend/`).
2. Deploy the backend and frontend `dist` folder to your server or hosting provider.
3. Set environment variables for production.

## Customization

- Update Tailwind config for custom colors or safelisting dynamic classes.
- See `frontend/src/pages/ProjectDetail.jsx` for status color logic.

## License

MIT
