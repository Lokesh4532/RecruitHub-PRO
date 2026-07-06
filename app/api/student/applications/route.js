import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Student from '@/models/Student';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request) {
  try {
    await dbConnect();

    // Get token from cookies
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if user is a student
    if (decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Students only.' },
        { status: 403 }
      );
    }

    // Find the student profile
    const student = await Student.findOne({ user_id: decoded.userId });
    
    if (!student) {
      console.log('Student not found for user_id:', decoded.userId);
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    console.log('Fetching applications for student_id:', student._id);

    // Fetch all applications for this student using student._id
    const applications = await Application.find({ student_id: student._id })
      .populate('job_id')
      .sort({ applied_at: -1 }); // Most recent first

    console.log('Found applications:', applications.length);

    return NextResponse.json({ 
      success: true,
      applications 
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    );
  }
}
