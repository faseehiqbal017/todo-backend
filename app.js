import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/auth.js'
import taskRoutes from './routes/tasks.js'

const { MONGO_URI, JWT_SECRET, CLIENT_URL = 'http://localhost:5173' } = process.env

const app = express()
app.use(cors({ origin: CLIENT_URL }))
app.use(express.json())

// Connect to MongoDB once and reuse the connection (needed on Vercel, where the
// server starts fresh on demand). Locally this does the same job as before.
let dbPromise
export function connectDB() {
  if (!dbPromise) {
    dbPromise = mongoose.connect(MONGO_URI).catch((err) => {
      dbPromise = null
      throw err
    })
  }
  return dbPromise
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.use(async (_req, res, next) => {
  if (!MONGO_URI || !JWT_SECRET)
    return res.status(500).json({ message: 'Server is missing MONGO_URI or JWT_SECRET' })
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    res.status(500).json({ message: 'Database connection error' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

export default app
