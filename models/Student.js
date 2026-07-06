import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phone: String,
  linkedin_url: String,
  profile_photo_url: String,
  id_card_url: String,
  current_year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'],
    default: null
  },
  achievements: [{
    title: String,
    description: String,
    date: String
  }],
  resume_url: String,
  resume_parsed_data: {
    skills: [String],
    education: {
      degree: String,
      major: String,
      university: String,
      graduation_year: String,
      gpa: String
    },
    experience: [{
      company: String,
      role: String,
      duration: String
    }],
    certifications: [String]
  },
  github_data: {
    username: String,
    repos_count: Number,
    followers: Number,
    top_languages: [String],
    profile_url: String
  },
  cultural_fitness: {
    work_environment: String,
    work_style: String,
    motivation: String,
    company_size: String,
    career_goals: String,
    learning_preference: String,
    work_life_balance: String,
    feedback_preference: String,
    risk_tolerance: String,
    collaboration_style: String
  },
  gamified_assessment: {
    scores: {
      pragmatism: Number,
      teamwork: Number,
      innovation: Number,
      leadership: Number
    },
    persona: String
  },
  retention_score: Number,
  recommendations: [{
    recommender_name: {
      type: String,
      required: true
    },
    recommender_email: {
      type: String,
      required: true
    },
    recommender_role: {
      type: String,
      enum: ['Professor', 'Club Mentor', 'Project Guide', 'Teaching Assistant', 'Placement Officer', 'HOD', 'Dean', 'Industry Mentor', 'Senior Student', 'Other'],
      required: true
    },
    organization: String, // College/Company name
    relationship: String, // How they know the student
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    skills_rating: {
      technical: Number, // 1-5
      communication: Number, // 1-5
      teamwork: Number, // 1-5
      leadership: Number, // 1-5
      problem_solving: Number // 1-5
    },
    recommendation_text: {
      type: String,
      required: true
    },
    would_hire_again: {
      type: Boolean,
      default: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    verification_token: String,
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  profile_completion: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
