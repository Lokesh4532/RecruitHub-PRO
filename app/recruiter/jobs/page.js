'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import { Briefcase, PlusCircle, ArrowLeft, MapPin, DollarSign, Award, Users, Calendar, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecruiterJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/recruiter/jobs');
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
                  Your Job Postings
                </h1>
                <p className="text-gray-400 font-medium mt-1">Manage and track all your active listings</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => router.push('/recruiter/dashboard')}
                  className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/recruiter/jobs/new')}
                  className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors flex items-center gap-2"
                >
                  <PlusCircle size={20} />
                  Post New Job
                </button>
              </div>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white/10"></div>
            </div>
          ) : jobs.length === 0 ? (
            <AnimatedCard className="text-center py-20 border border-white/5">
              <Briefcase className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Jobs Posted Yet</h2>
              <p className="text-gray-400 mb-8 font-medium">Create your first job posting to start recruiting top talent!</p>
              <button
                onClick={() => router.push('/recruiter/jobs/new')}
                className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors shadow-lg shadow-blue-500/30"
              >
                Post Your First Job
              </button>
            </AnimatedCard>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job, i) => (
                <AnimatedCard key={job._id} index={i} className="p-8 border border-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors">
                        {job.title}
                      </h2>
                      <p className="text-gray-300 mb-6 font-medium leading-relaxed">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-3 mb-6">
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm font-bold flex items-center gap-1">
                          <MapPin size={16} /> {job.location}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-green-400 rounded-lg text-sm font-bold flex items-center gap-1">
                          <DollarSign size={16} /> {job.salary_range}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm font-bold flex items-center gap-1">
                          <Award size={16} /> {job.experience_level}
                        </span>
                        <span className="px-3 py-1.5 bg-white/5 border border-yellow-100 text-yellow-700 rounded-lg text-sm font-bold flex items-center gap-1">
                          <Users size={16} /> {job.applications_count || 0} Apps
                        </span>
                        <span className="px-3 py-1.5 bg-white/[0.02] border border-white/10 text-gray-300 rounded-lg text-sm font-bold flex items-center gap-1">
                          <Calendar size={16} /> {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills?.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-white/[0.02] border border-white/10 text-gray-200 shadow-sm rounded-full text-sm font-bold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8 pt-6 border-t border-white/5">
                    <button
                      onClick={() => router.push(`/recruiter/candidates?job_id=${job._id}`)}
                      className="px-6 py-2.5 bg-white/5 hover:bg-white/5 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                      <Users size={18} /> View Candidates
                    </button>
                    <button
                      className="px-6 py-2.5 bg-white/[0.02] border border-white/10 text-gray-200 hover:bg-white/[0.02] rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2"
                    >
                      <Edit size={18} /> Edit
                    </button>
                    <button
                      className="px-6 py-2.5 bg-white/[0.02] border border-red-200 text-red-600 hover:bg-white/5 rounded-xl font-bold text-sm transition-colors shadow-sm flex items-center gap-2 ml-auto"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
