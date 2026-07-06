import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';

export async function GET() {
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

    await connectDB();

    const student = await Student.findOne({ user_id: decoded.userId }).populate('user_id');
    
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    console.log(' GET Profile - Sending data:', {
      phone: student.phone,
      linkedin_url: student.linkedin_url,
      current_year: student.current_year,
      profile_photo_url: student.profile_photo_url,
      id_card_url: student.id_card_url,
      skills: student.resume_parsed_data?.skills?.length || 0,
      has_resume_data: !!student.resume_parsed_data,
      has_github_data: !!student.github_data
    });

    return NextResponse.json(student); // Return student directly, not wrapped

  } catch (error) {
    console.error('Get Profile API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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
    const { name, phone, linkedin_url, current_year, gpa, degree, university, graduation_year, major, skills, achievements } = body;

    console.log(' PUT Profile - Received data:', {
      name,
      phone,
      linkedin_url,
      current_year,
      gpa,
      degree,
      university,
      graduation_year,
      major,
      skills_count: skills?.length,
      achievements_count: achievements?.length
    });

    await connectDB();

    const student = await Student.findOne({ user_id: decoded.userId });
    
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    // Update user name if provided
    if (name !== undefined && name.trim()) {
      await User.findByIdAndUpdate(decoded.userId, { name: name.trim() });
      console.log(' User name updated to:', name.trim());
    }

    // Update basic fields
    if (phone !== undefined) student.phone = phone;
    if (linkedin_url !== undefined) student.linkedin_url = linkedin_url;
    if (current_year !== undefined) student.current_year = current_year;
    if (achievements !== undefined) student.achievements = achievements;

    console.log(' Updating student fields:', {
      phone: student.phone,
      linkedin_url: student.linkedin_url,
      current_year: student.current_year
    });

    // Update education fields
    if (!student.resume_parsed_data) {
      student.resume_parsed_data = { education: {}, skills: [] };
    }
    if (!student.resume_parsed_data.education) {
      student.resume_parsed_data.education = {};
    }

    if (gpa !== undefined) student.resume_parsed_data.education.gpa = gpa;
    if (degree !== undefined) student.resume_parsed_data.education.degree = degree;
    if (university !== undefined) student.resume_parsed_data.education.university = university;
    if (graduation_year !== undefined) student.resume_parsed_data.education.graduation_year = graduation_year;
    if (major !== undefined) student.resume_parsed_data.education.major = major;

    // Update skills
    if (skills !== undefined) student.resume_parsed_data.skills = skills;

    // Mark the nested object as modified
    student.markModified('resume_parsed_data');

    await student.save();

    console.log(' Profile saved successfully');

    return NextResponse.json({
      message: 'Profile updated successfully',
      student
    });

  } catch (error) {
    console.error('Update Profile API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
