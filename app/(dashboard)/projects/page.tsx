'use client';

import { useState, useEffect } from 'react';
import { 
  FiCircle, 
  FiDownload, 
  FiSearch, 
  FiChevronDown, 
  FiPlus,
  FiArrowRight,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiLoader
} from 'react-icons/fi';
import Link from 'next/link';

interface Project {
  id: string;
  projectNo: string;
  name: string;
  clientName: string;
  type: 'OUTSOURCING' | 'INDUSTRIAL';
  status: 'DRAFT' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState<'OUTSOURCING' | 'INDUSTRIAL'>('OUTSOURCING');
  const [activeStatus, setActiveStatus] = useState<string>('ALL');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch projects');
      }
      
      setProjects(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on the active tab and the selected status
  const filteredProjects = projects.filter(p => {
    const matchesCategory = p.type === activeCategory;
    const matchesStatus = activeStatus === 'ALL' || p.status === activeStatus;
    return matchesCategory && matchesStatus;
  });
  
  // Calculate total counts for the tabs (ignoring the status filter so tab counts remain stable)
  const outsourcingCount = projects.filter(p => p.type === 'OUTSOURCING').length;
  const industrialCount = projects.filter(p => p.type === 'INDUSTRIAL').length;

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'IN_PROGRESS': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      case 'PENDING_REVIEW': return 'bg-[#914B00]/10 text-[#914B00] border-[#914B00]/20 dark:bg-[#B28503]/10 dark:text-[#B28503] dark:border-[#B28503]/20';
      case 'COMPLETED': return 'bg-[#616E7C]/10 text-[#616E7C] border-[#616E7C]/20 dark:bg-[#3A3E46]/50 dark:text-[#E5E7EB]/70 dark:border-[#3A3E46]';
      case 'DRAFT': return 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const formatEnumText = (text: string) => {
    return text.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto relative">
      
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1F2933] dark:text-white tracking-tight mb-1">Projects</h2>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70">
            Directory and operational lifecycle tracking for client deliverables.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-md text-[11px] font-bold tracking-wide text-[#1F2933] dark:text-[#E5E7EB] transition-colors duration-200">
            <FiCircle className="w-2 h-2 text-[#2A5CAA] dark:text-[#5B8DD9] fill-current" />
            <span>ACTIVE STREAM: {projects.length} Operations</span>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#14161A] hover:bg-gray-50 dark:hover:bg-[#3A3E46]/50 border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-md text-[12px] font-semibold text-[#1F2933] dark:text-white transition-colors duration-200">
            <FiDownload className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-6 border-b border-[#616E7C]/20 dark:border-[#3A3E46] mb-6">
        <button 
          onClick={() => setActiveCategory('OUTSOURCING')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeCategory === 'OUTSOURCING' ? 'border-[#2A5CAA] dark:border-[#5B8DD9]' : 'border-transparent hover:border-[#616E7C]/30 dark:hover:border-[#3A3E46]'}`}
        >
          <span className={`text-[14px] ${activeCategory === 'OUTSOURCING' ? 'font-bold text-[#2A5CAA] dark:text-[#5B8DD9]' : 'font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70'}`}>Outsourcing</span>
          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${activeCategory === 'OUTSOURCING' ? 'bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9]' : 'bg-[#616E7C]/10 text-[#616E7C] dark:bg-[#3A3E46] dark:text-[#E5E7EB]/70'}`}>{outsourcingCount}</span>
        </button>

        <button 
          onClick={() => setActiveCategory('INDUSTRIAL')}
          className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${activeCategory === 'INDUSTRIAL' ? 'border-[#2A5CAA] dark:border-[#5B8DD9]' : 'border-transparent hover:border-[#616E7C]/30 dark:hover:border-[#3A3E46]'}`}
        >
          <span className={`text-[14px] ${activeCategory === 'INDUSTRIAL' ? 'font-bold text-[#2A5CAA] dark:text-[#5B8DD9]' : 'font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70'}`}>Industrial</span>
          <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${activeCategory === 'INDUSTRIAL' ? 'bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9]' : 'bg-[#616E7C]/10 text-[#616E7C] dark:bg-[#3A3E46] dark:text-[#E5E7EB]/70'}`}>{industrialCount}</span>
        </button>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white dark:bg-[#14161A] p-4 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
        <div className="relative flex-1 max-w-lg">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/50" />
          <input 
            type="text" 
            placeholder={`Search ${formatEnumText(activeCategory).toLowerCase()} projects...`} 
            className="w-full h-9 pl-9 pr-4 text-[13px] font-medium bg-[#F8FAFC] border border-[#616E7C]/20 rounded-md focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors placeholder:text-[#616E7C]/70 dark:placeholder:text-[#E5E7EB]/40"
          />
        </div>

        <div className="flex items-center gap-4">
          
          {/* NATIVE SELECT IMPLEMENTATION FOR STATUS FILTER */}
          <div className="relative">
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="h-9 px-4 pr-10 appearance-none min-w-[140px] bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 rounded-md transition-colors text-[13px] font-bold text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/70 pointer-events-none" />
          </div>
          
          <div className="w-px h-6 bg-[#616E7C]/20 dark:bg-[#3A3E46] mx-1"></div>
          
          {/* STATIC NEW PROJECT BUTTON */}
          <Link 
            href={`/projects/new?type=${activeCategory}`}
            className="h-9 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm ml-2"
          >
            <FiPlus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      </div>

      {/* DATA STATES & PROJECT CARDS GRID */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#616E7C] dark:text-[#E5E7EB]/50">
          <FiLoader className="w-8 h-8 animate-spin mb-4 text-[#2A5CAA] dark:text-[#5B8DD9]" />
          <p className="text-[13px] font-medium">Synchronizing directories...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-center">
          <p className="text-red-600 dark:text-red-400 font-bold mb-2">Failed to load projects</p>
          <p className="text-[13px] text-red-500/80">{error}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#14161A] rounded-xl border border-dashed border-[#616E7C]/30 dark:border-[#3A3E46]">
          <FiBriefcase className="w-10 h-10 text-[#616E7C]/30 dark:text-[#E5E7EB]/20 mb-4" />
          <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white mb-2">
            No {activeStatus !== 'ALL' ? formatEnumText(activeStatus) : formatEnumText(activeCategory)} Projects
          </h3>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70">
            {activeStatus !== 'ALL' 
              ? 'Try changing the status filter to see more results.' 
              : 'Get started by creating a new project in this directory.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredProjects.map((project) => (
            <div key={project.id} className="group bg-white dark:bg-[#14161A] p-6 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm hover:shadow-md hover:border-[#2A5CAA]/50 dark:hover:border-[#5B8DD9]/50 transition-all duration-200 flex flex-col">
              
              <div className="flex justify-between items-start mb-5">
                <span className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wider bg-[#F8FAFC] text-[#616E7C] border border-[#616E7C]/20 dark:bg-[#0B0C0E] dark:text-[#E5E7EB]/70 dark:border-[#3A3E46] font-mono">
                  {project.projectNo}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide border ${getStatusStyle(project.status)}`}>
                  {formatEnumText(project.status)}
                </span>
              </div>

              <div className="mb-5 flex-1">
                <h3 className="text-[17px] font-bold text-[#1F2933] dark:text-white leading-snug mb-2 group-hover:text-[#2A5CAA] dark:group-hover:text-[#5B8DD9] transition-colors line-clamp-2">
                  {project.name}
                </h3>
                <div className="flex items-center gap-2 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">
                  <FiUsers className="w-4 h-4 opacity-70" />
                  {project.clientName}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70 bg-[#F8FAFC] dark:bg-[#0B0C0E] px-2.5 py-1 rounded border border-[#616E7C]/10 dark:border-[#3A3E46]/50">
                  <FiBriefcase className="w-3.5 h-3.5" /> 
                  {formatEnumText(project.type)}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70 bg-[#F8FAFC] dark:bg-[#0B0C0E] px-2.5 py-1 rounded border border-[#616E7C]/10 dark:border-[#3A3E46]/50">
                  <FiCalendar className="w-3.5 h-3.5" /> 
                  {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#616E7C]/10 dark:border-[#3A3E46]/50">
                <Link href={`/projects/${project.id}`} className="flex items-center justify-between text-[13px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors w-full">
                  View Project Dashboard
                  <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}