// 'use client';

// import { useState, useEffect, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';

// function CreateProjectForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const type = searchParams.get('type') as 'final-year' | 'industry' | null;
//   const projectType = searchParams.get('projectType') as 'group' | 'individual' | null;

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     clientName: '',
//     companyName: '',
//     country: 'Sri Lanka',
//     totalAmount: '',
//   });

//   const [members, setMembers] = useState<Array<{ name: string; contact: string }>>([
//     { name: '', contact: '' },
//   ]);

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!type || !projectType) {
//       router.push('/dashboard');
//     }
//   }, [type, projectType, router]);

//   const handleInputChange = (field: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleMemberChange = (index: number, field: 'name' | 'contact', value: string) => {
//     const newMembers = [...members];
//     newMembers[index][field] = value;
//     setMembers(newMembers);
//   };

//   const addMember = () => {
//     setMembers([...members, { name: '', contact: '' }]);
//   };

//   const removeMember = (index: number) => {
//     if (members.length > 1) {
//       setMembers(members.filter((_, i) => i !== index));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       const response = await fetch('/api/projects', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           type,
//           projectType,
//           members: projectType === 'group' ? members : undefined,
//           totalAmount: parseFloat(formData.totalAmount) || 0,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || 'Failed to create project');
//         setIsSubmitting(false);
//         return;
//       }

//       // Redirect to the newly created project
//       router.push(`/dashboard/project/${data.project.id}`);
//     } catch (err) {
//       setError('An error occurred while creating the project');
//       setIsSubmitting(false);
//     }
//   };

//   if (!type || !projectType) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-6">
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//             </svg>
//             Back to Dashboard
//           </button>
//           <h1 className="text-3xl font-bold text-gray-800">Create New Project</h1>
//           <p className="text-gray-600 mt-2">
//             {type === 'final-year' ? 'Final Year' : 'Industry'} Project - {projectType === 'group' ? 'Group' : 'Individual'}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           {/* Basic Information */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Project Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   placeholder="Enter project name"
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => handleInputChange('description', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   placeholder="Enter project description"
//                   rows={3}
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Client Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.clientName}
//                   onChange={(e) => handleInputChange('clientName', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   placeholder="Enter client name"
//                   required
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Company Name
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.companyName}
//                   onChange={(e) => handleInputChange('companyName', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   placeholder="Enter company name"
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Country
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.country}
//                   onChange={(e) => handleInputChange('country', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   disabled={isSubmitting}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Total Amount (LKR)
//                 </label>
//                 <input
//                   type="number"
//                   step="0.01"
//                   value={formData.totalAmount}
//                   onChange={(e) => handleInputChange('totalAmount', e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   placeholder="0.00"
//                   disabled={isSubmitting}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Group Members Section */}
//           {projectType === 'group' && (
//             <div>
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-xl font-semibold text-gray-800">Group Members</h2>
//                 <button
//                   type="button"
//                   onClick={addMember}
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
//                   disabled={isSubmitting}
//                 >
//                   + Add Member
//                 </button>
//               </div>
//               <div className="space-y-4">
//                 {members.map((member, index) => (
//                   <div key={index} className="flex gap-4 items-start">
//                     <div className="flex-1">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Member Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={member.name}
//                         onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                         placeholder="Enter member name"
//                         required
//                         disabled={isSubmitting}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Contact <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={member.contact}
//                         onChange={(e) => handleMemberChange(index, 'contact', e.target.value)}
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                         placeholder="Phone or email"
//                         required
//                         disabled={isSubmitting}
//                       />
//                     </div>
//                     {members.length > 1 && (
//                       <button
//                         type="button"
//                         onClick={() => removeMember(index)}
//                         className="mt-8 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
//                         disabled={isSubmitting}
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Submit Button */}
//           <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={() => router.push('/dashboard')}
//               className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
//               disabled={isSubmitting}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isSubmitting ? 'Creating...' : 'Create Project'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default function CreateProjectPage() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <CreateProjectForm />
//     </Suspense>
//   );
// }
