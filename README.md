# Lost & Found Item Portal (Full-Stack)

This repo contains:

- `client/` React (Vite) frontend
- `server/` Node.js (Express) backend + MongoDB

## Prerequisites

- Node.js 18+ (recommended)
- MongoDB running locally or a MongoDB Atlas connection string

## Backend (Express + MongoDB)

Run steps (exact):
```txt
cd server
npm install
npm run dev
```

1. `cd server`
2. `npm install`
3. Create an env file from the example:
   - Copy `server/.env.example` to `server/.env`
   - Set `MONGO_URI` and `JWT_SECRET`
4. Run:
   - `npm run dev`

Backend starts on `http://localhost:5000`

## Frontend (React + Vite)

Run steps (exact):
```txt
cd client
npm install
npm run dev
```

1. `cd client`
2. `npm install`
3. Run:
   - `npm run dev`

Frontend starts on `http://localhost:5173`

## Notes

- Auth uses an `httpOnly` cookie (`token`) for JWT (no localStorage token).
- Public listings show only `approved` items. New posts start as `pending` until an admin approves them.
- To create an admin user in development, set the user’s `role` to `admin` in the `users` collection.
- Image uploads:
  - If Cloudinary env vars are set, uploads go to Cloudinary.
  - Otherwise files are stored locally under `server/src/uploads` and served at `/uploads/...`.
