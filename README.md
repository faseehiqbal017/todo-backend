# To-Do List – Backend (Express + MongoDB)

REST API with JWT authentication and a per-user to-do list.

## Run locally
1. Install and start MongoDB (or use a MongoDB Atlas connection string).
2. `npm install`
3. Copy `.env.example` to `.env` and fill in the values.
4. `npm run dev` (http://localhost:5000)

## API
- `POST /api/auth/register` body: name, email, password
- `POST /api/auth/login` body: email, password
- `GET /api/auth/me` (token required)
- `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id` (token required; each user only sees their own tasks)

Send the token as `Authorization: Bearer <token>`.

## Deploy on Vercel
Set these environment variables in the Vercel project: `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `CLIENT_URL` (frontend address, no trailing slash).
