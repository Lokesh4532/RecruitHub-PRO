'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import { Star, Mail, Phone, ExternalLink, Trash2, ArrowLeft, Layers, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ShortlistPage() {
  const router = useRouter();
  const [shortlist, setShortlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('job');

  useEffect(() => {
    fetchShortlist();
  }, []);

  const fetchShortlist = async () => {
    try {
      const response = await fetch('/api/recruiter/shortlist');
      if (response.ok) {
        const data = await response.json();
        setShortlist(data.shortlist || []);
      }
    } catch (error) {
      console.error('Error fetching shortlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id, candidateName) => {
    if (!confirm(`Remove ${candidateName} from shortlist?`)) return;

    try {
      const response = await fetch(`/api/recruiter/shortlist?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShortlist(prev => prev.filter(s => s._id !== id));
      }
    } catch (error) {
      console.error('Error removing from shortlist:', error);
    }
  };

  const groupedByJob = {};
  shortlist.forEach(item => {
    const jobTitle = item.job_id?.title || 'Unknown Job';
    if (!groupedByJob[jobTitle]) groupedByJob[jobTitle] = [];
    groupedByJob[jobTitle].push(item);
  });

  const groupedByStatus = {};
  shortlist.forEach(item => {
    const status = item.status || 'shortlisted';
    if (!groupedByStatus[status]) groupedByStatus[status] = [];
    groupedByStatus[status].push(item);
  });

  return (
    <div className="min-h-screen relative font-sans text-white">
      <AnimatedCyberBackground />
      <Sidebar role="recruiter" />
      
      <div className="ml-[260px] relative z-10">
        <header className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-8 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-white">
                  Shortlisted Candidates
                </h1>
                <p className="text-gray-400 font-medium mt-1">Review and manage your top picks</p>
              </div>
              <button
                onClick={() => router.push('/recruiter/dashboard')}
                className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Dashboard
              </button>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-8">
          <div className="mb-8 flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/10 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Star size={20} className="text-gray-400" />
              <span className="font-bold text-white text-lg">{shortlist.length} Total Shortlisted</span>
            </div>
            
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => setGroupBy('job')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  groupBy === 'job'
                    ? 'bg-white/[0.02] text-gray-300 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Layers size={16} /> By Job
              </button>
              <button
                onClick={() => setGroupBy('status')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  groupBy === 'status'
                    ? 'bg-white/[0.02] text-gray-300 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListFilter size={16} /> By Status
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white/10"></div>
            </div>
          ) : shortlist.length === 0 ? (
            <AnimatedCard className="text-center py-20 border border-white/5">
              <Star className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Candidates Shortlisted</h2>
              <p className="text-gray-400 mb-8 font-medium">Head over to the candidate search to start building your pipeline.</p>
              <Link href="/recruiter/candidates" className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30">
                Search Candidates
              </Link>
            </AnimatedCard>
          ) : (
            <div className="space-y-8">
              <AnimatePresence>
                {groupBy === 'job' ? (
                  Object.entries(groupedByJob).map(([jobTitle, items], idx) => (
                    <motion.div 
                      key={jobTitle}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-panel p-6 border border-white/5"
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10/50 pb-4">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-300 text-sm">{items.length}</span>
                        {jobTitle}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                        {items.map((item, i) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                            className="bg-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all group"
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-gray-300 transition-colors">
                                  {item.student_id?.user_id?.name || 'Unknown Student'}
                                </h3>
                                <div className="text-sm text-gray-400 font-medium mt-1 space-y-1">
                                  <div className="flex items-center gap-2"><Mail size={14}/> {item.student_id?.user_id?.email || 'N/A'}</div>
                                  {item.student_id?.phone && item.student_id.phone !== 'N/A' && (
                                    <div className="flex items-center gap-2"><Phone size={14}/> {item.student_id.phone}</div>
                                  )}
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-white/5 text-gray-300 border border-white/10 text-xs font-bold rounded-full uppercase tracking-wider">
                                {item.status}
                              </span>
                            </div>

                            {item.notes && (
                              <div className="bg-white/5/50 border border-white/10 rounded-lg p-3 mb-4">
                                <p className="text-xs font-bold text-gray-300 mb-1 uppercase tracking-wider">Notes</p>
                                <p className="text-sm text-gray-200 font-medium">{item.notes}</p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
                              <Link
                                href={`/recruiter/student-profile/${item.student_id?._id}`}
                                className="px-4 py-2 bg-white/5 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg text-sm font-bold transition-colors"
                              >
                                View Profile
                              </Link>
                              <a
                                href={`mailto:${item.student_id?.user_id?.email}?subject=Opportunity at RecruitPro`}
                                className="px-4 py-2 bg-white/[0.02] text-gray-200 hover:bg-gray-200 rounded-lg text-sm font-bold transition-colors"
                              >
                                Email
                              </a>
                              <button
                                onClick={() => handleRemove(item._id, item.student_id?.user_id?.name)}
                                className="px-4 py-2 bg-white/5 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-sm font-bold transition-colors ml-auto flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Remove
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  Object.entries(groupedByStatus).map(([status, items], idx) => (
                    <motion.div 
                      key={status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-panel p-6 border border-white/5"
                    >
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/10/50 pb-4 capitalize">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-300 text-sm">{items.length}</span>
                        {status}
                      </h2>
                      <div className="grid gap-4 md:grid-cols-2">
                        {items.map((item, i) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                            className="bg-white/[0.02] backdrop-blur border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-lg hover:shadow-white/5 transition-all group flex flex-col"
                          >
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white group-hover:text-gray-300 transition-colors">
                                {item.student_id?.user_id?.name || 'Unknown Student'}
                              </h3>
                              <p className="text-gray-400 text-sm font-medium mt-1">{item.student_id?.user_id?.email}</p>
                              <div className="mt-4 mb-4 bg-white/[0.02] rounded-lg p-3 border border-white/5">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Applied for</span>
                                <p className="text-sm font-bold text-white mt-0.5">{item.job_id?.title}</p>
                              </div>
                            </div>
                            <div className="flex gap-2 pt-4 border-t border-white/5 mt-auto">
                              <Link
                                href={`/recruiter/student-profile/${item.student_id?._id}`}
                                className="flex-1 text-center px-4 py-2 bg-white/5 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg text-sm font-bold transition-colors"
                              >
                                View Profile
                              </Link>
                              <button
                                onClick={() => handleRemove(item._id, item.student_id?.user_id?.name)}
                                className="px-4 py-2 bg-white/5 text-red-600 hover:bg-red-600 hover:text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
