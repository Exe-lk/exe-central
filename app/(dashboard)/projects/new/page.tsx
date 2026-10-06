'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiLoader, FiPlus, FiTrash2, FiAlertCircle } from 'react-icons/fi';

// FIX: FormRow is defined at module level so its identity stays stable across
// re-renders. Defining it inside CreateProjectForm caused React to remount the
// inputs on every keystroke, which dropped focus and the cursor.
const FormRow = ({
  label,
  required,
  isTextArea,
  children,
}: {
  label: string;
  required?: boolean;
  isTextArea?: boolean;
  children: React.ReactNode;
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

function CreateProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Pre-fill type based on the tab parameter if passed
  const defaultType = (searchParams.get('type') as 'OUTSOURCING' | 'INDUSTRIAL') || 'OUTSOURCING';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Form state matching backend API requirements
  const [formData, setFormData] = useState({
    projectNo: '',
    name: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    country: 'Sri Lanka',
    type: defaultType,
    outsourcingMode: 'INDIVIDUAL' as 'INDIVIDUAL' | 'GROUP',
    status: 'DRAFT',
    startDate: '',
    endDate: '',
    projectManager: '',
    description: '',
  });

  // Dynamic participants array for GROUP mode
  const [participants, setParticipants] = useState<string[]>(['']);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleParticipantChange = (index: number, value: string) => {
    const updated = [...participants];
    updated[index] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, '']);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setWarning(null);

    // Prepare payload for POST /api/projects
    const isOutsourcing = formData.type === 'OUTSOURCING';
    const isGroup = isOutsourcing && formData.outsourcingMode === 'GROUP';

    const payload = {
      projectNo: formData.projectNo.trim(),
      name: formData.name.trim(),
      clientName: formData.clientName.trim(),
      clientCompany: formData.clientCompany ? formData.clientCompany.trim() : null,
      clientEmail: formData.clientEmail ? formData.clientEmail.trim() : null,
      clientPhone: formData.clientPhone ? formData.clientPhone.trim() : null,
      clientAddress: formData.clientAddress ? formData.clientAddress.trim() : null,
      country: formData.country ? formData.country.trim() : null,
      type: formData.type,
      ...(isOutsourcing
        ? {
            outsourcingMode: formData.outsourcingMode,
            ...(isGroup
              ? {
                  participants: participants.map(p => p.trim()).filter(p => p.length > 0),
                }
              : {}),
          }
        : {}),
      status: formData.status,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      projectManager: formData.projectManager ? formData.projectManager.trim() : null,
      description: formData.description ? formData.description.trim() : null,
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

      if (result.meta?.warning) {
        setWarning(result.meta.warning);
      }

      const createdId = result.data?.id;
      if (createdId) {
        router.push(`/projects/${createdId}`);
        router.refresh();
      } else {
        router.push('/projects');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyles = "w-full h-9 px-3 text-[13px] bg-white border border-[#616E7C]/30 rounded focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors";
  const textareaStyles = "w-full p-3 text-[13px] bg-white border border-[#616E7C]/30 rounded focus:outline-none focus:border-[#2A5CAA] dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:text-white dark:focus:border-[#5B8DD9] transition-colors resize-y";

  return (
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
            <div className="mb-6 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[13px] font-bold flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {warning && (
            <div className="mb-6 p-3 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[13px] font-bold flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{warning}</span>
            </div>
          )}

          {/* SECTION 1: PROJECT DETAILS */}
          <div className="mb-10">
            <h2 className="text-[15px] font-bold text-[#1F2933] dark:text-white border-b border-[#616E7C]/20 dark:border-[#3A3E46] pb-2 mb-6">
              Project Information
            </h2>
            
            <FormRow label="Project ID" required>
              <input required type="text" name="projectNo" placeholder="PN074" value={formData.projectNo} onChange={handleChange} className={inputStyles} />
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

            {formData.type === 'OUTSOURCING' && (
              <>
                <FormRow label="Outsourcing Mode" required>
                  <select 
                    required 
                    name="outsourcingMode" 
                    value={formData.outsourcingMode} 
                    onChange={handleChange} 
                    className={inputStyles}
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="GROUP">Group</option>
                  </select>
                </FormRow>

                {formData.outsourcingMode === 'GROUP' && (
                  <FormRow label="Group Participants" required>
                    <div className="space-y-3">
                      {participants.map((participant, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-[12px] font-mono text-[#616E7C] dark:text-[#E5E7EB]/60 w-7 shrink-0 text-right">
                            C{index + 1}:
                          </span>
                          <input
                            required
                            type="text"
                            placeholder={`Participant ${index + 1} Name`}
                            value={participant}
                            onChange={(e) => handleParticipantChange(index, e.target.value)}
                            className={inputStyles}
                          />
                          {participants.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParticipant(index)}
                              className="p-2 text-red-500 hover:text-red-700 transition-colors"
                              title="Remove Participant"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addParticipant}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9] hover:bg-[#2A5CAA]/20 text-[12px] font-bold rounded transition-colors"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        Add Participant
                      </button>
                    </div>
                  </FormRow>
                )}
              </>
            )}

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

            <FormRow label="Country">
              <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Email Address">
              <input type="email" name="clientEmail" placeholder="contact@domain.com" value={formData.clientEmail} onChange={handleChange} className={inputStyles} />
            </FormRow>

            <FormRow label="Contact Number">
              <input type="text" name="clientPhone" placeholder="+94 77 000 0000" value={formData.clientPhone} onChange={handleChange} className={inputStyles} />
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

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#616E7C] text-[13px] font-semibold">Initializing workspace...</div>}>
      <CreateProjectForm />
    </Suspense>
  );
}