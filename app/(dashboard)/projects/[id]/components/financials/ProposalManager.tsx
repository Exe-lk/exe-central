'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiLock,
  FiLayers,
  FiExternalLink
} from 'react-icons/fi';
import dynamic from 'next/dynamic';
import ProposalTemplate, { PricingCategoryType } from '@/components/pdf/ProposalTemplate';
import { PricingCategory, ProposalStatus } from '@prisma/client';

// 1. Dynamically import PDFViewer to prevent SSR compilation errors
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-900">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-cyan-400" />
        <p className="text-[13px] font-medium text-gray-300">Rendering Live PDF Preview...</p>
      </div>
    ),
  }
);

// 2. 🌟 Anti-Blink PDF Engine: Memoized to block unnecessary re-renders while typing
const MemoizedProposalPreview = memo(
  ({ proposalData }: { proposalData: any }) => {
    return (
      <PDFViewer width="100%" height="100%" className="border-none">
        <ProposalTemplate proposal={proposalData} />
      </PDFViewer>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps.proposalData) === JSON.stringify(nextProps.proposalData);
  }
);

interface ProjectData {
  id: string;
  projectNo: string;
  name: string;
  clientName: string;
  clientCompany?: string | null;
  type: string;
}

interface ProposalItem {
  id: string;
  status: string;
  validUntil?: string | null;
  createdAt: string;
  pricingItems?: Array<{
    category: string;
    amount: number | string;
  }>;
}

interface ProposalManagerProps {
  project: ProjectData;
  onProposalCreated?: () => void;
}

