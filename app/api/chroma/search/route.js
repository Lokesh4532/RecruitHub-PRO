import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Job from '@/models/Job';
import { searchCandidatesInChroma } from '@/lib/chromadb';
import Groq from 'groq-sdk';
import { calculateSemanticSkillMatch } from '@/lib/skillSemantics';

// Initialize Groq AI
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Semantic Search for Candidates using ChromaDB + AI Retention
 * GET /api/chroma/search
 */
export async function GET(request) {
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const job_id = searchParams.get('job_id');
    const query = searchParams.get('query') || '';
    const n_results = parseInt(searchParams.get('n_results') || '50');
    
    // Filters
    const min_gpa = searchParams.get('min_gpa');
    const max_gpa = searchParams.get('max_gpa');
    const graduation_year = searchParams.get('graduation_year');
    const university = searchParams.get('university');
    const degree = searchParams.get('degree');
    const min_github_repos = searchParams.get('min_github_repos');
    const location = searchParams.get('location');

    await connectDB();

    let jobDescription = '';
    let requiredSkills = [];

    // Get job details if job_id provided
    if (job_id) {
      const job = await Job.findById(job_id);
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      
      jobDescription = job.description || '';
      requiredSkills = job.required_skills || [];
    }

    // Build filters for ChromaDB
    const filters = {};
    if (min_gpa) filters.min_gpa = min_gpa;
    if (max_gpa) filters.max_gpa = max_gpa;
    if (graduation_year) filters.graduation_year = graduation_year;
    if (university) filters.university = university;
    if (degree) filters.degree = degree;
    if (min_github_repos) filters.min_github_repos = min_github_repos;
    if (location) filters.location = location;

    console.log(' Performing semantic search in ChromaDB...');
    console.log('Query:', query || jobDescription);
    console.log('Required Skills:', requiredSkills);

    // Perform semantic search in ChromaDB
    const chromaResults = await searchCandidatesInChroma({
      queryText: query,
      jobDescription,
      requiredSkills,
      nResults: n_results,
      filters
    });

    console.log(` Found ${chromaResults.ids.length} candidates via semantic search`);

    // Get full student data from MongoDB
    const studentIds = chromaResults.ids;
    
    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        candidates: [],
        message: 'No candidates found matching your criteria'
      });
    }

    const students = await Student.find({
      _id: { $in: studentIds }
    }).populate('user_id');

    // Create a map for quick lookup
    const studentMap = new Map();
    students.forEach(student => {
      studentMap.set(student._id.toString(), student);
    });

    // Calculate scores for each candidate
    const candidatesWithScores = await Promise.all(
      studentIds.map(async (studentId, index) => {
        const student = studentMap.get(studentId);
        
        if (!student) return null;

        //  SEMANTIC SKILL MATCHING - Understands related skills
        let skillMatchScore = 0;
        let matchedSkills = [];
        let unmatchedSkills = [];
        
        if (requiredSkills.length > 0) {
          const studentSkills = student.resume_parsed_data?.skills || [];
          const skillMatchResult = calculateSemanticSkillMatch(requiredSkills, studentSkills);
          skillMatchScore = skillMatchResult.score;
          matchedSkills = skillMatchResult.matchedSkills;
          unmatchedSkills = skillMatchResult.unmatchedSkills;
        }

        // Semantic similarity score from ChromaDB.
        // Collection uses L2 space: distance range is [0, 2] for normalized vectors.
        // 0 = identical, 2 = opposite → convert to 0-100%
        const semanticDistance = chromaResults.distances[index] ?? 2;
        const semanticScore = Math.round(Math.max(0, ((2 - semanticDistance) / 2) * 100));

        // Combined match score: 50% skills + 50% semantic similarity
        const combinedMatchScore = requiredSkills.length > 0
          ? (skillMatchScore * 0.5) + (semanticScore * 0.5)
          : semanticScore;

        // AI-Powered Retention Score
        const retentionResult = await calculateAIRetentionScore(student.cultural_fitness, student.gamified_assessment);

        // Extract education
        const education = student.resume_parsed_data?.education || {};

        return {
          student_id: student._id.toString(),
          name: student.user_id?.name || 'N/A',
          email: student.user_id?.email || 'N/A',
          gpa: education.gpa || 'N/A',
          gpa_numeric: education.gpa ? parseFloat(education.gpa) : null,
          graduation_year: education.graduation_year || 'N/A',
          degree: education.degree || 'N/A',
          university: education.university || 'N/A',
          phone: student.phone || 'N/A',
          linkedin_url: student.linkedin_url || null,
          current_year: student.current_year || 'N/A',
          achievements: student.achievements || [],
          
          // Scores
          match_score: Math.round(combinedMatchScore),
          skill_match_score: Math.round(skillMatchScore),
          semantic_score: Math.round(semanticScore),
          semantic_distance: semanticDistance,
          retention_score: Math.round(retentionResult.score),
          retention_reasoning: retentionResult.reasoning,
          ai_powered: retentionResult.ai_powered,
          
          // Skills
          skills: student.resume_parsed_data?.skills || [],
          matched_skills: matchedSkills,
          unmatched_skills: unmatchedSkills, // Show which skills are missing
          
          // Additional info
          resume_url: student.resume_url,
          github_username: student.github_data?.username,
          github_repos: student.github_data?.repos_count || 0,
          location: student.location || 'N/A',
          interests: student.interests || [],
          
          // ChromaDB metadata
          chroma_rank: index + 1
        };
      })
    );

    // Filter out nulls and sort by combined match score
    const validCandidates = candidatesWithScores
      .filter(c => c !== null)
      .sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      success: true,
      candidates: validCandidates,
      total_results: validCandidates.length,
      search_method: 'semantic_chromadb',
      message: `Found ${validCandidates.length} candidates using semantic search`
    });

  } catch (error) {
    console.error(' Semantic Search Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// AI-Powered Retention Score Calculation using Groq
async function calculateAIRetentionScore(culturalFitness, gamifiedAssessment) {
  if (!culturalFitness && !gamifiedAssessment) {
    return {
      score: 50,
      reasoning: 'No cultural or gamified assessment data available. Default retention score assigned.',
      ai_powered: false
    };
  }

  try {
    let profileText = 'PROFILE:\n';
    
    // Add Cultural Fitness context if it exists (for Semantic search it might be an array or an object)
    if (culturalFitness) {
      if (Array.isArray(culturalFitness) && culturalFitness.length > 0) {
        profileText += `\nCultural Fitness Responses:\n${culturalFitness.map((cf, idx) => `${idx + 1}. ${cf.question}\nAnswer: ${cf.answer}`).join('\n\n')}\n`;
      } else if (!Array.isArray(culturalFitness)) {
        profileText += `
Team: ${culturalFitness.team_preference || 'N/A'}, Conflict: ${culturalFitness.conflict_handling || 'N/A'}, Collaboration: ${culturalFitness.collaboration_style || 'N/A'}
Work-Life: ${culturalFitness.work_life_balance || 'N/A'}, Environment: ${culturalFitness.work_environment || 'N/A'}
Learning: ${culturalFitness.learning_preference || 'N/A'}, Feedback: ${culturalFitness.feedback_preference || 'N/A'}
Career: ${culturalFitness.career_focus || 'N/A'}, Vision: ${culturalFitness.five_year_vision || 'N/A'}
Communication: ${culturalFitness.communication_style || 'N/A'}
`;
      }
    }

    if (gamifiedAssessment) {
      profileText += `
Gamified Persona: ${gamifiedAssessment.persona || 'N/A'}
Gamified Scores: Pragmatism (${gamifiedAssessment.scores?.pragmatism || 0}), Teamwork (${gamifiedAssessment.scores?.teamwork || 0}), Innovation (${gamifiedAssessment.scores?.innovation || 0}), Leadership (${gamifiedAssessment.scores?.leadership || 0})
`;
    }

    const prompt = `Analyze this candidate's profile and predict retention probability (0-100) combining cultural fitness and gamified scenario logic:

${profileText}

Respond with ONLY a JSON object:
{"score": <0-100>, "reason": "<brief 1-sentence reason>"}`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const text = chatCompletion.choices[0]?.message?.content || '{}';

    // Parse response
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const aiResult = JSON.parse(cleanText);

    return {
      score: Math.max(0, Math.min(100, aiResult.score || 50)),
      reasoning: aiResult.reason || 'AI analysis completed',
      ai_powered: true
    };

  } catch (error) {
    console.error('Groq AI Error:', error);
    return {
      score: 50,
      reasoning: 'API unavailable so using fallback formula.',
      ai_powered: false
    };
  }
}

// Fallback calculation if AI fails
function calculateFallbackRetention(culturalFitness) {
  if (!culturalFitness || !Array.isArray(culturalFitness) || culturalFitness.length === 0) {
    return {
      score: 50,
      reasoning: 'No cultural fitness assessment data available.',
      ai_powered: false
    };
  }

  const strengths = [];
  const concerns = [];
  let totalScore = 0;

  culturalFitness.forEach(cf => {
    const answer = cf.answer?.toLowerCase() || '';
    const question = cf.question?.toLowerCase() || '';
    
    let itemScore = 50;

    // Team collaboration
    if (question.includes('team') || question.includes('collaborate')) {
      if (answer.includes('love') || answer.includes('enjoy') || answer.includes('prefer')) {
        itemScore = 85;
        strengths.push('Strong team collaboration mindset');
      } else if (answer.includes('alone') || answer.includes('individual')) {
        itemScore = 40;
        concerns.push('May prefer independent work');
      }
    }

    // Feedback
    if (question.includes('feedback') || question.includes('criticism')) {
      if (answer.includes('welcome') || answer.includes('appreciate') || answer.includes('value')) {
        itemScore = 90;
        strengths.push('Receptive to feedback and growth');
      }
    }

    // Work-life balance
    if (question.includes('work-life') || question.includes('overtime')) {
      if (answer.includes('balance') || answer.includes('important')) {
        itemScore = 75;
        strengths.push('Values work-life balance');
      }
    }

    // Learning and growth
    if (question.includes('learn') || question.includes('skill')) {
      if (answer.includes('continuously') || answer.includes('always') || answer.includes('eager')) {
        itemScore = 88;
        strengths.push('Continuous learner and growth-oriented');
      }
    }

    totalScore += itemScore;
  });

  const avgScore = Math.round(totalScore / culturalFitness.length);

  // Build reasoning
  let emoji = avgScore >= 75 ? '' : avgScore >= 60 ? '' : avgScore >= 45 ? '️' : '️';
  let reasoning = `${emoji} Retention Analysis:\n\n`;
  
  if (strengths.length > 0) {
    reasoning += `Strengths: ${strengths.join(', ')}. `;
  }
  
  if (concerns.length > 0) {
    reasoning += `Considerations: ${concerns.join(', ')}.`;
  } else {
    reasoning += 'Shows balanced professional approach.';
  }

  return {
    score: avgScore,
    reasoning,
    ai_powered: false
  };
}
