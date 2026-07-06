'use client';

import { motion } from 'framer-motion';

export default function AnimatedCyberBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#050505] overflow-hidden">
      
      {/* Central deep glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-[100px] pointer-events-none" />

      {/* High-end SaaS concentric dotted burst pattern */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-screen pointer-events-none flex items-center justify-center">
        <div className="w-[150vw] h-[150vw] absolute animate-[spin_240s_linear_infinite]"
             style={{
               backgroundImage: `repeating-radial-gradient(circle at center, transparent 0, transparent 4px, rgba(255,255,255,0.8) 4px, rgba(255,255,255,0.8) 5px)`,
               backgroundSize: '40px 40px',
               maskImage: 'radial-gradient(circle at center, black 10%, transparent 60%)',
               WebkitMaskImage: 'radial-gradient(circle at center, black 10%, transparent 60%)'
             }}
        />
        
        {/* intersecting lines to create the burst effect */}
        <div className="w-[150vw] h-[150vw] absolute animate-[spin_300s_linear_infinite_reverse]"
             style={{
               backgroundImage: `repeating-conic-gradient(from 0deg, transparent 0deg, transparent 2deg, rgba(255,255,255,0.5) 2deg, rgba(255,255,255,0.5) 2.5deg)`,
               maskImage: 'radial-gradient(circle at center, transparent 10%, black 40%, transparent 70%)',
               WebkitMaskImage: 'radial-gradient(circle at center, transparent 10%, black 40%, transparent 70%)'
             }}
        />
      </div>
      
      {/* Top light leak */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[200px] bg-white/[0.03] rounded-[100%] blur-[60px]" />

      {/* Noise texture overlay for premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
