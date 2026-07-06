'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthFeatures from '@/components/AuthFeatures';
import AuroraBackground from '@/components/AuroraBackground';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        router.push(formData.role === 'student' ? '/student/dashboard' : '/recruiter/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 lg:p-16 font-sans relative overflow-hidden">
      
      {/* Dark Animated Tech Background */}
      <AuroraBackground />
      
      {/* Main Container - Split Layout */}
      <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center justify-between relative z-10 gap-16">
        
        {/* Left Side - Features & Description (Floating on background) */}
        <div className="w-full lg:w-[50%] relative">
          <AuthFeatures />
        </div>

        {/* Right Side - Login Form Card */}
        <div className="w-full lg:w-[45%] flex justify-end">
          <div className="w-full max-w-[450px] bg-white rounded-[30px] shadow-2xl p-10 lg:p-12 border border-gray-100 flex flex-col items-center">
          
          {/* Tabs */}
          <div className="flex bg-white rounded-full border border-gray-200 p-1 mb-8 shadow-sm">
            <button
              onClick={() => setFormData({ ...formData, role: 'student' })}
              className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${
                formData.role === 'student'
                  ? 'bg-[#5452f6] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => setFormData({ ...formData, role: 'recruiter' })}
              className={`px-8 py-2 rounded-full text-sm font-semibold transition-all ${
                formData.role === 'recruiter'
                  ? 'bg-[#5452f6] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Recruiter
            </button>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-[380px] bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden border border-gray-100">
            {/* Card Header */}
            <div className="bg-[#5452f6] py-5 text-center">
              <h2 className="text-white font-bold text-xl tracking-wide">LOG IN</h2>
            </div>

            {error && (
              <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#5452f6] mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-gray-800 text-sm focus:border-[#5452f6] focus:outline-none focus:ring-1 focus:ring-[#5452f6] transition-all"
                  placeholder="jondoe32@gmail.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5452f6] mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#d1d5db] rounded-lg text-gray-800 text-sm focus:border-[#5452f6] focus:outline-none focus:ring-1 focus:ring-[#5452f6] transition-all tracking-widest"
                    placeholder="••••••••••"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>

              <div>
                <a href="#" className="text-xs font-semibold text-[#5452f6] hover:underline ml-1">Forgot Password?</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3.5 bg-[#5452f6] text-white rounded-lg font-bold text-sm shadow-[0_4px_14px_rgba(84,82,246,0.4)] hover:bg-[#4338ca] hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-sm text-gray-500 font-medium w-full text-center">
            Don't have an account? <Link href="/signup" className="text-[#5452f6] font-bold hover:underline">Sign up</Link>
          </p>
        </div>
        </div>

      </div>
    </div>
  );
}
