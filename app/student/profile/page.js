'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import PageTransition from '@/components/PageTransition';
import AnimatedCyberBackground from '@/components/AnimatedCyberBackground';
import AnimatedCard from '@/components/AnimatedCard';
import { User, Camera, Upload, Link as LinkIcon, Plus, X, ArrowLeft, FileText, CheckCircle, GitBranch, BarChart2, Briefcase, GraduationCap, Award, MessageSquare, Star, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);
  const [githubUsername, setGithubUsername] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    linkedin_url: '',
    current_year: '',
    gpa: '',
    degree: '',
    university: '',
    graduation_year: '',
    major: '',
    skills: [],
    achievements: []
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/student/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        const edu = data.resume_parsed_data?.education || {};
        
        setFormData({
          name: data.user_id?.name || '',
          phone: data.phone || '',
          linkedin_url: data.linkedin_url || '',
          current_year: data.current_year || '',
          gpa: data.gpa || edu.gpa || '',
          degree: edu.degree || '',
          university: edu.university || '',
          graduation_year: edu.graduation_year || '',
          major: edu.major || '',
          skills: data.resume_parsed_data?.skills || [],
          achievements: data.achievements || []
        });
        
        setGithubUsername(data.github_data?.username || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      alert('Please upload a PDF file');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('resume', file);

    try {
      const response = await fetch('/api/student/upload-resume', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok) {
        alert('Resume uploaded & parsed successfully!');
        await fetchProfile();
      } else {
        alert(data.error || 'Failed to upload resume');
      }
    } catch (error) {
      alert('Error uploading resume: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or WEBP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      const response = await fetch('/api/student/upload-photo', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok) {
        alert('Photo uploaded successfully!');
        await fetchProfile();
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (error) {
      alert('Error uploading photo: ' + error.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, WEBP, or PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingIdCard(true);
    const formDataUpload = new FormData();
    formDataUpload.append('idcard', file);

    try {
      const response = await fetch('/api/student/upload-idcard', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (response.ok) {
        alert('ID Card uploaded successfully!');
        await fetchProfile();
      } else {
        alert(data.error || 'Failed to upload ID card');
      }
    } catch (error) {
      alert('Error uploading ID card: ' + error.message);
    } finally {
      setUploadingIdCard(false);
    }
  };

  const handleConnectGithub = async () => {
    if (!githubUsername.trim()) {
      alert('Please enter your GitHub username');
      return;
    }

    setConnectingGithub(true);
    try {
      const response = await fetch('/api/student/connect-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_username: githubUsername })
      });

      const data = await response.json();

      if (response.ok) {
        alert('GitHub connected successfully!');
        await fetchProfile();
      } else {
        alert(data.error || 'Failed to connect GitHub');
      }
    } catch (error) {
      alert('Error connecting GitHub');
    } finally {
      setConnectingGithub(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        alert('Profile updated successfully!');
        await fetchProfile();
      } else {
        alert('Failed to update profile: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const skill = prompt('Enter skill name:');
    if (skill && skill.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill.trim()]
      });
    }
  };

  const removeSkill = (index) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    setFormData({ ...formData, skills: newSkills });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...formData.achievements, { title: '', description: '', date: '' }]
    });
  };

  const updateAchievement = (index, field, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index][field] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const removeAchievement = (index) => {
    const newAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: newAchievements });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20"></div>
      </div>
    );
  }

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
                  <User size={28} className="text-white/70" />
                  Your Profile
                </h1>
                <p className="text-gray-400 font-medium mt-1">Manage your details, resume, and portfolio.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/student/dashboard')}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 flex items-center gap-2 text-sm transition-colors"
                >
                  <ArrowLeft size={18} /> Dashboard
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold flex items-center gap-2 text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          </div>
        </header>

        <PageTransition className="max-w-7xl mx-auto px-8 py-10">
          {/* Profile Header Cover */}
          <AnimatedCard index={0} className="mb-8 overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="h-48 bg-[#0a0a0a] border-b border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              {/* Optional background subtle pattern could go here */}
            </div>
            
            <div className="px-8 pb-8 relative">
              <div className="flex flex-col md:flex-row gap-8 -mt-20">
                {/* Profile Photo */}
                <div className="relative group">
                  {profile?.profile_photo_url ? (
                    <img 
                      src={profile.profile_photo_url} 
                      alt="Profile"
                      className="w-40 h-40 rounded-2xl border-4 border-[#050505] shadow-2xl object-cover bg-white/[0.05]"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-2xl border-4 border-[#050505] shadow-2xl bg-white/5 flex items-center justify-center">
                      <User size={64} className="text-white/20" />
                    </div>
                  )}
                  
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto ? (
                      <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Camera className="text-white w-8 h-8" />
                    )}
                  </label>
                </div>

                {/* Name and Quick Info */}
                <div className="flex-1 md:mt-24">
                  <div className="mb-2">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="text-4xl font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-white/40 focus:outline-none transition-colors w-full max-w-md pb-1"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <p className="text-lg text-gray-400 font-medium">
                    {formData.degree || 'Student'} {formData.university && `at ${formData.university}`}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">{profile?.user_id?.email}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-6">
                    {formData.current_year && (
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                        {formData.current_year}
                      </span>
                    )}
                    {formData.phone && (
                      <span className="px-3 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-md text-xs font-medium">
                        {formData.phone}
                      </span>
                    )}
                    {formData.linkedin_url && (
                      <a 
                        href={formData.linkedin_url.startsWith('http') ? formData.linkedin_url : `https://${formData.linkedin_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-white/5 border border-white/10 text-white hover:bg-white/10 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <LinkIcon size={12} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Extra Actions */}
                <div className="md:mt-24 flex gap-3 h-fit">
                  {profile?.resume_url && (
                    <a
                      href={profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
                    >
                      <FileText size={18} /> View Resume
                    </a>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <AnimatedCard index={1} className="p-8 bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                  <User className="text-white/50" /> Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Current Year</label>
                    <select
                      value={formData.current_year}
                      onChange={(e) => setFormData({ ...formData, current_year: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm appearance-none"
                    >
                      <option value="" className="bg-[#0a0a0a]">Select Year</option>
                      <option value="1st Year" className="bg-[#0a0a0a]">1st Year</option>
                      <option value="2nd Year" className="bg-[#0a0a0a]">2nd Year</option>
                      <option value="3rd Year" className="bg-[#0a0a0a]">3rd Year</option>
                      <option value="4th Year" className="bg-[#0a0a0a]">4th Year</option>
                      <option value="Graduate" className="bg-[#0a0a0a]">Graduate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">GPA</label>
                    <input
                      type="text"
                      value={formData.gpa}
                      onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="3.8"
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Education */}
              <AnimatedCard index={2} className="p-8 bg-white/[0.02] border border-white/5">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                  <GraduationCap className="text-white/50" /> Education
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Degree</label>
                    <input
                      type="text"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="Bachelor of Science"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Major/Field</label>
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">University</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="University Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Graduation Year</label>
                    <input
                      type="text"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors text-sm"
                      placeholder="2025"
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Skills */}
              <AnimatedCard index={3} className="p-8 bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Briefcase className="text-white/50" /> Skills
                  </h2>
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Skill
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length === 0 ? (
                    <p className="text-gray-500 text-sm italic w-full text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10">No skills added. Upload resume to parse automatically.</p>
                  ) : (
                    formData.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-white rounded-lg text-sm font-medium group transition-colors hover:bg-white/20">
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(idx)}
                          className="text-white/50 hover:text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </AnimatedCard>

              {/* Achievements */}
              <AnimatedCard index={4} className="p-8 bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <Award className="text-white/50" /> Achievements
                  </h2>
                  <button
                    onClick={addAchievement}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus size={14} /> Add Achievement
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-white text-sm uppercase tracking-widest text-gray-500">Achievement #{index + 1}</h3>
                        <button
                          onClick={() => removeAchievement(index)}
                          className="text-gray-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X size={12} /> Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                            placeholder="Achievement Title"
                            className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors text-sm"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <textarea
                            value={achievement.description}
                            onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                            placeholder="Description"
                            rows="3"
                            className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors text-sm resize-none"
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            value={achievement.date}
                            onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                            className="w-full px-4 py-3 bg-[#050505] border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/30 transition-colors text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {formData.achievements.length === 0 && (
                    <p className="text-center text-gray-500 italic py-10 bg-white/5 rounded-xl border border-dashed border-white/10 text-sm">
                      No achievements added yet.
                    </p>
                  )}
                </div>
              </AnimatedCard>
              
              {/* Recommendations Section */}
              <AnimatedCard index={5} className="p-8 bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <MessageSquare className="text-white/50" /> Recommendations
                  </h2>
                  <div className="px-3 py-1.5 bg-white/10 rounded-md text-xs font-bold text-white">
                    {profile?.recommendations?.length || 0} Total
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                  <h3 className="font-bold text-white mb-2 text-sm">Get Recommendations</h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Share this link with your professors, mentors, or colleagues.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/recommend/${profile?._id}`}
                      readOnly
                      className="flex-1 px-4 py-2.5 bg-[#050505] border border-white/10 rounded-lg text-white text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/recommend/${profile?._id}`);
                        alert('Link copied to clipboard!');
                      }}
                      className="px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors text-xs font-bold whitespace-nowrap"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                {profile?.recommendations && profile.recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {profile.recommendations.map((rec, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-white">{rec.recommender_name}</h4>
                            <p className="text-xs text-gray-400">{rec.recommender_role} {rec.organization && `at ${rec.organization}`}</p>
                          </div>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={i < rec.rating ? 'text-white fill-white' : 'text-gray-600'} />
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                          {[
                            { label: 'Tech', value: rec.skills_rating?.technical },
                            { label: 'Comm', value: rec.skills_rating?.communication },
                            { label: 'Team', value: rec.skills_rating?.teamwork },
                            { label: 'Lead', value: rec.skills_rating?.leadership },
                            { label: 'Solve', value: rec.skills_rating?.problem_solving }
                          ].map((skill, idx) => (
                            <div key={idx} className="bg-[#050505] rounded-md py-2 text-center border border-white/5">
                              <div className="text-[10px] text-gray-500 uppercase font-bold">{skill.label}</div>
                              <div className="text-sm font-bold text-white">{skill.value || 0}/5</div>
                            </div>
                          ))}
                        </div>

                        <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-white/20 pl-4 mb-4">
                          "{rec.recommendation_text}"
                        </p>

                        <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                          <span>{new Date(rec.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          {rec.would_hire_again && (
                            <span className="text-white font-bold flex items-center gap-1"><CheckCircle size={12} /> Recommended Hire</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">
                    <p className="text-gray-400 text-sm">No recommendations yet</p>
                  </div>
                )}
              </AnimatedCard>
            </div>

            {/* Sidebar Tools */}
            <div className="lg:col-span-1 space-y-6">
              {/* Resume Upload */}
              <AnimatedCard index={2} className="p-6 bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2 border-b border-white/5 pb-4">
                  <FileText className="text-white/50" size={18} /> Upload Resume
                </h3>
                <p className="text-xs text-gray-400 mb-4 mt-4">Auto-fill profile from your PDF resume</p>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {uploading ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Upload size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    )}
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                      {uploading ? 'Parsing...' : 'Select PDF'}
                    </span>
                  </div>
                </label>
                {profile?.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-bold text-white hover:text-gray-300 mt-4 transition-colors">
                    View Current Resume →
                  </a>
                )}
              </AnimatedCard>

              {/* ID Card Upload */}
              <AnimatedCard index={3} className="p-6 bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2 border-b border-white/5 pb-4">
                  <User className="text-white/50" size={18} /> Student ID Card
                </h3>
                <p className="text-xs text-gray-400 mb-4 mt-4">Verify your student status</p>
                <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleIdCardUpload}
                    disabled={uploadingIdCard}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-2">
                    {uploadingIdCard ? (
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Upload size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                    )}
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                      {uploadingIdCard ? 'Uploading...' : 'Select ID File'}
                    </span>
                  </div>
                </label>
                {profile?.id_card_url && (
                  <a href={profile.id_card_url} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-bold text-white hover:text-gray-300 mt-4 transition-colors">
                    View Current ID Card →
                  </a>
                )}
              </AnimatedCard>

              {/* GitHub Connect */}
              <AnimatedCard index={4} className="p-6 bg-white/[0.02] border border-white/5">
                <h3 className="font-bold text-white mb-2 flex items-center gap-2 border-b border-white/5 pb-4">
                  <GitBranch className="text-white/50" size={18} /> Connect GitHub
                </h3>
                <p className="text-xs text-gray-400 mb-4 mt-4">Showcase repos & code stats</p>
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="GitHub username"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition-colors text-sm"
                  />
                  <button
                    onClick={handleConnectGithub}
                    disabled={connectingGithub}
                    className="w-full px-4 py-2.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    {connectingGithub ? 'Connecting...' : 'Sync GitHub'}
                  </button>
                </div>
                {profile?.github_data?.username && (
                  <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                    <CheckCircle size={14} className="text-white" />
                    <span className="text-xs font-bold text-white">Connected: {profile.github_data.username}</span>
                  </div>
                )}
              </AnimatedCard>

              {/* GitHub Analytics Pro */}
              {(profile?.github_username || profile?.github_data?.username) && (
                <AnimatedCard index={5} className="p-6 bg-white/[0.02] border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2 border-b border-white/5 pb-4">
                    <BarChart2 className="text-white" size={18} /> GitHub Analytics
                  </h3>
                  <p className="text-xs text-gray-400 mb-4 mt-4">Deep dive into your repos, commit history, and languages</p>
                  <button
                    onClick={() => router.push('/student/github-analytics')}
                    className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors border border-white/20 flex items-center justify-center gap-2"
                  >
                    View Analytics Dashboard
                  </button>
                </AnimatedCard>
              )}
            </div>
          </div>
        </PageTransition>
      </div>
    </div>
  );
}
