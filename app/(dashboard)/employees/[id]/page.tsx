'use client';

import { useState, useEffect, useCallback, useMemo, memo, useId } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiFolder,
  FiExternalLink,
  FiEdit3,
  FiTrash2,
  FiDownload,
  FiUploadCloud,
  FiFileText,
  FiShield,
  FiCreditCard,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
  FiX,
  FiPaperclip,
  FiClock,
  FiLock,
  FiDollarSign,
  FiAlignLeft
} from 'react-icons/fi';
import NDATemplate from '@/components/pdf/NDATemplate';
import BankDetailsTemplate from '@/components/pdf/BankDetailsTemplate';
import LOITemplate, { LOITemplateData } from '@/components/pdf/LOITemplate';

// 1. Dynamically import PDF components to prevent Next.js SSR hydration errors
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <span className="inline-flex items-center justify-center gap-2 text-[13px] font-semibold text-gray-400 py-2">
        <FiLoader className="w-4 h-4 animate-spin text-[#2A5CAA] dark:text-[#5B8DD9]" />
        <span>Preparing PDF...</span>
      </span>
    ),
  }
);

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full text-gray-300 bg-gray-800">
        <FiLoader className="w-8 h-8 animate-spin mb-3 text-[#5B8DD9]" />
        <p className="text-[13px] font-medium">Rendering Live LOI Preview...</p>
      </div>
    ),
  }
);

// 2. Anti-Blink PDF Engine: Memoized to block parent re-renders on keystrokes
const MemoizedLOIPreview = memo(
  ({ data }: { data: LOITemplateData }) => {
    return (
      <PDFViewer width="100%" height="100%" className="border-none">
        <LOITemplate data={data} />
      </PDFViewer>
    );
  },
  (prevProps, nextProps) => {
    return JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
  }
);

MemoizedLOIPreview.displayName = 'MemoizedLOIPreview';

interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: string;
  fileName: string;
  mimeType: string;
  driveFileId: string;
  url: string;
  uploadedAt: string;
}

