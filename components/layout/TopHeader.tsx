'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi';

export default function TopHeader() {
  const pathname = usePathname();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by ensuring component is mounted before rendering theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);


   if (pathname === '/login' || pathname.startsWith('/api-docs')) {
    return null;
  }

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkMode = currentTheme === 'dark';

  const toggleDarkMode = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className="h-[72px] flex items-center justify-end px-8 border-b border-[#616E7C]/20 dark:border-[#3A3E46] bg-white dark:bg-[#14161A] shrink-0 transition-colors duration-200">
      
      {/* Right Area (Theme Toggle, Admin Profile) */}
      <div className="flex items-center gap-6">

        {/* Theme Toggle Button (Icon Only) */}
        {mounted ? (
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-[#3A3E46]/50 dark:hover:bg-[#3A3E46] transition-colors focus:outline-none shadow-sm flex items-center justify-center"
          >
            {isDarkMode ? (
              <FiMoon className="w-[18px] h-[18px] text-[#5B8DD9]" />
            ) : (
              <FiSun className="w-[18px] h-[18px] text-[#2A5CAA]" />
            )}
          </button>
        ) : (
          // Placeholder to prevent layout shift before hydration matches the new icon button size
          <div className="w-[34px] h-[34px] bg-gray-100 dark:bg-[#3A3E46]/50 rounded-md animate-pulse"></div>
        )}

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-6 border-l border-[#616E7C]/20 dark:border-[#3A3E46]">
          <div className="w-8 h-8 rounded bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 text-[#2A5CAA] dark:text-[#5B8DD9] font-bold text-xs flex items-center justify-center">
            AD
          </div>
          <span className="text-[14px] font-semibold text-[#1F2933] dark:text-white">Admin</span>
        </div>
        
      </div>
    </header>
  );
}