import mongoose from 'mongoose';

const ShortlistSchema = new mongoose.Schema({
  recruiter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['shortlisted', 'interviewed', 'offered', 'rejected', 'accepted'],
    default: 'shortlisted'
  },
  interview_date: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to prevent duplicate shortlists
ShortlistSchema.index({ recruiter_id: 1, student_id: 1, job_id: 1 }, { unique: true });

export default mongoose.models.Shortlist || mongoose.model('Shortlist', ShortlistSchema);
