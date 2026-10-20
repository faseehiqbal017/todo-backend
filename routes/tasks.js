import { Router } from 'express'
import mongoose from 'mongoose'
import Task from '../models/Task.js'
import auth from '../middleware/auth.js'

const router = Router()

// Every route below requires a valid token (authentication) ...
router.use(auth)

// ... and only ever touches tasks owned by that user (authorization).
const publicTask = (t) => ({
  id: t._id,
  title: t.title,
  completed: t.completed,
  createdAt: t.createdAt,
})

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id)
    ? next()
    : res.status(400).json({ message: 'Invalid task id' })

// READ  GET /api/tasks  -> all tasks of the logged-in user
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 })
    res.json({ tasks: tasks.map(publicTask) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// CREATE  POST /api/tasks  body: title
router.post('/', async (req, res) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
    if (!title) return res.status(400).json({ message: 'Task title is required' })
    if (title.length > 200)
      return res.status(400).json({ message: 'Task title must be 200 characters or less' })

    const task = await Task.create({ user: req.userId, title })
    res.status(201).json({ task: publicTask(task) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// UPDATE  PUT /api/tasks/:id  body: title and/or completed
router.put('/:id', validId, async (req, res) => {
  try {
    const update = {}
    if (req.body.title !== undefined) {
      const title = typeof req.body.title === 'string' ? req.body.title.trim() : ''
      if (!title) return res.status(400).json({ message: 'Task title is required' })
      if (title.length > 200)
        return res.status(400).json({ message: 'Task title must be 200 characters or less' })
      update.title = title
    }
    if (req.body.completed !== undefined) {
      if (typeof req.body.completed !== 'boolean')
        return res.status(400).json({ message: 'completed must be true or false' })
      update.completed = req.body.completed
    }

    // Filtering by { _id, user } means someone else's task is simply "not found"
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      update,
      { new: true, runValidators: true },
    )
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ task: publicTask(task) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE  DELETE /api/tasks/:id
router.delete('/:id', validId, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
