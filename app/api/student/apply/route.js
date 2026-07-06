import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Job from '@/models/Job';
import Application from '@/models/Application';

export async function POST(request) {
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

    const body = await request.json();
    const { job_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    await connectDB();

    // Find the student
    const student = await Student.findOne({ user_id: decoded.userId });
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Find the job
    const job = await Job.findById(job_id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      student_id: student._id,
      job_id: job_id
    });

    if (existingApplication) {
      return NextResponse.json({ error: 'You have already applied to this job' }, { status: 400 });
    }

    // Create application
    const application = new Application({
      student_id: student._id,
      job_id: job_id,
      status: 'applied'
    });

    await application.save();

    // Increment applications count on job
    await Job.findByIdAndUpdate(job_id, {
      $inc: { applications_count: 1 }
    });

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: {
        id: application._id,
        job_title: job.title,
        status: application.status,
        applied_at: application.applied_at
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Apply API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
