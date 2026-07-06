'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import { LogOut, PlusCircle, Briefcase, Users, CheckCircle, BarChart2, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecruiterDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [analyticsRes, jobsRes] = await Promise.all([
        fetch('/api/recruiter/analytics'),
        fetch('/api/recruiter/jobs')
      ]);
      if (analyticsRes.ok) { const data = await analyticsRes.json(); setAnalytics(data.analytics); }
      if (jobsRes.ok) { const data = await jobsRes.json(); setJobs(data.jobs || []); }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally { setLoading(false); }
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

  const statCards = [
    { label: 'Total Jobs', value: analytics?.total_jobs || 0, icon: Briefcase },
    { label: 'Candidates', value: analytics?.total_students || 0, icon: Users },
    { label: 'Active Hiring', value: analytics?.active_jobs || 0, icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen relative font-sans text-gray-200">
      <AnimatedCyberBackground />
      <Sidebar role="recruiter" />
      
      <div className="ml-[260px] relative z-10">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Welcome back, Recruiter
                </h1>
                <p className="text-gray-400 font-medium mt-1">Manage your hiring pipeline seamlessly.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => router.push('/recruiter/jobs/new')} className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors">
                  <PlusCircle size={18} /> Post Job
                </button>
                <button onClick={handleLogout} className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors">
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {statCards.map((stat, i) => (
              <AnimatedCard key={stat.label} index={i} className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                    <motion.p
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: i * 0.1 }}
                      className="text-5xl font-light text-white tracking-tight"
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                  <div className={`w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70`}>
                    <stat.icon size={24} strokeWidth={1.5} />
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Jobs */}
            <div className="lg:col-span-2">
              <AnimatedCard index={3} className="p-8 h-full">
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Briefcase className="text-white/50" /> Your Job Postings
                  </h2>
                  <button onClick={() => router.push('/recruiter/jobs')} className="text-white hover:text-gray-300 text-sm font-semibold transition-colors">
                    View All →
                  </button>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                    <Briefcase className="mx-auto h-10 w-10 text-white/20 mb-4" />
                    <p className="text-gray-400 text-sm font-medium">No jobs posted yet</p>
                    <button onClick={() => router.push('/recruiter/jobs/new')} className="mt-6 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors">
                      Post Your First Job
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {jobs.slice(0, 5).map((job, i) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        key={job._id}
                        className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">{job.title}</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">{job.location}</span>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">{job.salary_range}</span>
                            <span className="px-3 py-1 bg-white/10 border border-white/20 text-white rounded-md text-xs font-medium">{job.applications_count || 0} Apps</span>
                          </div>
                        </div>
                        <button onClick={() => router.push(`/recruiter/candidates?job_id=${job._id}`)} className="ml-4 w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white transition-all">
                          <ArrowRight size={16}/>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatedCard>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <AnimatedCard index={4} className="p-8 h-full">
                <h2 className="text-xl font-bold text-white mb-8 border-b border-white/5 pb-6">Quick Actions</h2>
                <div className="grid gap-3">
                  {[
                    { label: 'View Analytics', desc: 'Track hiring metrics', icon: BarChart2, href: '/recruiter/analytics' },
                    { label: 'Search Candidates', desc: 'Find the best talent', icon: Users, href: '/recruiter/candidates' },
                    { label: 'Shortlisted', desc: 'View saved candidates', icon: Star, href: '/recruiter/shortlist' },
                  ].map((action) => (
                    <button
                      key={action.label}
                      onClick={() => router.push(action.href)}
                      className="flex items-center gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all group text-left"
                    >
                      <div className={`w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 group-hover:text-white transition-colors`}>
                        <action.icon size={18} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{action.label}</h3>
                        <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
