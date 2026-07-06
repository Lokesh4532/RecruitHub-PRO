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
    const photo = formData.get('photo');

    if (!photo) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(photo.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, and WEBP are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (photo.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 });
    }

    const bytes = await photo.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'photos');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory already exists, ignore
    }

    // Create unique filename
    const timestamp = Date.now();
    const ext = photo.name.split('.').pop();
    const filename = `photo_${decoded.userId}_${timestamp}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    const photoUrl = `/uploads/photos/${filename}`;

    // Update student profile
    await connectDB();
    const student = await Student.findOneAndUpdate(
      { user_id: decoded.userId },
      { profile_photo_url: photoUrl },
      { new: true }
    );

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      photo_url: photoUrl,
      message: 'Profile photo uploaded successfully!'
    });

  } catch (error) {
    console.error('Error uploading photo:', error);
    return NextResponse.json({ 
      error: 'Failed to upload photo',
      details: error.message 
    }, { status: 500 });
  }
}
