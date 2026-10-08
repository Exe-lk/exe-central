'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FiCircle, 
  FiSearch, 
  FiChevronDown, 
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiUserPlus,
  FiFilter,
  FiLoader,
  FiX,
  FiCheckCircle,
  FiAlertTriangle,
  FiCalendar,
  FiMail,
  FiBriefcase,
  FiUser
} from 'react-icons/fi';
import Link from 'next/link';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [position, setPosition] = useState<string>('Intern Software Engineer');
  const [appointedDate, setAppointedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<string>('ACTIVE');

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/employees');
      const json = await res.json();
      if (res.ok && json.success) {
        setEmployees(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPosition('Intern Software Engineer');
    setAppointedDate(new Date().toISOString().slice(0, 10));
    setEndDate('');
    setStatus('ACTIVE');
    setFormError(null);
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!fullName.trim() || !email.trim() || !position.trim() || !appointedDate) {
      setFormError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        position: position.trim(),
        appointedDate,
        endDate: endDate ? endDate : null,
        status,
      };

      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to create employee');
      }

      setSuccessMessage(`Employee ${result.data?.fullName} registered successfully!`);
      setIsModalOpen(false);
      resetForm();
      await fetchEmployees();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while creating the employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Metrics Calculations
  const totalHeadcount = employees.length;
  const activeStaff = employees.filter(e => e.status === 'ACTIVE').length;
  const onLeaveOrInactive = employees.filter(e => e.status !== 'ACTIVE').length;
  const pendingCompliance = employees.filter(e => !e.documents || e.documents.length === 0).length;
  
  const newHiresCount = useMemo(() => {
    const now = Date.now();
    return employees.filter(e => {
      if (!e.appointedDate) return false;
      const diffDays = (now - new Date(e.appointedDate).getTime()) / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 30;
    }).length;
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = 
        emp.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchQuery, statusFilter]);

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'ACTIVE':
      case 'Active':
        return 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20';
      case 'RESIGNED':
        return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-300">
      
      {/* ========================================== */}
      {/* 1. PAGE HEADER                             */}
      {/* ========================================== */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2933] dark:text-white mb-1 tracking-tight">
            Employees &amp; Interns
          </h2>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70">
            Centralized workforce directory, HR Document Vault, and compliance lifecycle management.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-md text-[11px] font-bold tracking-wide text-[#1F2933] dark:text-[#E5E7EB] transition-colors duration-200">
            <FiCircle className="w-2 h-2 text-[#2A5CAA] dark:text-[#5B8DD9] fill-current" />
            <span>HR VAULT: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 text-[13px] font-medium shadow-sm">
          <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================== */}
      {/* 2. HR METRICS GRID                         */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">Total Headcount</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#1F2933] dark:text-white">{totalHeadcount}</div>
            <span className="text-[12px] font-bold text-[#2A5CAA] dark:text-[#5B8DD9] mb-1">{activeStaff} Active Staff</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">Inactive / Resigned</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#1F2933] dark:text-white">{onLeaveOrInactive}</div>
            <span className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/50 tracking-wide mb-1">Archived / Away</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">Pending Compliance</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#914B00] dark:text-[#B28503]">{pendingCompliance}</div>
            <span className="text-[12px] font-bold text-[#914B00] dark:text-[#B28503] mb-1">Missing Documents</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">New Hires</h3>
          <div className="flex justify-between items-end">
            <div className="text-[32px] leading-none font-bold text-[#1F2933] dark:text-white">{newHiresCount}</div>
            <span className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/50 tracking-wide mb-1">Trailing 30 Days</span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. ACTION BAR (SEARCH & FILTERS)           */}
      {/* ========================================== */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white dark:bg-[#14161A] p-4 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full max-w-lg">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/50" />
          <input 
            type="text" 
            placeholder="Search employees by name, email, or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-[13px] font-medium bg-[#F8FAFC] border border-[#616E7C]/20 rounded-md focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors placeholder:text-[#616E7C]/70 dark:placeholder:text-[#E5E7EB]/40"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-4 pr-8 text-[13px] font-bold text-[#1F2933] dark:text-white bg-[#F8FAFC] border border-[#616E7C]/20 dark:bg-[#0B0C0E] dark:border-[#3A3E46] rounded-md focus:outline-none cursor-pointer appearance-none"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="COMPLETED">Status: Completed</option>
              <option value="RESIGNED">Status: Resigned</option>
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#616E7C] pointer-events-none" />
          </div>
          
          <div className="hidden sm:block w-px h-6 bg-[#616E7C]/20 dark:bg-[#3A3E46] mx-1"></div>

          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="h-9 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm shrink-0"
          >
            <FiUserPlus className="w-4 h-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* 4. DATA TABLE                              */}
      {/* ========================================== */}
      <div className="bg-white dark:bg-[#14161A] rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm overflow-hidden transition-colors duration-200">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center text-[#616E7C]">
            <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#2A5CAA]" />
            <p className="text-[13px] font-medium">Loading workforce directory...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#2A5CAA]/10 flex items-center justify-center text-[#2A5CAA] mb-4">
              <FiUser className="w-7 h-7" />
            </div>
            <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">No Employees Found</h4>
            <p className="text-[13px] text-[#616E7C] max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'No workforce records match your active search and filter criteria.'
                : 'Get started by adding your first intern or employee to the HR Vault.'}
            </p>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="inline-flex items-center gap-2 h-9 px-4 bg-[#2A5CAA] text-white text-[13px] font-bold rounded-md hover:bg-[#2A5CAA]/90 transition-colors shadow-sm"
            >
              <FiUserPlus className="w-4 h-4" /> Add Employee
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Position &amp; Role</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Appointed Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-[#616E7C]/10 dark:divide-[#3A3E46]/50 text-[13px]">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-[#3A3E46]/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1F2933] dark:text-white">{emp.fullName}</span>
                        <span className="text-[12px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/60">{emp.email}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-[#1F2933] dark:text-[#E5E7EB]/90">{emp.position}</span>
                    </td>
                    
                    <td className="px-6 py-4 text-[#616E7C] dark:text-[#E5E7EB]/80 font-mono">
                      {formatDate(emp.appointedDate)}
                    </td>

                    <td className="px-6 py-4 text-[#616E7C] dark:text-[#E5E7EB]/80 font-mono">
                      {formatDate(emp.endDate)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {emp.documents ? emp.documents.length : 0} Files
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide ${getStatusStyle(emp.status)}`}>
                        {emp.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/employees/${emp.id}`} 
                        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors"
                      >
                        Profile
                        <FiExternalLink className="w-3.5 h-3.5 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* ========================================== */}
        {/* 5. FOOTER SUMMARY                          */}
        {/* ========================================== */}
        <div className="flex justify-between items-center p-4 border-t border-[#616E7C]/20 dark:border-[#3A3E46] bg-[#F8FAFC] dark:bg-[#0B0C0E]">
          <span className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium">
            Showing <span className="font-bold text-[#1F2933] dark:text-white">{filteredEmployees.length}</span> of <span className="font-bold text-[#1F2933] dark:text-white">{employees.length}</span> total employees
          </span>
        </div>
      </div>

      {/* ========================================== */}
      {/* 6. ADD EMPLOYEE MODAL                      */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#14161A] rounded-xl border border-gray-200 dark:border-[#3A3E46] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-[#3A3E46] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0C0E]">
              <div>
                <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
                  <FiUserPlus className="text-[#2A5CAA]" /> Add New Employee / Intern
                </h3>
                <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-0.5">
                  Register workforce credentials and initialize their HR Vault.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#3A3E46] text-gray-500 hover:text-gray-700 dark:hover:text-white transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEmployee} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2 text-[12px]">
                  <FiAlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                  <FiUser className="text-[#2A5CAA]" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sandun Navodya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                  <FiMail className="text-[#2A5CAA]" /> Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. sandun@exe.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                  <FiBriefcase className="text-[#2A5CAA]" /> Job Position / Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Intern Software Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                    <FiCalendar className="text-[#2A5CAA]" /> Appointed Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={appointedDate}
                    onChange={(e) => setAppointedDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                    <FiCalendar className="text-[#2A5CAA]" /> End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB]">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="RESIGNED">RESIGNED</option>
                </select>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-[#3A3E46] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3E46] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 text-white text-[13px] font-bold rounded-lg transition shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" /> Registering...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-4 h-4" /> Save Employee
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}