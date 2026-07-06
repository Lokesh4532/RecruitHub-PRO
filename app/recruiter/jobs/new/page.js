'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Script from 'next/script';

export default function NewJob() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // tracking payment status visually
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary_range: '',
    experience_level: 'Entry Level',
    required_skills: ''
  });

  const handlePaymentAndSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Razorpay Order
      setPaymentStatus('Initializing Payment...');
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 499 }) // Charging ₹499 for a standard job post !
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error('Failed to start payment');
      }

      // 2. Open Razorpay Widget
      const options = {
        key: process.env.NEXT_PUBLIC_KEY_ID, 
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "RecruitHirePro",
        description: `Job Posting: ${formData.title}`,
        order_id: orderData.order.id,
        handler: async function (response) {
          setPaymentStatus('Verifying Payment...');
          
          // 3. Verify Payment
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            body: JSON.stringify(response),
            headers: { 'Content-Type': 'application/json' },
          });

          const verifyResult = await verifyRes.json();
          
          if (verifyResult.success) {
             setPaymentStatus('Payment Verified! Saving Job...');
             await saveJobToDatabase();
          } else {
             alert('Payment verification failed.');
             setLoading(false);
             setPaymentStatus(null);
          }
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: function() {
            setLoading(false);
            setPaymentStatus(null);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error) {
      console.error(error);
      alert('Error initializing payment checkout.');
      setLoading(false);
      setPaymentStatus(null);
    }
  };

  const saveJobToDatabase = async () => {
    try {
      const skills = formData.required_skills.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await fetch('/api/recruiter/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          required_skills: skills
        })
      });

      if (response.ok) {
        alert('Job Paid for and Posted Successfully!');
        router.push('/recruiter/jobs');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to finish posting job to database');
        setLoading(false);
      }
    } catch (error) {
      alert('Error communicating with database after payment!');
      setLoading(false);
    }
  };

  if (loading && formData.title) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">{paymentStatus || 'Processing...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Script id="razorpay-checkout-js" src="https://checkout.razorpay.com/v1/checkout.js" />
      <Sidebar role="recruiter" />
      <div className="ml-[260px]">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl border-b border-white/10/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-400 to-pink-400">Post New Job</h1>
                <p className="text-gray-300">Create a new job posting</p>
              </div>
              <button
                onClick={() => router.push('/recruiter/jobs')}
                className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-modern p-8">
          <form onSubmit={handlePaymentAndSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input-modern"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="5"
                className="input-modern"
                placeholder="Describe the role, responsibilities, and requirements..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-modern"
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Salary Range *
                </label>
                <input
                  type="text"
                  required
                  value={formData.salary_range}
                  onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                  className="input-modern"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Experience Level *
              </label>
              <select
                value={formData.experience_level}
                onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                className="input-modern"
              >
                <option value="Entry Level">Entry Level</option>
                <option value="Mid Level">Mid Level</option>
                <option value="Senior Level">Senior Level</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Required Skills *
              </label>
              <input
                type="text"
                required
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                className="input-modern"
                placeholder="e.g., JavaScript, React, Node.js, MongoDB (comma-separated)"
              />
              <p className="mt-2 text-sm text-gray-400">
                Enter skills separated by commas
              </p>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-colors flex-1"
              >
                {loading ? 'Posting...' : 'Post Job'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/recruiter/jobs')}
                className="px-5 py-2.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 rounded-xl font-bold transition-colors px-6"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
}
