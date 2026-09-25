import { FiPlus } from 'react-icons/fi';

export default function QuickActions() {
  return (
    <div className="flex items-center gap-4 mb-8 bg-white dark:bg-[#14161A] p-4 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
      <span className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mr-2">
        Quick Actions:
      </span>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm">
        <FiPlus className="w-4 h-4" />
        New Project
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#616E7C]/30 hover:bg-[#616E7C]/5 dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 text-[#1F2933] dark:text-white text-[13px] font-semibold rounded-md transition-colors">
        <FiPlus className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70" />
        New Invoice
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#616E7C]/30 hover:bg-[#616E7C]/5 dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 text-[#1F2933] dark:text-white text-[13px] font-semibold rounded-md transition-colors">
        <FiPlus className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70" />
        New Receipt
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#616E7C]/30 hover:bg-[#616E7C]/5 dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 text-[#1F2933] dark:text-white text-[13px] font-semibold rounded-md transition-colors">
        <FiPlus className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70" />
        New Employee Letter
      </button>
    </div>
  );
}