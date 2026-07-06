'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import { Briefcase, ArrowLeft, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/student/recommended-jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
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
      } else {
        alert(data.error || 'Failed to apply');
      }
    } catch (error) {
      alert('Error submitting application');
    } finally {
      setApplying(null);
    }
  };

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
                <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                  <Briefcase size={28} className="text-white/70" />
                  Browse Jobs
                </h1>
                <p className="text-gray-400 font-medium mt-1">Find your perfect career opportunity.</p>
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
              <p className="mt-6 text-gray-400 font-medium text-sm">Loading opportunities...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center">
              <Briefcase className="mx-auto h-16 w-16 text-white/20 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3">No Jobs Available</h2>
              <p className="text-gray-400">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={job._id}
                  className="bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 rounded-2xl p-8 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-3">{job.title}</h2>
                      <p className="text-gray-400 text-sm mb-5 line-clamp-2 leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                          {job.location}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                          {job.salary_range}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                          {job.experience_level}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 rounded-md text-xs font-medium">
                          {job.applications_count || 0} applicants
                        </span>
                      </div>

                      <div className="mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills?.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {job.match_score && (
                      <div className="ml-6 bg-white/5 border border-white/10 text-white rounded-xl px-5 py-3 flex flex-col items-center">
                        <span className="text-3xl font-bold tracking-tight">{Math.round(job.match_score)}%</span>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">Match</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-white/5">
                    <p className="text-xs text-gray-500 font-medium">
                      Posted: {new Date(job.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={applying === job._id}
                      className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying === job._id ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
