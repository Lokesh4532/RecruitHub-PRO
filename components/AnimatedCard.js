'use client';

import { motion } from 'framer-motion';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  in: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

export default function AnimatedCard({ children, className = '', index = 0, onClick }) {
  const isInteractive = !!onClick;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      whileInView="in"
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05 }}
      whileHover={isInteractive ? { y: -4, scale: 1.01 } : {}}
      whileTap={isInteractive ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:border-white/10 transition-all duration-300 overflow-hidden ${
        isInteractive ? 'cursor-pointer hover:bg-[#111111]/90' : ''
      } ${className}`}
    >
      {/* Subtle top light reflection for glass effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
}
