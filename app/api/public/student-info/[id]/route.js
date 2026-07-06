import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(request, { params }) {
  try {
    await connectDB();

    const studentId = params.id;
    const student = await Student.findById(studentId).populate('user_id').select('user_id');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      name: student.user_id?.name || 'Student',
      id: student._id
    });

  } catch (error) {
    console.error(' Error fetching student info:', error);
    return NextResponse.json({ error: 'Failed to fetch student info' }, { status: 500 });
  }
}
