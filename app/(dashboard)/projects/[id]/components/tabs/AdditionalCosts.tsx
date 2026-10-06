'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FiPlusCircle, 
  FiTrash2, 
  FiDollarSign, 
  FiUser, 
  FiLayers, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiLoader, 
  FiLock,
  FiFileText
} from 'react-icons/fi';

interface Participant {
  id: string;
  code: string;
  name: string;
}

interface OutsourcingProjectData {
  id: string;
  mode: 'INDIVIDUAL' | 'GROUP';
  participants: Participant[];
}

interface ProjectData {
  id: string;
  outsourcingProject?: OutsourcingProjectData | null;
}

interface AdditionalCostItem {
  id: string;
  outsourcingProjectId: string;
  participantId?: string | null;
  description: string;
  amount: number | string;
  participant?: Participant | null;
  createdAt?: string;
}

interface AdditionalCostsProps {
  project: ProjectData;
  onCostUpdated?: () => void;
}

export default function AdditionalCosts({ project, onCostUpdated }: AdditionalCostsProps) {
  const projectId = project.id;
  const participants = project.outsourcingProject?.participants || [];
  
  // 1. Determine mode safely
  const isGroupMode = project.outsourcingProject?.mode === 'GROUP';

  // Data state
  const [costs, setCosts] = useState<AdditionalCostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Form state
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [participantId, setParticipantId] = useState<string>('');

  // Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch costs list
  const fetchCosts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/additional-costs`);
      const result = await response.json();

      if (response.status === 409) {
        setIsLocked(true);
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch additional costs');
      }

      setCosts(result.data || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading additional costs');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchCosts();
    }
  }, [projectId, fetchCosts]);

  // Total amount calculation
  const totalAdditionalCosts = useMemo(() => {
    return costs.reduce((sum, item) => {
      const num = typeof item.amount === 'number' ? item.amount : parseFloat(String(item.amount));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  }, [costs]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0 || isSubmitting || isLocked) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        description: description.trim(),
        amount: parseFloat(amount),
        participantId: participantId.trim() ? participantId.trim() : null
      };

      const response = await fetch(`/api/projects/${projectId}/additional-costs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 409) {
        setIsLocked(true);
        throw new Error('Financial processing has already started for this project. Additional costs can no longer be modified.');
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to add additional cost');
      }

      setSuccessMessage('Additional cost added successfully!');
      
      // Reset form
      setDescription('');
      setAmount('');
      setParticipantId('');

      // Refresh list
      await fetchCosts();

      if (onCostUpdated) {
        onCostUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while adding the cost');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler
  const handleDelete = async (costId: string) => {
    if (isLocked || deletingId) return;

    setDeletingId(costId);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/additional-costs?costId=${costId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.status === 409) {
        setIsLocked(true);
        throw new Error('Financial processing has already started. Costs cannot be removed.');
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete cost');
      }

      setSuccessMessage('Additional cost removed.');
      setCosts((prev) => prev.filter((c) => c.id !== costId));

      if (onCostUpdated) {
        onCostUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while deleting the cost');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[#616E7C] dark:text-[#E5E7EB]/50">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#2A5CAA] dark:text-[#5B8DD9]" />
        <p className="text-[13px] font-medium">Loading project additional costs...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
        <div>
          <h3 className="text-lg font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
            <FiDollarSign className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
            Outsourcing Additional Costs
          </h3>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-1">
            Manage extra scopes, server hosting, third-party services, or participant-specific expenses outside the base package.
          </p>
        </div>

        {isLocked && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[12px] font-bold shrink-0">
            <FiLock className="w-4 h-4" />
            Financial Lock Active
          </div>
        )}
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

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-[13px]">
          <FiCheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Success</p>
            <p className="mt-0.5">{successMessage}</p>
          </div>
        </div>
      )}

      {/* TWO COLUMN GRID: FORM (LEFT) & TABLE (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: FORM */}
        <div className="lg:col-span-5 p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#616E7C]/10 dark:border-[#3A3E46]">
            <h4 className="text-[14px] font-bold text-[#1F2933] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FiPlusCircle className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
              Add Extra Cost
            </h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* DESCRIPTION */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                Cost Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Domain Registration & Cloud Hosting"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLocked || isSubmitting}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50 transition-colors"
                required
              />
            </div>

            {/* AMOUNT */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="15000.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLocked || isSubmitting}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-mono text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50 transition-colors"
                required
              />
            </div>

            {/* 2. ASSIGN TO (CONDITIONAL RENDER FOR GROUP MODE ONLY) */}
            {isGroupMode && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                  Assigned Scope
                </label>
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  disabled={isLocked || isSubmitting}
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50 transition-colors"
                >
                  <option value="">🌐 Entire Project (Global Expense)</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      👤 Participant [{p.code}] - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={!description.trim() || !amount || parseFloat(amount) <= 0 || isSubmitting || isLocked}
              className="w-full h-10 mt-2 inline-flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white font-bold text-[13px] rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Adding Cost...
                </>
              ) : (
                <>
                  <FiPlusCircle className="w-4 h-4" />
                  Add Additional Cost
                </>
              )}
            </button>

          </form>
        </div>

        {/* RIGHT COLUMN: TABLE LIST */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-[14px] font-bold text-[#1F2933] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FiLayers className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
              Recorded Additional Costs ({costs.length})
            </h4>

            {costs.length > 0 && (
              <span className="text-[13px] font-bold text-[#2A5CAA] dark:text-[#5B8DD9] font-mono bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 px-3 py-1 rounded-lg">
                Total: LKR {totalAdditionalCosts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>

          {costs.length === 0 ? (
            <div className="p-12 text-center rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-dashed border-[#616E7C]/20 dark:border-[#3A3E46] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-3">
                <FiFileText className="w-6 h-6" />
              </div>
              <p className="text-[14px] font-bold text-[#1F2933] dark:text-white mb-1">No Additional Costs Recorded</p>
              <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/60 max-w-sm">
                Use the form to log extra expenses or custom client additions for this outsourcing project.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] bg-white dark:bg-[#14161A] shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 dark:border-[#3A3E46] text-[#616E7C] dark:text-[#E5E7EB]/70 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Scope</th>
                      <th className="px-4 py-3 text-right">Amount (LKR)</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#616E7C]/10 dark:divide-[#3A3E46]/60">
                    {costs.map((c) => {
                      const amountNum = typeof c.amount === 'number' ? c.amount : parseFloat(String(c.amount));
                      const isDeleting = deletingId === c.id;

                      return (
                        <tr key={c.id} className="hover:bg-[#F8FAFC]/50 dark:hover:bg-[#0B0C0E]/40 transition-colors">
                          {/* DESCRIPTION */}
                          <td className="px-4 py-3 font-semibold text-[#1F2933] dark:text-white">
                            {c.description}
                          </td>

                          {/* SCOPE BADGE */}
                          <td className="px-4 py-3">
                            {c.participant ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                <FiUser className="w-3 h-3" />
                                [{c.participant.code}] {c.participant.name}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                🌐 Entire Project
                              </span>
                            )}
                          </td>

                          {/* AMOUNT */}
                          <td className="px-4 py-3 text-right font-mono font-bold text-[#1F2933] dark:text-white">
                            LKR {amountNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* ACTION DELETE */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDelete(c.id)}
                              disabled={isLocked || isDeleting}
                              title="Delete Cost"
                              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-30 cursor-pointer"
                            >
                              {isDeleting ? (
                                <FiLoader className="w-4 h-4 animate-spin text-red-500" />
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
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
        </div>

      </div>
    </div>
  );
}