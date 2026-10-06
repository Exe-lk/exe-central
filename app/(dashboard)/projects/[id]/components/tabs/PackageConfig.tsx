'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  FiBox, 
  FiPlus, 
  FiTrash2, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiLoader, 
  FiInfo, 
  FiDollarSign, 
  FiCalendar, 
  FiRefreshCw,
  FiLock,
  FiSliders
} from 'react-icons/fi';

interface TemplateMilestone {
  id: string;
  name: string;
  amount: number | string;
  order: number;
}

interface PackageTemplate {
  id: string;
  name: string;
  durationMonths: number;
  totalAmount: number | string;
  milestones: TemplateMilestone[];
}

interface MilestoneInput {
  id?: string;
  name: string;
  amount: string | number;
  order: number;
  dueDate: string;
}

interface PackageConfigProps {
  projectId: string;
  onPackageUpdated?: () => void;
}

export default function PackageConfig({ projectId, onPackageUpdated }: PackageConfigProps) {
  // State
  const [templates, setTemplates] = useState<PackageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [packageName, setPackageName] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [taxAmount, setTaxAmount] = useState<string>('0');
  const [milestones, setMilestones] = useState<MilestoneInput[]>([]);

  // Page level state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper number parser
  const parseToNum = (val: number | string | undefined | null): number => {
    if (val === undefined || val === null || val === '') return 0;
    const parsed = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(parsed) ? 0 : parsed;
  };

  const roundTwoDecimals = (num: number): number => {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  };

  // Fetch initial data (Templates & Existing Saved Package)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Fetch Templates and Existing Package concurrently
        const [templatesRes, packageRes] = await Promise.all([
          fetch('/api/package-templates'),
          fetch(`/api/projects/${projectId}/package`)
        ]);

        const templatesData = await templatesRes.json();
        const packageData = await packageRes.json();

        if (!isMounted) return;

        if (templatesRes.ok && templatesData.success) {
          setTemplates(templatesData.data || []);
        }

        if (packageRes.ok && packageData.success && packageData.data) {
          const pkg = packageData.data;
          setPackageName(pkg.name || '');
          setTotalAmount(String(pkg.totalAmount ?? ''));
          setDiscountAmount(String(pkg.discountAmount ?? '0'));
          setTaxAmount(String(pkg.taxAmount ?? '0'));
          setSelectedTemplateId(pkg.templateId || '');

          if (Array.isArray(pkg.milestones) && pkg.milestones.length > 0) {
            setMilestones(
              pkg.milestones.map((m: any, idx: number) => ({
                id: m.id,
                name: m.name,
                amount: String(m.amount),
                order: m.order || idx + 1,
                dueDate: m.dueDate ? new Date(m.dueDate).toISOString().split('T')[0] : ''
              }))
            );
          }
        } else if (packageRes.status === 409) {
          setIsLocked(true);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load package configuration');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (!templateId) return;

    const selected = templates.find((t) => t.id === templateId);
    if (selected) {
      setPackageName(selected.name);
      setTotalAmount(String(selected.totalAmount));
      
      if (Array.isArray(selected.milestones) && selected.milestones.length > 0) {
        setMilestones(
          selected.milestones.map((m, idx) => ({
            name: m.name,
            amount: String(m.amount),
            order: m.order || idx + 1,
            dueDate: ''
          }))
        );
      }
    }
  };

  // Milestone Row Modifications
  const handleAddMilestone = () => {
    setMilestones((prev) => [
      ...prev,
      {
        name: `Milestone ${prev.length + 1}`,
        amount: '0',
        order: prev.length + 1,
        dueDate: ''
      }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((m, idx) => ({ ...m, order: idx + 1 }));
    });
  };

  const handleMilestoneChange = (index: number, field: keyof MilestoneInput, value: string) => {
    setMilestones((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Real-time Financial Calculations
  const numTotalAmount = useMemo(() => parseToNum(totalAmount), [totalAmount]);
  const numDiscountAmount = useMemo(() => parseToNum(discountAmount), [discountAmount]);
  const numTaxAmount = useMemo(() => parseToNum(taxAmount), [taxAmount]);

  const runningTotal = useMemo(() => {
    const sum = milestones.reduce((acc, m) => acc + parseToNum(m.amount), 0);
    return roundTwoDecimals(sum);
  }, [milestones]);

  const netPayable = useMemo(() => {
    return roundTwoDecimals(numTotalAmount - numDiscountAmount + numTaxAmount);
  }, [numTotalAmount, numDiscountAmount, numTaxAmount]);

  const totalDifference = useMemo(() => {
    return roundTwoDecimals(runningTotal - numTotalAmount);
  }, [runningTotal, numTotalAmount]);

  const isTotalMatching = useMemo(() => {
    return Math.abs(totalDifference) < 0.01 && numTotalAmount > 0;
  }, [totalDifference, numTotalAmount]);

  const isValidForm = useMemo(() => {
    if (!packageName.trim()) return false;
    if (numTotalAmount <= 0) return false;
    if (milestones.length === 0) return false;
    if (!isTotalMatching) return false;
    
    // Check all milestones have valid names and positive amounts
    for (const m of milestones) {
      if (!m.name.trim()) return false;
      if (parseToNum(m.amount) < 0) return false;
    }

    return true;
  }, [packageName, numTotalAmount, milestones, isTotalMatching]);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidForm || isSaving || isLocked) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        name: packageName.trim(),
        totalAmount: numTotalAmount,
        discountAmount: numDiscountAmount,
        taxAmount: numTaxAmount,
        templateId: selectedTemplateId || null,
        milestones: milestones.map((m, idx) => ({
          name: m.name.trim(),
          amount: parseToNum(m.amount),
          order: idx + 1,
          dueDate: m.dueDate ? m.dueDate : null
        }))
      };

      const response = await fetch(`/api/projects/${projectId}/package`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        if (response.status === 409) {
          setIsLocked(true);
          throw new Error('Financial processing has already started for this project. Packages can no longer be modified.');
        }
        throw new Error(result.error || 'Failed to save package configuration.');
      }

      setSuccessMessage('Project package and milestone schedule saved successfully!');
      if (onPackageUpdated) {
        onPackageUpdated();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center text-[#616E7C] dark:text-[#E5E7EB]/50">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#2A5CAA] dark:text-[#5B8DD9]" />
        <p className="text-[13px] font-medium">Loading package configuration & templates...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
        <div>
          <h3 className="text-lg font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
            <FiBox className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
            Package & Milestone Configuration
          </h3>
          <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-1">
            Configure the financial package total, discounts, tax, and define individual payment milestones.
          </p>
        </div>

        {isLocked && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[12px] font-bold">
            <FiLock className="w-4 h-4" />
            Financial Lock Active
          </div>
        )}
      </div>

      {/* ALERTS / NOTIFICATIONS */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-start gap-3 text-[13px]">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Configuration Error</p>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* TOP SECTION: PACKAGE TEMPLATE SELECTION */}
        <div className="p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-bold text-[#1F2933] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FiSliders className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
              1. Preset Package Template
            </label>
            <span className="text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/50">
              Selecting a template auto-populates amounts and milestones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                disabled={isLocked || isSaving}
                className="w-full h-11 px-4 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50 transition-colors"
              >
                <option value="">-- Custom / Choose Package Template --</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.durationMonths} Months) — LKR {parseToNum(tpl.totalAmount).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedTemplateId && (
              <div className="flex items-center gap-2 text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 bg-white dark:bg-[#14161A] p-3 rounded-lg border border-[#616E7C]/10 dark:border-[#3A3E46]">
                <FiInfo className="w-4 h-4 text-[#2A5CAA] dark:text-[#5B8DD9] shrink-0" />
                <span>
                  Template loaded. You can modify totals and milestone amounts freely below.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE SECTION: FINANCIAL TOTALS */}
        <div className="p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] space-y-6">
          <label className="text-[13px] font-bold text-[#1F2933] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FiDollarSign className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
            2. Package Totals & Pricing
          </label>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* PACKAGE NAME */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                Package Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 03 Month Standard"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                disabled={isLocked || isSaving}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
                required
              />
            </div>

            {/* TOTAL AMOUNT */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                Total Package Amount (LKR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="75000.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                disabled={isLocked || isSaving}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-mono text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
                required
              />
            </div>

            {/* DISCOUNT AMOUNT */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                Discount Amount (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                disabled={isLocked || isSaving}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-mono text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
              />
            </div>

            {/* TAX AMOUNT */}
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                Tax Amount (LKR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={taxAmount}
                onChange={(e) => setTaxAmount(e.target.value)}
                disabled={isLocked || isSaving}
                className="w-full h-10 px-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-mono text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
              />
            </div>

          </div>

          {/* FINANCIAL SUMMARY COUNTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#616E7C]/10 dark:border-[#3A3E46]/50">
            <div className="p-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/10 dark:border-[#3A3E46]">
              <span className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/60 uppercase tracking-wider block">Package Base Total</span>
              <span className="text-base font-bold font-mono text-[#1F2933] dark:text-white">
                LKR {numTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/10 dark:border-[#3A3E46]">
              <span className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/60 uppercase tracking-wider block">Discounts & Taxes</span>
              <span className="text-base font-bold font-mono text-[#1F2933] dark:text-white">
                - LKR {numDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} + LKR {numTaxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 border border-[#2A5CAA]/20 dark:border-[#5B8DD9]/20">
              <span className="text-[11px] font-bold text-[#2A5CAA] dark:text-[#5B8DD9] uppercase tracking-wider block">Net Payable Amount</span>
              <span className="text-base font-bold font-mono text-[#2A5CAA] dark:text-[#5B8DD9]">
                LKR {netPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: DYNAMIC MILESTONE ROWS */}
        <div className="p-6 rounded-xl bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-[13px] font-bold text-[#1F2933] dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FiCalendar className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
                3. Milestone Schedule Breakdowns
              </label>
              <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/60 mt-0.5">
                The sum of milestone amounts must exactly equal the Total Package Amount.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMilestone}
              disabled={isLocked || isSaving}
              className="h-9 px-4 inline-flex items-center gap-2 bg-[#2A5CAA]/10 hover:bg-[#2A5CAA]/20 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:hover:bg-[#5B8DD9]/20 dark:text-[#5B8DD9] text-[13px] font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0 self-start sm:self-auto"
            >
              <FiPlus className="w-4 h-4" />
              Add Milestone
            </button>
          </div>

          {/* REAL-TIME VALIDATION WARNING BANNER */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[13px] transition-colors ${
            isTotalMatching 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
          }`}>
            <div className="flex items-center gap-3">
              {isTotalMatching ? (
                <FiCheckCircle className="w-5 h-5 shrink-0" />
              ) : (
                <FiAlertTriangle className="w-5 h-5 shrink-0" />
              )}
              <div>
                <span className="font-bold block">
                  {isTotalMatching 
                    ? 'Milestone Total Verified' 
                    : 'Milestone Total Mismatch Warning'}
                </span>
                <span className="text-[12px] opacity-90">
                  {isTotalMatching 
                    ? 'The sum of all milestone breakdown amounts matches the package total perfectly.' 
                    : `Running milestone sum (LKR ${runningTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}) does not equal Package Total (LKR ${numTotalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}).`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/50 dark:bg-[#14161A]/50 px-4 py-2 rounded-lg border border-current/20 shrink-0 font-mono font-bold text-[13px]">
              <div>
                <span className="text-[10px] uppercase block opacity-70">Running Total</span>
                <span>LKR {runningTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="h-6 w-px bg-current/20" />
              <div>
                <span className="text-[10px] uppercase block opacity-70">Difference</span>
                <span className={totalDifference === 0 ? 'text-emerald-500' : 'text-red-500'}>
                  {totalDifference > 0 ? `+${totalDifference}` : totalDifference}
                </span>
              </div>
            </div>
          </div>

          {/* MILESTONE INPUT ROWS */}
          {milestones.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#616E7C]/20 dark:border-[#3A3E46] rounded-lg">
              <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/60 mb-3">No payment milestones defined.</p>
              <button
                type="button"
                onClick={handleAddMilestone}
                disabled={isLocked || isSaving}
                className="inline-flex items-center gap-2 text-[13px] font-bold text-[#2A5CAA] dark:text-[#5B8DD9] hover:underline"
              >
                <FiPlus /> Add First Milestone
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((m, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-12 gap-3 items-center p-3 rounded-lg bg-white dark:bg-[#14161A] border border-[#616E7C]/20 dark:border-[#3A3E46]"
                >
                  {/* ORDER BADGE */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#616E7C] dark:text-[#E5E7EB]/70 font-mono text-[12px] font-bold flex items-center justify-center">
                      #{index + 1}
                    </span>
                  </div>

                  {/* MILESTONE NAME */}
                  <div className="col-span-11 sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Milestone Name (e.g. Advance Payment)"
                      value={m.name}
                      onChange={(e) => handleMilestoneChange(index, 'name', e.target.value)}
                      disabled={isLocked || isSaving}
                      className="w-full h-9 px-3 rounded-md bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* MILESTONE AMOUNT */}
                  <div className="col-span-6 sm:col-span-3">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Amount (LKR)"
                      value={m.amount}
                      onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                      disabled={isLocked || isSaving}
                      className="w-full h-9 px-3 rounded-md bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-mono text-[13px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
                      required
                    />
                  </div>

                  {/* DUE DATE */}
                  <div className="col-span-5 sm:col-span-2">
                    <input
                      type="date"
                      value={m.dueDate}
                      onChange={(e) => handleMilestoneChange(index, 'dueDate', e.target.value)}
                      disabled={isLocked || isSaving}
                      className="w-full h-9 px-2 rounded-md bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#1F2933] dark:text-white text-[12px] font-medium focus:outline-none focus:border-[#2A5CAA] dark:focus:border-[#5B8DD9] disabled:opacity-50"
                    />
                  </div>

                  {/* REMOVE BUTTON */}
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      disabled={isLocked || isSaving || milestones.length <= 1}
                      title="Remove Milestone"
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-30"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BOTTOM SUBMIT BAR */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-[#616E7C]/20 dark:border-[#3A3E46]">
          <button
            type="submit"
            disabled={!isValidForm || isSaving || isLocked}
            className="h-11 px-8 inline-flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white font-bold text-[14px] rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Saving Package...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" />
                Save Package Configuration
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
