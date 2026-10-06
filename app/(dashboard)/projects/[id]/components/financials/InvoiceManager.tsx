
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { FiFileText, FiPlus, FiExternalLink, FiLoader, FiX, FiCheckCircle, FiAlertTriangle, FiTrash2, FiUser, FiFlag, FiFilePlus } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import InvoiceTemplate from '@/components/pdf/InvoiceTemplate';

// 1. Dynamically import PDFViewer to prevent Next.js SSR errors
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500"><FiLoader className="animate-spin w-8 h-8" /></div> }
);

// 2. 🌟 THE FIX: Isolate and Memoize the Viewer to completely block parent re-renders
const MemoizedPDFPreview = memo(({ invoiceData }: { invoiceData: any }) => {
  return (
    <PDFViewer width="100%" height="100%" className="border-none">
      <InvoiceTemplate invoice={invoiceData} />
    </PDFViewer>
  );
}, (prevProps, nextProps) => {
  // Deep comparison: Only re-render the iframe if the actual JSON data has changed
  return JSON.stringify(prevProps.invoiceData) === JSON.stringify(nextProps.invoiceData);
});

export default function InvoiceManager({ project, onInvoiceCreated }: any) {
  const projectId = project.id;
  const isIndustrial = project.type === 'INDUSTRIAL';
  const isGroupMode = project.outsourcingProject?.mode === 'GROUP';
  const participants = project.outsourcingProject?.participants || [];

  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [manualSubtotal, setManualSubtotal] = useState<string>('');
  const [proposalNo, setProposalNo] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('');
  const [taxAmount, setTaxAmount] = useState<string>('');
  const [costEstimationNo, setCostEstimationNo] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  
  const [additionalCosts, setAdditionalCosts] = useState<{id: number, description: string, amount: string}[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/invoices?projectId=${projectId}`);
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to fetch invoices');
      setInvoices(result.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading invoices');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => { if (projectId) fetchInvoices(); }, [projectId, fetchInvoices]);

  const activeInvoices = useMemo(() => invoices.filter(inv => inv.status !== 'CANCELLED'), [invoices]);

  const availableMilestones = useMemo(() => {
    const allMilestones = project.outsourcingProject?.package?.milestones || [];
    return allMilestones.filter((m: any) => {
      if (isGroupMode) {
        const invoicedIds = activeInvoices.filter(inv => inv.milestone?.id === m.id && inv.participant).map(inv => inv.participant?.id);
        return invoicedIds.length < participants.length;
      }
      return !activeInvoices.some(inv => inv.milestone?.id === m.id);
    });
  }, [project, activeInvoices, isGroupMode, participants.length]);

  const availableParticipants = useMemo(() => {
    if (!isGroupMode || !milestoneId) return participants;
    const invoicedIds = activeInvoices.filter(inv => inv.milestone?.id === milestoneId && inv.participant).map(inv => inv.participant?.id);
    return participants.filter((p: any) => !invoicedIds.includes(p.id));
  }, [isGroupMode, milestoneId, activeInvoices, participants]);

  useEffect(() => {
    if (participantId && !availableParticipants.some((p: any) => p.id === participantId)) setParticipantId('');
  }, [milestoneId, availableParticipants, participantId]);

  // Calculations for Preview
  const selectedMilestoneData = availableMilestones.find((m: any) => m.id === milestoneId);
  const selectedParticipantData = participants.find((p: any) => p.id === participantId);
  
  const baseAmount = selectedMilestoneData ? Number(selectedMilestoneData.amount) : 0;
  const additionalCostsTotal = additionalCosts.reduce((sum, cost) => sum + (parseFloat(cost.amount) || 0), 0);
  const outsourcingSubtotal = baseAmount + additionalCostsTotal;
  const manualBase = Number(manualSubtotal || 0);
  const subtotal = isIndustrial ? manualBase : outsourcingSubtotal;
  const discount = parseFloat(discountAmount) || 0;
  const tax = parseFloat(taxAmount) || 0;
  const totalDue = subtotal - discount + tax;

  const canSubmit = isIndustrial
    ? Number(manualSubtotal) > 0 && !isSubmitting
    : Boolean(milestoneId) && !(isGroupMode && !participantId) && !isSubmitting;

  const handleAddCost = () => setAdditionalCosts([...additionalCosts, { id: Date.now(), description: '', amount: '' }]);
  const handleRemoveCost = (id: number) => setAdditionalCosts(costs => costs.filter(c => c.id !== id));
  const handleCostChange = (id: number, field: string, value: string) => {
    setAdditionalCosts(costs => costs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetForm = () => {
    setMilestoneId('');
    setParticipantId('');
    setPaymentNote('');
    setManualSubtotal('');
    setProposalNo('');
    setDiscountAmount('');
    setTaxAmount('');
    setCostEstimationNo('');
    setDueDate('');
    setAdditionalCosts([]);
  };

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (isIndustrial) {
      if (!(Number(manualSubtotal) > 0)) return;
    } else {
      if (!milestoneId || (isGroupMode && !participantId)) return;
    }

    setIsSubmitting(true);
    setErrorMessage(null); setSuccessMessage(null);

    try {
      const payload = isIndustrial
        ? {
            projectId,
            subtotal: Number(manualSubtotal),
            paymentNote: paymentNote.trim() ? paymentNote.trim() : null,
            proposalNo: proposalNo.trim() ? proposalNo.trim() : null,
            discountAmount: discount,
            taxAmount: tax,
            costEstimationNo: costEstimationNo.trim() ? costEstimationNo.trim() : null,
            dueDate: dueDate ? dueDate : null,
          }
        : {
            projectId,
            milestoneId,
            participantId: (isGroupMode && participantId) ? participantId : null,
            paymentNote: paymentNote.trim() ? paymentNote.trim() : null,
            discountAmount: discount,
            taxAmount: tax,
            costEstimationNo: costEstimationNo.trim() ? costEstimationNo.trim() : null,
            dueDate: dueDate ? dueDate : null,
            newAdditionalCosts: additionalCosts.map(c => ({ description: c.description, amount: parseFloat(c.amount) || 0 })),
          };

      const response = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Failed to generate invoice');

      setSuccessMessage(`Invoice ${result.data?.invoiceNo || ''} generated successfully!`);
      setIsModalOpen(false);
      resetForm();
      await fetchInvoices();
      if (onInvoiceCreated) onInvoiceCreated();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while generating the invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  // 3. Live Data Calculation
  const previewInvoiceData: any = useMemo(() => ({
    id: 'preview',
    invoiceNo: 'DRAFT-PREVIEW',
    costEstimationNo: costEstimationNo || null,
    proposalNo: proposalNo || null,
    clientName: selectedParticipantData ? selectedParticipantData.name : project.clientName,
    clientCompany: project.clientCompany,
    country: project.country,
    currency: 'LKR',
    subtotal: subtotal,
    discountAmount: discount,
    taxAmount: tax,
    totalAmount: totalDue,
    paymentNote: paymentNote || null,
    status: 'DRAFT',
    issuedDate: new Date(),
    dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 86400000),
    project: project,
    participant: selectedParticipantData,
    milestone: selectedMilestoneData,
    additionalCosts: additionalCosts.map(c => ({ description: c.description || 'New Item', amount: parseFloat(c.amount) || 0 })),
    billingHistory: [
      ...activeInvoices.map((inv) => ({
        description: inv.paymentNote || inv.milestone?.name || 'Invoice',
        amount: Number(inv.subtotal ?? inv.totalAmount),
        status: inv.status,
        date: inv.issuedDate || inv.createdAt,
      })),
      {
        description: isIndustrial ? paymentNote : selectedMilestoneData?.name,
        amount: isIndustrial ? Number(manualSubtotal || 0) : subtotal,
        status: 'PENDING',
        date: new Date(),
      },
    ],
  }), [
    costEstimationNo, proposalNo, selectedParticipantData, project, subtotal, discount, tax,
    totalDue, paymentNote, dueDate, selectedMilestoneData, additionalCosts,
    activeInvoices, isIndustrial, manualSubtotal,
  ]);

  // 4. Debounced State (Only updates after user stops typing for 800ms)
  const [debouncedPreviewData, setDebouncedPreviewData] = useState(previewInvoiceData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPreviewData(previewInvoiceData);
    }, 800);

    return () => clearTimeout(handler);
  }, [previewInvoiceData]);

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[#616E7C]">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#2A5CAA]" />
        <p className="text-[13px] font-medium">Loading project invoices...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#616E7C]/20">
        <div>
          <h3 className="text-lg font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
            <FiFileText className="text-[#2A5CAA]" /> Project Invoice Manager
          </h3>
          <p className="text-[13px] text-[#616E7C] mt-1">
            {isIndustrial
              ? 'Generate payment invoices, stream enterprise PDF documents, and track ledger snapshots.'
              : 'Generate milestone invoices, stream enterprise PDF documents, and track payment snapshots.'}
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="h-10 px-4 inline-flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm shrink-0">
          <FiFilePlus className="w-4 h-4" /> Generate Invoice
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-start gap-3 text-[13px]">
          <FiAlertTriangle className="w-5 h-5 mt-0.5" />
          <div><p className="font-bold">Error</p><p>{errorMessage}</p></div>
        </div>
      )}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-start gap-3 text-[13px]">
          <FiCheckCircle className="w-5 h-5 mt-0.5" />
          <div><p className="font-bold">Success</p><p>{successMessage}</p></div>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-dashed border-[#616E7C]/20">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#2A5CAA]/10 flex items-center justify-center text-[#2A5CAA] mb-4">
            <FiFileText className="w-7 h-7" />
          </div>
          <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">No Invoices Issued Yet</h4>
          <p className="text-[13px] text-[#616E7C] mb-6">
            {isIndustrial
              ? 'Click "Generate Invoice" to issue a new payment invoice for this project.'
              : 'Click "Generate Invoice" to issue a new milestone payment invoice for this project.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#616E7C]/20 bg-white dark:bg-[#14161A] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 text-[#616E7C] font-semibold uppercase text-[11px] tracking-wider">
                <tr><th className="px-4 py-3">Invoice No</th><th className="px-4 py-3">Billed Target</th><th className="px-4 py-3">Milestone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Total Amount (LKR)</th><th className="px-4 py-3 text-center">PDF</th></tr>
              </thead>
              <tbody className="divide-y divide-[#616E7C]/10">
                {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-[#2A5CAA]">{inv.invoiceNo}</td>
                      <td className="px-4 py-3 font-semibold text-[#1F2933] dark:text-white">{inv.participant ? `[${inv.participant.code}] ${inv.participant.name}` : inv.clientName}</td>
                      <td className="px-4 py-3 text-[#616E7C]">{inv.milestone ? `#${inv.milestone.order} - ${inv.milestone.name}` : (inv.paymentNote || 'General Payment')}</td>
                      <td className="px-4 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadgeStyle(inv.status)}`}>{inv.status}</span></td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#1F2933] dark:text-white">LKR {Number(inv.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => window.open(`/api/invoices/${inv.id}/document`, '_blank')} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#2A5CAA]/10 text-[#2A5CAA] text-[12px] font-bold hover:bg-[#2A5CAA]/20">
                          <FiFileText className="w-3.5 h-3.5" /> View PDF
                        </button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW SPLIT-VIEW LIVE EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex bg-gray-100 overflow-hidden">
          
          {/* LEFT PANEL: Form Controls */}
          <div className="w-[450px] bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2933] flex items-center gap-2"><FiFilePlus className="text-[#2A5CAA]"/> Create Invoice</h2>
                <p className="text-[11px] text-[#616E7C] mt-0.5">Project #{project.projectNo}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-red-100 hover:text-red-600 transition"><FiX /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isIndustrial ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#616E7C]">Invoice Description <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Advance Payment (50%)"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#616E7C]">Base Amount (LKR) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={manualSubtotal}
                      onChange={(e) => setManualSubtotal(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-mono focus:outline-none focus:border-[#2A5CAA]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#616E7C]">Proposal Ref No</label>
                    <input
                      type="text"
                      placeholder="PROP-..."
                      value={proposalNo}
                      onChange={(e) => setProposalNo(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-mono focus:outline-none focus:border-[#2A5CAA]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-[#616E7C]">Target Milestone <span className="text-red-500">*</span></label>
                    <select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA]">
                      <option value="">-- Select Pending Milestone --</option>
                      {availableMilestones.map((m: any) => <option key={m.id} value={m.id}>#{m.order} - {m.name}</option>)}
                    </select>
                  </div>

                  {isGroupMode && (
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-[#616E7C]">Target Participant <span className="text-red-500">*</span></label>
                      <select value={participantId} onChange={(e) => setParticipantId(e.target.value)} disabled={!milestoneId} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA] disabled:opacity-50">
                        <option value="">{!milestoneId ? "-- Select Milestone First --" : "-- Select Participant --"}</option>
                        {availableParticipants.map((p: any) => <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Dynamic Additional Costs */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-semibold text-[#616E7C]">Additional Costs (Line Items)</label>
                      <button onClick={handleAddCost} className="text-[11px] font-bold text-[#2A5CAA] hover:underline flex items-center"><FiPlus /> Add</button>
                    </div>
                    {additionalCosts.map((cost) => (
                      <div key={cost.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                        <input type="text" placeholder="Description" value={cost.description} onChange={e => handleCostChange(cost.id, 'description', e.target.value)} className="flex-1 bg-white border border-gray-300 px-2 py-1.5 rounded text-[12px] focus:outline-none focus:border-[#2A5CAA]" />
                        <input type="number" placeholder="LKR" value={cost.amount} onChange={e => handleCostChange(cost.id, 'amount', e.target.value)} className="w-24 bg-white border border-gray-300 px-2 py-1.5 rounded text-[12px] font-mono focus:outline-none focus:border-[#2A5CAA]" />
                        <button onClick={() => handleRemoveCost(cost.id)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 /></button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Discount (LKR)</label>
                  <input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-mono focus:outline-none focus:border-[#2A5CAA]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Tax (LKR)</label>
                  <input type="number" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-mono focus:outline-none focus:border-[#2A5CAA]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Ref Est No</label>
                  <input type="text" placeholder="EST-..." value={costEstimationNo} onChange={(e) => setCostEstimationNo(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] font-mono focus:outline-none focus:border-[#2A5CAA]" />
                </div>
              </div>

              {!isIndustrial && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Notes</label>
                  <textarea rows={2} value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} className="w-full p-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA]" />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[13px] font-bold text-gray-800">Total Payable:</span>
                <span className="text-[18px] font-bold font-mono text-[#2A5CAA]">LKR {totalDue.toLocaleString()}</span>
              </div>
              <button onClick={handleGenerateInvoice} disabled={!canSubmit} className="w-full h-12 flex justify-center items-center gap-2 bg-[#2A5CAA] hover:bg-blue-700 text-white font-bold text-[14px] rounded-lg transition-colors disabled:opacity-40 shadow-md">
                {isSubmitting ? <><FiLoader className="animate-spin" /> Locking...</> : <><FiCheckCircle /> Lock & Generate Invoice</>}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Live PDF Preview shielded by Memoized Component */}
          <div className="flex-1 bg-gray-500 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-4 text-white">
              <h3 className="font-bold text-lg">Live PDF Preview</h3>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">Read-Only View</span>
            </div>
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl bg-white">
              <MemoizedPDFPreview invoiceData={debouncedPreviewData} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
