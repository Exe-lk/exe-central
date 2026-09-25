import { FiCircle } from 'react-icons/fi';
import MetricsGrid from '@/components/dashboard-components/MetricsGrid';
import QuickActions from '@/components/dashboard-components/QuickActions';
import RecentDocuments from '@/components/dashboard-components/RecentDocuments';

export default function Dashboard() {
  return (
    <div className="w-full max-w-[1600px] mx-auto">
      
      {/* Page Title & Status */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2933] dark:text-white mb-1 tracking-tight">
            Dashboard
          </h2>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70">
            System overview, operational metrics, and recent administrative records
          </p>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-md text-[11px] font-semibold tracking-wide text-[#1F2933] dark:text-[#E5E7EB] transition-colors duration-200">
          <FiCircle className="w-2 h-2 text-[#2A5CAA] dark:text-[#5B8DD9] fill-current" />
          <span>SYSTEM STATUS: NORMAL</span>
          <span className="text-[#616E7C] dark:text-[#E5E7EB]/50 ml-1 pl-2 border-l border-[#616E7C]/20 dark:border-[#3A3E46]">
            LK-COL-01
          </span>
        </div>
      </div>

      {/* Render Extracted Dashboard Components */}
      <MetricsGrid />
      <QuickActions />
      <RecentDocuments />

    </div>
  );
}