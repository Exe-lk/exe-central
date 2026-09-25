'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { 
  FiGrid, 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiArchive, 
  FiUserCheck, 
  FiCalendar, 
  FiDollarSign, 
  FiFolder, 
  FiSettings,
  FiChevronDown,
  FiLogOut
} from 'react-icons/fi';

// Updated Navigation Structure with Sub-items
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: FiGrid },
  { name: 'Projects', href: '/projects', icon: FiBriefcase },
  { name: 'Employees', href: '/employees', icon: FiUsers },
  { name: 'Settings', href: '/settings', icon: FiSettings }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDarkMode = currentTheme === 'dark';


  if (pathname === '/login' || pathname.startsWith('/api-docs')) {
    return null;
  }

  if (!mounted) {
    return (
      <aside className="w-[260px] h-screen shrink-0 bg-white dark:bg-[#14161A] border-r border-[#616E7C]/20 dark:border-[#3A3E46]"></aside>
    );
  }

  return (
    <aside className="w-[260px] h-screen flex flex-col bg-white border-r border-[#616E7C]/20 dark:bg-[#14161A] dark:border-[#3A3E46] transition-colors duration-200 shrink-0 select-none">
      
      {/* Brand Header */}
      <div className="h-[72px] flex flex-col justify-center px-6 border-b border-[#616E7C]/20 dark:border-[#3A3E46] shrink-0">
        <h1 className="text-xl font-bold text-[#1F2933] dark:text-white tracking-tight">
          EXE.LK
        </h1>
        <p className="text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium uppercase tracking-wider mt-0.5">
          Centralized Management System
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9]'
                  : 'text-[#1F2933] hover:bg-gray-100 dark:text-[#E5E7EB] dark:hover:bg-[#3A3E46]/50'
              }`}
            >
              <Icon 
                className={`w-[18px] h-[18px] ${
                  isActive 
                    ? 'text-[#2A5CAA] dark:text-[#5B8DD9]' 
                    : 'text-[#616E7C] dark:text-[#E5E7EB]/70'
                }`} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Panel (Logout Button) */}
      <div className="p-3 border-t border-[#616E7C]/20 dark:border-[#3A3E46] shrink-0">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiLogOut className="w-[18px] h-[18px]" />
          <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
        </button>
      </div>

    </aside>
  );
}
