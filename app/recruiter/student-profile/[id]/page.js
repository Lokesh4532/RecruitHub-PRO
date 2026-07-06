'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c'];

export default function RecruiterViewStudentProfile() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id;
  
  const [student, setStudent] = useState(null);
  const [githubAnalytics, setGithubAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile'); // profile, github

  useEffect(() => {
    if (studentId) {
      fetchStudentProfile();
    }
  }, [studentId]);

  const fetchStudentProfile = async () => {
    try {
      const response = await fetch(`/api/recruiter/student-profile/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setStudent(data.student);
        if (data.github_analytics) {
          setGithubAnalytics(data.github_analytics);
        }
      } else {
        alert('Failed to load student profile');
        router.push('/recruiter/shortlist');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      alert('Error loading profile');
      router.push('/recruiter/shortlist');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="recruiter" />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading student profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar role="recruiter" />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <p className="text-red-600">Student not found</p>
          </div>
        </div>
      </div>
    );
  }

  const education = student.resume_parsed_data?.education || {};
  const skills = student.resume_parsed_data?.skills || [];
  const achievements = student.resume_parsed_data?.achievements || [];
  const experience = student.resume_parsed_data?.experience || [];
  const certifications = student.resume_parsed_data?.certifications || [];

  // GitHub Analytics data prep
  let languageData = [];
  let repoTypeData = [];
  let followData = [];

  if (githubAnalytics) {
    languageData = (githubAnalytics.languages || []).slice(0, 8).map(l => ({
      name: l.language,
      value: parseFloat(l.percentage)
    }));

    repoTypeData = [
      { name: 'Original', value: githubAnalytics.repo_type_distribution?.original || 0 },
      { name: 'Forked', value: githubAnalytics.repo_type_distribution?.forked || 0 }
    ];

    followData = [
      { name: 'Followers', value: githubAnalytics.profile?.followers || 0 },
      { name: 'Following', value: githubAnalytics.profile?.following || 0 }
    ];
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role="recruiter" />
      <div className="flex-1 ml-64">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
              <p className="text-gray-600 mt-1">Complete candidate overview</p>
            </div>
            <button 
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>

          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl mb-6 shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="px-8 pb-6 -mt-16 flex items-start gap-6">
              <div className="relative">
                {student.profile_photo_url ? (
                  <img 
                    src={student.profile_photo_url} 
                    alt={student.user_id?.name}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gray-200 flex items-center justify-center text-4xl text-gray-500">
                    
                  </div>
                )}
              </div>
              <div className="flex-1 mt-16 text-white">
                <h2 className="text-3xl font-bold">{student.user_id?.name || 'Student'}</h2>
                <p className="text-blue-100 text-lg">{education.degree || 'Student'}</p>
                <p className="text-blue-50 mt-1">{education.university || ''}</p>
                <div className="flex gap-4 mt-3 text-sm">
                  <span> {student.user_id?.email}</span>
                  {student.phone && <span> {student.phone}</span>}
                  {student.current_year && <span> {student.current_year}</span>}
                  {education.gpa && <span> GPA: {education.gpa}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                 Profile & Credentials
              </button>
              {githubAnalytics && (
                <button
                  onClick={() => setActiveTab('github')}
                  className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                    activeTab === 'github'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                   GitHub Analytics
                </button>
              )}
              {student.recommendations && student.recommendations.length > 0 && (
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                    activeTab === 'recommendations'
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                   Recommendations ({student.recommendations.length})
                </button>
              )}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">

              {/* Gamified Assessment Results */}
              {student.gamified_assessment && student.gamified_assessment.persona && (
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Gamified Cultural Assessment</h3>
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 uppercase tracking-wide font-semibold">Matched Persona:</span>
                    <div className="text-2xl font-extrabold text-indigo-600 mt-1">{student.gamified_assessment.persona}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {Object.entries(student.gamified_assessment.scores || {}).map(([trait, score]) => (
                      <div key={trait} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="text-gray-500 capitalize text-sm mb-2 font-medium">{trait}</div>
                        <div className="text-xl font-bold text-gray-800 mb-2">{score > 0 ? `+${score}` : score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4"> Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4"> Education</h3>
                <div className="space-y-2">
                  <p><span className="font-semibold">Degree:</span> {education.degree || 'N/A'}</p>
                  <p><span className="font-semibold">University:</span> {education.university || 'N/A'}</p>
                  <p><span className="font-semibold">Major:</span> {education.major || 'N/A'}</p>
                  <p><span className="font-semibold">GPA:</span> {education.gpa || 'N/A'}</p>
                  <p><span className="font-semibold">Graduation Year:</span> {education.graduation_year || 'N/A'}</p>
                </div>
              </div>

              {/* Experience */}
              {experience.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4"> Experience</h3>
                  <div className="space-y-4">
                    {experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-bold text-gray-900">{exp.title}</h4>
                        <p className="text-gray-600">{exp.company}</p>
                        {exp.duration && <p className="text-sm text-gray-500">{exp.duration}</p>}
                        {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4"> Achievements</h3>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="border-l-4 border-yellow-500 pl-4 py-2">
                        <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                        <p className="text-gray-700 text-sm mt-1">{achievement.description}</p>
                        {achievement.year && <p className="text-xs text-gray-500 mt-1">Year: {achievement.year}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {certifications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4"> Certifications</h3>
                  <ul className="list-disc list-inside space-y-2">
                    {certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700">{cert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume & ID Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {student.resume_url && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3"> Resume</h3>
                    <a
                      href={student.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                    >
                      View Resume PDF
                    </a>
                  </div>
                )}
                {student.id_card_url && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3"> Student ID</h3>
                    <a
                      href={student.id_card_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                    >
                      View ID Card
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* GitHub Analytics Tab */}
          {activeTab === 'github' && githubAnalytics && (
            <div className="space-y-6">
              {/* GitHub Profile Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-6">
                  <img 
                    src={githubAnalytics.profile.avatar_url} 
                    alt={githubAnalytics.profile.username}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold">{githubAnalytics.profile.name || githubAnalytics.profile.username}</h2>
                    <p className="text-gray-300">@{githubAnalytics.profile.username}</p>
                    {githubAnalytics.profile.bio && <p className="mt-2 text-gray-200">{githubAnalytics.profile.bio}</p>}
                  </div>
                  <div className="bg-white/20 backdrop-blur rounded-lg p-4 text-center">
                    <div className="text-4xl font-bold">{githubAnalytics.statistics.activity_score}</div>
                    <div className="text-sm text-gray-200">Activity Score</div>
                  </div>
                </div>
              </div>

              {/* GitHub Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="text-3xl font-bold text-gray-900">{githubAnalytics.statistics.total_repos}</div>
                  <div className="text-gray-600 mt-1">Total Repositories</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {githubAnalytics.statistics.original_repos} original
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                  <div className="text-3xl font-bold text-gray-900">{githubAnalytics.statistics.total_stars}</div>
                  <div className="text-gray-600 mt-1">Total Stars </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="text-3xl font-bold text-gray-900">{githubAnalytics.statistics.total_commits_recent}</div>
                  <div className="text-gray-600 mt-1">Recent Commits</div>
                </div>

                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="text-3xl font-bold text-gray-900">{githubAnalytics.profile.followers}</div>
                  <div className="text-gray-600 mt-1">Followers</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Language Distribution */}
                {languageData.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Language Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={languageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {languageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend 
                          layout="vertical" 
                          align="right" 
                          verticalAlign="middle"
                          formatter={(value, entry) => `${value}: ${entry.payload.value}%`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Repository Types */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Repository Types</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={repoTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {repoTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#0088FE' : '#00C49F'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value, entry) => `${value}: ${entry.payload.value} repos`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top Repositories */}
              {githubAnalytics.top_repos && githubAnalytics.top_repos.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4"> Top Repositories</h3>
                  <div className="space-y-4">
                    {githubAnalytics.top_repos.map((repo, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <a 
                          href={repo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-lg font-semibold text-blue-600 hover:underline"
                        >
                          {repo.name}
                        </a>
                        <p className="text-gray-600 text-sm mt-1">{repo.description || 'No description'}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {repo.language && <span>{repo.language}</span>}
                          <span> {repo.stars}</span>
                          <span> {repo.forks}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && student.recommendations && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                  <div className="text-3xl font-bold text-gray-900">{student.recommendations.length}</div>
                  <div className="text-gray-600 mt-1">Total Recommendations</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                  <div className="text-3xl font-bold text-gray-900">
                    {student.recommendations.filter(r => r.verified).length}
                  </div>
                  <div className="text-gray-600 mt-1">Verified</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                  <div className="text-3xl font-bold text-gray-900">
                    {student.recommendations.length > 0 
                      ? (student.recommendations.reduce((sum, r) => sum + (r.rating || 0), 0) / student.recommendations.length).toFixed(1)
                      : '0'
                    }
                  </div>
                  <div className="text-gray-600 mt-1">Average Rating</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.round((student.recommendations.filter(r => r.would_hire_again).length / student.recommendations.length) * 100)}%
                  </div>
                  <div className="text-gray-600 mt-1">Would Recommend</div>
                </div>
              </div>

              {/* Recommendations List */}
              <div className="space-y-6">
                {student.recommendations.map((rec, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xl">{rec.recommender_name}</h4>
                        <p className="text-sm text-gray-600 font-semibold">{rec.recommender_role} {rec.organization && `at ${rec.organization}`}</p>
                        <p className="text-sm text-gray-500">{rec.recommender_email}</p>
                        {rec.relationship && (
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50 inline-block px-3 py-1 rounded">
                            {rec.relationship}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-2xl ${i < rec.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                              
                            </span>
                          ))}
                        </div>
                        {rec.verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skills Ratings */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-gray-900 mb-3">Skills Assessment</h5>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { label: ' Technical', value: rec.skills_rating?.technical },
                          { label: ' Communication', value: rec.skills_rating?.communication },
                          { label: ' Teamwork', value: rec.skills_rating?.teamwork },
                          { label: ' Leadership', value: rec.skills_rating?.leadership },
                          { label: ' Problem Solving', value: rec.skills_rating?.problem_solving }
                        ].map((skill, idx) => (
                          <div key={idx} className="bg-white rounded-lg p-3 text-center shadow-sm">
                            <div className="text-xs text-gray-600 mb-1">{skill.label}</div>
                            <div className="text-lg font-bold text-blue-600">{skill.value || 0}/5</div>
                            <div className="flex gap-0.5 justify-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-xs ${i < (skill.value || 0) ? 'text-yellow-500' : 'text-gray-300'}`}>
                                  
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation Text */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold text-gray-900 mb-2">Recommendation</h5>
                      <p className="text-gray-700 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                        "{rec.recommendation_text}"
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t border-gray-200">
                      <span> {new Date(rec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      {rec.would_hire_again && (
                        <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded">
                          ✓ Would recommend for hiring
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
