'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiExternalLink, 
  FiLoader, 
  FiX, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiFileText,
  FiPaperclip,
  FiUploadCloud,
  FiCheck,
  FiArchive,
  FiClock,
  FiXCircle
} from 'react-icons/fi';

interface InvoiceSummary {
  id: string;
  invoiceNo: string;
  totalAmount: number | string;
  status: string;
  clientName: string;
}

interface PaymentProof {
  id: string;
  driveFileId: string;
  fileName: string;
  mimeType: string;
  url: string;
}

interface ReceiptItem {
  id: string;
  receiptNo: string;
  generatedAt: string;
}

interface PaymentRecord {
  id: string;
  projectId: string;
  invoiceId: string;
  amount: number | string;
  paymentDate: string;
  method: string;
  referenceNo?: string | null;
  notes?: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  invoice?: InvoiceSummary | null;
  proof?: PaymentProof | null;
  receipt?: ReceiptItem | null;
  createdAt: string;
}

interface ProjectData {
  id: string;
  projectNo: string;
  name: string;
}

interface PaymentManagerProps {
  project: ProjectData;
  onPaymentLogged?: () => void;
}

export default function PaymentManager({ project, onPaymentLogged }: PaymentManagerProps) {
  const projectId = project.id;

  // Payments list state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<InvoiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [invoiceId, setInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<string>('Online Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  // Notifications
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Payments & Pending Invoices
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [paymentsRes, invoicesRes] = await Promise.all([
        fetch(`/api/payments?projectId=${projectId}`),
        fetch(`/api/invoices?projectId=${projectId}`) // Fetch all to see statuses
      ]);

      const paymentsData = await paymentsRes.json();
      const invoicesData = await invoicesRes.json();

      if (paymentsRes.ok && paymentsData.success) {
        setPayments(paymentsData.data || []);
      }

      if (invoicesRes.ok && invoicesData.success) {
        // Only show PENDING invoices in the dropdown
        setPendingInvoices((invoicesData.data || []).filter((inv: any) => inv.status === 'PENDING'));
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch payment history');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchData();
    }
  }, [projectId, fetchData]);

  // Selected Invoice Details
  const selectedInvoice = useMemo(() => {
    return pendingInvoices.find((inv) => inv.id === invoiceId) || null;
  }, [pendingInvoices, invoiceId]);

  const selectedInvoiceMaxAmount = useMemo(() => {
    if (!selectedInvoice) return 0;
    const n = typeof selectedInvoice.totalAmount === 'number' 
      ? selectedInvoice.totalAmount 
      : parseFloat(String(selectedInvoice.totalAmount));
    return isNaN(n) ? 0 : n;
  }, [selectedInvoice]);

  // Real-time amount validation
  const amountNumber = useMemo(() => {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  const isAmountOverflow = useMemo(() => {
    if (!selectedInvoice || amountNumber <= 0) return false;
    return amountNumber > selectedInvoiceMaxAmount + 0.01;
  }, [selectedInvoice, amountNumber, selectedInvoiceMaxAmount]);

  const isValidForm = useMemo(() => {
    if (!invoiceId) return false;
    if (amountNumber <= 0 || isAmountOverflow) return false;
    if (!method.trim()) return false;
    if (!file) return false;
    return true;
  }, [invoiceId, amountNumber, isAmountOverflow, method, file]);

  // Open modal and select default invoice
  const handleOpenModal = () => {
    setIsModalOpen(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setSuccessMessage(null);
    if (pendingInvoices.length > 0 && !invoiceId) {
      const first = pendingInvoices[0];
      setInvoiceId(first.id);
      setAmount(String(first.totalAmount));
    }
  };

  const handleInvoiceSelectChange = (newInvoiceId: string) => {
    setInvoiceId(newInvoiceId);
    const inv = pendingInvoices.find((i) => i.id === newInvoiceId);
    if (inv) {
      setAmount(String(inv.totalAmount));
    }
  };

  // Status Update Handler (The missing trigger for your backend!)
  const handleUpdateStatus = async (paymentId: string, newStatus: 'VERIFIED' | 'REJECTED') => {
    setActionLoadingId(paymentId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update payment status');
      }

      setSuccessMessage(`Payment successfully marked as ${newStatus}. Invoice status synced.`);
      
      // Refresh to get the latest cascaded data
      await fetchData();
      if (onPaymentLogged) onPaymentLogged();

    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Submit Handler using FormData
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('invoiceId', invoiceId);
      formData.append('amount', String(amountNumber));
      if (paymentDate) formData.append('paymentDate', paymentDate);
      formData.append('method', method.trim());
      if (referenceNo.trim()) formData.append('referenceNo', referenceNo.trim());
      if (notes.trim()) formData.append('notes', notes.trim());
      if (file) formData.append('file', file);

      const response = await fetch('/api/payments', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to record payment');
      }

      if (result.meta?.warning) {
        setWarningMessage(result.meta.warning);
      }

      setSuccessMessage('Payment logged successfully! Please verify it below to sync invoices.');

      // Reset form & close modal
      setIsModalOpen(false);
      setInvoiceId('');
      setAmount('');
      setReferenceNo('');
      setNotes('');
      setFile(null);

      // Refresh list
      await fetchData();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while logging payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for dynamic status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <FiCheck className="w-3 h-3" /> VERIFIED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <FiXCircle className="w-3 h-3" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <FiClock className="w-3 h-3" /> PENDING
          </span>
        );
    }
  };

  if (isLoading && payments.length === 0) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[#616E7C] dark:text-[#E5E7EB]/50">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#2A5CAA] dark:text-[#5B8DD9]" />
        <p className="text-[13px] font-medium">Loading payment & proof history...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
        <div>
          <h3 className="text-lg font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
            <FiCreditCard className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
            Payment Logging & Drive Proof Vault
          </h3>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-1">
            Record customer bank transfers, upload payment slips to Google Drive, and issue verified receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-10 px-4 inline-flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <FiPlus className="w-4 h-4" />
          Record Payment
        </button>
      </div>

      {/* NOTIFICATIONS */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3 text-[13px]">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {warningMessage && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3 text-[13px]">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Drive Sync Warning</p>
            <p className="mt-0.5">{warningMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-[13px]">
          <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Success</p>
            <p className="mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* PAYMENTS LIST TABLE */}
      {payments.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-dashed border-[#616E7C]/20 dark:border-[#3A3E46] flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
            <FiCreditCard className="w-7 h-7" />
          </div>
          <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">No Recorded Payments</h4>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/60 max-w-md mb-6">
            Log verified customer payments to attach bank slips to Google Drive and update invoice statuses.
          </p>
          <button
            type="button"
            onClick={handleOpenModal}
            className="h-10 px-5 inline-flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm"
          >
            <FiPlus className="w-4 h-4" />
            Record First Payment
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] bg-white dark:bg-[#14161A] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 dark:border-[#3A3E46] text-[#616E7C] dark:text-[#E5E7EB]/70 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Method & Ref</th>
                  <th className="px-4 py-3">Receipt No</th>
                  <th className="px-4 py-3">Drive Proof</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount Paid</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#616E7C]/10 dark:divide-[#3A3E46]/60">
                {payments.map((p) => {
                  const amountNum = typeof p.amount === 'number' ? p.amount : parseFloat(String(p.amount));
                  const isProcessing = actionLoadingId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#0B0C0E]/40 transition-colors">
                      {/* DATE */}
                      <td className="px-4 py-3 text-[#1F2933] dark:text-white font-medium">
                        {new Date(p.paymentDate).toLocaleDateString()}
                      </td>

                      {/* INVOICE NO */}
                      <td className="px-4 py-3 font-mono font-bold text-[#2A5CAA] dark:text-[#5B8DD9]">
                        {p.invoice?.invoiceNo || 'N/A'}
                      </td>

                      {/* METHOD & REF */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-[#1F2933] dark:text-white block">
                          {p.method}
                        </span>
                        {p.referenceNo && (
                          <span className="font-mono text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/60">
                            Ref: {p.referenceNo}
                          </span>
                        )}
                      </td>

                      {/* RECEIPT NO */}
                      <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {p.receipt?.receiptNo ? (
                          <span className="inline-flex items-center gap-1">
                            <FiArchive className="w-3.5 h-3.5" />
                            {p.receipt.receiptNo}
                          </span>
                        ) : (
                          <span className="text-[#616E7C] dark:text-[#E5E7EB]/50 font-sans font-normal text-[12px]">Pending Verification</span>
                        )}
                      </td>

                      {/* DRIVE PROOF LINK */}
                      <td className="px-4 py-3">
                        {p.proof?.url ? (
                          <a
                            href={p.proof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[12px] font-bold hover:underline"
                          >
                            <FiPaperclip className="w-3.5 h-3.5" />
                            Proof Slip
                            <FiExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/50">No Proof Attached</span>
                        )}
                      </td>

                      {/* STATUS BADGE - NOW DYNAMIC */}
                      <td className="px-4 py-3">
                        {renderStatusBadge(p.status)}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-[#1F2933] dark:text-white">
                        LKR {amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="px-4 py-3 text-center">
                        {p.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(p.id, 'VERIFIED')}
                              disabled={isProcessing}
                              title="Verify Payment"
                              className="p-1.5 rounded-md text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              {isProcessing ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(p.id, 'REJECTED')}
                              disabled={isProcessing}
                              title="Reject Payment"
                              className="p-1.5 rounded-md text-red-600 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 transition-colors cursor-pointer"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/50">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-2xl shadow-2xl overflow-hidden">
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-[#616E7C]/20 dark:border-[#3A3E46] bg-[#F8FAFC] dark:bg-[#0B0C0E]">
              <div>
                <h3 className="text-base font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
                  <FiCreditCard className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
                  Record Payment
                </h3>
                <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/60 mt-0.5">
                  Logs a pending payment and uploads bank slip proof to Drive.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#616E7C] hover:text-[#1F2933] dark:text-[#E5E7EB]/70 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL FORM */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* INVOICE SELECTION */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                  Target Unpaid Invoice <span className="text-red-500">*</span>
                </label>
                {pendingInvoices.length === 0 ? (
                  <p className="p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[12px] font-medium border border-amber-500/20">
                    No pending invoices found for this project. Please generate an invoice first.
                  </p>
                ) : (
                  <select
                    value={invoiceId}
                    onChange={(e) => handleInvoiceSelectChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9]"
                    required
                  >
                    <option value="">-- Select Pending Invoice --</option>
                    {pendingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNo} — Billed: {inv.clientName} (LKR {parseFloat(String(inv.totalAmount)).toLocaleString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* AMOUNT & DATE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                    Payment Amount (LKR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full h-10 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0C0E] border font-mono text-[13px] focus:outline-none ${
                      isAmountOverflow 
                        ? 'border-red-500 text-red-500' 
                        : 'border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9]'
                    }`}
                    required
                  />
                  {isAmountOverflow && (
                    <p className="text-[11px] text-red-500 font-medium">
                      Exceeds invoice balance (LKR {selectedInvoiceMaxAmount.toLocaleString()})
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9]"
                    required
                  />
                </div>
              </div>

              {/* METHOD & REF NO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9]"
                    required
                  >
                    <option value="Online Bank Transfer">Online Bank Transfer</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                    <option value="Cheque Deposit">Cheque Deposit</option>
                    <option value="Online Credit Card">Online Credit Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                    Bank Reference / Slip No
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-998877"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-mono text-[13px] focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9]"
                  />
                </div>
              </div>

              {/* FILE UPLOAD (BANK SLIP / PROOF) */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                  Payment Proof Slip (PDF / Image) <span className="text-red-500">*</span>
                </label>
                <div className="relative border-2 border-dashed border-[#616E7C]/30 dark:border-[#3A3E46] rounded-xl p-4 text-center hover:border-[#2A5CAA] dark:hover:border-[#5B8DD9] transition-colors bg-[#F8FAFC]/50 dark:bg-[#0B0C0E]/50">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg,image/jpg,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <FiUploadCloud className="w-6 h-6 text-[#2A5CAA] dark:text-[#5B8DD9] mb-1" />
                    {file ? (
                      <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ {file.name} ({Math.round(file.size / 1024)} KB)
                      </p>
                    ) : (
                      <>
                        <p className="text-[13px] font-semibold text-[#1F2933] dark:text-white">
                          Click or drag bank transfer slip / PDF proof here
                        </p>
                        <p className="text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/50 mt-0.5">
                          Supports PDF, PNG, JPG, JPEG, WEBP (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via Commercial Bank online portal"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9]"
                />
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#616E7C]/20 dark:border-[#3A3E46]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="h-10 px-4 text-[13px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70 hover:text-[#1F2933] dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValidForm || isSubmitting}
                  className="h-10 px-6 inline-flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white font-bold text-[13px] rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Uploading to Drive...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Record Payment
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