# TaskTracker — MERN Stack Assignment

A full-stack task management application built with MongoDB, Express, React, and Node.js.

**Features:** Full CRUD · Form validation · REST API · Responsive UI · Filter & sort · Toast notifications · Tag system · Overdue detection · Priority grouping

---

## Project Structure

```
mern-task-tracker/
├── backend/                    # Express + MongoDB server
│   ├── middleware/
│   │   └── errorHandler.js     # Global error handling
│   ├── models/
│   │   └── Task.js             # Mongoose schema
│   ├── routes/
│   │   └── tasks.js            # CRUD endpoints
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express entry point
│
└── frontend/                   # React + TypeScript + Vite
    ├── src/
    │   ├── components/
    │   │   ├── FilterBar.tsx   # Search, filter, sort controls
    │   │   ├── StatsSidebar.tsx# Progress & stats panel
    │   │   ├── TaskCard.tsx    # Individual task card
    │   │   ├── TaskForm.tsx    # Create / edit modal
    │   │   └── ToastContainer.tsx
    │   ├── services/
    │   │   └── api.ts          # API calls (or localStorage mock)
    │   ├── types/
    │   │   └── index.ts        # TypeScript types
    │   ├── App.tsx             # Root component & state
    │   ├── index.css           # Tailwind + fonts
    │   └── main.tsx            # React entry point
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts          # Dev proxy → backend
```

---

## Prerequisites

Before you begin, make sure you have:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | comes with Node |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community OR use Atlas (free cloud) |
| Git | any | https://git-scm.com |

---

## Setup & Run Locally

### Step 1 — Clone the repo

```bash
git clone <your-repo-url>
cd mern-task-tracker
```

### Step 2 — Set up the backend

```bash
cd backend
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set your MongoDB URI:

```env
# Option A: Local MongoDB (must be running)
MONGODB_URI=mongodb://localhost:27017/task-tracker

# Option B: MongoDB Atlas (free cloud cluster)
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/task-tracker

PORT=5000
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
# Development (auto-restarts on file change)
npm run dev

# OR production
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on http://localhost:5000
```

Verify it works:
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}

curl http://localhost:5000/api/tasks
# → {"tasks":[],"total":0,"page":1,"pages":0}
```

### Step 3 — Set up the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
```

The `vite.config.ts` already proxies `/api` to `http://localhost:5000`, so no extra config is needed.

Start the dev server:

```bash
npm run dev
```

Open http://localhost:5173 in your browser. 🎉

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | List all tasks (supports filters) |
| `GET` | `/tasks/:id` | Get a single task |
| `POST` | `/tasks` | Create a new task |
| `PUT` | `/tasks/:id` | Update a task |
| `DELETE` | `/tasks/:id` | Delete a task |
| `DELETE` | `/tasks?status=completed` | Bulk delete by status |

### Query params for GET /tasks

| Param | Values | Default |
|-------|--------|---------|
| `status` | `todo`, `in-progress`, `completed` | all |
| `priority` | `low`, `medium`, `high` | all |
| `search` | string (full-text) | — |
| `sortBy` | `createdAt`, `dueDate`, `priority`, `title` | `createdAt` |
| `order` | `asc`, `desc` | `desc` |
| `page` | number | `1` |
| `limit` | number (max 100) | `50` |

### Task schema

```json
{
  "_id": "string (MongoDB ObjectId)",
  "title": "string (3–100 chars, required)",
  "description": "string (0–500 chars)",
  "status": "todo | in-progress | completed",
  "priority": "low | medium | high",
  "dueDate": "YYYY-MM-DD | null",
  "tags": ["string", "..."],  // max 5
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### Example requests

```bash
# Create a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Deploy to production","priority":"high","status":"todo"}'

# Update a task
curl -X PUT http://localhost:5000/api/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'

# Delete a task
curl -X DELETE http://localhost:5000/api/tasks/<id>

# Filter by status
curl "http://localhost:5000/api/tasks?status=in-progress&sortBy=priority&order=desc"
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express 4, express-validator |
| Database | MongoDB 6, Mongoose 8 |
| Fonts | Syne (headings), DM Sans (body), JetBrains Mono (meta) |

---

## Bonus Features Implemented

- **Filtering** by status, priority, and full-text search
- **Sorting** by created date, due date, priority, and title (asc/desc)
- **Toast notifications** for all CRUD operations
- **Tag system** — add up to 5 tags per task, searchable
- **Overdue detection** — tasks past due date are highlighted in red
- **Progress sidebar** — live completion percentage, attention alerts
- **Status toggle** — click the status icon on any card to advance it
- **Delete confirmation** — inline confirmation prevents accidental deletion
- **Grouped view** — tasks grouped by status (To Do / In Progress / Completed)
- **Environment variables** — `.env` on backend, `import.meta.env` on frontend
- **Pagination** — API supports `page` and `limit` params
- **Bulk delete** — `DELETE /api/tasks?status=completed` endpoint
