import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

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

    const data = await request.json();

    await connectDB();

    const student = await Student.findOne({ user_id: decoded.userId });
    
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    student.gamified_assessment = {
      scores: data.scores,
      persona: data.persona
    };
    
    // Calculate retention_score directly from the gamified assessment
    const scores = data.scores || { pragmatism: 0, teamwork: 0, innovation: 0, leadership: 0 };
    const totalRaw = (scores.pragmatism || 0) +
                     (scores.innovation || 0) +
                     (scores.teamwork || 0) +
                     (scores.leadership || 0);

    // Basic heuristic: 50 + (totalRaw * 1.5), capped at 95
    const computedRetentionScore = Math.min(95, Math.max(50, 50 + (totalRaw * 1.5)));
    student.retention_score = Math.round(computedRetentionScore);

    student.profile_completion = Math.max(student.profile_completion || 0, 80);
    
    await student.save();

    return NextResponse.json({
      message: 'Gamified assessment completed successfully'
    });

  } catch (error) {
    console.error('Cultural test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
