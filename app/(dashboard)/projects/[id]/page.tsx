// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { 
//   FiArrowLeft, 
//   FiMoreVertical, 
//   FiClock, 
//   FiCheckCircle, 
//   FiFileText, 
//   FiArchive, 
//   FiFolder, 
//   FiGrid
// } from 'react-icons/fi';

// export default function ProjectDetailPage() {
//   const params = useParams();
//   const projectId = params.id as string;

//   // Local state for the interactive in-page Navbar
//   const [activeTab, setActiveTab] = useState('overview');

//   const tabs = [
//     { id: 'overview', label: 'Overview', icon: FiGrid },
//     { id: 'invoices', label: 'Invoices', icon: FiFileText },
//     { id: 'receipts', label: 'Receipts', icon: FiArchive },
//     { id: 'documents', label: 'Documents', icon: FiFolder },
//   ];

//   return (
//     <div className="w-full max-w-[1600px] mx-auto pb-12">
      
//       {/* 1. BACK NAVIGATION */}
//       <Link href="/projects" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#616E7C] hover:text-[#1F2933] dark:text-[#E5E7EB]/70 dark:hover:text-white transition-colors mb-6">
//         <FiArrowLeft className="w-4 h-4" />
//         Back to Projects
//       </Link>

//       {/* 2. PROJECT HEADER */}
//       <div className="flex justify-between items-start mb-8 bg-white dark:bg-[#14161A] p-6 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm">
//         <div>
//           <div className="flex items-center gap-3 mb-2">
//             <h1 className="text-2xl font-bold text-[#1F2933] dark:text-white tracking-tight">
//               FinTech Mobile API Gateway
//             </h1>
//             <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide border bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
//               In Progress
//             </span>
//           </div>
//           <div className="flex items-center gap-4 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">
//             <span className="font-mono bg-[#F8FAFC] dark:bg-[#0B0C0E] px-2 py-0.5 rounded border border-[#616E7C]/20 dark:border-[#3A3E46]">
//               {projectId}
//             </span>
//             <span>Client: <strong className="text-[#1F2933] dark:text-white">Nordic Cloud Systems</strong></span>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <button className="h-9 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm">
//             <FiCheckCircle className="w-4 h-4" />
//             Mark Completed
//           </button>
//           <button className="h-9 w-9 flex items-center justify-center bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 rounded-md transition-colors text-[#616E7C] dark:text-[#E5E7EB]/70">
//             <FiMoreVertical className="w-4 h-4" />
//           </button>
//         </div>
//       </div>

//       {/* 3. IN-PAGE NAVBAR (TABS) */}
//       <div className="flex items-center gap-2 border-b border-[#616E7C]/20 dark:border-[#3A3E46] mb-8">
//         {tabs.map((tab) => {
//           const isActive = activeTab === tab.id;
//           const Icon = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-[14px] transition-colors ${
//                 isActive 
//                   ? 'border-[#2A5CAA] text-[#2A5CAA] dark:border-[#5B8DD9] dark:text-[#5B8DD9]' 
//                   : 'border-transparent text-[#616E7C] hover:text-[#1F2933] hover:border-[#616E7C]/30 dark:text-[#E5E7EB]/70 dark:hover:text-white dark:hover:border-[#3A3E46]'
//               }`}
//             >
//               <Icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* 4. DYNAMIC TAB CONTENT */}
//       <div className="bg-white dark:bg-[#14161A] rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm min-h-[400px] p-8">
        
//         {activeTab === 'overview' && (
//           <div className="animate-in fade-in duration-300">
//             <h3 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-4">Project Overview</h3>
//             <div className="grid grid-cols-3 gap-6 mb-8">
//               <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#616E7C]/10 dark:bg-[#0B0C0E] dark:border-[#3A3E46]/50">
//                 <p className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-1">Total Budget</p>
//                 <p className="text-xl font-bold text-[#1F2933] dark:text-white">LKR 1,250,000</p>
//               </div>
//               <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#616E7C]/10 dark:bg-[#0B0C0E] dark:border-[#3A3E46]/50">
//                 <p className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-1">Deadline</p>
//                 <div className="flex items-center gap-2">
//                   <FiClock className="text-[#914B00] dark:text-[#B28503]" />
//                   <p className="text-xl font-bold text-[#1F2933] dark:text-white">Nov 30, 2024</p>
//                 </div>
//               </div>
//             </div>
//             <p className="text-[14px] text-[#616E7C] dark:text-[#E5E7EB]/70 leading-relaxed max-w-3xl">
//               Development of a scalable mobile API gateway to handle real-time transactional data for Nordic Cloud Systems. Phase 1 includes authentication clustering and primary database synchronization.
//             </p>
//           </div>
//         )}

//         {activeTab === 'invoices' && (
//           <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-[300px] text-center">
//             <div className="w-16 h-16 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
//               <FiFileText className="w-8 h-8" />
//             </div>
//             <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white mb-2">No Invoices Generated</h3>
//             <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 mb-4 max-w-md">There are currently no active invoices linked to this project directory.</p>
//             <button className="text-[13px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors">
//               + Generate First Invoice
//             </button>
//           </div>
//         )}

//         {activeTab === 'receipts' && (
//           <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-[300px] text-center">
//             <div className="w-16 h-16 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
//               <FiArchive className="w-8 h-8" />
//             </div>
//             <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white mb-2">No Payment Receipts</h3>
//             <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 max-w-md">Client payments have not yet been recorded for this project.</p>
//           </div>
//         )}

