import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { culturalFitness } = await request.json();

    if (!culturalFitness) {
      return NextResponse.json(
        { error: 'Cultural fitness data required' },
        { status: 400 }
      );
    }

    // Initialize Gemini model (use gemini-1.5-pro instead of flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create comprehensive prompt for retention analysis
    const prompt = `You are an expert HR analyst specializing in employee retention prediction. Analyze the following cultural fitness assessment answers from a candidate and predict their retention probability.

**CANDIDATE CULTURAL FITNESS PROFILE:**

**Team Dynamics:**
- Team Preference: ${culturalFitness.team_preference || 'Not answered'}
- Conflict Handling: ${culturalFitness.conflict_handling || 'Not answered'}
- Collaboration Style: ${culturalFitness.collaboration_style || 'Not answered'}
- Team Contribution: ${culturalFitness.team_contribution || 'Not answered'}
- Group Role: ${culturalFitness.group_role || 'Not answered'}

**Work Style:**
- Work-Life Balance: ${culturalFitness.work_life_balance || 'Not answered'}
- Work Environment: ${culturalFitness.work_environment || 'Not answered'}
- Deadline Management: ${culturalFitness.deadline_management || 'Not answered'}
- Remote Preference: ${culturalFitness.remote_preference || 'Not answered'}
- Schedule Flexibility: ${culturalFitness.schedule_flexibility || 'Not answered'}

**Learning & Growth:**
- Learning Preference: ${culturalFitness.learning_preference || 'Not answered'}
- Upskill Method: ${culturalFitness.upskill_method || 'Not answered'}
- Feedback Preference: ${culturalFitness.feedback_preference || 'Not answered'}
- Challenge Approach: ${culturalFitness.challenge_approach || 'Not answered'}
- Mentorship Preference: ${culturalFitness.mentorship_preference || 'Not answered'}

**Career Goals:**
- Career Focus: ${culturalFitness.career_focus || 'Not answered'}
- Five Year Vision: ${culturalFitness.five_year_vision || 'Not answered'}
- Leadership Interest: ${culturalFitness.leadership_interest || 'Not answered'}
- Specialist vs Generalist: ${culturalFitness.specialist_generalist || 'Not answered'}
- Company Size Preference: ${culturalFitness.company_size_preference || 'Not answered'}

**Communication:**
- Communication Style: ${culturalFitness.communication_style || 'Not answered'}
- Meeting Preference: ${culturalFitness.meeting_preference || 'Not answered'}
- Written vs Verbal: ${culturalFitness.written_verbal || 'Not answered'}
- Presentation Comfort: ${culturalFitness.presentation_comfort || 'Not answered'}
- Update Frequency: ${culturalFitness.update_frequency || 'Not answered'}

**ANALYSIS TASK:**
Based on HR research and employee retention patterns, analyze this profile and provide:

1. **Retention Score (0-100)**: A numerical score where:
   - 85-100 = Excellent retention potential (highly aligned, stable, growth-oriented)
   - 70-84 = Good retention potential (aligned with some minor concerns)
   - 55-69 = Moderate retention risk (mixed signals, needs right environment)
   - 40-54 = Higher retention risk (misaligned expectations or red flags)
   - 0-39 = High retention risk (significant concerns)

2. **Key Strengths**: 2-3 positive retention indicators
3. **Potential Concerns**: 1-2 areas that might affect retention
4. **Overall Assessment**: Brief summary (2-3 sentences)

**IMPORTANT RETENTION FACTORS TO CONSIDER:**
- Team collaboration ability (lonely workers have higher turnover)
- Work-life balance expectations (unrealistic expectations lead to burnout)
- Growth mindset (continuous learners stay longer)
- Career clarity (vague goals indicate lack of commitment)
- Communication skills (poor communicators struggle in teams)
- Adaptability (rigid workers leave when things change)
- Feedback receptiveness (defensive people don't grow)
- Leadership aspirations aligned with timeline (impatient people leave)

**RESPOND IN THIS EXACT JSON FORMAT:**
{
  "retention_score": <number between 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "assessment": "Brief overall assessment in 2-3 sentences",
  "confidence": "high|medium|low"
}

Only respond with valid JSON, no additional text.`;

    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON response
    let aiAnalysis;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      aiAnalysis = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback: extract score using regex if JSON parsing fails
      const scoreMatch = text.match(/"retention_score":\s*(\d+)/);
      if (scoreMatch) {
        aiAnalysis = {
          retention_score: parseInt(scoreMatch[1]),
          strengths: ['Analysis available in detailed view'],
          concerns: [],
          assessment: 'AI analysis completed successfully',
          confidence: 'medium'
        };
      } else {
        throw new Error('Could not parse AI response');
      }
    }

    // Validate retention score
    const retentionScore = Math.max(0, Math.min(100, aiAnalysis.retention_score));

    return NextResponse.json({
      success: true,
      retention_score: retentionScore,
      strengths: aiAnalysis.strengths || [],
      concerns: aiAnalysis.concerns || [],
      assessment: aiAnalysis.assessment || 'AI analysis completed',
      confidence: aiAnalysis.confidence || 'medium',
      ai_powered: true
    });

  } catch (error) {
    console.error('AI Retention Calculation Error:', error);
    
    // Fallback to basic calculation if AI fails
    const { culturalFitness } = await request.json();
    const fallbackScore = calculateFallbackRetention(culturalFitness);
    
    return NextResponse.json({
      success: true,
      retention_score: fallbackScore,
      strengths: ['Cultural fit assessment completed'],
      concerns: [],
      assessment: 'Basic retention analysis (AI unavailable)',
      confidence: 'low',
      ai_powered: false,
      fallback: true
    });
  }
}

// Fallback calculation if AI is unavailable
function calculateFallbackRetention(culturalFitness) {
  if (!culturalFitness) return 50;
  
  let score = 50; // Base score
  
  // Team dynamics (20 points)
  if (culturalFitness.collaboration_style?.includes('Contribute equally')) score += 5;
  if (culturalFitness.conflict_handling?.includes('Address directly')) score += 5;
  if (culturalFitness.team_preference?.includes('collaborative')) score += 5;
  if (culturalFitness.group_role?.includes('Leader') || culturalFitness.group_role?.includes('problem-solver')) score += 5;
  
  // Work style (20 points)
  if (culturalFitness.work_life_balance?.includes('Important')) score += 5;
  if (culturalFitness.work_environment) score += 5;
  if (culturalFitness.deadline_management?.includes('Plan') || culturalFitness.deadline_management?.includes('Prioritize')) score += 5;
  if (culturalFitness.schedule_flexibility) score += 5;
  
  // Learning & growth (20 points)
  if (culturalFitness.learning_preference) score += 5;
  if (culturalFitness.feedback_preference?.includes('Regular') || culturalFitness.feedback_preference?.includes('Continuous')) score += 5;
  if (culturalFitness.challenge_approach?.includes('opportunity') || culturalFitness.challenge_approach?.includes('Learn')) score += 5;
  if (culturalFitness.mentorship_preference) score += 5;
  
  // Career goals (10 points)
  if (culturalFitness.five_year_vision) score += 5;
  if (culturalFitness.leadership_interest) score += 5;
  
  return Math.min(score, 100);
}
