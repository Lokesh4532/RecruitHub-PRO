'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import { BarChart2, Briefcase, FileText, Users, TrendingUp, AlertTriangle, Lightbulb, ArrowLeft } from 'lucide-react';

export default function RecruiterAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/recruiter/analytics', {
        credentials: 'include',
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?role=recruiter');
          return;
        }
        throw new Error('Failed to fetch analytics');
      }
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const skillGapData = analytics?.skill_gaps?.slice(0, 8).map(gap => ({
    skill: gap.skill.charAt(0).toUpperCase() + gap.skill.slice(1),
    Demand: gap.demand,
    Supply: gap.supply,
    Gap: gap.gap
  })) || [];

  const universityData = analytics?.university_distribution?.slice(0, 6).map(uni => ({
    name: uni.name || 'Unknown',
    value: uni.count
  })) || [];

  const degreeData = analytics?.degree_distribution?.slice(0, 5).map(deg => ({
    name: deg.name || 'Unknown',
    value: deg.count
  })) || [];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#14b8a6'];

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
                  Analytics Dashboard
                </h1>
                <p className="text-gray-400 font-medium mt-1">Real-time recruitment insights and metrics</p>
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
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-white/10"></div>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <AnimatedCard index={0} className="p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-300">
                      <Briefcase size={24} />
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total Jobs</div>
                  <div className="text-3xl font-extrabold text-white">{analytics?.total_jobs || 0}</div>
                  <div className="text-green-400 text-xs mt-2 font-bold flex items-center gap-1">✓ Active: {analytics?.active_jobs || 0}</div>
                </AnimatedCard>
                
                <AnimatedCard index={1} className="p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-300">
                      <FileText size={24} />
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Applications</div>
                  <div className="text-3xl font-extrabold text-white">{analytics?.total_applications || 0}</div>
                  <div className="text-gray-300 text-xs mt-2 font-bold">Avg: {analytics?.average_applications_per_job || 0}/job</div>
                </AnimatedCard>
                
                <AnimatedCard index={2} className="p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gray-300">
                      <Users size={24} />
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Candidates</div>
                  <div className="text-3xl font-extrabold text-white">{analytics?.total_students || 0}</div>
                  <div className="text-gray-300 text-xs mt-2 font-bold">In talent pool</div>
                </AnimatedCard>
                
                <AnimatedCard index={3} className="p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-400">
                      <TrendingUp size={24} />
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Conversion</div>
                  <div className="text-3xl font-extrabold text-white">{analytics?.conversion_rate || 0}%</div>
                  <div className="text-green-400 text-xs mt-2 font-bold">Acceptance rate</div>
                </AnimatedCard>
                
                <AnimatedCard index={4} className="p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                      <AlertTriangle size={24} />
                    </div>
                  </div>
                  <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Skill Gaps</div>
                  <div className="text-3xl font-extrabold text-white">
                    {analytics?.skill_gaps?.filter(g => g.gap_percentage > 50).length || 0}
                  </div>
                  <div className="text-red-600 text-xs mt-2 font-bold">Critical shortage</div>
                </AnimatedCard>
              </div>

              {/* Main Charts Row */}
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Application Funnel */}
                <AnimatedCard index={5} className="p-8 border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart2 className="text-gray-300" />
                    Application Funnel
                  </h2>
                  {analytics?.application_funnel && analytics.application_funnel.length > 0 ? (
                    <div className="space-y-6">
                      {analytics.application_funnel.map((stage, index) => (
                        <div key={stage.stage} className="relative">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-white font-bold">{stage.stage}</span>
                            <span className="text-gray-300 font-medium">{stage.count} ({stage.percentage}%)</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-8 relative overflow-hidden shadow-inner">
                            <div 
                              className={`h-8 rounded-full transition-all duration-1000 flex items-center px-4 ${
                                index === 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                                index === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                index === 2 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                                'bg-gradient-to-r from-green-500 to-emerald-500'
                              }`}
                              style={{ width: `${stage.percentage}%` }}
                            >
                              <span className="text-white font-bold text-sm">{stage.percentage}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 font-medium">No application data available</div>
                  )}
                  <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/5">
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-gray-300">{analytics?.shortlist_rate || 0}%</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Shortlist Rate</div>
                    </div>
                    <div className="text-center border-l border-r border-white/5">
                      <div className="text-2xl font-extrabold text-green-400">{analytics?.conversion_rate || 0}%</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Conversion Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-extrabold text-orange-600">{analytics?.average_time_to_apply || 0}d</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">Avg Time</div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Applications Trend */}
                <AnimatedCard index={6} className="p-8 border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-gray-300" />
                    Applications Trend (30 Days)
                  </h2>
                  {analytics?.applications_over_time && analytics.applications_over_time.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.applications_over_time}>
                        <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="date" stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#ffffff', border: 'none', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="applications" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorApps)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium">
                      No recent application data
                    </div>
                  )}
                </AnimatedCard>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Skill Gap Chart */}
                <AnimatedCard index={7} className="p-8 border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-orange-600" />
                    Skill Supply vs Demand
                  </h2>
                  {skillGapData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={skillGapData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis dataKey="skill" stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Legend iconType="circle" />
                        <Bar dataKey="Demand" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Supply" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium">No skill data available</div>
                  )}
                </AnimatedCard>

                {/* University Chart */}
                <AnimatedCard index={8} className="p-8 border border-white/5">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="text-gray-300" />
                    Candidate Universities
                  </h2>
                  {universityData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={universityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {universityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Legend iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium">No university data available</div>
                  )}
                </AnimatedCard>
              </div>

              {/* AI Insights */}
              <AnimatedCard index={9} className="p-8 border border-white/10 bg-white/[0.02] mb-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" />
                  AI-Powered Recruitment Insights
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/10">
                    <h4 className="font-extrabold text-green-400 mb-4 flex items-center gap-2">✓ Key Strengths</h4>
                    <div className="space-y-3">
                      {analytics?.skill_gaps?.filter(g => g.gap_percentage <= 0).length > 0 ? (
                        analytics.skill_gaps.filter(g => g.gap_percentage <= 0).slice(0, 3).map((gap, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-2 flex-shrink-0" />
                            <p className="text-gray-200 font-medium">
                              <span className="capitalize font-bold text-white">{gap.skill}</span>: Excellent supply ({gap.supply} candidates for {gap.demand} positions)
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-300 font-medium">Focus on building your candidate pool</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/10">
                    <h4 className="font-extrabold text-red-400 mb-4 flex items-center gap-2"> Action Required</h4>
                    <div className="space-y-3">
                      {analytics?.skill_gaps?.filter(g => g.gap_percentage > 50).length > 0 ? (
                        analytics.skill_gaps.filter(g => g.gap_percentage > 50).slice(0, 3).map((gap, idx) => (
                          <div key={idx} className="flex gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 mt-2 flex-shrink-0" />
                            <p className="text-gray-200 font-medium">
                              Urgently recruit <span className="capitalize font-bold text-white">{gap.skill}</span> talent (need {gap.gap} more)
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-300 font-medium">All critical skills are well covered!</p>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>

            </>
          )}
        </PageTransition>
      </div>
    </div>
  );
}