//         {activeTab === 'documents' && (
//           <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-[300px] text-center">
//             <div className="w-16 h-16 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
//               <FiFolder className="w-8 h-8" />
//             </div>
//             <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white mb-2">Project Repository Empty</h3>
//             <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 mb-4 max-w-md">Upload NDAs, technical scopes, and structural assets here.</p>
//             <button className="text-[13px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors">
//               + Upload Document
//             </button>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  FiArrowLeft, 
  FiMoreVertical, 
  FiClock, 
  FiCheckCircle, 
  FiFileText, 
  FiArchive, 
  FiGrid,
  FiFilePlus,
  FiClipboard,
  FiUsers,
  FiFlag,
  FiBox,
  FiPlusCircle
} from 'react-icons/fi';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  // Determine Project Type from ID pattern
  const isIndustrial = projectId.includes('IND');
  const projectTypeLabel = isIndustrial ? 'Industrial' : 'Outsourcing';

  const [activeTab, setActiveTab] = useState('overview');

  // Define tailored tab structures based on the project type requirement
  const industrialTabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'proposals', label: 'Proposals', icon: FiFileText },
    { id: 'quotations', label: 'Quotations', icon: FiClipboard },
    { id: 'invoices', label: 'Invoices', icon: FiFileText },
    { id: 'receipts', label: 'Receipts', icon: FiArchive },
    { id: 'new_proposal', label: 'New Proposal', icon: FiFilePlus },
  ];

  const outsourcingTabs = [
    { id: 'overview', label: 'Overview', icon: FiGrid },
    { id: 'participants', label: 'Participants', icon: FiUsers },
    { id: 'milestones', label: 'Milestones', icon: FiFlag },
    { id: 'packages', label: 'Packages', icon: FiBox },
    { id: 'invoices', label: 'Invoices', icon: FiFileText },
    { id: 'receipts', label: 'Receipts', icon: FiArchive },
    { id: 'additional_cost', label: 'Additional Cost', icon: FiPlusCircle },
  ];

  const activeTabs = isIndustrial ? industrialTabs : outsourcingTabs;

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-12">
      
      {/* 1. BACK NAVIGATION */}
      <Link href="/projects" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#616E7C] hover:text-[#1F2933] dark:text-[#E5E7EB]/70 dark:hover:text-white transition-colors mb-6">
        <FiArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      {/* 2. DYNAMIC PROJECT HEADER */}
      <div className="flex justify-between items-start mb-8 bg-white dark:bg-[#14161A] p-6 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-[#1F2933] dark:text-white tracking-tight">
              {isIndustrial ? 'Enterprise Resource Planner' : 'FinTech Mobile API Gateway'}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide border bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              In Progress
            </span>
          </div>
          <div className="flex items-center gap-4 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">
            <span className="font-mono bg-[#F8FAFC] dark:bg-[#0B0C0E] px-2 py-0.5 rounded border border-[#616E7C]/20 dark:border-[#3A3E46]">
              {projectId}
            </span>
            <span className="bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9] px-2 py-0.5 rounded font-bold">
              {projectTypeLabel}
            </span>
            <span>Client: <strong className="text-[#1F2933] dark:text-white">{isIndustrial ? 'Stark Industries' : 'Nordic Cloud Systems'}</strong></span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="h-9 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm">
            <FiCheckCircle className="w-4 h-4" />
            Mark Completed
          </button>
          <button className="h-9 w-9 flex items-center justify-center bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 rounded-md transition-colors text-[#616E7C] dark:text-[#E5E7EB]/70">
            <FiMoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. DYNAMIC IN-PAGE NAVBAR (TABS) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#616E7C]/20 dark:border-[#3A3E46] mb-8">
        {activeTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-[14px] transition-colors ${
                isActive 
                  ? 'border-[#2A5CAA] text-[#2A5CAA] dark:border-[#5B8DD9] dark:text-[#5B8DD9]' 
                  : 'border-transparent text-[#616E7C] hover:text-[#1F2933] hover:border-[#616E7C]/30 dark:text-[#E5E7EB]/70 dark:hover:text-white dark:hover:border-[#3A3E46]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT RENDERER */}
      <div className="bg-white dark:bg-[#14161A] rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm min-h-[400px] p-8">
        
        {/* SHARED OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in duration-300">
            <h3 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-4">{projectTypeLabel} Project Overview</h3>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#616E7C]/10 dark:bg-[#0B0C0E] dark:border-[#3A3E46]/50">
                <p className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-1">Total Budget</p>
                <p className="text-xl font-bold text-[#1F2933] dark:text-white">LKR {isIndustrial ? '8,500,000' : '1,250,000'}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#616E7C]/10 dark:bg-[#0B0C0E] dark:border-[#3A3E46]/50">
                <p className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-1">Deadline</p>
                <div className="flex items-center gap-2">
                  <FiClock className="text-[#914B00] dark:text-[#B28503]" />
                  <p className="text-xl font-bold text-[#1F2933] dark:text-white">Nov 30, 2024</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GENERIC FALLBACK FOR OTHER TABS TO SHOW THE SELECTED STATE */}
        {activeTab !== 'overview' && (
          <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center h-[250px] text-center">
            <div className="w-16 h-16 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
              {/* Find the icon for the active tab */}
              {activeTabs.map(tab => tab.id === activeTab && <tab.icon key={tab.id} className="w-8 h-8" />)}
            </div>
            <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white mb-2 capitalize">
              {activeTab.replace('_', ' ')} Directory
            </h3>
            <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 mb-4 max-w-md">
              Manage {activeTab.replace('_', ' ')} related to this {projectTypeLabel.toLowerCase()} project here.
            </p>
            <button className="text-[13px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors capitalize">
              + Add {activeTab.replace('_', ' ')}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