interface EmployeeDetail {
  id: string;
  fullName: string;
  email: string;
  position: string;
  appointedDate: string;
  endDate?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'RESIGNED' | string;
  driveFolderId?: string | null;
  documents: EmployeeDocument[];
  createdAt: string;
  updatedAt: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params?.id as string;
  const fileInputId = useId();

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editFullName, setEditFullName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPosition, setEditPosition] = useState<string>('');
  const [editAppointedDate, setEditAppointedDate] = useState<string>('');
  const [editEndDate, setEditEndDate] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('ACTIVE');
  const [editDriveFolderId, setEditDriveFolderId] = useState<string>('');

  // Delete State
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // LOI Builder State (Phase 3 Split-Screen Engine)
  const [isLoiModalOpen, setIsLoiModalOpen] = useState<boolean>(false);
  const [loiDate, setLoiDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [loiDuration, setLoiDuration] = useState<string>('6 Months');
  const [loiStartDate, setLoiStartDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [loiProbationSalary, setLoiProbationSalary] = useState<string>('LKR 25,000 / Month');
  const [loiBasicSalary, setLoiBasicSalary] = useState<string>('LKR 35,000 / Month');
  const [loiAllowance, setLoiAllowance] = useState<string>('N/A');
  const [loiReportingManager, setLoiReportingManager] = useState<string>('Lead Software Engineer / Engineering Division');
  const [loiNoticePeriod, setLoiNoticePeriod] = useState<string>('1 Month');
  const [loiCustomBody, setLoiCustomBody] = useState<string>(
    'We are pleased to offer you the position. We believe that this mutual agreement will enable both parties to excel in our respective capabilities in the future. Please find below the details of your employment offer:'
  );

  // Document Upload State (Mocked for Drive Vault)
  const [uploadDocType, setUploadDocType] = useState<string>('NDA');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Hydration safety flag
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${employeeId}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch employee details');
      }
      const data = json.data;
      setEmployee(data);

      // Pre-fill initial LOI state from employee details
      if (data) {
        if (data.appointedDate) {
          setLoiStartDate(new Date(data.appointedDate).toISOString().slice(0, 10));
        }
      }
    } catch (err: any) {
      console.error('Fetch employee error:', err);
      setError(err.message || 'Could not load employee details');
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  // Open Edit Modal with Prepopulated data
  const handleOpenEditModal = () => {
    if (!employee) return;
    setEditFullName(employee.fullName || '');
    setEditEmail(employee.email || '');
    setEditPosition(employee.position || '');
    setEditAppointedDate(
      employee.appointedDate ? new Date(employee.appointedDate).toISOString().slice(0, 10) : ''
    );
    setEditEndDate(
      employee.endDate ? new Date(employee.endDate).toISOString().slice(0, 10) : ''
    );
    setEditStatus(employee.status || 'ACTIVE');
    setEditDriveFolderId(employee.driveFolderId || '');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit Form (PUT)
  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingEdit || !employee) return;

    if (!editFullName.trim() || !editEmail.trim() || !editPosition.trim() || !editAppointedDate) {
      setEditError('Please fill in all required fields.');
      return;
    }

    setIsSubmittingEdit(true);
    setEditError(null);

    try {
      const payload = {
        fullName: editFullName.trim(),
        email: editEmail.trim().toLowerCase(),
        position: editPosition.trim(),
        appointedDate: editAppointedDate,
        endDate: editEndDate ? editEndDate : null,
        status: editStatus,
        driveFolderId: editDriveFolderId.trim() || null,
      };

      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to update employee record');
      }

      setSuccessMessage('Employee profile updated successfully!');
      setIsEditModalOpen(false);
      await fetchEmployee();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setEditError(err.message || 'An error occurred while updating the employee');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Delete Employee (DELETE)
  const handleDeleteEmployee = async () => {
    if (!employee || isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${employee.fullName}"?\n\nThis will remove their profile and all associated HR Vault documents from the system.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete employee record');
      }

      router.push('/employees');
    } catch (err: any) {
      alert(err.message || 'Failed to delete employee.');
      setIsDeleting(false);
    }
  };

  // Mock Upload to Drive
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    console.log('Mock uploading document to Drive:', {
      employeeId: employee?.id,
      documentType: uploadDocType,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
    });

    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(`Uploaded "${selectedFile.name}" as [${uploadDocType}] to Employee Drive.`);
      setSelectedFile(null);
      setTimeout(() => setUploadSuccess(null), 5000);
    }, 1200);
  };

  // ==========================================
  // ANTI-BLINK LOI LIVE PREVIEW ENGINE
  // ==========================================
  const previewLOIData: LOITemplateData = useMemo(() => {
    const formattedDate = loiDate
      ? new Date(loiDate).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');

    const formattedStartDate = loiStartDate
      ? new Date(loiStartDate).toLocaleDateString('en-GB')
      : employee?.appointedDate
      ? new Date(employee.appointedDate).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');

    return {
      employeeName: employee?.fullName || 'Candidate / Employee Name',
      position: employee?.position || 'Intern Software Engineer',
      date: formattedDate,
      durationMonths: loiDuration || '6 Months',
      startDate: formattedStartDate,
      probationSalary: loiProbationSalary || 'LKR 25,000 / Month',
      basicSalary: loiBasicSalary || 'LKR 35,000 / Month',
      allowance: loiAllowance || 'N/A',
      reportingManager: loiReportingManager || 'Lead Software Engineer / Engineering Division',
      noticePeriod: loiNoticePeriod || '1 Month',
      customBodyText:
        loiCustomBody ||
        'We are pleased to offer you the position. We believe that this mutual agreement will enable both parties to excel in our respective capabilities in the future. Please find below the details of your employment offer:',
    };
  }, [
    employee,
    loiDate,
    loiDuration,
    loiStartDate,
    loiProbationSalary,
    loiBasicSalary,
    loiAllowance,
    loiReportingManager,
    loiNoticePeriod,
    loiCustomBody,
  ]);

  // Debounced State (800ms) for Smooth Live Preview
  const [renderLoiData, setRenderLoiData] = useState<LOITemplateData>(previewLOIData);

  useEffect(() => {
    const handler = setTimeout(() => {
      setRenderLoiData(previewLOIData);
    }, 800);
    return () => clearTimeout(handler);
  }, [previewLOIData]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20';
      case 'RESIGNED':
        return 'bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200';
    }
  };

  const getDocTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'NDA':
        return 'bg-purple-500/10 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20';
      case 'BANK_FORM':
        return 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20';
      case 'LOI':
        return 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20';
      case 'NIC_COPY':
      case 'PASSBOOK_COPY':
        return 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-24 flex flex-col items-center justify-center text-[#616E7C] dark:text-[#E5E7EB]/50">
        <FiLoader className="w-9 h-9 animate-spin mb-4 text-[#2A5CAA] dark:text-[#5B8DD9]" />
        <p className="text-[14px] font-semibold">Loading employee profile &amp; document vault...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="w-full max-w-[1600px] mx-auto py-12">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-[13px] font-bold text-[#616E7C] hover:text-[#1F2933] dark:text-[#E5E7EB]/70 dark:hover:text-white transition-colors mb-6"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Employees
        </Link>
        <div className="p-8 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
            <FiAlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-red-700 dark:text-red-400 font-bold text-[16px] mb-1">Employee Record Not Found</h3>
          <p className="text-[13px] text-red-600/80 dark:text-red-400/80 mb-5">
            {error || 'The requested employee profile could not be located in the database.'}
          </p>
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 text-white text-[13px] font-bold rounded-md transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" /> Return to Directory
          </Link>
        </div>
      </div>
    );
  }

  const sanitizedFileName = employee.fullName.replace(/\s+/g, '_');
  const pdfDate = employee.appointedDate
    ? new Date(employee.appointedDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-16 animate-in fade-in duration-300">
      
      {/* 1. BACK NAVIGATION */}
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-[13px] font-bold text-[#616E7C] hover:text-[#1F2933] dark:text-[#E5E7EB]/70 dark:hover:text-white transition-colors mb-6"
      >
        <FiArrowLeft className="w-4 h-4" />
        Back to Employees Directory
      </Link>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 text-[13px] font-medium shadow-sm animate-in fade-in duration-200">
          <FiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 2. EMPLOYEE PROFILE HEADER & CRUD ACTIONS */}
      <div className="bg-white dark:bg-[#14161A] p-6 lg:p-8 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm mb-8 transition-colors duration-200">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          
          {/* Employee Avatar & Basic Info */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 text-[#2A5CAA] dark:text-[#5B8DD9] border border-[#2A5CAA]/20 dark:border-[#5B8DD9]/20 flex items-center justify-center shrink-0 shadow-inner">
              <FiUser className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2933] dark:text-white tracking-tight">
                  {employee.fullName}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide ${getStatusStyle(employee.status)}`}>
                  {employee.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium">
                <span className="flex items-center gap-1.5 text-[#1F2933] dark:text-[#E5E7EB]">
                  <FiBriefcase className="w-4 h-4 text-[#2A5CAA] dark:text-[#5B8DD9]" />
                  {employee.position}
                </span>
                <span className="hidden sm:inline text-gray-300 dark:text-gray-700">•</span>
                <span className="flex items-center gap-1.5">
                  <FiMail className="w-4 h-4 text-[#616E7C] dark:text-[#E5E7EB]/50" />
                  {employee.email}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/60 mt-3 pt-3 border-t border-[#616E7C]/10 dark:border-[#3A3E46]/40">
                <span className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-[#2A5CAA] dark:text-[#5B8DD9]" />
                  <span>Appointed: <strong className="text-[#1F2933] dark:text-white font-mono">{formatDate(employee.appointedDate)}</strong></span>
                </span>
                {employee.endDate && (
                  <span className="flex items-center gap-1.5">
                    <FiClock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Contract End: <strong className="text-[#1F2933] dark:text-white font-mono">{formatDate(employee.endDate)}</strong></span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <FiFileText className="w-3.5 h-3.5" />
                  <span>Vaulted Documents: <strong className="text-[#1F2933] dark:text-white font-mono">{employee.documents ? employee.documents.length : 0}</strong></span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 self-start lg:self-center flex-wrap">
            {employee.driveFolderId && (
              <a
                href={`https://drive.google.com/drive/folders/${employee.driveFolderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3.5 flex items-center gap-2 bg-[#F8FAFC] border border-[#616E7C]/20 hover:bg-[#616E7C]/5 dark:bg-[#0B0C0E] dark:border-[#3A3E46] dark:hover:bg-[#3A3E46]/50 text-[#1F2933] dark:text-white text-[12px] font-bold rounded-md transition-colors shadow-xs"
              >
                <FiFolder className="w-4 h-4 text-amber-500" />
                Drive Vault
                <FiExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}

            <button
              onClick={handleOpenEditModal}
              className="h-9 px-4 flex items-center gap-2 bg-white dark:bg-[#0B0C0E] border border-[#616E7C]/25 dark:border-[#3A3E46] hover:bg-gray-50 dark:hover:bg-[#3A3E46]/40 text-[#1F2933] dark:text-white text-[12px] font-bold rounded-md transition-colors shadow-xs cursor-pointer"
            >
              <FiEdit3 className="w-3.5 h-3.5 text-[#2A5CAA] dark:text-[#5B8DD9]" />
              Edit Profile
            </button>

            <button
              onClick={handleDeleteEmployee}
              disabled={isDeleting}
              className="h-9 px-4 flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 border border-red-500/20 text-[12px] font-bold rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <FiLoader className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FiTrash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>
          </div>

        </div>
      </div>

      {/* 3. SECTION 1: HR DOCUMENT CENTER (GENERATORS) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1F2933] dark:text-white tracking-tight flex items-center gap-2">
              <FiShield className="text-[#2A5CAA] dark:text-[#5B8DD9]" />
              HR Document Center
            </h2>
            <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/70">
              One-click PDF generation engine for onboarding, agreements, and legal documentation.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9] border border-[#2A5CAA]/20 dark:border-[#5B8DD9]/20">
            Client-Side PDF Engine
          </span>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Non-Disclosure Agreement (NDA) */}
          <div className="bg-white dark:bg-[#14161A] p-6 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm flex flex-col justify-between hover:border-[#2A5CAA]/40 dark:hover:border-[#5B8DD9]/40 transition-all duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 flex items-center justify-center">
                  <FiLock className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  Legal Binding
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1.5 group-hover:text-[#2A5CAA] dark:group-hover:text-[#5B8DD9] transition-colors">
                Non-Disclosure Agreement
              </h3>
              <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 leading-relaxed mb-4">
                Standard confidential information, intellectual property assignment, and trade secret undertaking.
              </p>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B0C0E] rounded-lg border border-[#616E7C]/15 dark:border-[#3A3E46] space-y-1 text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/70 mb-5">
                <div className="flex justify-between">
                  <span>Signee:</span>
                  <span className="font-bold text-[#1F2933] dark:text-white">{employee.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Template:</span>
                  <span className="font-mono text-[#2A5CAA] dark:text-[#5B8DD9]">NDA_v1.0 (A4)</span>
                </div>
              </div>
            </div>

            <div>
              {isMounted ? (
                <PDFDownloadLink
                  document={<NDATemplate employeeName={employee.fullName} date={pdfDate} />}
                  fileName={`NDA_${sanitizedFileName}.pdf`}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {({ loading }) =>
                    loading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Generating NDA...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4" />
                        <span>Download NDA</span>
                      </>
                    )
                  }
                </PDFDownloadLink>
              ) : (
                <button disabled className="w-full h-10 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-400 text-[13px] font-bold rounded-lg cursor-not-allowed">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Preparing Engine...</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 2: Bank Details Form */}
          <div className="bg-white dark:bg-[#14161A] p-6 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm flex flex-col justify-between hover:border-[#2A5CAA]/40 dark:hover:border-[#5B8DD9]/40 transition-all duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center">
                  <FiCreditCard className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Onboarding &amp; Payroll
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1.5 group-hover:text-[#2A5CAA] dark:group-hover:text-[#5B8DD9] transition-colors">
                Bank Details Form
              </h3>
              <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 leading-relaxed mb-4">
                Official 2-page printable onboarding document with fillable account slots and Passbook / NIC attachment areas.
              </p>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B0C0E] rounded-lg border border-[#616E7C]/15 dark:border-[#3A3E46] space-y-1 text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/70 mb-5">
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-bold text-[#1F2933] dark:text-white">Stipend &amp; Payroll</span>
                </div>
                <div className="flex justify-between">
                  <span>Layout:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">2-Page Fillable Form</span>
                </div>
              </div>
            </div>

            <div>
              {isMounted ? (
                <PDFDownloadLink
                  document={<BankDetailsTemplate />}
                  fileName={`Bank_Details_Form_${sanitizedFileName}.pdf`}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {({ loading }) =>
                    loading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Generating Form...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4" />
                        <span>Download Form</span>
                      </>
                    )
                  }
                </PDFDownloadLink>
              ) : (
                <button disabled className="w-full h-10 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-400 text-[13px] font-bold rounded-lg cursor-not-allowed">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Preparing Engine...</span>
                </button>
              )}
            </div>
          </div>

          {/* Card 3: Letter of Intent (LOI Builder - Phase 3) */}
          <div className="bg-white dark:bg-[#14161A] p-6 rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm flex flex-col justify-between hover:border-[#2A5CAA]/40 dark:hover:border-[#5B8DD9]/40 transition-all duration-200 group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                  <FiFileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  Appointment
                </span>
              </div>

              <h3 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1.5 group-hover:text-[#2A5CAA] dark:group-hover:text-[#5B8DD9] transition-colors">
                Letter of Intent
              </h3>
              <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 leading-relaxed mb-4">
                Customizable employment offer letter detailing terms, start date, compensation, allowances, and reporting structure.
              </p>

              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B0C0E] rounded-lg border border-[#616E7C]/15 dark:border-[#3A3E46] space-y-1 text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/70 mb-5">
                <div className="flex justify-between">
                  <span>Engine:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Live Split-Screen Builder</span>
                </div>
                <div className="flex justify-between">
                  <span>Customizer:</span>
                  <span className="font-mono text-[#1F2933] dark:text-white">Dynamic Terms &amp; Preview</span>
                </div>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsLoiModalOpen(true)}
                className="w-full h-10 flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <FiFileText className="w-4 h-4" />
                <span>Draft LOI</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. SECTION 2: EMPLOYEE DOCUMENT VAULT (UPLOAD & RETRIEVAL) */}
      <div className="bg-white dark:bg-[#14161A] rounded-xl border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm overflow-hidden transition-colors duration-200">
        
        {/* Vault Header */}
        <div className="p-6 border-b border-[#616E7C]/15 dark:border-[#3A3E46] bg-[#F8FAFC]/50 dark:bg-[#0B0C0E]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-[#1F2933] dark:text-white tracking-tight">
                Employee Document Vault
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#2A5CAA]/10 text-[#2A5CAA] dark:bg-[#5B8DD9]/10 dark:text-[#5B8DD9] border border-[#2A5CAA]/20 dark:border-[#5B8DD9]/20 font-mono">
                {employee.documents?.length || 0} Files
              </span>
            </div>
            <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-0.5">
              Secure cloud storage for executed agreements, passbooks, and identity credentials.
            </p>
          </div>

          {employee.driveFolderId && (
            <a
              href={`https://drive.google.com/drive/folders/${employee.driveFolderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors self-start md:self-center"
            >
              <span>Open Google Drive Vault</span>
              <FiExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Upload Action Form Panel */}
        <div className="p-6 border-b border-[#616E7C]/15 dark:border-[#3A3E46] bg-white dark:bg-[#14161A]">
          <form onSubmit={handleUploadDocument} className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3.5">
            
            {/* Document Type Dropdown */}
            <div className="w-full sm:w-56 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70">
                Document Type
              </label>
              <select
                value={uploadDocType}
                onChange={(e) => setUploadDocType(e.target.value)}
                className="w-full h-10 px-3 text-[13px] font-medium bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-lg text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA] cursor-pointer"
              >
                <option value="NDA">NDA (Signed Copy)</option>
                <option value="BANK_FORM">Bank Details Form</option>
                <option value="LOI">Letter of Intent (LOI)</option>
                <option value="NIC_COPY">NIC / Passport Copy</option>
                <option value="PASSBOOK_COPY">Bank Passbook Copy</option>
                <option value="SERVICE_LETTER">Service Letter</option>
                <option value="OTHER">Other Attachment</option>
              </select>
            </div>

            {/* File Input */}
            <div className="flex-1 space-y-1.5">
              <label htmlFor={fileInputId} className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70">
                Upload File (PDF or Image)
              </label>
              <div className="relative">
                <input
                  id={fileInputId}
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full h-10 px-3 pt-1.5 text-[12px] font-medium bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] rounded-lg text-[#616E7C] dark:text-[#E5E7EB]/70 focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-[#2A5CAA]/10 file:text-[#2A5CAA] dark:file:bg-[#5B8DD9]/20 dark:file:text-[#5B8DD9] cursor-pointer"
                />
              </div>
            </div>

            {/* Upload Button */}
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="h-10 px-5 flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-bold rounded-lg transition-colors shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUploading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FiUploadCloud className="w-4 h-4" />
                  <span>Upload to Drive</span>
                </>
              )}
            </button>
          </form>

          {/* Upload Success Feedback */}
          {uploadSuccess && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-[12px] animate-in fade-in duration-200">
              <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Documents Data Table */}
        {!employee.documents || employee.documents.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#2A5CAA]/10 dark:bg-[#5B8DD9]/10 flex items-center justify-center text-[#2A5CAA] dark:text-[#5B8DD9] mb-4">
              <FiFolder className="w-7 h-7" />
            </div>
            <h4 className="text-[15px] font-bold text-[#1F2933] dark:text-white mb-1">
              No Documents Vaulted Yet
            </h4>
            <p className="text-[13px] text-[#616E7C] dark:text-[#E5E7EB]/60 max-w-md mx-auto">
              Download the standard templates above, get them physically signed, and upload the scanned copies here for permanent compliance storage.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/15 dark:border-[#3A3E46]">
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Document Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">File Name</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Uploaded Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#616E7C]/10 dark:divide-[#3A3E46]/50 text-[13px]">
                {employee.documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-[#3A3E46]/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wide ${getDocTypeBadgeStyle(doc.type)}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1F2933] dark:text-white flex items-center gap-2">
                      <FiPaperclip className="w-3.5 h-3.5 text-[#616E7C]" />
                      <span>{doc.fileName}</span>
                    </td>
                    <td className="px-6 py-4 text-[#616E7C] dark:text-[#E5E7EB]/80 font-mono text-[12px]">
                      {formatDate(doc.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {doc.url ? (
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F8FAFC] dark:bg-[#0B0C0E] border border-[#616E7C]/20 dark:border-[#3A3E46] text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 text-[12px] font-bold rounded transition-colors"
                        >
                          <span>View on Drive</span>
                          <FiExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[12px] text-gray-400 italic">No link available</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* 5. EDIT PROFILE MODAL (UPDATE)             */}
      {/* ========================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#14161A] rounded-xl border border-gray-200 dark:border-[#3A3E46] shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 dark:border-[#3A3E46] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0C0E]">
              <div>
                <h3 className="text-[16px] font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
                  <FiEdit3 className="text-[#2A5CAA] dark:text-[#5B8DD9]" /> Edit Employee Profile
                </h3>
                <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-0.5">
                  Update workforce credentials, contract dates, and status.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-[#3A3E46] text-gray-500 hover:text-gray-700 dark:hover:text-white transition cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUpdateEmployee} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center gap-2 text-[12px]">
                  <FiAlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                  <FiUser className="text-[#2A5CAA]" /> Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                  <FiMail className="text-[#2A5CAA]" /> Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                  <FiBriefcase className="text-[#2A5CAA]" /> Job Position / Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                    <FiCalendar className="text-[#2A5CAA]" /> Appointed Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={editAppointedDate}
                    onChange={(e) => setEditAppointedDate(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                    <FiCalendar className="text-[#2A5CAA]" /> End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RESIGNED">RESIGNED</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-[#1F2933] dark:text-[#E5E7EB] flex items-center gap-1.5">
                    <FiFolder className="text-amber-500" /> Drive Folder ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1a2b3c4d5e6f"
                    value={editDriveFolderId}
                    onChange={(e) => setEditDriveFolderId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[13px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-gray-100 dark:border-[#3A3E46] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="h-10 px-4 text-[13px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3E46] rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="h-10 px-5 flex items-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 text-white text-[13px] font-bold rounded-lg transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingEdit ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. LOI BUILDER SPLIT-SCREEN MODAL ENGINE (LIVE PREVIEW)   */}
      {/* ========================================================= */}
      {isLoiModalOpen && (
        <div className="fixed inset-0 z-[100] flex bg-gray-950/70 backdrop-blur-xs overflow-hidden animate-in fade-in duration-200">
          
          {/* LEFT PANEL: Form Controls & Dynamic Customizer */}
          <div className="w-[480px] lg:w-[500px] shrink-0 bg-white dark:bg-[#14161A] border-r border-[#616E7C]/20 dark:border-[#3A3E46] flex flex-col h-full shadow-2xl z-10 transition-colors">
            
            {/* Header */}
            <div className="p-5 border-b border-gray-100 dark:border-[#3A3E46] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0B0C0E]">
              <div>
                <h2 className="text-[16px] font-bold text-[#1F2933] dark:text-white flex items-center gap-2">
                  <FiFileText className="text-[#2A5CAA] dark:text-[#5B8DD9]" /> LOI Builder
                </h2>
                <p className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/70 mt-0.5">
                  Offer of Appointment for <strong className="text-[#1F2933] dark:text-white">{employee.fullName}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsLoiModalOpen(false)}
                className="p-2 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 dark:bg-[#3A3E46]/50 dark:hover:bg-red-950/50 dark:text-gray-300 dark:hover:text-red-400 rounded-full transition cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Fields */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-6 space-y-4">
              
              {/* Candidate Info Summary Box */}
              <div className="p-3 bg-[#F8FAFC] dark:bg-[#0B0C0E] rounded-lg border border-[#616E7C]/15 dark:border-[#3A3E46] text-[12px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium">Candidate:</span>
                  <span className="font-bold text-[#1F2933] dark:text-white">{employee.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium">Designation:</span>
                  <span className="font-bold text-[#2A5CAA] dark:text-[#5B8DD9]">{employee.position}</span>
                </div>
              </div>

              {/* Date & Start Date */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70 flex items-center gap-1.5">
                    <FiCalendar className="text-[#2A5CAA]" /> Date Issued
                  </label>
                  <input
                    type="date"
                    value={loiDate}
                    onChange={(e) => setLoiDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[12px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70 flex items-center gap-1.5">
                    <FiCalendar className="text-[#2A5CAA]" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={loiStartDate}
                    onChange={(e) => setLoiStartDate(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[12px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>
              </div>

              {/* Duration & Notice Period */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70 flex items-center gap-1.5">
                    <FiClock className="text-[#2A5CAA]" /> Duration of Term
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 6 Months"
                    value={loiDuration}
                    onChange={(e) => setLoiDuration(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[12px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70 flex items-center gap-1.5">
                    <FiShield className="text-[#2A5CAA]" /> Notice Period
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Month"
                    value={loiNoticePeriod}
                    onChange={(e) => setLoiNoticePeriod(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[12px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>
              </div>

              {/* Compensation Details Section */}
              <div className="p-4 bg-gray-50/80 dark:bg-[#0B0C0E] rounded-xl border border-gray-200 dark:border-[#3A3E46] space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-[#3A3E46] text-[#1F2933] dark:text-white font-bold text-[12px]">
                  <FiDollarSign className="text-[#2A5CAA] dark:text-[#5B8DD9]" /> Compensation &amp; Allowances
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                      Probationary Salary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LKR 25,000 / Month"
                      value={loiProbationSalary}
                      onChange={(e) => setLoiProbationSalary(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#14161A] text-[12px] text-[#1F2933] dark:text-white font-medium focus:outline-none focus:border-[#2A5CAA]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                      Basic (Post-Probation)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LKR 35,000 / Month"
                      value={loiBasicSalary}
                      onChange={(e) => setLoiBasicSalary(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#14161A] text-[12px] text-[#1F2933] dark:text-white font-medium focus:outline-none focus:border-[#2A5CAA]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-[#616E7C] dark:text-[#E5E7EB]/70">
                    Additional Allowances / Benefits
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Performance Bonus or N/A"
                    value={loiAllowance}
                    onChange={(e) => setLoiAllowance(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#14161A] text-[12px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                  />
                </div>
              </div>

              {/* Reporting Structure */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70 flex items-center gap-1.5">
                  <FiBriefcase className="text-[#2A5CAA]" /> Reporting Supervisor / Division
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lead Software Engineer / Engineering Division"
                  value={loiReportingManager}
                  onChange={(e) => setLoiReportingManager(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[12px] text-[#1F2933] dark:text-white focus:outline-none focus:border-[#2A5CAA]"
                />
              </div>

              {/* Custom Paragraph Text Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#616E7C] dark:text-[#E5E7EB]/70 flex items-center gap-1.5">
                  <FiAlignLeft className="text-[#2A5CAA]" /> Custom Opening Statement
                </label>
                <textarea
                  rows={3}
                  value={loiCustomBody}
                  onChange={(e) => setLoiCustomBody(e.target.value)}
                  placeholder="Introductory body paragraph..."
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-[#3A3E46] bg-white dark:bg-[#0B0C0E] text-[12px] text-[#1F2933] dark:text-white leading-relaxed focus:outline-none focus:border-[#2A5CAA] resize-none"
                />
              </div>

            </div>

            {/* Modal Bottom Footer: Action Export Button */}
            <div className="p-5 border-t border-gray-200 dark:border-[#3A3E46] bg-gray-50 dark:bg-[#0B0C0E]">
              {isMounted ? (
                <PDFDownloadLink
                  document={<LOITemplate data={renderLoiData} />}
                  fileName={`LOI_${sanitizedFileName}.pdf`}
                  className="w-full h-11 flex items-center justify-center gap-2 bg-[#2A5CAA] hover:bg-[#2A5CAA]/90 dark:bg-[#5B8DD9] dark:hover:bg-[#5B8DD9]/90 text-white text-[13px] font-bold rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  {({ loading }) =>
                    loading ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Rendering Official LOI...</span>
                      </>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4" />
                        <span>Download Official LOI</span>
                      </>
                    )
                  }
                </PDFDownloadLink>
              ) : (
                <button disabled className="w-full h-11 flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-800 text-gray-400 text-[13px] font-bold rounded-lg cursor-not-allowed">
                  <FiLoader className="w-4 h-4 animate-spin" />
                  <span>Preparing Engine...</span>
                </button>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Live PDF Preview shielded by Memoized Component */}
          <div className="flex-1 bg-gray-500 dark:bg-[#1C2026] p-6 lg:p-8 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="font-bold text-[16px] tracking-tight">Live LOI Document Preview</h3>
                <p className="text-[11px] text-gray-300 dark:text-gray-400">
                  Real-time A4 printable document preview • Updates automatically on edits
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-gray-700 dark:bg-gray-800 text-gray-200 px-3 py-1 rounded-md border border-gray-600">
                Anti-Blink Preview
              </span>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl bg-white">
              <MemoizedLOIPreview data={renderLoiData} />
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
