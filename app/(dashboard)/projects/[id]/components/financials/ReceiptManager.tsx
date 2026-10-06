

'use client';

import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import { FiArchive, FiPlus, FiExternalLink, FiLoader, FiX, FiCheckCircle, FiAlertTriangle, FiTrash2, FiFilePlus,FiFileText } from 'react-icons/fi';
import dynamic from 'next/dynamic';
import ReceiptTemplate from '@/components/pdf/ReceiptTemplate';

// 1. Dynamically import PDFViewer to prevent Next.js SSR errors
const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-gray-500"><FiLoader className="animate-spin w-8 h-8" /></div> }
);

// 2. 🌟 Anti-Blink PDF Engine: Memoized to block parent re-renders
const MemoizedReceiptPreview = memo(({ receiptData }: { receiptData: any }) => {
  return (
    <PDFViewer width="100%" height="100%" className="border-none">
      <ReceiptTemplate receipt={receiptData} />
    </PDFViewer>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.receiptData) === JSON.stringify(nextProps.receiptData);
});

export default function ReceiptManager({ project }: any) {
  const projectId = project.id;

  const [receipts, setReceipts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [paymentId, setPaymentId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [additionalCosts, setAdditionalCosts] = useState<{id: number, description: string, amount: string}[]>([]);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [recRes, payRes] = await Promise.all([
        fetch(`/api/receipts?projectId=${projectId}`),
        fetch(`/api/payments?projectId=${projectId}`)
      ]);
      const recData = await recRes.json();
      const payData = await payRes.json();

      if (recRes.ok) setReceipts(recData.data || []);
      if (payRes.ok) setPayments(payData.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading data');
    } finally { setIsLoading(false); }
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Available Payments
  const pendingPayments = useMemo(() => 
    payments.filter(p => p.status === 'VERIFIED' && !p.receipt), 
  [payments]);

  const selectedPayment = useMemo(() => pendingPayments.find(p => p.id === paymentId), [pendingPayments, paymentId]);
  const baseAmount = selectedPayment ? Number(selectedPayment.amount) : 0;
  
  const handleAddCost = () => setAdditionalCosts([...additionalCosts, { id: Date.now(), description: '', amount: '' }]);
  const handleRemoveCost = (id: number) => setAdditionalCosts(costs => costs.filter(c => c.id !== id));
  const handleCostChange = (id: number, field: string, value: string) => {
    setAdditionalCosts(costs => costs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async () => {
    if (!paymentId || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null); setSuccessMessage(null);
    
    try {
      const payload = {
        paymentId,
        description: description.trim() ? description : undefined,
        newAdditionalCosts: additionalCosts.map(c => ({ description: c.description, amount: parseFloat(c.amount) || 0 }))
      };

      const res = await fetch('/api/receipts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || 'Failed to generate receipt');

      setSuccessMessage(`Receipt ${result.data?.receiptNo || ''} generated successfully!`);
      setIsModalOpen(false);
      setPaymentId(''); setDescription(''); setAdditionalCosts([]);
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while generating the receipt');
    } finally { setIsSubmitting(false); }
  };

  // 3. Construct Live Preview Data Object securely using useMemo
  const previewReceiptData: any = useMemo(() => {
    const previewItems = [];
    if (selectedPayment) {
      previewItems.push({
        id: 'base',
        description: description || `Payment for Invoice ${selectedPayment.invoice?.invoiceNo || ''}`,
        amount: baseAmount
      });
    }
    additionalCosts.forEach((c) => {
      if (c.description || parseFloat(c.amount) > 0) {
        previewItems.push({ id: c.id, description: c.description || 'Additional Cost', amount: parseFloat(c.amount) || 0 });
      }
    });

    return {
      id: 'preview',
      receiptNo: 'DRAFT-PREVIEW',
      generatedAt: new Date(),
      projectId: projectId,
      project: project,
      payment: selectedPayment,
      items: previewItems,
    };
  }, [selectedPayment, description, baseAmount, additionalCosts, projectId, project]);

  // 4. Debounced State Logic (Anti-Blink Engine)
  const [debouncedPreviewData, setDebouncedPreviewData] = useState(previewReceiptData);
  const previewDataRef = useRef(previewReceiptData);
  
  useEffect(() => { previewDataRef.current = previewReceiptData; }, [previewReceiptData]);

  const syncPDF = useCallback(() => { setRenderData(previewDataRef.current); }, []);

  const [renderData, setRenderData] = useState(previewReceiptData);

  useEffect(() => {
    const handler = setTimeout(() => { setRenderData(previewReceiptData); }, 800);
    return () => clearTimeout(handler);
  }, [previewReceiptData]);

  // Calculate dynamic total for the sidebar UI
  const totalReceiptAmount = previewReceiptData.items.reduce((sum: number, item: any) => sum + item.amount, 0);

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[#616E7C]">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#2A5CAA]" />
        <p className="text-[13px] font-medium">Loading receipts...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#616E7C]/20">
        <div>
          <h3 className="text-lg font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
            <FiArchive className="text-[#2A5CAA]" /> Official Payment Receipts
          </h3>
          <p className="text-[13px] text-[#616E7C] mt-1">Generate immutable proof-of-payment documents and track additional costs.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="h-10 px-4 inline-flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm shrink-0">
          <FiFilePlus className="w-4 h-4" /> Generate Receipt
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

      {receipts.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-dashed border-[#616E7C]/20">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#2A5CAA]/10 flex items-center justify-center text-[#2A5CAA] mb-4">
            <FiArchive className="w-7 h-7" />
          </div>
          <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">No Receipts Issued Yet</h4>
          <p className="text-[13px] text-[#616E7C] mb-6">Click &quot;Generate Receipt&quot; to issue a document for a verified payment.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#616E7C]/20 bg-white dark:bg-[#14161A] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 text-[#616E7C] font-semibold uppercase text-[11px] tracking-wider">
                <tr><th className="px-4 py-3">Receipt No</th><th className="px-4 py-3">Linked Invoice</th><th className="px-4 py-3">Payment Date</th><th className="px-4 py-3 text-right">Total Amount (LKR)</th><th className="px-4 py-3 text-center">PDF Document</th></tr>
              </thead>
              <tbody className="divide-y divide-[#616E7C]/10">
                {receipts.map(rec => {
                   const total = rec.items.reduce((s:number, i:any) => s + Number(i.amount), 0);
                   return (
                    <tr key={rec.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-[#2A5CAA]">{rec.receiptNo}</td>
                        <td className="px-4 py-3 font-semibold text-[#1F2933]">{rec.payment?.invoice?.invoiceNo || 'N/A'}</td>
                        <td className="px-4 py-3 text-[#616E7C]">{rec.payment?.paymentDate ? new Date(rec.payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-[#1F2933]">LKR {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => window.open(`/api/receipts/${rec.id}/document`, '_blank')} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#2A5CAA]/10 text-[#2A5CAA] text-[12px] font-bold hover:bg-[#2A5CAA]/20 transition-colors">
                            <FiFileText className="w-3.5 h-3.5" /> View PDF
                          </button>
                        </td>
                    </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPLIT-VIEW LIVE EDITOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex bg-gray-50 overflow-hidden">
          
          {/* LEFT PANEL: Form Controls */}
          <div className="w-[450px] bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#F8FAFC]">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2933] flex items-center gap-2"><FiFilePlus className="text-[#2A5CAA]"/> Generate Receipt</h2>
                <p className="text-[11px] text-[#616E7C] mt-0.5">Project #{project.projectNo}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-200 rounded-full hover:bg-red-100 hover:text-red-600 transition"><FiX /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#616E7C]">Link to Verified Payment <span className="text-red-500">*</span></label>
                {pendingPayments.length === 0 ? (
                  <p className="text-[12px] text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">No un-receipted verified payments available.</p>
                ) : (
                  <select value={paymentId} onChange={(e) => setPaymentId(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA]">
                    <option value="">-- Select a Verified Payment Target --</option>
                    {pendingPayments.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {new Date(p.paymentDate).toLocaleDateString()} — Inv {p.invoice?.invoiceNo} (LKR {Number(p.amount).toLocaleString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#616E7C]">Payment Description Override</label>
                <input type="text" placeholder={`Payment for Invoice ${selectedPayment?.invoice?.invoiceNo || '...'}`} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] focus:outline-none focus:border-[#2A5CAA]" />
              </div>

              {/* Dynamic Additional Costs */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-semibold text-[#616E7C]">Additional Costs (Line Items)</label>
                  <button onClick={handleAddCost} className="text-[11px] font-bold text-[#2A5CAA] hover:underline flex items-center"><FiPlus /> Add Cost</button>
                </div>
                {additionalCosts.map((cost) => (
                  <div key={cost.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                    <input type="text" placeholder="Description (e.g. Extra Fee)" value={cost.description} onChange={e => handleCostChange(cost.id, 'description', e.target.value)} className="flex-1 bg-white border border-gray-300 px-2 py-1.5 rounded text-[12px] focus:outline-none focus:border-[#2A5CAA]" />
                    <input type="number" placeholder="LKR" value={cost.amount} onChange={e => handleCostChange(cost.id, 'amount', e.target.value)} className="w-24 bg-white border border-gray-300 px-2 py-1.5 rounded text-[12px] font-mono focus:outline-none focus:border-[#2A5CAA]" />
                    <button onClick={() => handleRemoveCost(cost.id)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[13px] font-bold text-gray-800">Total Received:</span>
                <span className="text-[18px] font-bold font-mono text-[#2A5CAA]">LKR {totalReceiptAmount.toLocaleString()}</span>
              </div>
              <button onClick={handleSubmit} disabled={!paymentId || isSubmitting} className="w-full h-12 flex justify-center items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 text-white font-bold text-[14px] rounded-lg transition-colors disabled:opacity-40 shadow-md">
                {isSubmitting ? <><FiLoader className="animate-spin" /> Locking...</> : <><FiCheckCircle /> Generate Official Receipt</>}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: Live PDF Preview shielded by Memoized Component */}
          {/* Note: The inner dark gray backdrop inside the viewer is a native browser feature. We wrap it in a clean bg-gray-100 container. */}
          <div className="flex-1 bg-gray-100 p-6 sm:p-10 flex flex-col items-center justify-center">
            <div className="w-full flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider">Live Receipt Preview</h3>
            </div>
            <div className="w-full max-w-4xl flex-1 rounded-xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
              <MemoizedReceiptPreview receiptData={renderData} />
            </div>
          </div>

        </div>
      )}
    </div>
  );
}