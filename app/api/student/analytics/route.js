import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Application from '@/models/Application';
import Job from '@/models/Job';

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

    // Get student profile
    const student = await Student.findOne({ user_id: decoded.userId }).populate('user_id');
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Get all applications for this student
    const applications = await Application.find({ student_id: student._id }).populate('job_id');

    // PROFILE STRENGTH CALCULATION
    let profileStrength = 0;
    const checklist = [];

    // Basic Info (10%)
    if (student.user_id?.email) {
      profileStrength += 10;
      checklist.push({ name: 'Email Verified', description: 'Your email is confirmed', completed: true, points: 10 });
    } else {
      checklist.push({ name: 'Email Verified', description: 'Verify your email address', completed: false, points: 10 });
    }

    // Resume (20%)
    if (student.resume) {
      profileStrength += 20;
      checklist.push({ name: 'Resume Uploaded', description: 'Resume is uploaded', completed: true, points: 20 });
    } else {
      checklist.push({ name: 'Resume Uploaded', description: 'Upload your resume', completed: false, points: 20 });
    }

    // Education (15%)
    if (student.resume_parsed_data?.education?.university) {
      profileStrength += 15;
      checklist.push({ name: 'Education Added', description: 'University details complete', completed: true, points: 15 });
    } else {
      checklist.push({ name: 'Education Added', description: 'Add your education details', completed: false, points: 15 });
    }

    // Skills (25%)
    const skills = student.resume_parsed_data?.skills || [];
    if (skills.length >= 5) {
      profileStrength += 25;
      checklist.push({ name: 'Skills Listed', description: `${skills.length} skills added`, completed: true, points: 25 });
    } else {
      checklist.push({ name: 'Skills Listed', description: 'Add at least 5 skills', completed: false, points: 25 });
    }

    // GitHub (10%)
    if (student.github_url) {
      profileStrength += 10;
      checklist.push({ name: 'GitHub Connected', description: 'GitHub profile linked', completed: true, points: 10 });
    } else {
      checklist.push({ name: 'GitHub Connected', description: 'Connect your GitHub account', completed: false, points: 10 });
    }

    // LinkedIn (10%)
    if (student.linkedin_url) {
      profileStrength += 10;
      checklist.push({ name: 'LinkedIn Connected', description: 'LinkedIn profile linked', completed: true, points: 10 });
    } else {
      checklist.push({ name: 'LinkedIn Connected', description: 'Connect your LinkedIn', completed: false, points: 10 });
    }

    // Cultural Test (10%)
    if (student.cultural_fit_score) {
      profileStrength += 10;
      checklist.push({ name: 'Cultural Test Done', description: 'Cultural fit assessment complete', completed: true, points: 10 });
    } else {
      checklist.push({ name: 'Cultural Test Done', description: 'Take the cultural fit test', completed: false, points: 10 });
    }

    // APPLICATION METRICS
    const totalApplications = applications.length;
    const statusCounts = {
      applied: applications.filter(a => a.status === 'applied').length,
      shortlisted: applications.filter(a => a.status === 'shortlisted').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    const statusBreakdown = [
      { name: 'Pending', value: statusCounts.applied },
      { name: 'Shortlisted', value: statusCounts.shortlisted },
      { name: 'Accepted', value: statusCounts.accepted },
      { name: 'Rejected', value: statusCounts.rejected },
    ].filter(s => s.value > 0);

    const responseRate = totalApplications > 0 
      ? Math.round(((statusCounts.shortlisted + statusCounts.accepted + statusCounts.rejected) / totalApplications) * 100)
      : 0;

    // AVERAGE MATCH SCORE
    let totalMatchScore = 0;
    let matchCount = 0;
    applications.forEach(app => {
      if (app.match_score) {
        totalMatchScore += app.match_score;
        matchCount++;
      }
    });
    const averageMatchScore = matchCount > 0 ? Math.round(totalMatchScore / matchCount) : 0;

    // SKILL ANALYSIS
    const allJobs = await Job.find({ status: 'active' });
    const marketSkills = {};
    
    allJobs.forEach(job => {
      job.required_skills.forEach(skill => {
        marketSkills[skill] = (marketSkills[skill] || 0) + 1;
      });
    });

    // Top 6 market skills
    const topMarketSkills = Object.entries(marketSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const skillMatch = topMarketSkills.map(([skill, demand]) => ({
      skill: skill.charAt(0).toUpperCase() + skill.slice(1),
      you: skills.includes(skill.toLowerCase()) ? 100 : 0,
      market: Math.min(demand * 10, 100)
    }));

    // RECOMMENDATIONS
    const recommendations = [];

    if (!student.resume) {
      recommendations.push({
        icon: '',
        title: 'Upload Your Resume',
        description: 'A complete resume increases your profile visibility by 3x',
        action_text: 'Upload Now',
        action_link: '/student/profile'
      });
    }

    if (skills.length < 5) {
      recommendations.push({
        icon: '',
        title: 'Add More Skills',
        description: 'List at least 5 skills to improve job matching',
        action_text: 'Update Skills',
        action_link: '/student/profile'
      });
    }

    if (!student.cultural_fit_score) {
      recommendations.push({
        icon: '',
        title: 'Take Cultural Fit Test',
        description: 'Companies value cultural fit. Complete the assessment to stand out',
        action_text: 'Take Test',
        action_link: '/student/cultural-test'
      });
    }

    if (totalApplications < 3) {
      recommendations.push({
        icon: '',
        title: 'Apply to More Jobs',
        description: 'Increase your chances by applying to at least 5-10 jobs',
        action_text: 'Browse Jobs',
        action_link: '/student/jobs'
      });
    }

    if (!student.github_url) {
      recommendations.push({
        icon: '',
        title: 'Connect GitHub',
        description: 'Showcase your projects and code to recruiters',
        action_text: 'Connect',
        action_link: '/student/profile'
      });
    }

    return NextResponse.json({
      success: true,
      analytics: {
        profile_strength: profileStrength,
        total_applications: totalApplications,
        response_rate: responseRate,
        average_match_score: averageMatchScore,
        status_breakdown: statusBreakdown,
        skill_match: skillMatch,
        profile_checklist: checklist,
        recommendations: recommendations.slice(0, 3) // Top 3 recommendations
      }
    });

  } catch (error) {
    console.error('Student Analytics Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
