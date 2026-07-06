'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import AnimatedCard from '@/components/AnimatedCard';
import { BrainCircuit, ArrowLeft, CheckCircle, ChevronRight, Gamepad2, Shield, Zap, Target, Users, Code, Award, Loader2 } from 'lucide-react';

const GAMIFIED_SCENARIOS = [
  {
    id: 1,
    title: "Scenario 1: The Friday Deploy Night",
    context: "It is 4:30 PM on a Friday. A recent deployment just broke the main login page for 10% of users. Your senior engineer is currently offline.",
    challenge: "What is your immediate action?",
    choices: [
      { text: "Instantly rollback the deployment and notify the team later.", attributes: { pragmatism: 3, leadership: 1, teamwork: 0, innovation: -1 } },
      { text: "Quickly post in the team channel, wait 5 mins for replies, then rollback if no one answers.", attributes: { teamwork: 3, leadership: 1, pragmatism: 2, innovation: 0 } },
      { text: "Dive into the logs, find the exact bug, and push a hotfix directly to production.", attributes: { innovation: 3, pragmatism: -1, teamwork: -1, leadership: 2 } },
      { text: "Mitigate by routing traffic to a backup server while you investigate safely.", attributes: { pragmatism: 2, innovation: 2, teamwork: 1, leadership: 2 } }
    ]
  },
  {
    id: 2,
    title: "Scenario 2: The Scope Creep",
    context: "Your project is due in 3 days. The Product Manager suddenly asks to add a 'small' feature that you know will take at least 2 days.",
    challenge: "How do you handle this request?",
    choices: [
      { text: "Agree to do it, pull an all-nighter, and deliver everything to impress them.", attributes: { teamwork: 1, pragmatism: -2, leadership: -1, innovation: 3 } },
      { text: "Politely decline, explaining the technical risks to the current deadline.", attributes: { pragmatism: 3, leadership: 2, teamwork: 1, innovation: 0 } },
      { text: "Propose an alternative: launch on time, but hide the feature behind a toggle to finish next week.", attributes: { innovation: 3, pragmatism: 2, leadership: 3, teamwork: 2 } },
      { text: "Tell them you need to consult with the dev team first to see if it's feasible.", attributes: { teamwork: 3, leadership: 1, pragmatism: 1, innovation: 0 } }
    ]
  },
  {
    id: 3,
    title: "Scenario 3: The Legacy Codebase",
    context: "You've been assigned to maintain a 5-year-old monolith. The code is messy, undocumented, and hard to read. You need to add a new API route.",
    challenge: "What is your development approach?",
    choices: [
      { text: "Refactor the entire module first, then add the new API route cleanly.", attributes: { innovation: 3, pragmatism: -1, leadership: 2, teamwork: 0 } },
      { text: "Write the API route matching the existing messy style to keep things 'consistent' and deliver fast.", attributes: { pragmatism: 3, innovation: -1, teamwork: 1, leadership: 0 } },
      { text: "Write the new API perfectly, and leave comments documenting the old mess for future you.", attributes: { innovation: 2, pragmatism: 2, teamwork: 1, leadership: 1 } },
      { text: "Pair program with a senior who previously worked on it to learn the hidden traps.", attributes: { teamwork: 3, leadership: 0, pragmatism: 2, innovation: 1 } }
    ]
  },
  {
    id: 4,
    title: "Scenario 4: The Junior's PR",
    context: "A junior developer submits a Pull Request. The logic works perfectly, but the code style is very messy and breaks several linting rules.",
    challenge: "How do you conduct the code review?",
    choices: [
      { text: "Reject the PR and tell them to fix the linting errors before you even look at the logic.", attributes: { pragmatism: 3, teamwork: -1, leadership: 1, innovation: 0 } },
      { text: "Fix the formatting yourself and merge it so they aren't blocked.", attributes: { teamwork: 2, pragmatism: 2, leadership: -1, innovation: -1 } },
      { text: "Approve the PR but leave a friendly comment explaining the team's coding standards for next time.", attributes: { teamwork: 3, leadership: 2, pragmatism: 1, innovation: 0 } },
      { text: "Schedule a 10-minute pair-programming call to show them how to configure auto-formatting.", attributes: { leadership: 3, teamwork: 3, innovation: 1, pragmatism: 0 } }
    ]
  },
  {
    id: 5,
    title: "Scenario 5: The Missing Specification",
    context: "You pick up a new Jira ticket. The requirements are incredibly vague ('Make the dashboard load faster'). The PM is out sick.",
    challenge: "What is your next move?",
    choices: [
      { text: "Skip the ticket and pick up something clearly defined from the backlog.", attributes: { pragmatism: 3, teamwork: 0, innovation: -1, leadership: 0 } },
      { text: "Implement a caching layer and optimize DB queries based on your best guess of what is slow.", attributes: { innovation: 3, pragmatism: 1, leadership: 1, teamwork: -1 } },
      { text: "Message the stakeholders or client directly to ask what specific slowness they are seeing.", attributes: { teamwork: 2, leadership: 2, pragmatism: 2, innovation: 0 } },
      { text: "Write a proposal to migrate the entire dashboard to a faster framework like Next.js.", attributes: { innovation: 3, pragmatism: -2, leadership: 1, teamwork: 0 } }
    ]
  },
  {
    id: 6,
    title: "Scenario 6: The Security Vulnerability",
    context: "While browsing an old repo, you notice a hardcoded AWS API key pushed 6 months ago. The system hasn't been compromised yet.",
    challenge: "How do you respond to this discovery?",
    choices: [
      { text: "Immediately revoke the key in AWS, even if it might break an internal tool temporarily.", attributes: { pragmatism: 3, leadership: 2, teamwork: -1, innovation: 0 } },
      { text: "Report it privately to the DevOps/Security team and await their instructions.", attributes: { teamwork: 3, pragmatism: 2, leadership: 1, innovation: 0 } },
      { text: "Write a script to scan all company repos for similar keys before reporting.", attributes: { innovation: 3, leadership: 1, pragmatism: 0, teamwork: 1 } },
      { text: "Quietly delete the key from the code in your next PR and hope no one noticed.", attributes: { pragmatism: -1, teamwork: -2, leadership: -2, innovation: -1 } }
    ]
  },
  {
    id: 7,
    title: "Scenario 7: The Impossible Deadline",
    context: "You are mid-sprint and realize there's a 0% chance the team will hit the Friday deadline for a major feature.",
    challenge: "How do you communicate this?",
    choices: [
      { text: "Work 14-hour days to try and save the sprint by yourself.", attributes: { innovation: 2, pragmatism: -3, teamwork: -1, leadership: -1 } },
      { text: "Bring it up in tomorrow's standup so the whole team can re-estimate.", attributes: { teamwork: 3, leadership: 1, pragmatism: 2, innovation: 0 } },
      { text: "Quietly message the PM right now to manage expectations and descriminate features.", attributes: { leadership: 3, pragmatism: 3, teamwork: 1, innovation: 0 } },
      { text: "Wait until Friday. Maybe you'll find a magical workaround by then.", attributes: { pragmatism: -3, teamwork: -2, leadership: -2, innovation: 1 } }
    ]
  },
  {
    id: 8,
    title: "Scenario 8: The Client Call",
    context: "Sales drags you into a client call. The client is angry that a feature is delayed and demands a technical explanation they can understand.",
    challenge: "How do you handle the confrontation?",
    choices: [
      { text: "Explain the complex architecture (microservices, caching) in deep technical detail so they know it's hard.", attributes: { innovation: 1, pragmatism: 0, teamwork: -1, leadership: -1 } },
      { text: "Use a simple analogy (like building a house) to explain the delay and reassure them of the quality.", attributes: { leadership: 3, teamwork: 3, pragmatism: 2, innovation: 1 } },
      { text: "Stay quiet and let the Sales team handle it since you are just the engineer.", attributes: { teamwork: 0, pragmatism: 1, leadership: -2, innovation: 0 } },
      { text: "Apologize profusely and promise them it will definitely be done tomorrow (even if you aren't sure).", attributes: { pragmatism: -2, teamwork: 1, leadership: -2, innovation: 0 } }
    ]
  },
  {
    id: 9,
    title: "Scenario 9: The Shiny New Tech",
    context: "Your team is starting a greenfield project. A teammate suggests using a brand new framework released three weeks ago.",
    challenge: "What is your stance?",
    choices: [
      { text: "Absolutely! Bleeding-edge tech will make the project faster and fun to build.", attributes: { innovation: 3, pragmatism: -2, leadership: 1, teamwork: 1 } },
      { text: "Reject it. Stick to the 5-year-old framework everyone already knows to guarantee delivery.", attributes: { pragmatism: 3, innovation: -2, leadership: 1, teamwork: 1 } },
      { text: "Suggest doing a 2-day proof-of-concept (PoC) to see if the new tech actually solves your specific problems.", attributes: { leadership: 3, pragmatism: 2, innovation: 2, teamwork: 2 } },
      { text: "Go with whatever the majority of the team votes for in a poll.", attributes: { teamwork: 3, leadership: -1, pragmatism: 1, innovation: 0 } }
    ]
  },
  {
    id: 10,
    title: "Scenario 10: The Broken Production Pipe",
    context: "It is launch day. The build pipeline fails. If you bypass the automated tests, you can deploy on time. If you fix the tests, you will be 2 hours late.",
    challenge: "What is your decision?",
    choices: [
      { text: "Bypass the pipeline and deploy! Hitting the deadline is paramount.", attributes: { pragmatism: 2, innovation: 1, leadership: 1, teamwork: -1 } },
      { text: "Refuse to deploy. Fix the tests because broken tests mean broken code.", attributes: { pragmatism: 3, leadership: 2, teamwork: 0, innovation: 0 } },
      { text: "Deploy the bypass, but sit at your desk monitoring graphs manually for the next 4 hours.", attributes: { teamwork: 2, pragmatism: -1, leadership: 1, innovation: 1 } },
      { text: "Gather the PM and Tech Lead for an immediate 5-minute huddle to make a joint decision.", attributes: { teamwork: 3, leadership: 3, pragmatism: 2, innovation: 0 } }
    ]
  }
];

