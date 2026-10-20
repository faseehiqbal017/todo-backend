import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    // Owner of the task. Every query filters by this, so users only see their own tasks.
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true },
)

export default mongoose.model('Task', taskSchema)
