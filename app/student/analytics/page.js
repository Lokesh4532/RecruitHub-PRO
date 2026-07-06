'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PieChart, Pie, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import AnimatedCard from '@/components/AnimatedCard';
import { BarChart2, LogOut, Target, Briefcase, ListChecks, ChevronRight, Award } from 'lucide-react';

export default function StudentAnalytics() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/student/analytics', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login?role=student');
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include' 
    });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    );
  }

  const COLORS = ['#ffffff', '#a855f7', '#3b82f6', '#10b981', '#ec4899'];

  return (
    <div className="min-h-screen relative font-sans text-gray-200">
      <AnimatedCyberBackground />
      <Sidebar role="student" />
      
      <div className="ml-[260px] relative z-10 pb-20">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <BarChart2 size={28} className="text-white/70" />
                My Career Analytics
              </h1>
              <p className="text-gray-400 font-medium mt-1">Track your profile strength and application metrics.</p>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {/* Profile Strength & Key Metrics */}
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            <AnimatedCard index={0} className="p-8 bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Profile Strength</div>
                <Target size={20} className="text-white/30" />
              </div>
              <div className="text-6xl font-light text-white tracking-tight mb-4">
                {analytics?.profile_strength || 0}<span className="text-3xl text-gray-500 ml-1">%</span>
              </div>
              <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 border border-white/10">
                <div 
                  className="bg-white h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${analytics?.profile_strength || 0}%`, boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
                ></div>
              </div>
            </AnimatedCard>

            <AnimatedCard index={1} className="p-8 bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Applications</div>
                <Briefcase size={20} className="text-white/30" />
              </div>
              <div className="text-6xl font-light text-white tracking-tight mb-2">
                {analytics?.total_applications || 0}
              </div>
              <div className="text-sm font-medium text-gray-400">Total jobs applied to</div>
            </AnimatedCard>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-10">
            {/* Application Status Breakdown */}
            <AnimatedCard index={2} className="p-8 bg-white/[0.02] border border-white/5">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <PieChart className="text-white/50" /> Application Status
              </h2>
              {analytics?.status_breakdown && analytics.status_breakdown.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.status_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics.status_breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                  No application data yet
                </div>
              )}
            </AnimatedCard>

            {/* Profile Completion Checklist */}
            <AnimatedCard index={3} className="p-8 bg-white/[0.02] border border-white/5">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                <ListChecks className="text-white/50" /> Profile Completion
              </h2>
              <div className="space-y-3">
                {analytics?.profile_checklist && analytics.profile_checklist.map((item, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${item.completed ? 'bg-white/5 border-white/10' : 'bg-[#050505] border-dashed border-white/10 opacity-70'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      item.completed ? 'bg-white text-black' : 'bg-white/5 text-gray-600 border border-white/10'
                    }`}>
                      {item.completed && <Award size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm truncate ${item.completed ? 'text-white' : 'text-gray-400'}`}>{item.name}</div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">{item.description}</div>
                    </div>
                    <div className="text-xs font-bold bg-[#0a0a0a] px-2.5 py-1 rounded-md text-gray-400 border border-white/5">
                      +{item.points}%
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </div>

          {/* Recommendations */}
          <AnimatedCard index={4} className="p-8 bg-white/[0.02] border border-white/5">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
              <Target className="text-white/50" /> Recommendations to Improve
            </h2>
            <div className="grid gap-4">
              {analytics?.recommendations && analytics.recommendations.length > 0 ? (
                analytics.recommendations.map((rec, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-colors group">
                    <div className="text-2xl opacity-70 group-hover:opacity-100 transition-opacity bg-[#0a0a0a] w-12 h-12 flex items-center justify-center rounded-full border border-white/5 shrink-0">
                      {rec.icon || '🚀'}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold text-sm mb-1">{rec.title}</div>
                      <div className="text-gray-400 text-xs leading-relaxed">{rec.description}</div>
                    </div>
                    <button 
                      onClick={() => router.push(rec.action_link)}
                      className="mt-4 sm:mt-0 px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-2"
                    >
                      {rec.action_text} <ChevronRight size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 text-sm italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                  Great job! Keep applying to more jobs.
                </div>
              )}
            </div>
          </AnimatedCard>
        </PageTransition>
      </div>
    </div>
  );
}
