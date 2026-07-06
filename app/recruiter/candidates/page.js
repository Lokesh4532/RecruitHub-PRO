'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, ChevronDown, ChevronUp, Star, MapPin, 
  GraduationCap, Mail, Phone, ExternalLink, RefreshCw,
  BrainCircuit, Database, X, Check, ArrowRight
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';

export default function RecruiterCandidates() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showReasoningModal, setShowReasoningModal] = useState(false);
  const [selectedReasoning, setSelectedReasoning] = useState(null);
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);
  const [semanticQuery, setSemanticQuery] = useState('');
  const [syncingChroma, setSyncingChroma] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [filters, setFilters] = useState({
    min_match_score: '',
    min_retention_score: '',
    min_gpa: '',
    max_gpa: '',
    degree: '',
    university: '',
    skills: '',
    graduation_year: '',
    min_github_repos: '',
    location: '',
    interests: ''
  });

  useEffect(() => {
    fetchJobs();
    fetchShortlist();
    const jobId = searchParams.get('job_id');
    if (jobId) {
      setSelectedJob(jobId);
    }
  }, []);

  useEffect(() => {
    if (selectedJob) {
      searchCandidates();
    }
  }, [selectedJob]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/recruiter/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const searchCandidates = async () => {
    if (!selectedJob) return;

    setLoading(true);
    try {
      const endpoint = useSemanticSearch ? '/api/chroma/search' : '/api/recruiter/search-candidates';
      
      const queryParams = new URLSearchParams({
        job_id: selectedJob,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      if (useSemanticSearch && semanticQuery) {
        queryParams.set('query', semanticQuery);
      }

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      }
    } catch (error) {
      console.error('Error searching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      min_match_score: '', min_retention_score: '', min_gpa: '', max_gpa: '',
      degree: '', university: '', skills: '', graduation_year: '',
      min_github_repos: '', location: '', interests: ''
    });
  };

  const applyFilters = () => {
    searchCandidates();
  };

  const fetchShortlist = async () => {
    try {
      const response = await fetch('/api/recruiter/shortlist');
      if (response.ok) {
        const data = await response.json();
        const ids = new Set(data.shortlist.map(s => s.student_id._id));
        setShortlistedIds(ids);
      }
    } catch (error) {
      console.error('Error fetching shortlist:', error);
    }
  };

  const handleShortlist = async (candidate) => {
    if (!selectedJob) {
      alert('Please select a job first');
      return;
    }

    const studentId = candidate.student_id || candidate._id;
    
    if (!studentId) return;

    try {
      const response = await fetch('/api/recruiter/shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          job_id: selectedJob,
          notes: `Match: ${candidate.match_score}%, Retention: ${candidate.retention_score}%`
        })
      });

      if (response.ok) {
        setShortlistedIds(prev => new Set([...prev, studentId]));
        setCandidates(prev => prev.filter(c => (c.student_id || c._id) !== studentId));
      }
    } catch (error) {
      console.error('Error shortlisting:', error);
    }
  };

  const syncToChromaDB = async () => {
    setSyncingChroma(true);
    setSyncStatus('Syncing candidates to ChromaDB...');
    try {
      const response = await fetch('/api/chroma/sync', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        setSyncStatus(`Synced ${data.synced} candidates!`);
      } else {
        setSyncStatus(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      setSyncStatus(`Error: ${error.message}`);
    } finally {
      setTimeout(() => setSyncStatus(''), 5000);
      setSyncingChroma(false);
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
                  Candidate Discovery
                </h1>
                <p className="text-gray-400 font-medium mt-1">Find the best talent for your openings using AI</p>
              </div>
              <button onClick={() => router.push('/recruiter/dashboard')} className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors">
                Back to Dashboard
              </button>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-8">
          <AnimatedCard index={0} className="p-8 mb-8 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Search className="text-gray-300" />
                Smart Search
              </h2>
              <div className="flex gap-3 items-center">
                <button
                  onClick={syncToChromaDB}
                  disabled={syncingChroma}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-300 hover:bg-white/5 disabled:opacity-50 transition-all border border-white/10"
                >
                  <RefreshCw size={16} className={syncingChroma ? 'animate-spin' : ''} />
                  {syncingChroma ? 'Syncing...' : 'Sync Vector DB'}
                </button>

                <button
                  onClick={() => setUseSemanticSearch(!useSemanticSearch)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    useSemanticSearch
                      ? 'bg-white/5 text-white border-white/10 shadow-lg shadow-purple-500/30'
                      : 'bg-white/[0.02] text-gray-300 border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <BrainCircuit size={16} />
                  {useSemanticSearch ? 'Semantic Search Active' : 'Standard Search'}
                </button>
                
                <button
                  onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors text-sm"
                >
                  <Filter size={16} />
                  {showAdvancedSearch ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {syncStatus && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mb-4 p-3 rounded-lg text-sm bg-white/5 text-gray-300 border border-white/10 font-medium"
                >
                  {syncStatus}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">Select Job *</label>
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="input-modern"
                >
                  <option value="" className="bg-[#1a1a1a] text-white">Choose a job...</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id} className="bg-[#1a1a1a] text-white">{job.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">Min Match (%)</label>
                <input
                  type="number" value={filters.min_match_score}
                  onChange={(e) => handleFilterChange('min_match_score', e.target.value)}
                  className="input-modern" placeholder="e.g., 50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-200 mb-2">Min GPA</label>
                <input
                  type="number" step="0.1" value={filters.min_gpa}
                  onChange={(e) => handleFilterChange('min_gpa', e.target.value)}
                  className="input-modern" placeholder="e.g., 3.0"
                />
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedSearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-white/10/50 pt-6 mt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Advanced Filters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Inputs */}
                      {['degree', 'university', 'graduation_year', 'skills', 'location', 'max_gpa', 'min_github_repos', 'interests', 'min_retention_score'].map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-bold text-gray-200 mb-2 capitalize">
                            {field.replace(/_/g, ' ')}
                          </label>
                          <input
                            type="text"
                            value={filters[field]}
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                            className="input-modern"
                            placeholder={`Enter ${field.replace(/_/g, ' ')}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 mt-6">
              <button onClick={applyFilters} disabled={!selectedJob || loading} className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors flex-1">
                {loading ? 'Searching...' : 'Search Candidates'}
              </button>
              <button onClick={clearFilters} className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors">Clear Filters</button>
            </div>
          </AnimatedCard>

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2">Results ({candidates.length})</h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white/10"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-20 glass-panel border border-white/5">
              <p className="text-gray-400 text-lg font-bold">
                {selectedJob ? 'No candidates match your criteria' : 'Select a job to view candidates'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {candidates.map((candidate, i) => (
                <AnimatedCard key={candidate.student_id || candidate._id} index={i + 1} className="p-6 border border-white/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">{candidate.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-300 font-medium mb-4">
                        <div className="flex items-center gap-1"><Mail size={16} className="text-gray-400"/> {candidate.email}</div>
                        <div className="flex items-center gap-1"><GraduationCap size={16} className="text-gray-400"/> {candidate.university}</div>
                        <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400"/> GPA: {candidate.gpa}</div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm font-bold text-white mb-2">Matched Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.matched_skills?.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/5 border border-white/10 text-green-400 rounded-lg text-xs font-bold flex items-center gap-1">
                              <Check size={12}/> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 flex flex-col gap-3">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl px-5 py-3 text-center shadow-lg shadow-blue-500/30">
                        <div className="text-3xl font-extrabold">
                          {Math.round((candidate.match_score * 0.83) + (candidate.retention_score * 0.17))}%
                        </div>
                        <div className="text-xs font-bold tracking-wider uppercase opacity-90 mt-1">Overall Match</div>
                      </div>

                      {candidate.retention_reasoning && (
                        <button 
                          onClick={() => {
                            setSelectedReasoning({
                              name: candidate.name,
                              score: candidate.retention_score,
                              reasoning: candidate.retention_reasoning,
                              aiPowered: candidate.ai_powered
                            });
                            setShowReasoningModal(true);
                          }}
                          className="bg-white/[0.02] border border-white/10 hover:border-white/10 text-gray-300 rounded-xl px-4 py-2 text-center text-sm font-bold transition-all shadow-sm hover:shadow-lg hover:shadow-white/5 flex items-center justify-center gap-2"
                        >
                          <BrainCircuit size={16} />
                          AI Analysis
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-5 border-t border-white/5">
                    <Link
                      href={`/recruiter/student-profile/${candidate.student_id || candidate._id}`}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/5 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2"
                    >
                      View Profile <ArrowRight size={16}/>
                    </Link>
                    <button
                      onClick={() => handleShortlist(candidate)}
                      disabled={shortlistedIds.has(candidate.student_id || candidate._id)}
                      className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        shortlistedIds.has(candidate.student_id || candidate._id)
                          ? 'bg-white/5 text-gray-400 cursor-not-allowed'
                          : 'bg-white/[0.02] border-2 border-white/10 text-green-400 hover:bg-white/5'
                      }`}
                    >
                      <Star size={16} className={shortlistedIds.has(candidate.student_id || candidate._id) ? 'fill-current' : ''} />
                      {shortlistedIds.has(candidate.student_id || candidate._id) ? 'Shortlisted' : 'Shortlist'}
                    </button>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          )}
        </PageTransition>

        <AnimatePresence>
          {showReasoningModal && selectedReasoning && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowReasoningModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white/[0.02] rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-extrabold mb-1">Retention Analysis</h2>
                      <p className="text-gray-300 font-medium">{selectedReasoning.name}</p>
                    </div>
                    <button onClick={() => setShowReasoningModal(false)} className="text-white/70 hover:text-white transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="bg-white/20 rounded-xl px-5 py-3 border border-white/20">
                      <div className="text-3xl font-extrabold">{selectedReasoning.score}%</div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-300 mt-1">Score</div>
                    </div>
                    {selectedReasoning.aiPowered && (
                      <div className="bg-yellow-400/20 border border-yellow-400/50 text-yellow-100 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                        <BrainCircuit size={16} /> AI-Powered
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-bold text-white mb-4">Detailed Breakdown</h3>
                  <p className="text-gray-200 leading-relaxed font-medium bg-white/[0.02] p-6 rounded-xl border border-white/5">
                    {selectedReasoning.reasoning}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
