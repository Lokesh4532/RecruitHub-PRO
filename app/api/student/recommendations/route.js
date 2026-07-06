import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    
    const {
      student_id,
      recommender_name,
      recommender_email,
      recommender_role,
      organization,
      relationship,
      rating,
      technical,
      communication,
      teamwork,
      leadership,
      problem_solving,
      recommendation_text,
      would_hire_again
    } = body;

    // Validation
    if (!student_id || !recommender_name || !recommender_email || !recommender_role || !recommendation_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const student = await Student.findById(student_id);

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate verification token
    const verification_token = crypto.randomBytes(32).toString('hex');

    // Create recommendation object
    const recommendation = {
      recommender_name,
      recommender_email,
      recommender_role,
      organization,
      relationship,
      rating: rating || 5,
      skills_rating: {
        technical: technical || 4,
        communication: communication || 4,
        teamwork: teamwork || 4,
        leadership: leadership || 4,
        problem_solving: problem_solving || 4
      },
      recommendation_text,
      would_hire_again: would_hire_again !== false,
      verified: false,
      verification_token,
      created_at: new Date()
    };

    // Add to student's recommendations
    student.recommendations.push(recommendation);
    await student.save();

    // Send verification email (optional - implement if needed)
    // sendVerificationEmail(recommender_email, verification_token);

    return NextResponse.json({
      success: true,
      message: 'Recommendation submitted successfully!',
      recommendation_id: student.recommendations[student.recommendations.length - 1]._id
    });

  } catch (error) {
    console.error(' Error adding recommendation:', error);
    return NextResponse.json({ error: 'Failed to submit recommendation' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const student_id = searchParams.get('student_id');

    if (!student_id) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    await connectDB();

    const student = await Student.findById(student_id).select('recommendations');

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Sort recommendations by date (newest first)
    const recommendations = student.recommendations.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
      verified_count: recommendations.filter(r => r.verified).length
    });

  } catch (error) {
    console.error(' Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}

// Verify recommendation
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token required' }, { status: 400 });
    }

    await connectDB();

    const student = await Student.findOne({
      'recommendations.verification_token': token
    });

    if (!student) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 404 });
    }

    // Find and verify the recommendation
    const recommendation = student.recommendations.find(r => r.verification_token === token);
    
    if (recommendation) {
      recommendation.verified = true;
      await student.save();

      return NextResponse.json({
        success: true,
        message: 'Recommendation verified successfully!'
      });
    }

    return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });

  } catch (error) {
    console.error(' Error verifying recommendation:', error);
    return NextResponse.json({ error: 'Failed to verify recommendation' }, { status: 500 });
  }
}
