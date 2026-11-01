# SpendWise – Expense Tracker (MERN)

A full-stack web app that helps people record daily expenses, filter them by category, and see where their money goes.

**Live app:** `PASTE_CLIENT_VERCEL_LINK`
**API:** `PASTE_SERVER_VERCEL_LINK`
**GitHub:** `PASTE_GITHUB_REPO_LINK`

## Problem statement
Many students and families lose track of small daily spending. SpendWise gives a simple place to log each expense, edit mistakes, delete entries, and view totals per category.

## Features
- Add, view, edit and delete expenses (full CRUD)
- Filter by category and see the running total
- Spending-by-category bar summary
- Responsive layout for phones, tablets and desktops
- Server-side validation with clear error messages

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript, ReactJS (Vite) |
| Backend | NodeJS, ExpressJS |
| Database | MongoDB Atlas with Mongoose |
| Hosting | Vercel (client and server) |

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/expenses` | List expenses (optional `?category=Food`) |
| POST | `/api/expenses` | Create an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

Expense fields: `title` (required), `amount` (required, > 0), `category`, `date`, `note`.

## Run locally
```bash
# 1. Server
cd server
cp .env.example .env      # then put your MongoDB Atlas string in MONGO_URI
npm install
npm run dev               # http://localhost:5000

# 2. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

## Deploy on Vercel
Create two Vercel projects from the same GitHub repo:
1. **Server:** Root Directory `server`; add env var `MONGO_URI`.
2. **Client:** Root Directory `client` (Framework: Vite); add env var `VITE_API_URL` = the server's Vercel URL (no trailing slash).

## Folder structure
```
spendwise/
├── client/   React app (Vite)
└── server/   Express API + Mongoose model
```