export default function CulturalTest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState({ pragmatism: 0, teamwork: 0, innovation: 0, leadership: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const handleSelection = (attributes) => {
    setScores(prev => ({
      pragmatism: prev.pragmatism + attributes.pragmatism,
      teamwork: prev.teamwork + attributes.teamwork,
      innovation: prev.innovation + attributes.innovation,
      leadership: prev.leadership + attributes.leadership
    }));

    if (currentStep < GAMIFIED_SCENARIOS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      finishAssessment();
    }
  };

  const finishAssessment = () => {
    setCalculating(true);
    // Simulate AI processing time
    setTimeout(() => {
      setCalculating(false);
      setIsFinished(true);
    }, 2000);
  };

  const submitResults = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/student/cultural-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: scores,
          persona: persona.name
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to save assessment');
      }
      
      router.push('/student/dashboard');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const getPersona = () => {
    const dominantTrait = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    switch (dominantTrait) {
      case 'teamwork': return { name: "The Diplomat", icon: <Users className="w-12 h-12 text-blue-400" />, desc: "You excel at communication and keeping the team aligned." };
      case 'innovation': return { name: "The Trailblazer", icon: <Zap className="w-12 h-12 text-yellow-400" />, desc: "You love creative solutions and aren't afraid of trying new things." };
      case 'leadership': return { name: "The Architect", icon: <Target className="w-12 h-12 text-purple-400" />, desc: "You take charge and guide projects to successful completion." };
      case 'pragmatism': return { name: "The Optimizer", icon: <Shield className="w-12 h-12 text-green-400" />, desc: "You prefer safe, practical, and efficient solutions to get things done." };
      default: return { name: "The Versatile Developer", icon: <Code className="w-12 h-12 text-gray-400" />, desc: "You have a balanced approach to all situations." };
    }
  };

  const persona = getPersona();

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar role="student" />
      
      <main className="flex-1 relative overflow-y-auto">
        <AnimatedCyberBackground />
        
        <PageTransition>
          <div className="min-h-screen p-8 mt-16 relative z-10">
            <div className="max-w-4xl mx-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple cyberpunk-font">
                    Gamified Assessment
                  </h1>
                  <p className="text-gray-400 mt-2 flex items-center">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Determine your ideal cultural fit through workplace scenarios
                  </p>
                </div>
                <button
                  onClick={() => router.back()}
                  className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10 hover:border-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
              </div>

              {!isFinished && !calculating ? (
                /* Scenario UI */
                <AnimatedCard className="p-8 border-neon-blue/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
                    <div 
                      className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / GAMIFIED_SCENARIOS.length) * 100}%` }}
                    />
                  </div>

                  <div className="mb-6 flex justify-between items-center mt-4">
                    <span className="text-neon-blue font-mono text-sm">
                      Level {currentStep + 1} of {GAMIFIED_SCENARIOS.length}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-white mb-4">{GAMIFIED_SCENARIOS[currentStep].title}</h2>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed border-l-4 border-neon-purple pl-4">
                    {GAMIFIED_SCENARIOS[currentStep].context}
                  </p>
                  
                  <h3 className="text-xl text-neon-action font-semibold mb-6">
                    {GAMIFIED_SCENARIOS[currentStep].challenge}
                  </h3>

                  <div className="grid gap-4">
                    {GAMIFIED_SCENARIOS[currentStep].choices.map((choice, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelection(choice.attributes)}
                        className="text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-neon-blue/10 hover:border-neon-blue/50 transition-all duration-200 group flex items-start"
                      >
                        <div className="w-6 h-6 rounded-full border border-gray-500 mr-4 flex-shrink-0 group-hover:border-neon-blue flex items-center justify-center mt-1">
                          <div className="w-3 h-3 rounded-full bg-neon-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-gray-200 group-hover:text-white text-lg">
                          {choice.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </AnimatedCard>
              ) : calculating ? (
                /* Calculating UI */
                <AnimatedCard className="p-12 text-center border-neon-purple/50 flex flex-col items-center justify-center min-h-[400px]">
                  <BrainCircuit className="w-16 h-16 text-neon-purple animate-pulse mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Decisions...</h2>
                  <p className="text-gray-400 mb-8">Computing your developer persona based on your instincts.</p>
                  <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
                </AnimatedCard>
              ) : (
                /* Result UI */
                <AnimatedCard className="p-8 border-green-500/50 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-black border-2 border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 animate-pulse" />
                      {persona.icon}
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
                  <p className="text-gray-400 mb-6">Your responses indicate your developer persona is:</p>
                  
                  <div className="inline-block px-6 py-3 rounded-full bg-white/5 border border-white/10 mb-8">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">
                      {persona.name}
                    </span>
                  </div>
                  
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                    {persona.desc}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {Object.entries(scores).map(([trait, score]) => (
                      <div key={trait} className="bg-black/50 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 capitalize text-sm mb-2">{trait}</div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-neon-blue to-neon-purple h-2 rounded-full"
                            style={{ width: `${Math.max(10, Math.min(100, (score + 5) * 10))}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={submitResults}
                    disabled={loading}
                    className="flex justify-center items-center w-full max-w-md mx-auto py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Award className="w-5 h-5 mr-2" />
                        Claim Badge & Complete
                      </>
                    )}
                  </button>
                </AnimatedCard>
              )}

            </div>
          </div>
        </PageTransition>
      </main>

    </div>
  );
} 
