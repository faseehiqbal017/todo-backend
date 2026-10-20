// Local development entry point: `npm run dev`
import app, { connectDB } from './app.js'

const { PORT = 5000, MONGO_URI, JWT_SECRET } = process.env

if (!MONGO_URI || !JWT_SECRET) {
  console.error('Missing MONGO_URI or JWT_SECRET in backend/.env')
  process.exit(1)
}

connectDB()
  .then(() => {
    console.log('MongoDB connected')
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })
