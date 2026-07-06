import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    const formData = await request.formData();
    const idcard = formData.get('idcard');

    if (!idcard) {
      return NextResponse.json({ error: 'No ID card provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(idcard.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (idcard.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    const bytes = await idcard.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'idcards');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
    }

    // Create unique filename
    const timestamp = Date.now();
    const ext = idcard.name.split('.').pop();
    const filename = `idcard_${decoded.userId}_${timestamp}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    const idCardUrl = `/uploads/idcards/${filename}`;

    // Update student profile
    await connectDB();
    const student = await Student.findOneAndUpdate(
      { user_id: decoded.userId },
      { id_card_url: idCardUrl },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      id_card_url: idCardUrl,
      message: 'Student ID card uploaded successfully!'
    });

  } catch (error) {
    console.error('Error uploading ID card:', error);
    return NextResponse.json({ 
      error: 'Failed to upload ID card',
      details: error.message 
    }, { status: 500 });
  }
}
