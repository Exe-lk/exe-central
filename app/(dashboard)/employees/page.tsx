import { 
  FiCircle, 
  FiSearch, 
  FiChevronDown, 
  FiPlus,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
  FiFilter
} from 'react-icons/fi';
import Link from 'next/link';

export default function EmployeesPage() {
  // Static mock data representing the Employee Profile schema from the SRS
  const employees = [
    { 
      id: "EMP-0012", 
      name: "Sandun Navodya", 
      email: "sandun@exe.lk",
      position: "Intern Software Engineer", 
      department: "Engineering", 
      type: "Intern",
      joinDate: "2026-08-15",
      status: "Active" 
    },
    { 
      id: "EMP-0011", 
      name: "Kavinda Perera", 
      email: "kavinda@exe.lk",
      position: "Senior UI/UX Designer", 
      department: "Design", 
      type: "Full Time",
      joinDate: "2024-03-01",
      status: "On Leave" 
    },
    { 
      id: "EMP-0010", 
      name: "Amali Silva", 
      email: "amali@exe.lk",
      position: "HR Manager", 
      department: "Human Resources", 
      type: "Full Time",
      joinDate: "2023-11-10",
      status: "Active" 
    },
    { 
      id: "EMP-0008", 
      name: "Nuwan Fernando", 
      email: "nuwan@exe.lk",
      position: "Full Stack Developer", 
      department: "Engineering", 
      type: "Contract",
      joinDate: "2025-01-15",
      status: "Resigned" 
    },
  ];

  // Dynamic styling for employee statuses
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'On Leave':
        return 'bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/20 dark:text-[#5B8DD9]';
      case 'Resigned':
      case 'Terminated':
        return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      
      {/* ========================================== */}
      {/* 1. PAGE HEADER                             */}
      {/* ========================================== */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2933] dark:text-white mb-1 tracking-tight">
            Employees
          </h2>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70">
            Centralized workforce directory, lifecycle tracking, and compliance management.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-md text-[11px] font-bold tracking-wide text-[#1F2933] dark:text-[#E5E7EB] transition-colors duration-200">
            <FiCircle className="w-2 h-2 text-[#2A5CAA] dark:text-[#5B8DD9] fill-current" />
            <span>HR MODULE: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. HR METRICS GRID                         */}
      {/* ========================================== */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">Total Headcount</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#1F2933] dark:text-white">42</div>
            <span className="text-[12px] font-bold text-[#2A5CAA] dark:text-[#5B8DD9] mb-1">Active Staff</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">On Leave</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#1F2933] dark:text-white">3</div>
            <span className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/50 tracking-wide mb-1">Currently Away</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">Pending Compliance</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#914B00] dark:text-[#B28503]">5</div>
            <span className="text-[12px] font-bold text-[#914B00] dark:text-[#B28503] mb-1">Missing NDAs / Bank Info</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">New Hires</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#1F2933] dark:text-white">2</div>
            <span className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/50 tracking-wide mb-1">Trailing 30 Days</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. ACTION BAR (SEARCH & FILTERS)           */}
      {/* ========================================== */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white dark:bg-[#14161A] p-4 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/50" />
          <input 
            type="text" 
            placeholder="Search employees by name, ID, or email..." 
            className="w-full h-9 pl-9 pr-4 text-[13px] font-medium bg-[#F8FAFC] border border-[#616E7C]/20 rounded-md focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors placeholder:text-[#616E7C]/70 dark:placeholder:text-[#E5E7EB]/40"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="h-9 px-3 flex items-center justify-center bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 rounded-md transition-colors" title="Advanced Filters">
            <FiFilter className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70" />
          </button>

          <button className="h-9 px-4 min-w-[140px] flex justify-between items-center bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 rounded-md transition-colors">
            <span className="text-[13px] font-bold text-[#1F2933] dark:text-white">All Departments</span>
            <FiChevronDown className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70" />
          </button>

          <button className="h-9 px-4 min-w-[130px] flex justify-between items-center bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 rounded-md transition-colors">
            <span className="text-[13px] font-bold text-[#1F2933] dark:text-white">Status: Active</span>
            <FiChevronDown className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70" />
          </button>
          
          <div className="w-px h-6 bg-[#616E7C]/20 dark:bg-[#3A3E46] mx-1"></div>

          <button className="h-9 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm ml-2">
            <FiUserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. DATA TABLE                              */}
      {/* ========================================== */}
      <div className="bg-white dark:bg-[#14161A] rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm overflow-hidden transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Emp No</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Role & Department</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#616E7C]/10 dark:divide-[#3A3E46]/50">
              {employees.map((emp, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-[#3A3E46]/10 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[13px] font-semibold text-[#1F2933] dark:text-white font-mono">
                      {emp.id}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-[#1F2933] dark:text-white">{emp.name}</span>
                      <span className="text-[12px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/60">{emp.email}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-[#1F2933] dark:text-[#E5E7EB]/90">{emp.position}</span>
                      <span className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/50 tracking-wide uppercase">{emp.department}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/80">
                    {emp.type}
                  </td>
                  
                  <td className="px-6 py-4 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/80">
                    {emp.joinDate}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${getStatusStyle(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <Link href={`/employees/${emp.id}`} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors">
                      Profile
                      <FiExternalLink className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* ========================================== */}
        {/* 5. PAGINATION FOOTER                       */}
        {/* ========================================== */}
        <div className="flex justify-between items-center p-4 border-t border-[#616E7C]/20 dark:border-[#3A3E46] bg-[#F8FAFC] dark:bg-[#0B0C0E]">
          <div className="flex items-center gap-6">
            <span className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium">
              Showing <span className="font-bold text-[#1F2933] dark:text-white">1</span> to <span className="font-bold text-[#1F2933] dark:text-white">4</span> of <span className="font-bold text-[#1F2933] dark:text-white">42</span> employees
            </span>
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">
              Rows per page: 
              <button className="flex items-center gap-1 font-bold text-[#1F2933] dark:text-white hover:bg-gray-200 dark:hover:bg-[#3A3E46] px-1.5 py-0.5 rounded transition-colors">
                10 <FiChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button className="p-1 rounded text-[#616E7C] hover:bg-gray-200 dark:text-[#E5E7EB]/50 dark:hover:bg-[#3A3E46] transition-colors cursor-not-allowed">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-7 h-7 rounded bg-[#2A5CAA] text-white dark:bg-[#5B8DD9] text-[12px] font-bold flex items-center justify-center">1</button>
            <button className="w-7 h-7 rounded text-[#616E7C] dark:text-[#E5E7EB]/70 hover:bg-gray-200 dark:hover:bg-[#3A3E46] text-[12px] font-bold flex items-center justify-center transition-colors">2</button>
            <button className="w-7 h-7 rounded text-[#616E7C] dark:text-[#E5E7EB]/70 hover:bg-gray-200 dark:hover:bg-[#3A3E46] text-[12px] font-bold flex items-center justify-center transition-colors">3</button>
            <span className="text-[#616E7C] dark:text-[#E5E7EB]/50 mx-1">...</span>
            <button className="w-7 h-7 rounded text-[#616E7C] dark:text-[#E5E7EB]/70 hover:bg-gray-200 dark:hover:bg-[#3A3E46] text-[12px] font-bold flex items-center justify-center transition-colors">5</button>
            <button className="p-1 rounded text-[#1F2933] hover:bg-gray-200 dark:text-[#E5E7EB] dark:hover:bg-[#3A3E46] transition-colors">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}