import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Shortlist from '@/models/Shortlist';

// GET - Fetch shortlisted candidates
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

    const shortlist = await Shortlist.find({ recruiter_id: decoded.userId })
      .populate({
        path: 'student_id',
        populate: {
          path: 'user_id',
          select: 'name email'
        }
      })
      .populate('job_id')
      .sort({ created_at: -1 });

    return NextResponse.json({ shortlist });

  } catch (error) {
    console.error('Shortlist GET Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add candidate to shortlist
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

    const { student_id, job_id, notes } = await request.json();

    if (!student_id || !job_id) {
      return NextResponse.json(
        { error: 'Student ID and Job ID are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if already shortlisted
    const existing = await Shortlist.findOne({
      recruiter_id: decoded.userId,
      student_id,
      job_id
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Candidate already shortlisted for this job' },
        { status: 400 }
      );
    }

    const shortlistEntry = new Shortlist({
      recruiter_id: decoded.userId,
      student_id,
      job_id,
      notes,
      status: 'shortlisted',
      created_at: new Date()
    });

    await shortlistEntry.save();

    return NextResponse.json({
      message: 'Candidate shortlisted successfully',
      shortlist: shortlistEntry
    });

  } catch (error) {
    console.error('Shortlist POST Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove from shortlist
export async function DELETE(request) {
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

    const { searchParams } = new URL(request.url);
    const shortlistId = searchParams.get('id');

    if (!shortlistId) {
      return NextResponse.json(
        { error: 'Shortlist ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await Shortlist.findOneAndDelete({
      _id: shortlistId,
      recruiter_id: decoded.userId
    });

    if (!deleted) {
      return NextResponse.json(
        { error: 'Shortlist entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Removed from shortlist successfully'
    });

  } catch (error) {
    console.error('Shortlist DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
