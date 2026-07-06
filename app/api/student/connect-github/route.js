import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Octokit } from '@octokit/rest';
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

    const { github_username } = await request.json();

    if (!github_username) {
      return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
    }

    // Fetch GitHub data
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const { data: user } = await octokit.users.getByUsername({
      username: github_username
    });

    const { data: repos } = await octokit.repos.listForUser({
      username: github_username,
      sort: 'updated',
      per_page: 100
    });

    // Get top languages
    const languages = {};
    repos.forEach(repo => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    });

    const top_languages = Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    await connectDB();

    const student = await Student.findOne({ user_id: decoded.userId });
    
    if (!student) {
      return NextResponse.json({ error: 'Student profile not found' }, { status: 404 });
    }

    student.github_data = {
      username: github_username,
      repos_count: user.public_repos,
      followers: user.followers,
      top_languages,
      profile_url: user.html_url
    };
    
    student.profile_completion = Math.max(student.profile_completion, 90);
    
    await student.save();

    return NextResponse.json({
      message: 'GitHub connected successfully',
      github_data: student.github_data
    });

  } catch (error) {
    console.error('GitHub connect error:', error);
    return NextResponse.json(
      { error: 'Failed to connect GitHub. Check username and try again.' },
      { status: 500 }
    );
  }
}
