import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { message, role, context } = await request.json();

    // Simple AI responses based on role and keywords
    let response = '';

    // Student responses
    if (role === 'student') {
      if (message.toLowerCase().includes('resume')) {
        response = `To improve your resume:
1. Keep it to 1-2 pages
2. Use action verbs (achieved, developed, led)
3. Quantify your achievements (increased by 30%, managed team of 5)
4. Highlight relevant skills and projects
5. Include your GitHub profile and portfolio
6. Proofread for errors!`;
      } else if (message.toLowerCase().includes('job') || message.toLowerCase().includes('match')) {
        response = `I can help you find jobs that match your skills! Go to the "Browse Jobs" section to see all available positions. Each job shows a match percentage based on your profile and skills.`;
      } else if (message.toLowerCase().includes('interview')) {
        response = `Interview preparation tips:
1. Research the company's values and culture
2. Practice common interview questions
3. Prepare STAR method examples (Situation, Task, Action, Result)
4. Ask thoughtful questions about the role
5. Dress professionally and arrive early
6. Follow up with a thank you email`;
      } else if (message.toLowerCase().includes('cultural') || message.toLowerCase().includes('test')) {
        response = `The Cultural Fit Test helps us understand your work style and values. Take it honestly - there are no right or wrong answers! It takes about 10-15 minutes and helps match you with the right teams.`;
      } else {
        response = `I'm here to help with:
• Resume tips and profile improvement
• Finding jobs that match your skills
• Interview preparation
• Understanding the cultural fit test
• Application status

What would you like to know more about?`;
      }
    }
    
    // Recruiter responses
    else if (role === 'recruiter') {
      if (message.toLowerCase().includes('candidate') || message.toLowerCase().includes('top')) {
        response = `To find top candidates:
1. Go to "Search Candidates" and select a job
2. Set filters for match score, retention score, or GPA
3. Review candidates sorted by best match
4. Check their skills, achievements, and cultural fit scores
5. Shortlist promising candidates for further review`;
      } else if (message.toLowerCase().includes('skill') || message.toLowerCase().includes('gap')) {
        response = `Check the Analytics Dashboard to see:
• Skill supply vs demand charts
• Critical skill shortages (>30% gap)
• Most demanded skills for your jobs
• Recommendations for hiring priorities

This helps you identify where to focus recruitment efforts.`;
      } else if (message.toLowerCase().includes('application')) {
        response = `View applications on your Jobs page. Each job shows:
• Total number of applications
• Average candidate match score
• Option to search qualified candidates
• Shortlisted candidates

Click "View Candidates" on any job to see applicants.`;
      } else if (message.toLowerCase().includes('analytics') || message.toLowerCase().includes('data')) {
        response = `Your Analytics Dashboard provides:
 Skill Supply vs Demand charts
 University distribution of candidates
 Degree distribution analysis
️ Critical skill shortage alerts
 AI-powered recruitment insights

This data helps make informed hiring decisions.`;
      } else {
        response = `I can assist you with:
• Finding and evaluating candidates
• Understanding skill gap analytics
• Managing job postings
• Reviewing applications and shortlists
• Interpreting recruitment data

How can I help you today?`;
      }
    }
    
    // Default response
    else {
      response = `Hello! I'm your AI recruitment assistant. I can help answer questions about jobs, candidates, applications, and more. What would you like to know?`;
    }

    return NextResponse.json({ response });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
