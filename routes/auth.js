import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = Router()

const signToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email })

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' })
    if (!/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ message: 'Please enter a valid email' })
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email is already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, password: hashed })
    res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (err) {
    // 11000 = duplicate email (two sign-ups at the same time)
    if (err.code === 11000)
      return res.status(409).json({ message: 'Email is already registered' })
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' })

    res.json({ token: signToken(user), user: publicUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/auth/me  (protected)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user: publicUser(user) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
