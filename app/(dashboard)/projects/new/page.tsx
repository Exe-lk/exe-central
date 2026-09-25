'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader } from 'react-icons/fi';

function CreateProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pre-fill type based on the tab the user was looking at
  const defaultType = (searchParams.get('type') as 'OUTSOURCING' | 'INDUSTRIAL') || 'OUTSOURCING';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map to Prisma schema fields
  const [formData, setFormData] = useState({
    projectNo: '',
    name: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    type: defaultType,
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    projectManager: '',
    description: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Format dates to ISO-8601 if they exist
    const payload = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create project');
      }

      router.push('/projects');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable component for perfect enterprise-style horizontal alignment
  const FormRow = ({ 
    label, 
    required, 
    isTextArea, 
    children 
  }: { 
    label: string, 
    required?: boolean, 
    isTextArea?: boolean, 
    children: React.ReactNode 
  }) => (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-8 mb-5 ${isTextArea ? 'sm:items-start' : 'sm:items-center'}`}>
      <label className={`w-full sm:w-[220px] shrink-0 text-[13px] font-semibold text-[#1F2933] dark:text-[#E5E7EB]/90 sm:text-right ${isTextArea ? 'pt-3' : ''}`}>
        {label} {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex-1 max-w-[500px]">
        {children}
      </div>
    </div>
  );

  const inputStyles = "w-full h-9 px-3 text-[13px] bg-white border border-[#616E7C]/30 rounded focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors";
  const textareaStyles = "w-full p-3 text-[13px] bg-white border border-[#616E7C]/30 rounded focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors resize-y";

  return (
    // Reduced container max-width to perfectly balance the left/right whitespace
    <div className="w-full max-w-[900px] mx-auto pb-12 mt-6">
      
      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#14161A] min-h-screen border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-md shadow-sm">
        
        {/* TOP ACTION BAR */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-[#14161A]/95 backdrop-blur-sm flex items-center justify-between px-8 py-5 border-b border-[#616E7C]/20 dark:border-[#3A3E46] rounded-t-md">
          <h1 className="text-[18px] font-bold text-[#1F2933] dark:text-white tracking-tight">
            Create Project Directory
          </h1>
          
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => router.back()}
              disabled={isLoading}
              className="h-8 px-4 flex items-center justify-center bg-[#F8FAFC] border border-[#616E7C]/30 hover:bg-[#616E7C]/10 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 text-[#1F2933] dark:text-white text-[13px] font-semibold rounded transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="h-8 px-6 flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-semibold rounded transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading && <FiLoader className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>

        <div className="p-8 sm:px-12">
          {error && (
            <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] font-bold flex items-center">
              {error}
            </div>
          )}

          {/* SECTION 1: PROJECT DETAILS */}
          <div className="mb-10">
            <h2 className="text-[15px] font-bold text-[#1F2933] dark:text-white border-b border-[#616E7C]/20 dark:border-[#3A3E46] pb-2 mb-6">
              Project Information
            </h2>
            
            <FormRow label="Project ID" required>
              <input required type="text" name="projectNo" placeholder="PRJ-2026-001" value={formData.projectNo} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Project Name" required>
              <input required type="text" name="name" placeholder="Enter formal project name" value={formData.name} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Project Type" required>
              <select required name="type" value={formData.type} onChange={handleChange} className={inputStyles}>
                <option value="OUTSOURCING">Outsourcing</option>
                <option value="INDUSTRIAL">Industrial</option>
              </select>
            </FormRow>

            <FormRow label="Initial Status" required>
              <select required name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                <option value="DRAFT">Draft</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING_REVIEW">Pending Review</option>
              </select>
            </FormRow>

            <FormRow label="Project Manager">
              <input type="text" name="projectManager" placeholder="Assigned Lead" value={formData.projectManager} onChange={handleChange} className={inputStyles} />
            </FormRow>
          </div>

          {/* SECTION 2: CLIENT DIRECTORY */}
          <div className="mb-10">
            <h2 className="text-[15px] font-bold text-[#1F2933] dark:text-white border-b border-[#616E7C]/20 dark:border-[#3A3E46] pb-2 mb-6">
              Client Directory
            </h2>
            
            <FormRow label="Client Name" required>
              <input required type="text" name="clientName" placeholder="Primary contact person" value={formData.clientName} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Organization">
              <input type="text" name="clientCompany" placeholder="Company or Entity Name" value={formData.clientCompany} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Email Address">
              <input type="email" name="clientEmail" placeholder="contact@domain.com" value={formData.clientEmail} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Contact Number">
              <input type="text" name="clientPhone" placeholder="+1 (555) 000-0000" value={formData.clientPhone} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Billing Address" isTextArea>
              <textarea name="clientAddress" placeholder="Registered business address" rows={3} value={formData.clientAddress} onChange={handleChange} className={textareaStyles} />
            </FormRow>
          </div>

          {/* SECTION 3: TIMELINE & SCOPE */}
          <div className="mb-8">
            <h2 className="text-[15px] font-bold text-[#1F2933] dark:text-white border-b border-[#616E7C]/20 dark:border-[#3A3E46] pb-2 mb-6">
              Timeline & Scope
            </h2>
            
            <FormRow label="Start Date">
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} />
            </FormRow>

            <FormRow label="Expected Delivery">
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} />
            </FormRow>

            <FormRow label="Scope Notes" isTextArea>
              <textarea name="description" placeholder="Technical requirements or administrative notes..." rows={5} value={formData.description} onChange={handleChange} className={textareaStyles} />
            </FormRow>
          </div>

        </div>
      </form>
    </div>
  );
}

// Wrap in Suspense to safely use useSearchParams in Next.js App Router
export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#616E7C] text-[13px] font-semibold">Initializing workspace...</div>}>
      <CreateProjectForm />
    </Suspense>
  );
}