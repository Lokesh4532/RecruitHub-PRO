'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import AnimatedCard from '@/components/AnimatedCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { GitBranch, ArrowLeft, Star, GitCommit, Users, BookOpen, MapPin, Building, Globe, FolderGit2, Calendar } from 'lucide-react';

const COLORS = ['#ffffff', '#a855f7', '#3b82f6', '#10b981', '#ec4899', '#f59e0b', '#6366f1', '#14b8a6'];

export default function GitHubAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/student/github-analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to fetch GitHub analytics');
        router.push('/student/profile');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Error loading GitHub analytics');
      router.push('/student/profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">Failed to load analytics</p>
          <button 
            onClick={() => router.push('/student/profile')}
            className="px-6 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  const { profile, statistics, languages, top_repos, repo_type_distribution, organizations } = analytics;

  // Prepare data for pie charts
  const repoTypeData = [
    { name: 'Original', value: repo_type_distribution.original },
    { name: 'Forked', value: repo_type_distribution.forked }
  ];

  const languageData = languages.slice(0, 8).map(l => ({
    name: l.language,
    value: parseFloat(l.percentage)
  }));

  const followData = [
    { name: 'Followers', value: profile.followers },
    { name: 'Following', value: profile.following }
  ];

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
                  <GitBranch size={28} className="text-white/70" />
                  GitHub Analytics Pro
                </h1>
                <p className="text-gray-400 font-medium mt-1">Comprehensive analysis of your GitHub profile.</p>
              </div>
              <button 
                onClick={() => router.push('/student/profile')}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
              >
                <ArrowLeft size={18} /> Back to Profile
              </button>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {/* Profile Header Card */}
          <AnimatedCard index={0} className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
              <img 
                src={profile.avatar_url} 
                alt={profile.username}
                className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] shadow-2xl bg-white/5"
              />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-extrabold text-white mb-1">{profile.name || profile.username}</h2>
                <p className="text-gray-400 font-medium mb-3">@{profile.username}</p>
                {profile.bio && <p className="text-gray-300 mb-4 max-w-2xl">{profile.bio}</p>}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                  {profile.location && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <MapPin size={14} /> {profile.location}
                    </span>
                  )}
                  {profile.company && (
                    <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                      <Building size={14} /> {profile.company}
                    </span>
                  )}
                  {profile.blog && (
                    <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg border border-white/5 text-white">
                      <Globe size={14} /> Website
                    </a>
                  )}
                </div>
              </div>
              
              <div className="bg-[#050505]/50 border border-white/10 backdrop-blur-md rounded-2xl p-6 text-center min-w-[160px]">
                <div className="text-5xl font-light text-white tracking-tight mb-2">{statistics.activity_score}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Activity Score</div>
              </div>
            </div>
          </AnimatedCard>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Repositories', value: statistics.total_repos, desc: `${statistics.original_repos} original, ${statistics.forked_repos} forked`, icon: BookOpen },
              { label: 'Total Stars', value: statistics.total_stars, desc: 'Across all repositories', icon: Star },
              { label: 'Total Commits', value: statistics.total_commits_recent, desc: 'Recent activity', icon: GitCommit },
              { label: 'Followers', value: profile.followers, desc: `Following ${profile.following}`, icon: Users },
            ].map((stat, i) => (
              <AnimatedCard key={i} index={1 + i * 0.1} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
                  <stat.icon size={18} className="text-white/30" />
                </div>
                <div className="text-4xl font-light text-white tracking-tight mb-2">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.desc}</div>
              </AnimatedCard>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Language Distribution Pie Chart */}
            <AnimatedCard index={2} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Language Distribution</h3>
              {languageData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={languageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `${value}%`}
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value, entry) => <span className="text-gray-400 text-xs">{value}: <span className="text-white font-medium">{entry.payload.value}%</span></span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No language data available
                </div>
              )}
            </AnimatedCard>

            {/* Repository Type Distribution */}
            <AnimatedCard index={2.1} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Repository Types</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={repoTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {repoTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#ffffff' : '#3b82f6'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle"
                      formatter={(value, entry) => <span className="text-gray-400 text-xs">{value}: <span className="text-white font-medium">{entry.payload.value} repos</span></span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>

            {/* Social Network */}
            <AnimatedCard index={2.2} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Social Network</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={followData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {followData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ec4899'} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle"
                      formatter={(value, entry) => <span className="text-gray-400 text-xs">{value}: <span className="text-white font-medium">{entry.payload.value}</span></span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnimatedCard>

            {/* Top Languages Bar Chart */}
            <AnimatedCard index={2.3} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">Top Languages (by usage)</h3>
              {languageData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={languageData} margin={{ top: 20, right: 30, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {languageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No language data available
                </div>
              )}
            </AnimatedCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Repositories */}
            <AnimatedCard index={3} className="lg:col-span-2 p-8 bg-white/[0.02] border border-white/5 rounded-2xl h-fit">
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                <FolderGit2 size={18} className="text-white/50" /> Top Repositories
              </h3>
              {top_repos.length > 0 ? (
                <div className="space-y-4">
                  {top_repos.map((repo, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <a 
                            href={repo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-lg font-bold text-white group-hover:text-gray-300 transition-colors flex items-center gap-2"
                          >
                            {repo.name}
                          </a>
                          <p className="text-gray-400 text-sm mt-2 line-clamp-2 leading-relaxed">{repo.description || 'No description provided'}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-medium text-gray-500">
                            {repo.language && (
                              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#050505] rounded-md border border-white/5">
                                <span className="w-2 h-2 rounded-full bg-white"></span>
                                {repo.language}
                              </span>
                            )}
                            <span className="flex items-center gap-1"><Star size={14} className="text-white/40" /> {repo.stars}</span>
                            <span className="flex items-center gap-1"><GitCommit size={14} className="text-white/40" /> {repo.forks}</span>
                            <span className="flex items-center gap-1 ml-auto">
                              <Calendar size={14} className="text-white/40" /> {new Date(repo.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12 bg-white/5 rounded-xl border border-dashed border-white/10 text-sm italic">
                  No repositories found
                </div>
              )}
            </AnimatedCard>

            <div className="space-y-8">
              {/* Organizations */}
              {organizations.length > 0 && (
                <AnimatedCard index={4} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4 flex items-center gap-2">
                    <Building size={18} className="text-white/50" /> Organizations
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {organizations.map((org, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                        <img 
                          src={org.avatar_url} 
                          alt={org.login}
                          className="w-10 h-10 rounded-lg bg-[#0a0a0a] border border-white/10"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate">{org.login}</p>
                          {org.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{org.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              )}

              {/* Additional Stats */}
              <AnimatedCard index={5} className="p-8 bg-white/[0.02] border border-white/5 rounded-2xl">
                <div className="grid grid-cols-1 gap-6">
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-light text-white mb-1">{statistics.total_forks}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Total Forks</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-light text-white mb-1">{profile.public_gists}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Public Gists</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="text-3xl font-light text-white mb-1">{statistics.total_organizations}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Organizations</div>
                  </div>
                </div>
              </AnimatedCard>

              {/* Profile Age */}
              <AnimatedCard index={6} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                <p className="text-sm text-gray-400">
                  Member since <span className="text-white font-bold">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(profile.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </AnimatedCard>
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
