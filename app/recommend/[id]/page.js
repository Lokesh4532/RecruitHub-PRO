'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RecommendationForm() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;

  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    recommender_name: '',
    recommender_email: '',
    recommender_role: 'Professor',
    organization: '',
    relationship: '',
    rating: 5,
    technical: 4,
    communication: 4,
    teamwork: 4,
    leadership: 4,
    problem_solving: 4,
    recommendation_text: '',
    would_hire_again: true
  });

  useEffect(() => {
    fetchStudentInfo();
  }, [studentId]);

  const fetchStudentInfo = async () => {
    try {
      const response = await fetch(`/api/public/student-info/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudentName(data.name);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/student/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(' Recommendation submitted successfully! Thank you!');
        // Reset form
        setFormData({
          recommender_name: '',
          recommender_email: '',
          recommender_role: 'Professor',
          organization: '',
          relationship: '',
          rating: 5,
          technical: 4,
          communication: 4,
          teamwork: 4,
          leadership: 4,
          problem_solving: 4,
          recommendation_text: '',
          would_hire_again: true
        });
      } else {
        alert(data.error || 'Failed to submit recommendation');
      }
    } catch (error) {
      alert('Error submitting recommendation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Recommendation</h1>
            <p className="text-gray-600">for <span className="font-semibold text-blue-600">{studentName || 'Student'}</span></p>
            <p className="text-sm text-gray-500 mt-2">Your honest feedback helps recruiters make better decisions</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Your Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4"> Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={formData.recommender_name}
                    onChange={(e) => setFormData({...formData, recommender_name: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Email *</label>
                  <input
                    type="email"
                    value={formData.recommender_email}
                    onChange={(e) => setFormData({...formData, recommender_email: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    placeholder="john.smith@university.edu"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role *</label>
                  <select
                    value={formData.recommender_role}
                    onChange={(e) => setFormData({...formData, recommender_role: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    required
                  >
                    <option value="Professor">Professor</option>
                    <option value="Club Mentor">Club Mentor</option>
                    <option value="Project Guide">Project Guide</option>
                    <option value="Teaching Assistant">Teaching Assistant</option>
                    <option value="Placement Officer">Placement Officer</option>
                    <option value="HOD">HOD</option>
                    <option value="Dean">Dean</option>
                    <option value="Industry Mentor">Industry Mentor</option>
                    <option value="Senior Student">Senior Student</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({...formData, organization: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    placeholder="MIT / Google"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">How do you know the student?</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                    placeholder="e.g., Taught Data Structures course for 2 semesters"
                  />
                </div>
              </div>
            </div>

            {/* Overall Rating */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4"> Overall Rating</h3>
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-gray-700">Rate this student (1-5):</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({...formData, rating: star})}
                      className={`text-3xl ${star <= formData.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      
                    </button>
                  ))}
                </div>
                <span className="text-lg font-bold text-gray-900">{formData.rating}/5</span>
              </div>
            </div>

            {/* Skills Rating */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4"> Skills Assessment (1-5)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'technical', label: ' Technical Skills' },
                  { key: 'communication', label: ' Communication' },
                  { key: 'teamwork', label: ' Teamwork' },
                  { key: 'leadership', label: ' Leadership' },
                  { key: 'problem_solving', label: ' Problem Solving' }
                ].map(skill => (
                  <div key={skill.key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{skill.label}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={formData[skill.key]}
                      onChange={(e) => setFormData({...formData, [skill.key]: parseInt(e.target.value)})}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Poor</span>
                      <span className="font-bold text-blue-600">{formData[skill.key]}/5</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Text */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">️ Your Recommendation *</h3>
              <textarea
                value={formData.recommendation_text}
                onChange={(e) => setFormData({...formData, recommendation_text: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
                rows="6"
                placeholder="Write your honest feedback about the student's performance, skills, work ethic, and potential. Be specific with examples..."
                required
              />
              <p className="text-xs text-gray-500 mt-2">Minimum 100 characters recommended</p>
            </div>

            {/* Would Hire Again */}
            <div className="bg-pink-50 rounded-lg p-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="would_hire_again"
                  checked={formData.would_hire_again}
                  onChange={(e) => setFormData({...formData, would_hire_again: e.target.checked})}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="would_hire_again" className="text-sm font-semibold text-gray-700">
                  I would recommend this student for professional opportunities
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : ' Submit Recommendation'}
              </button>
            </div>
          </form>

          <p className="text-xs text-center text-gray-500 mt-6">
            Your recommendation will be visible to recruiters viewing this student's profile
          </p>
        </div>
      </div>
    </div>
  );
}
