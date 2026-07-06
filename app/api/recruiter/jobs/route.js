import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    if (decoded.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const jobs = await Job.find({ recruiter_id: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ jobs });

  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    if (decoded.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, location, salary_range, experience_level, required_skills } = await request.json();

    if (!title || !description || !required_skills) {
      return NextResponse.json(
        { error: 'Title, description, and required skills are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const job = new Job({
      recruiter_id: decoded.userId,
      title,
      description,
      location,
      salary_range,
      experience_level,
      required_skills
    });

    await job.save();

    return NextResponse.json(
      { message: 'Job posted successfully', job },
      { status: 201 }
    );

  } catch (error) {
    console.error('Post job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
