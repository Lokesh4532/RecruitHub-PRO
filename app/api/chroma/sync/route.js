import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { syncAllCandidatesToChroma, getChromaStats } from '@/lib/chromadb';

/**
 * Sync all students to ChromaDB
 * POST /api/chroma/sync
 */
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET);
    
    // Only recruiters can sync
    if (decoded.role !== 'recruiter') {
      return NextResponse.json({ error: 'Unauthorized - Recruiter only' }, { status: 403 });
    }

    await connectDB();

    // Get all students with populated user data
    const students = await Student.find().populate('user_id');
    
    console.log(` Starting ChromaDB sync for ${students.length} candidates...`);

    // Sync to ChromaDB
    const result = await syncAllCandidatesToChroma(students);

    if (result.success) {
      console.log(` Successfully synced ${result.count} candidates to ChromaDB`);
      
      // Get updated stats
      const stats = await getChromaStats();
      
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.count} candidates to ChromaDB`,
        synced_count: result.count,
        total_in_db: stats.total_candidates
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to sync candidates',
      }, { status: 500 });
    }
  } catch (error) {
    console.error(' ChromaDB Sync Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * Get ChromaDB statistics
 * GET /api/chroma/sync
 */
export async function GET(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    jwt.verify(token.value, process.env.JWT_SECRET);

    const stats = await getChromaStats();

    return NextResponse.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error getting ChromaDB stats:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
