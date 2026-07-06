import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Job from '@/models/Job';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    if (decoded.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const student = await Student.findOne({ user_id: decoded.userId });
    
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Get all jobs
    const jobs = await Job.find();

    // Calculate match score for each job
    const studentSkills = student.resume_parsed_data?.skills || [];
    
    const jobsWithScores = jobs.map(job => {
      const requiredSkills = job.required_skills || [];
      
      const matchedSkills = requiredSkills.filter(skill =>
        studentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
      );
      
      const match_score = requiredSkills.length > 0
        ? (matchedSkills.length / requiredSkills.length) * 100
        : 0;

      return {
        _id: job._id,
        title: job.title,
        description: job.description,
        location: job.location,
        salary_range: job.salary_range,
        experience_level: job.experience_level,
        required_skills: job.required_skills,
        applications_count: job.applications_count,
        created_at: job.createdAt,
        match_score
      };
    });

    // Sort by match score
    jobsWithScores.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({ jobs: jobsWithScores });

  } catch (error) {
    console.error('Recommended jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
