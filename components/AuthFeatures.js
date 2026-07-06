'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, LineChart, Target, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

const features = [
  {
    id: 0,
    icon: BrainCircuit,
    color: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    bgGlow: 'bg-blue-500/10',
    title: "AI-Powered Matching",
    desc: "Our advanced AI perfectly matches candidates to jobs based on skills, experience, and nuanced cultural fit instantly."
  },
  {
    id: 1,
    icon: LineChart,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/30',
    bgGlow: 'bg-cyan-500/10',
    title: "Smart Analytics",
    desc: "Gain profound insights into your hiring pipeline and candidate performance with real-time analytics."
  },
  {
    id: 2,
    icon: Target,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-500/30',
    bgGlow: 'bg-indigo-500/10',
    title: "Cultural Fit Analysis",
    desc: "Ensure long-term success by assessing candidates' alignment with your company's core values."
  },
  {
    id: 3,
    icon: Zap,
    color: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    bgGlow: 'bg-purple-500/10',
    title: "Automated Screening",
    desc: "Save hundreds of hours with automated resume parsing and initial candidate screening."
  }
];

export default function AuthFeatures() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-playing slideshow of cards
  useEffect(() => {
    if (isHovered) return; // Pause on hover
    
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % features.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + features.length) % features.length);

  return (
    <div className="w-full flex flex-col justify-start h-full pt-4 lg:pt-10">
      
      {/* Top Left Heading Area */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-blue-400 mr-2 animate-pulse"></span>
          <span className="text-blue-300 text-xs font-bold tracking-widest uppercase">Welcome to RecruitPro</span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tighter">
          The future of <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">
            smart campus hiring.
          </span>
        </h1>
        
        <p className="text-gray-300 text-lg leading-relaxed max-w-xl font-medium">
          Connect top-tier talent with global companies. Experience a seamless, AI-driven recruitment journey designed to save you time.
        </p>
      </motion.div>

      {/* Row of Sliding Cards */}
      <div 
        className="relative w-full max-w-[550px] overflow-hidden py-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className="flex"
          animate={{ x: `calc(-${activeIndex * 100}%)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="min-w-full px-2">
                {/* Individual Card */}
                <div className={`relative h-[220px] bg-white/5 border border-white/10 backdrop-blur-xl rounded-[28px] p-8 shadow-2xl flex flex-col justify-center overflow-hidden transition-colors hover:${feature.bgGlow} hover:${feature.borderColor}`}>
                  
                  {/* Subtle Background Glow per card */}
                  <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none transition-colors ${feature.bgGlow}`} />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-black/30 flex items-center justify-center mb-5 border border-white/5 shadow-lg">
                      <Icon className={`h-7 w-7 ${feature.color}`} />
                    </div>
                    <h3 className="font-extrabold text-2xl mb-2 text-white tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-between mt-6 px-2">
          {/* Dots Indicator */}
          <div className="flex gap-2">
            {features.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeIndex ? 'w-8 bg-blue-400' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
