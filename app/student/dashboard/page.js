'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import { LogOut, User, Briefcase, Bot, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, jobsRes] = await Promise.all([
        fetch('/api/student/profile'),
        fetch('/api/student/recommended-jobs')
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData.student);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      const response = await fetch('/api/student/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Application submitted successfully!');
        fetchData(); // Refresh data
      } else {
        alert(data.error || 'Failed to apply');
      }
    } catch (error) {
      alert('Error submitting application');
    } finally {
      setApplying(null);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

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
      
      <div className="ml-[260px] relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Welcome Back!
                </h1>
                <p className="text-gray-400 font-medium mt-1">Hey {profile?.user_id?.name}, explore new opportunities.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/student/profile')}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
                >
                  <User size={18} /> Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 mb-10">
            <AnimatedCard index={0} className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Recommended Jobs</p>
                  <motion.p
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-5xl font-light text-white tracking-tight"
                  >
                    {jobs.length}
                  </motion.p>
                  <p className="text-gray-400 text-sm mt-2">Available opportunities matching your profile</p>
                </div>
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                  <Briefcase size={24} strokeWidth={1.5} />
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Recommended Jobs */}
          <AnimatedCard index={1} className="p-8">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Briefcase className="text-white/50" /> Recommended Jobs for You
              </h2>
              <button
                onClick={() => router.push('/student/jobs')}
                className="text-white hover:text-gray-300 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                View All <ArrowRight size={16} />
              </button>
            </div>
            
            {jobs.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                <Briefcase className="mx-auto h-10 w-10 text-white/20 mb-4" />
                <p className="text-white text-lg font-medium">No jobs available at the moment</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new opportunities!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {jobs.map((job, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    key={job._id}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{job.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                            {job.location}
                          </span>
                          <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                            {job.salary_range}
                          </span>
                          <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                            {job.experience_level}
                          </span>
                        </div>
                      </div>
                      {job.match_score && (
                        <div className="flex flex-col items-center bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 ml-4">
                          <span className="text-2xl font-bold tracking-tight">{Math.round(job.match_score)}%</span>
                          <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Match</span>
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills?.slice(0, 5).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.required_skills?.length > 5 && (
                          <span className="px-3 py-1.5 bg-transparent border border-dashed border-white/20 text-gray-400 rounded-md text-xs font-medium">
                            +{job.required_skills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-5 border-t border-white/5">
                      <p className="text-xs text-gray-500 font-medium">
                        Posted: {new Date(job.created_at).toLocaleDateString()}
                      </p>
                      <button
                        onClick={() => handleApply(job._id)}
                        disabled={applying === job._id}
                        className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applying === job._id ? 'Applying...' : 'Apply Now'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatedCard>
        </PageTransition>

        {/* Floating AI Chatbot Button */}
        <button
          onClick={() => router.push('/student/ai-copilot')}
          className="fixed bottom-8 right-8 w-14 h-14 bg-white hover:bg-gray-200 border border-white/20 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300 flex items-center justify-center text-black z-50 group"
          title="Launch AI Co-Pilot"
        >
          <Bot size={24} className="group-hover:animate-pulse" />
        </button>
      </div>
    </div>
  );
}
