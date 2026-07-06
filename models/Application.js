import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'applied', 'shortlisted', 'accepted', 'rejected'],
    default: 'applied',
  },
  applied_at: {
    type: Date,
    default: Date.now,
  },
  match_score: {
    type: Number,
    min: 0,
    max: 100,
  },
  cover_letter: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create compound index to prevent duplicate applications
ApplicationSchema.index({ student_id: 1, job_id: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
