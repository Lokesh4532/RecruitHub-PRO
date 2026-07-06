import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Job from '@/models/Job';
import Student from '@/models/Student';
import User from '@/models/User';
import Application from '@/models/Application';

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

    // Get all jobs for this recruiter
    const jobs = await Job.find({ recruiter_id: decoded.userId });
    
    // Get all students
    const students = await Student.find().populate('user_id');

    // Get all applications for this recruiter's jobs
    const jobIds = jobs.map(j => j._id);
    const applications = await Application.find({ job_id: { $in: jobIds } }).populate('student_id');

    // APPLICATION FUNNEL METRICS
    const totalApplications = applications.length;
    const appliedCount = applications.filter(a => a.status === 'applied').length;
    const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
    const acceptedCount = applications.filter(a => a.status === 'accepted').length;
    const rejectedCount = applications.filter(a => a.status === 'rejected').length;

    const funnelData = [
      { stage: 'Total Applications', count: totalApplications, percentage: 100 },
      { stage: 'Pending Review', count: appliedCount, percentage: totalApplications > 0 ? Math.round((appliedCount / totalApplications) * 100) : 0 },
      { stage: 'Shortlisted', count: shortlistedCount, percentage: totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0 },
      { stage: 'Accepted', count: acceptedCount, percentage: totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0 },
    ];

    // TIME-BASED TRENDS (Last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = applications.filter(a => new Date(a.applied_at) >= thirtyDaysAgo);
    
    // Group applications by date
    const applicationsByDate = {};
    recentApplications.forEach(app => {
      const date = new Date(app.applied_at).toISOString().split('T')[0];
      applicationsByDate[date] = (applicationsByDate[date] || 0) + 1;
    });

    const timeSeriesData = Object.entries(applicationsByDate)
      .map(([date, count]) => ({ date, applications: count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // TOP PERFORMING JOBS
    const jobPerformance = jobs.map(job => ({
      title: job.title,
      applications: applications.filter(a => a.job_id.toString() === job._id.toString()).length,
      shortlisted: applications.filter(a => a.job_id.toString() === job._id.toString() && a.status === 'shortlisted').length,
      location: job.location,
      created_at: job.created_at
    })).sort((a, b) => b.applications - a.applications).slice(0, 5);

    // Calculate skill demand (from jobs)
    const skillDemand = {};
    jobs.forEach(job => {
      job.required_skills.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    });

    // Calculate skill supply (from students)
    const skillSupply = {};
    students.forEach(student => {
      const skills = student.resume_parsed_data?.skills || [];
      skills.forEach(skill => {
        skillSupply[skill] = (skillSupply[skill] || 0) + 1;
      });
    });

    // FIX: Show ALL skills (not just gaps) by using Set to combine both
    const allSkills = new Set([
      ...Object.keys(skillDemand),
      ...Object.keys(skillSupply)
    ]);

    const skillGaps = [];
    allSkills.forEach(skill => {
      const demand = skillDemand[skill] || 0;
      const supply = skillSupply[skill] || 0;
      const gap = demand - supply;
      const gap_percentage = demand > 0 ? Math.round((gap / demand) * 100) : 0;

      skillGaps.push({
        skill,
        demand,
        supply,
        gap,
        gap_percentage
      });
    });

    // Sort by gap (highest first)
    skillGaps.sort((a, b) => b.gap - a.gap);

    // Calculate diversity metrics
    const universities = {};
    const degrees = {};
    let totalGPA = 0;
    let gpaCount = 0;

    students.forEach(student => {
      const edu = student.resume_parsed_data?.education;
      if (edu?.university) {
        universities[edu.university] = (universities[edu.university] || 0) + 1;
      }
      if (edu?.degree) {
        degrees[edu.degree] = (degrees[edu.degree] || 0) + 1;
      }
      if (edu?.gpa) {
        const gpa = parseFloat(edu.gpa);
        if (!isNaN(gpa)) {
          totalGPA += gpa;
          gpaCount++;
        }
      }
    });

    const universityDistribution = Object.entries(universities).map(([name, count]) => ({
      name,
      count
    }));

    const degreeDistribution = Object.entries(degrees).map(([name, count]) => ({
      name,
      count
    }));

    // EXPERIENCE LEVEL DISTRIBUTION
    const experienceLevels = {};
    jobs.forEach(job => {
      const level = job.experience_level || 'Not Specified';
      experienceLevels[level] = (experienceLevels[level] || 0) + 1;
    });

    const experienceDistribution = Object.entries(experienceLevels).map(([level, count]) => ({
      level,
      count
    }));

    // AVERAGE TIME TO APPLY
    let totalTimeToApply = 0;
    let timeCount = 0;
    applications.forEach(app => {
      const job = jobs.find(j => j._id.toString() === app.job_id.toString());
      if (job) {
        const daysDiff = Math.floor((new Date(app.applied_at) - new Date(job.created_at)) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0) {
          totalTimeToApply += daysDiff;
          timeCount++;
        }
      }
    });

    const averageTimeToApply = timeCount > 0 ? Math.round(totalTimeToApply / timeCount) : 0;

    return NextResponse.json({
      analytics: {
        // Basic Metrics
        total_jobs: jobs.length,
        active_jobs: jobs.filter(j => j.status === 'active').length,
        total_students: students.length,
        total_applications: totalApplications,
        average_applications_per_job: jobs.length > 0 
          ? Math.round(jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0) / jobs.length)
          : 0,
        
        // Application Funnel
        application_funnel: funnelData,
        conversion_rate: totalApplications > 0 ? Math.round((acceptedCount / totalApplications) * 100) : 0,
        shortlist_rate: totalApplications > 0 ? Math.round((shortlistedCount / totalApplications) * 100) : 0,
        rejection_rate: totalApplications > 0 ? Math.round((rejectedCount / totalApplications) * 100) : 0,
        
        // Time-based Data
        applications_over_time: timeSeriesData,
        average_time_to_apply: averageTimeToApply,
        
        // Job Performance
        top_jobs: jobPerformance,
        
        // Existing Metrics
        skill_gaps: skillGaps,
        university_distribution: universityDistribution,
        degree_distribution: degreeDistribution,
        experience_distribution: experienceDistribution,
        average_gpa: gpaCount > 0 ? (totalGPA / gpaCount).toFixed(2) : 'N/A'
      }
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
