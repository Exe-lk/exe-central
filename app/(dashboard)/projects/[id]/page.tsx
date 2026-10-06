'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiFileText,
  FiArchive,
  FiFolder,
  FiLoader,
  FiExternalLink,
  FiEdit3,
  FiFile,
  FiFlag
} from 'react-icons/fi';
import InvoiceManager from './components/financials/InvoiceManager';
import PaymentManager from './components/financials/PaymentManager';
import ReceiptManager from './components/financials/ReceiptManager';
import ProposalManager from './components/financials/ProposalManager';
import PackageConfig from './components/tabs/PackageConfig';


interface OutsourcingMilestoneData {
  id: string;
  name: string;
  amount: any; // Prisma Decimal returns as an object/string in JSON
  status: string;
  dueDate?: string | null;
}

interface ProjectPackageData {
  id: string;
  totalAmount: any;
  milestones: OutsourcingMilestoneData[];
}

interface Participant {
  id: string;
  code: string;
  name: string;
}

interface OutsourcingProjectData {
  id: string;
  mode: 'INDIVIDUAL' | 'GROUP';
  participants: Participant[];
  package?: ProjectPackageData | null;
}

interface InvoiceData {
  id: string;
  invoiceNo: string;
  totalAmount: number;
  status: string;
  issuedDate?: string;
  dueDate?: string;
}

interface ReceiptData {
  id: string;
  receiptNo: string;
  generatedAt: string;
}

interface IndustrialProjectData {
  id: string;
  projectId: string;
}

interface ProjectDetail {
  id: string;
  sequenceNo: number;
  projectNo: string;
  name: string;
  clientName: string;
  clientCompany?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  country?: string | null;
  type: 'OUTSOURCING' | 'INDUSTRIAL';
  status: 'DRAFT' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED' | 'CANCELLED';
  startDate?: string | null;
  endDate?: string | null;
  projectManager?: string | null;
  description?: string | null;
  driveFolderId?: string | null;
  outsourcingProject?: OutsourcingProjectData | null;
  industrialProject?: IndustrialProjectData | null;
  proposals?: any[];
  quotations?: any[];
  invoices?: InvoiceData[];
  receipts?: ReceiptData[];
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (!projectId) return;

    const fetchProjectDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch project details');
        }

        setProject(result.data);
        // Dynamically set initial tab based on project type
        setActiveTab(result.data.type === 'INDUSTRIAL' ? 'proposals' : 'milestones');
      } catch (err: any) {
        setError(err.message || 'Error loading project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectDetail();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-20 flex flex-col items-center justify-center text-[#616E7C] dark:text-[#E5E7EB]/50">
        <FiLoader className="w-8 h-8 animate-spin mb-4 text-[#2A5CAA] dark:text-[#5B8DD9]" />
        <p className="text-[13px] font-medium">Loading project directory...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-12">
        <Link href="/projects" className="inline-flex items-center gap-2 text-[13px] font-bold text-[#616E7C] hover:text-[#1F2933] dark:text-[#E5E7EB]/70 dark:hover:text-white transition-colors mb-6">
          <FiArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <div className="p-8 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-center">
          <p className="text-red-600 dark:text-red-400 font-bold mb-2">Project Not Found</p>
          <p className="text-[13px] text-red-500/80">{error || 'The requested project could not be found.'}</p>
        </div>
      </div>
    );
  }

  const isIndustrial = project.type === 'INDUSTRIAL';
  const projectTypeLabel = isIndustrial ? 'Industrial' : 'Outsourcing';

  // Dynamic Tabs Architecture
  const activeTabs = isIndustrial ? [
    { id: 'proposals', label: 'Proposals', icon: FiEdit3 },
    { id: 'quotations', label: 'Quotations', icon: FiFile },
    { id: 'invoices', label: 'Invoices', icon: FiFileText },
    { id: 'payments', label: 'Payments', icon: FiCheckCircle },
    { id: 'receipts', label: 'Receipts', icon: FiArchive },
  ] : [
    { id: 'milestones', label: 'Milestones', icon: FiFlag },
    { id: 'invoices', label: 'Invoices', icon: FiFileText },
    { id: 'payments', label: 'Payments', icon: FiCheckCircle },
    { id: 'receipts', label: 'Receipts', icon: FiArchive },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
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
              {project.name}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide border ${getStatusStyle(project.status)}`}>
              {formatEnumText(project.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">
            <span className="font-mono bg-[#F8FAFC] dark:bg-[#0B0C0E] px-2 py-0.5 rounded border border-[#616E7C]/20 dark:border-[#3A3E46]">
              {project.projectNo}
            </span>

            {/* Dynamic Type Badge */}
            <span className={`px-2 py-0.5 rounded font-bold border ${isIndustrial ? 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' : 'bg-[#2A5CAA]/10 text-[#2A5CAA] border-[#2A5CAA]/20 dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9] dark:border-[#5B8DD9]/20'}`}>
              {projectTypeLabel}
              {project.outsourcingProject ? ` (${project.outsourcingProject.mode})` : ''}
            </span>

            <span>Client: <strong className="text-[#1F2933] dark:text-white">{project.clientName}</strong></span>
            {project.clientCompany && <span>Company: <strong className="text-[#1F2933] dark:text-white">{project.clientCompany}</strong></span>}

            {project.outsourcingProject?.mode === 'GROUP' && project.outsourcingProject?.participants && project.outsourcingProject.participants.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap border-l border-[#616E7C]/20 dark:border-[#3A3E46] pl-4">
                <span className="text-[13px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">Participants:</span>
                {project.outsourcingProject.participants.map((participant) => (
                  <span
                    key={participant.id}
                    className="inline-flex items-center bg-[#F8FAFC] dark:bg-[#0B0C0E] text-[#1F2933] dark:text-white px-2 py-0.5 rounded border border-[#616E7C]/20 dark:border-[#3A3E46] text-[13px] font-medium"
                  >
                    <span className="text-[#2A5CAA] dark:text-[#5B8DD9] font-mono font-bold mr-1">
                      [{participant.code}]
                    </span>
                    {participant.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {project.driveFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${project.driveFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 flex items-center gap-2 bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 text-[#1F2933] dark:text-white text-[13px] font-semibold rounded-md transition-colors"
            >
              <FiFolder className="w-4 h-4 text-amber-500" />
              Drive Folder
              <FiExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
          <button className="h-9 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded-md transition-colors shadow-sm">
            <FiCheckCircle className="w-4 h-4" />
            Status: {formatEnumText(project.status)}
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
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-[14px] transition-colors ${isActive
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

        {/* MILESTONES TAB (Outsourcing Only) */}
        {activeTab === 'milestones' && !isIndustrial && (
          <PackageConfig projectId={project.id} />
        )}

        {/* PROPOSALS TAB (Industrial Only) */}
        {activeTab === 'proposals' && isIndustrial && (
          <ProposalManager project={project as any} />
        )}

        {/* QUOTATIONS TAB (Industrial Only - Placeholder for Step 9) */}
        {activeTab === 'quotations' && isIndustrial && (
          <div className="p-16 text-center bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-dashed border-[#616E7C]/20 dark:border-[#3A3E46] rounded-xl flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
              <FiFile className="w-7 h-7" />
            </div>
            <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">Quotation Manager</h4>
            <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/60 max-w-md">
              This module will be implemented in Step 9.
            </p>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <InvoiceManager project={project as any} />
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
          <PaymentManager project={project as any} />
        )}

        {/* RECEIPTS TAB */}
        {activeTab === 'receipts' && (
          <ReceiptManager project={project as any} />
        )}

      </div>
    </div>
  );
}