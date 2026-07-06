'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import AnimatedCard from '@/components/AnimatedCard';
import { Bot, ArrowLeft, Send, BrainCircuit, Target, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AITalentCopilot() {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI Career Coach. I can help you with job matching, skill assessment, interview preparation, and career advice. What would you like to explore today?'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchStudentData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchStudentData = async () => {
    try {
      const response = await fetch('/api/student/profile', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?role=student');
          return;
        }
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setStudent(data.student);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAIResponse = async (userMessage) => {
    // Simulated AI responses based on student data
    const lowerMessage = userMessage.toLowerCase();
    
    let response = '';

    if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
      const skills = student?.skills || [];
      response = `**Skill Analysis:**\n\nYou currently have ${skills.length} skills in your profile. Based on market demand:\n\n**Your Strengths:**\n${skills.slice(0, 5).map(s => `✓ ${s}`).join('\n')}\n\n**Recommended to Learn:**\n• Cloud Computing (AWS/Azure)\n• Machine Learning\n• System Design\n• DevOps (Docker, Kubernetes)\n\nThese skills are in high demand and will increase your match rate by 25-40%.`;
    } 
    else if (lowerMessage.includes('career') || lowerMessage.includes('path')) {
      response = `**Career Path Recommendation:**\n\nBased on your profile (GPA: ${student?.gpa || 'N/A'}, Skills: ${student?.skills?.length || 0}), I recommend:\n\n**Short-term (0-2 years):**\n1. Software Engineer - Entry Level\n2. Full Stack Developer\n3. Frontend Developer\n\n**Mid-term (2-5 years):**\n• Senior Engineer\n• Tech Lead\n• Solution Architect\n\n**Focus Areas:**\n• Build 3-5 strong projects\n• Contribute to open source\n• Get certified in cloud platforms`;
    }
    else if (lowerMessage.includes('interview') || lowerMessage.includes('prepare')) {
      response = `**Interview Preparation Guide:**\n\n**For Technical Interviews:**\n1. Practice 50+ LeetCode problems (Easy → Medium)\n2. Master system design basics\n3. Review your projects deeply\n\n**For Cultural Fit:**\nBased on your cultural test (Retention: ${student?.retention_score || 'Not taken'}%), emphasize:\n• Teamwork experiences\n• Learning from failures\n• Adaptability examples\n\n**Common Questions:**\n• "Tell me about yourself" - 2 min pitch\n• "Why this company?" - Research thoroughly\n• "Biggest challenge?" - Use STAR method`;
    }
    else if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      response = `**Resume Improvement Tips:**\n\n**Current Status:**\n• Skills listed: ${student?.skills?.length || 0}\n• Achievements: ${student?.achievements?.length || 0}\n• GPA: ${student?.gpa || 'N/A'}\n\n**Improvements:**\n1. Add quantifiable achievements (increased by X%, reduced by Y%)\n2. Use action verbs (Developed, Implemented, Optimized)\n3. Include project metrics (users, performance, scale)\n4. Highlight leadership roles\n5. Add certifications/courses\n\n**Format:**\n• Keep it 1 page\n• Use bullet points\n• Reverse chronological order\n• ATS-friendly (no tables/graphics)`;
    }
    else if (lowerMessage.includes('job') || lowerMessage.includes('match')) {
      response = `**Job Matching Insights:**\n\n**Your Profile Strength:** ${calculateProfileStrength()}%\n\n**Best Matches:**\n1. Entry-level Software Engineer (85% match)\n2. Full Stack Developer (78% match)\n3. Backend Developer (72% match)\n\n**Why these matches?**\n• Your skills align with requirements\n• GPA meets criteria\n• Cultural fit score is strong\n\n**To improve matches:**\n• Complete cultural test if not done\n• Add more projects\n• Learn trending technologies\n• Connect GitHub (shows coding activity)`;
    }
    else if (lowerMessage.includes('salary') || lowerMessage.includes('compensation')) {
      response = `**Salary Expectations:**\n\nBased on your profile:\n\n**Entry Level (0-2 years):**\n• Software Engineer: $70,000 - $95,000\n• Full Stack Developer: $75,000 - $100,000\n• Frontend Developer: $65,000 - $90,000\n\n**Factors affecting salary:**\n✓ Skills (${student?.skills?.length || 0} currently)\n✓ GPA (${student?.gpa || 'N/A'})\n✓ Projects quality\n✓ Company size & location\n✓ Negotiation skills\n\n**Tip:** Never reveal expected salary first. Research company ranges and ask about their budget.`;
    }
    else {
      response = `I understand you're asking about "${userMessage}".\n\nI can help you with:\n\n1. **Skills Analysis** - What to learn next\n2. **Career Planning** - Short & long-term paths\n3. **Interview Prep** - Technical & behavioral\n4. **Resume Tips** - Make it stand out\n5. **Job Matching** - Find best opportunities\n6. **Salary Guidance** - Know your worth\n\nWhich area interests you most?`;
    }

    return response;
  };

  const calculateProfileStrength = () => {
    if (!student) return 0;
    
    let strength = 0;
    if (student.skills?.length > 0) strength += 30;
    if (student.skills?.length > 5) strength += 20;
    if (student.gpa >= 3.5) strength += 20;
    if (student.gpa >= 3.0) strength += 10;
    if (student.achievements?.length > 0) strength += 10;
    if (student.github_username) strength += 10;
    if (student.cultural_test_completed) strength += 20;
    
    return Math.min(strength, 100);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const quickQuestions = [
    "What skills should I learn?",
    "How can I improve my resume?",
    "What's my career path?",
    "Prepare me for interviews",
    "Show me job matches"
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative font-sans text-gray-200">
      <AnimatedCyberBackground />
      <Sidebar role="student" />
      
      <div className="ml-[260px] relative z-10 pb-20">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <Bot size={28} className="text-white/70" />
                  AI Talent Co-Pilot
                </h1>
                <p className="text-gray-400 font-medium mt-1">Your personal AI career coach & advisor.</p>
              </div>
              <button
                onClick={() => router.push('/student/dashboard')}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft size={18} /> Back
              </button>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {/* Chat Container */}
          <AnimatedCard index={0} className="bg-white/[0.02] border border-white/5 rounded-2xl mb-8 flex flex-col overflow-hidden" style={{ height: '600px' }}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-5 ${
                      msg.role === 'user'
                        ? 'bg-white text-black rounded-tr-sm'
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-5">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/5 p-4 bg-[#0a0a0a]">
              <div className="flex gap-3 relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your career..."
                  className="flex-1 pl-5 pr-16 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-white/30 focus:bg-white/10 focus:outline-none transition-all duration-300 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-white text-black hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} className="ml-0.5" />
                </button>
              </div>
            </div>
          </AnimatedCard>

          {/* Quick Questions */}
          <AnimatedCard index={1} className="mb-10">
            <div className="flex flex-wrap gap-3">
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputMessage(question)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </AnimatedCard>

          {/* Features Info */}
          <div className="grid md:grid-cols-3 gap-6">
            <AnimatedCard index={2} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <BrainCircuit className="mx-auto w-10 h-10 text-white/40 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-white mb-2">Predictive Analysis</h4>
              <p className="text-sm text-gray-500 leading-relaxed">AI predicts your potential and suggests targeted improvements.</p>
            </AnimatedCard>
            
            <AnimatedCard index={3} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <Target className="mx-auto w-10 h-10 text-white/40 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-white mb-2">Personalized Coaching</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Get tailored advice based precisely on your unique profile.</p>
            </AnimatedCard>
            
            <AnimatedCard index={4} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
              <Compass className="mx-auto w-10 h-10 text-white/40 mb-5" strokeWidth={1.5} />
              <h4 className="font-bold text-white mb-2">Career Guidance</h4>
              <p className="text-sm text-gray-500 leading-relaxed">Actionable, real-time insights for your tech career journey.</p>
            </AnimatedCard>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