export default function ProposalManager({ project, onProposalCreated }: ProposalManagerProps) {
  const projectId = project.id;

  // List view state
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Accordion toggle states
  const [isSectionsOpen, setIsSectionsOpen] = useState<boolean>(true);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(true);
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(true);

  // Form State
  const [validUntil, setValidUntil] = useState<string>('');

  const [sections, setSections] = useState<
    Array<{ id: string; title: string; content: string; order: number }>
  >([
    {
      id: 'sec-1',
      title: 'Executive Summary',
      content:
        'This proposal outlines the strategy, architecture, and deployment plan for the enterprise web solution designed specifically for your corporate requirements.',
      order: 1,
    },
    {
      id: 'sec-2',
      title: 'Scope of Work & Technical Deliverables',
      content:
        'Our scope includes full UI/UX design, custom frontend implementation, scalable API integrations, microservices setup, and cloud infrastructure deployment.',
      order: 2,
    },
  ]);

  const [pricingItems, setPricingItems] = useState<
    Array<{
      id: string;
      category: PricingCategoryType;
      title: string;
      description: string;
      amount: string;
      billingFrequency: string;
      isOptional: boolean;
      order: number;
    }>
  >([
    {
      id: 'price-1',
      category: 'BASE_COST',
      title: 'Core Platform Architecture & UI/UX Design',
      description: 'Custom wireframing, high-fidelity mockups, and frontend component library development.',
      amount: '350000',
      billingFrequency: 'One-Time',
      isOptional: false,
      order: 1,
    },
    {
      id: 'price-2',
      category: 'BASE_COST',
      title: 'Backend API & Database Development',
      description: 'RESTful API endpoints, PostgreSQL database schema design, and role-based authentication.',
      amount: '450000',
      billingFrequency: 'One-Time',
      isOptional: false,
      order: 2,
    },
    {
      id: 'price-3',
      category: 'AMC',
      title: 'Annual Maintenance & Support Package',
      description: 'Includes 24/7 uptime monitoring, security updates, and quarterly performance tuning.',
      amount: '120000',
      billingFrequency: 'Annually',
      isOptional: true,
      order: 3,
    },
  ]);

  const [timelineItems, setTimelineItems] = useState<
    Array<{ id: string; phaseName: string; duration: string; order: number }>
  >([
    { id: 'time-1', phaseName: 'Phase 1: Discovery & Requirements Finalization', duration: '2 Weeks', order: 1 },
    { id: 'time-2', phaseName: 'Phase 2: UI/UX Wireframing & Prototyping', duration: '3 Weeks', order: 2 },
    { id: 'time-3', phaseName: 'Phase 3: Core Frontend & API Integration', duration: '4 Weeks', order: 3 },
    { id: 'time-4', phaseName: 'Phase 4: QA Testing, Security Audit & Launch', duration: '2 Weeks', order: 4 },
  ]);

  // Fetch proposals list
  const fetchProposals = useCallback(async () => {
    setIsLoadingList(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/proposals?projectId=${projectId}&includeDetails=true`);
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch proposals');
      }
      setProposals(result.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading proposals');
    } finally {
      setIsLoadingList(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProposals();
    }
  }, [projectId, fetchProposals]);

  // Helper functions for array manipulations
  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        id: `sec-${Date.now()}`,
        title: '',
        content: '',
        order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSectionChange = (id: string, field: 'title' | 'content', value: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleAddPricingItem = () => {
    setPricingItems((prev) => [
      ...prev,
      {
        id: `price-${Date.now()}`,
        category: 'BASE_COST',
        title: '',
        description: '',
        amount: '',
        billingFrequency: 'One-Time',
        isOptional: false,
        order: prev.length + 1,
      },
    ]);
  };

  const handleRemovePricingItem = (id: string) => {
    setPricingItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handlePricingItemChange = (id: string, field: string, value: any) => {
    setPricingItems((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleAddTimelineItem = () => {
    setTimelineItems((prev) => [
      ...prev,
      {
        id: `time-${Date.now()}`,
        phaseName: '',
        duration: '',
        order: prev.length + 1,
      },
    ]);
  };

  const handleRemoveTimelineItem = (id: string) => {
    setTimelineItems((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTimelineItemChange = (id: string, field: 'phaseName' | 'duration', value: string) => {
    setTimelineItems((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));
  };

  // 3. Construct Live Preview Data Object using useMemo
  const previewProposalData = useMemo(() => {
    return {
      project: {
        name: project.name,
        clientName: project.clientName,
        clientCompany: project.clientCompany,
        projectNo: project.projectNo,
      },
      validUntil: validUntil || null,
      sections: sections.map((s, idx) => ({ ...s, order: idx + 1 })),
      pricingItems: pricingItems.map((p, idx) => ({
        ...p,
        amount: parseFloat(p.amount) || 0,
        order: idx + 1,
      })),
      timelineItems: timelineItems.map((t, idx) => ({ ...t, order: idx + 1 })),
    };
  }, [project, validUntil, sections, pricingItems, timelineItems]);

  // 4. Anti-Blink Engine (800ms debounce with useRef + setTimeout)
  const [debouncedPreviewData, setDebouncedPreviewData] = useState(previewProposalData);
  const previewDataRef = useRef(previewProposalData);

  useEffect(() => {
    previewDataRef.current = previewProposalData;
  }, [previewProposalData]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPreviewData(previewDataRef.current);
    }, 800);
    return () => clearTimeout(handler);
  }, [previewProposalData]);

  // Total base investment for footer display
  const totalBaseCost = useMemo(() => {
    return pricingItems
      .filter((p) => p.category === 'BASE_COST')
      .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  }, [pricingItems]);

  // Form Submission
  const handleSaveProposal = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        projectId,
        validUntil: validUntil || null,
        status: ProposalStatus.DRAFT,
        sections: sections
          .filter((s) => s.title.trim())
          .map((s, idx) => ({
            title: s.title.trim(),
            content: s.content,
            order: idx + 1,
          })),
        pricingItems: pricingItems
          .filter((p) => p.title.trim())
          .map((p, idx) => ({
            category: p.category,
            title: p.title.trim(),
            description: p.description.trim() || null,
            amount: parseFloat(p.amount) || 0,
            billingFrequency: p.billingFrequency.trim() || null,
            isOptional: Boolean(p.isOptional),
            order: idx + 1,
          })),
        timelineItems: timelineItems
          .filter((t) => t.phaseName.trim())
          .map((t, idx) => ({
            phaseName: t.phaseName.trim(),
            duration: t.duration.trim(),
            order: idx + 1,
          })),
      };

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create proposal');
      }

      setSuccessMessage('Proposal locked and created successfully!');
      setIsModalOpen(false);

      await fetchProposals();
      if (onProposalCreated) {
        onProposalCreated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while creating the proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingList) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[#616E7C]">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#1E3A8A]" />
        <p className="text-[13px] font-medium">Loading proposal records...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* HEADER & TOP CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#616E7C]/20">
        <div>
          <h3 className="text-lg font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
            <FiFileText className="text-[#1E3A8A] dark:text-cyan-400" /> Industrial Proposal Builder
          </h3>
          <p className="text-[13px] text-[#616E7C] mt-1">
            Build modular B2B proposals, preview live A4 PDF layouts, and lock commercial terms.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 inline-flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer"
        >
          <FiPlus className="w-4 h-4" /> Create Proposal
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-3 text-[13px]">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Error</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-start gap-3 text-[13px]">
          <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Success</p>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      {/* PROPOSALS TABLE */}
      {proposals.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-dashed border-[#616E7C]/20">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#1E3A8A]/10 flex items-center justify-center text-[#1E3A8A] dark:text-cyan-400 mb-4">
            <FiFileText className="w-7 h-7" />
          </div>
          <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">No Proposals Created Yet</h4>
          <p className="text-[13px] text-[#616E7C] mb-6">
            Click &quot;Create Proposal&quot; to open the split-view editor and draft a B2B commercial proposal.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 inline-flex items-center gap-2 bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" /> Create First Proposal
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#616E7C]/20 bg-white dark:bg-[#14161A] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 text-[#616E7C] font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Proposal ID</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Base Investment</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#616E7C]/10">
                {proposals.map((prop) => {
                  const baseItems = prop.pricingItems?.filter((p) => p.category === 'BASE_COST') || [];
                  const baseSum = baseItems.reduce(
                    (acc, item) => acc + (typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount)) || 0),
                    0
                  );

                  return (
                    <tr key={prop.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#1E3A8A] dark:text-cyan-400">
                        {prop.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-[#616E7C]">
                        {new Date(prop.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-[#616E7C]">
                        {prop.validUntil ? new Date(prop.validUntil).toLocaleDateString() : 'Flexible'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {prop.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#1F2933] dark:text-white">
                        LKR {baseSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#1E3A8A]/10 text-[#1E3A8A] dark:text-cyan-400 text-[12px] font-bold hover:bg-[#1E3A8A]/20 cursor-pointer"
                        >
                          <FiFileText className="w-3.5 h-3.5" /> Split-View Editor
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 SPLIT-VIEW LIVE PROPOSAL EDITOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex bg-gray-100 overflow-hidden animate-in fade-in duration-200">
          
          {/* LEFT PANEL: Form Controls */}
          <div className="w-[500px] bg-white border-r border-gray-200 flex flex-col h-full shadow-2xl z-10">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-[#0F172A] text-white">
              <div>
                <h2 className="text-[16px] font-bold flex items-center gap-2 text-cyan-400">
                  <FiLayers /> Proposal Builder & Editor
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Project #{project.projectNo} — {project.name}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 bg-slate-800 rounded-full hover:bg-red-600 hover:text-white transition text-gray-300 cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/50">
              
              {/* Header Configuration */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 shadow-xs">
                <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FiCalendar className="text-[#1E3A8A]" /> Proposal Metadata
                </h4>
                <div className="space-y-1">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Valid Until Date</label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 text-[13px] bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ACCORDION 1: Text Sections */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsSectionsOpen(!isSectionsOpen)}
                  className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition border-b border-gray-200 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-[13px] text-[#1F2933]">
                    <FiFileText className="text-[#1E3A8A]" /> Text & Scope Sections ({sections.length})
                  </div>
                  {isSectionsOpen ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                </button>

                {isSectionsOpen && (
                  <div className="p-4 space-y-4">
                    {sections.map((sec, idx) => (
                      <div key={sec.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 relative group">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">
                            Section #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSection(sec.id)}
                            className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Remove Section"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Section Title (e.g., Executive Summary)"
                          value={sec.title}
                          onChange={(e) => handleSectionChange(sec.id, 'title', e.target.value)}
                          className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-500 font-semibold text-gray-800"
                        />
                        <textarea
                          rows={3}
                          placeholder="Detailed section narrative / scope text..."
                          value={sec.content}
                          onChange={(e) => handleSectionChange(sec.id, 'content', e.target.value)}
                          className="w-full p-2.5 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-500 text-gray-700"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="w-full h-9 flex justify-center items-center gap-1.5 border border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-[12px] rounded-lg transition cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4" /> Add Text Section
                    </button>
                  </div>
                )}
              </div>

              {/* ACCORDION 2: Pricing Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsPricingOpen(!isPricingOpen)}
                  className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition border-b border-gray-200 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-[13px] text-[#1F2933]">
                    <FiDollarSign className="text-emerald-600" /> Pricing & Commercial Items ({pricingItems.length})
                  </div>
                  {isPricingOpen ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                </button>

                {isPricingOpen && (
                  <div className="p-4 space-y-4">
                    {pricingItems.map((item, idx) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 relative">
                        <div className="flex justify-between items-center">
                          <select
                            value={item.category}
                            onChange={(e) => handlePricingItemChange(item.id, 'category', e.target.value)}
                            className="h-7 px-2 bg-white border border-gray-300 rounded text-[11px] font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value={PricingCategory.BASE_COST}>BASE_COST</option>
                            <option value={PricingCategory.OPTIONAL_PRODUCT}>OPTIONAL_PRODUCT</option>
                            <option value={PricingCategory.OPTIONAL_SERVICE}>OPTIONAL_SERVICE</option>
                            <option value={PricingCategory.AMC}>AMC</option>
                            <option value={PricingCategory.HOSTING}>HOSTING</option>
                            <option value={PricingCategory.THIRD_PARTY}>THIRD_PARTY</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemovePricingItem(item.id)}
                            className="text-red-400 hover:text-red-600 p-1 cursor-pointer"
                            title="Remove Pricing Item"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            placeholder="Item Title (e.g. Core Web Development)"
                            value={item.title}
                            onChange={(e) => handlePricingItemChange(item.id, 'title', e.target.value)}
                            className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded text-[13px] focus:outline-none focus:border-blue-500 font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Short Description..."
                            value={item.description}
                            onChange={(e) => handlePricingItemChange(item.id, 'description', e.target.value)}
                            className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded text-[12px] focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Amount (LKR)</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={item.amount}
                              onChange={(e) => handlePricingItemChange(item.id, 'amount', e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded text-[13px] font-mono focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Billing Frequency</label>
                            <input
                              type="text"
                              placeholder="e.g. One-Time, Annually"
                              value={item.billingFrequency}
                              onChange={(e) => handlePricingItemChange(item.id, 'billingFrequency', e.target.value)}
                              className="w-full h-8 px-2.5 bg-white border border-gray-300 rounded text-[12px] focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="checkbox"
                            id={`opt-${item.id}`}
                            checked={item.isOptional}
                            onChange={(e) => handlePricingItemChange(item.id, 'isOptional', e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label htmlFor={`opt-${item.id}`} className="text-[12px] font-medium text-gray-700 cursor-pointer">
                            Mark as Optional Add-on
                          </label>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddPricingItem}
                      className="w-full h-9 flex justify-center items-center gap-1.5 border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 font-bold text-[12px] rounded-lg transition cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4" /> Add Pricing Item
                    </button>
                  </div>
                )}
              </div>

              {/* ACCORDION 3: Timeline Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => setIsTimelineOpen(!isTimelineOpen)}
                  className="w-full p-4 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition border-b border-gray-200 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 font-bold text-[13px] text-[#1F2933]">
                    <FiClock className="text-amber-600" /> Timeline & Schedule Phases ({timelineItems.length})
                  </div>
                  {isTimelineOpen ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
                </button>

                {isTimelineOpen && (
                  <div className="p-4 space-y-3">
                    {timelineItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                        <span className="text-[11px] font-bold text-gray-500 shrink-0 w-6">#{idx + 1}</span>
                        <input
                          type="text"
                          placeholder="Phase Name"
                          value={item.phaseName}
                          onChange={(e) => handleTimelineItemChange(item.id, 'phaseName', e.target.value)}
                          className="flex-1 h-8 px-2 bg-white border border-gray-300 rounded text-[12px] focus:outline-none focus:border-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g. 2 Weeks)"
                          value={item.duration}
                          onChange={(e) => handleTimelineItemChange(item.id, 'duration', e.target.value)}
                          className="w-32 h-8 px-2 bg-white border border-gray-300 rounded text-[12px] focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTimelineItem(item.id)}
                          className="text-red-400 hover:text-red-600 p-1 cursor-pointer shrink-0"
                          title="Remove Phase"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddTimelineItem}
                      className="w-full h-9 flex justify-center items-center gap-1.5 border border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-700 font-bold text-[12px] rounded-lg transition cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4" /> Add Timeline Phase
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-5 border-t border-gray-200 bg-gray-900 text-white space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[12px] font-medium text-gray-400">Total Core Investment:</span>
                <span className="text-[17px] font-bold font-mono text-cyan-400">
                  LKR {totalBaseCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveProposal}
                disabled={isSubmitting}
                className="w-full h-11 flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[13.5px] rounded-xl transition shadow-lg cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" /> Saving Proposal...
                  </>
                ) : (
                  <>
                    <FiLock /> Lock & Save Proposal
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Live Anti-Blink PDF Preview */}
          <div className="flex-1 bg-slate-900 p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 text-white">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-bold text-sm text-gray-200">Live Anti-Blink PDF Preview</h3>
              </div>
              <span className="text-[11px] bg-slate-800 text-cyan-400 border border-slate-700 px-3 py-1 rounded-full font-mono">
                800ms Debounce Shield
              </span>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl bg-white border border-slate-800">
              <MemoizedProposalPreview proposalData={debouncedPreviewData} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
