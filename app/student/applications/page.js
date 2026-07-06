'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import AnimatedCard from '@/components/AnimatedCard';
import { FileText, LogOut, Briefcase, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentApplications() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/student/applications', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?role=student');
          return;
        }
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'shortlisted':
        return 'bg-white/5 text-gray-200 border-white/20';
      case 'rejected':
        return 'bg-white/5 text-gray-500 border-white/10';
      case 'pending':
      case 'applied':
        return 'bg-white/10 text-white border-white/30';
      default:
        return 'bg-white/5 text-gray-400 border-white/10';
    }
  };

  const handleLogout = () => {
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login?role=student');
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
                  <FileText size={28} className="text-white/70" />
                  My Applications
                </h1>
                <p className="text-gray-400 font-medium mt-1">Track your job application status and progress.</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
              <p className="mt-6 text-gray-400 font-medium text-sm">Loading your applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-16 text-center">
              <FileText className="mx-auto h-16 w-16 text-white/20 mb-6" />
              <h2 className="text-2xl font-bold text-white mb-3">No Applications Yet</h2>
              <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
                You haven't applied to any jobs yet. Start browsing exciting opportunities and take the first step towards your career!
              </p>
              <button
                onClick={() => router.push('/student/jobs')}
                className="px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
              >
                Browse Jobs Now
              </button>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <AnimatedCard index={0} className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Total Applied</p>
                      <p className="text-5xl font-light text-white tracking-tight">{applications.length}</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <FileText size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard index={1} className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Shortlisted</p>
                      <p className="text-5xl font-light text-white tracking-tight">
                        {applications.filter(a => ['accepted', 'shortlisted'].includes(a.status?.toLowerCase())).length}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <CheckCircle size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                </AnimatedCard>

                <AnimatedCard index={2} className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Pending</p>
                      <p className="text-5xl font-light text-white tracking-tight">
                        {applications.filter(a => ['pending', 'applied'].includes(a.status?.toLowerCase())).length}
                      </p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
                      <Clock size={24} strokeWidth={1.5} />
                    </div>
                  </div>
                </AnimatedCard>
              </div>

              {/* Applications List */}
              <div className="grid gap-6">
                {applications.map((application, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={application._id}
                    className="bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 rounded-2xl p-8 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <h2 className="text-2xl font-bold text-white">
                            {application.job_id?.title || 'Job Title Not Available'}
                          </h2>
                          <div className={`rounded-md px-4 py-1.5 border text-xs font-bold uppercase tracking-widest ${getStatusStyle(application.status)}`}>
                            {application.status || 'Pending'}
                          </div>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-2">
                          {application.job_id?.description || 'No description available'}
                        </p>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                          <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                            {application.job_id?.location || 'Location N/A'}
                          </span>
                          <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                            {application.job_id?.salary_range || 'Salary N/A'}
                          </span>
                          <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                            {application.job_id?.experience_level || 'Experience N/A'}
                          </span>
                        </div>

                        {application.job_id?.required_skills && application.job_id.required_skills.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                              Required Skills
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {application.job_id.required_skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium"
                                >
                                  {skill}
                               </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                      <div className="flex gap-6">
                        <p className="text-xs text-gray-500 font-medium">
                          Applied: {new Date(application.applied_at || application.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        {application.match_score && (
                          <p className="text-xs text-gray-400 font-medium">
                            Match: <span className="text-white font-bold">{Math.round(application.match_score)}%</span>
                          </p>
                        )}
                      </div>
                      {application.job_id?._id && (
                        <button
                          onClick={() => router.push(`/student/jobs`)}
                          className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                        >
                          <Briefcase size={14} /> View Similar
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
