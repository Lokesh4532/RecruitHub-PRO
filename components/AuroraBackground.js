'use client';

import { motion } from 'framer-motion';

export default function AuroraBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617]">
      
      {/* Moving Rippled Curtain Effect */}
      <motion.div 
        className="absolute inset-0 opacity-60"
        animate={{
          backgroundPositionX: ['0px', '240px'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, #020617 0%, #2563eb 50%, #020617 100%)`,
          backgroundSize: '120px 100%',
        }}
      />

      {/* Top and Bottom Fade to create depth and stage effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] pointer-events-none" />

      {/* Central soft glow for emphasis */}
      <motion.div 
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none"
      />

      {/* Subtle fine vertical lines for added texture */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px, transparent 19px, rgba(255,255,255,0.1) 19px, rgba(255,255,255,0.1) 20px)`,
          backgroundSize: '20px 100%',
        }}
      />
    </div>
  );
}
