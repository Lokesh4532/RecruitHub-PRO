'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Briefcase, PlusCircle, Search, Star, BarChart2, 
  User, FileText, Target, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const recruiterLinks = [
    { href: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/recruiter/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/recruiter/jobs/new', icon: PlusCircle, label: 'Post Job' },
    { href: '/recruiter/candidates', icon: Search, label: 'Search Candidates' },
    { href: '/recruiter/shortlist', icon: Star, label: 'Shortlisted' },
    { href: '/recruiter/analytics', icon: BarChart2, label: 'Analytics' },
  ];

  const studentLinks = [
    { href: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/student/profile', icon: User, label: 'Profile' },
    { href: '/student/jobs', icon: Briefcase, label: 'Browse Jobs' },
    { href: '/student/applications', icon: FileText, label: 'My Applications' },
    { href: '/student/analytics', icon: BarChart2, label: 'My Analytics' },
    { href: '/student/cultural-test', icon: Target, label: 'Cultural Fit Test' },
  ];

  const links = role === 'recruiter' ? recruiterLinks : studentLinks;

  return (
    <motion.div
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen flex flex-col z-40 bg-[#050505] border-r border-white/5 shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 flex-shrink-0 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-xl font-extrabold text-white whitespace-nowrap"
              >
                Recruit<span className="text-gray-400">Pro</span>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`relative flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center flex-1">
                <Icon className={`w-5 h-5 flex-shrink-0 transition-all duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white drop-shadow-md' : ''
                }`} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`ml-3 text-sm font-semibold whitespace-nowrap ${
                        isActive ? 'text-white' : ''
                      }`}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              {collapsed && (
                <div className="absolute left-16 px-3 py-1.5 bg-[#111] border border-white/10 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  {link.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-transparent hover:border-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.div>
  );
}
