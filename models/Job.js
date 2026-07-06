import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  recruiter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: String,
  salary_range: String,
  experience_level: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Internship'],
    default: 'Entry Level'
  },
  required_skills: [String],
  applications_count: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.Job || mongoose.model('Job', jobSchema);
