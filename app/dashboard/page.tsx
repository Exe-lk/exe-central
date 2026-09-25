'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// interface Project {
//   id: string;
//   name: string;
//   type: string;
//   projectType: string;
//   clientName: string;
//   companyName: string | null;
//   totalAmount: number;
//   createdAt: string;
// }

export default function DashboardPage() {
//   const router = useRouter();
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [user, setUser] = useState<any>(null);
//   const [showProjectTypeModal, setShowProjectTypeModal] = useState(false);
//   const [selectedInvoiceType, setSelectedInvoiceType] = useState<'final-year' | 'industry' | null>(null);

//   useEffect(() => {
//     fetchUser();
//     fetchProjects();
//   }, []);

//   const fetchUser = async () => {
//     try {
//       const response = await fetch('/api/auth/me');
//       if (response.ok) {
//         const data = await response.json();
//         setUser(data.user);
//       } else {
//         router.push('/');
//       }
//     } catch (error) {
//       console.error('Error fetching user:', error);
//       router.push('/');
//     }
//   };

//   const fetchProjects = async () => {
//     try {
//       const response = await fetch('/api/projects');
//       if (response.ok) {
//         const data = await response.json();
//         setProjects(data.projects);
//       }
//     } catch (error) {
//       console.error('Error fetching projects:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//       router.push('/');
//     } catch (error) {
//       console.error('Error logging out:', error);
//     }
//   };

//   const handleCreateProject = (type: 'final-year' | 'industry') => {
//     setSelectedInvoiceType(type);
//     setShowProjectTypeModal(true);
//   };

//   const handleSelectProjectType = (projectType: 'group' | 'individual') => {
//     setShowProjectTypeModal(false);
//     router.push(`/dashboard/create-project?type=${selectedInvoiceType}&projectType=${projectType}`);
//   };

//   const handleProjectClick = (projectId: string) => {
//     router.push(`/dashboard/project/${projectId}`);
//   };

  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
    //   {/* Header */}
    //   <div className="bg-white shadow-sm border-b border-gray-200">
    //     <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
    //       <div>
    //         <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
    //           EXE.LK Invoice Generator
    //         </h1>
    //         <p className="text-gray-600 text-sm">Make your idea executable.</p>
    //       </div>
    //       <div className="flex items-center gap-4">
    //         <div className="text-right">
    //           <p className="text-sm font-medium text-gray-700">{user?.name}</p>
    //           <p className="text-xs text-gray-500">{user?.email}</p>
    //         </div>
    //         <button
    //           onClick={handleLogout}
    //           className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
    //         >
    //           Logout
    //         </button>
    //       </div>
    //     </div>
    //   </div>

    //   <div className="max-w-7xl mx-auto p-8">
    //     {/* Create New Project Section */}
    //     <div className="mb-8">
    //       <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Project</h2>
    //       <div className="grid md:grid-cols-2 gap-6">
    //         <div 
    //           onClick={() => handleCreateProject('final-year')}
    //           className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500"
    //         >
    //           <div className="text-center">
    //             <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
    //               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    //               </svg>
    //             </div>
    //             <h3 className="text-2xl font-semibold text-gray-800 mb-2">Final Year Projects</h3>
    //             <p className="text-gray-600">Create projects for final year students</p>
    //           </div>
    //         </div>

    //         <div 
    //           onClick={() => handleCreateProject('industry')}
    //           className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-green-500"
    //         >
    //           <div className="text-center">
    //             <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
    //               <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    //               </svg>
    //             </div>
    //             <h3 className="text-2xl font-semibold text-gray-800 mb-2">Industry Projects</h3>
    //             <p className="text-gray-600">Create projects for industry clients</p>
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     {/* Existing Projects Section */}
    //     <div>
    //       <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Projects</h2>
    //       {isLoading ? (
    //         <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
    //           Loading projects...
    //         </div>
    //       ) : projects.length === 0 ? (
    //         <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
    //           No projects yet. Create your first project above!
    //         </div>
    //       ) : (
    //         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    //           {projects.map((project) => (
    //             <div
    //               key={project.id}
    //               onClick={() => handleProjectClick(project.id)}
    //               className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500"
    //             >
    //               <div className="flex items-start justify-between mb-3">
    //                 <div className="flex-1">
    //                   <h3 className="text-lg font-semibold text-gray-800 mb-1">{project.name}</h3>
    //                   <p className="text-sm text-gray-500">{project.clientName}</p>
    //                 </div>
    //                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${
    //                   project.type === 'final-year' 
    //                     ? 'bg-blue-100 text-blue-700' 
    //                     : 'bg-green-100 text-green-700'
    //                 }`}>
    //                   {project.type === 'final-year' ? 'Final Year' : 'Industry'}
    //                 </span>
    //               </div>
    //               <div className="space-y-2">
    //                 <div className="flex justify-between text-sm">
    //                   <span className="text-gray-600">Type:</span>
    //                   <span className="font-medium text-gray-800 capitalize">{project.projectType}</span>
    //                 </div>
    //                 {project.companyName && (
    //                   <div className="flex justify-between text-sm">
    //                     <span className="text-gray-600">Company:</span>
    //                     <span className="font-medium text-gray-800">{project.companyName}</span>
    //                   </div>
    //                 )}
    //                 <div className="flex justify-between text-sm">
    //                   <span className="text-gray-600">Total:</span>
    //                   <span className="font-medium text-gray-800">LKR {Number(project.totalAmount).toLocaleString()}</span>
    //                 </div>
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //       )}
    //     </div>
    //   </div>

    //   {/* Project Type Selection Modal */}
    //   {showProjectTypeModal && (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    //       <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
    //         <div className="px-6 py-4 border-b border-gray-200">
    //           <h3 className="text-xl font-bold text-gray-800">Select Project Type</h3>
    //         </div>
    //         <div className="p-6">
    //           <div className="space-y-4">
    //             <button
    //               onClick={() => handleSelectProjectType('group')}
    //               className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
    //             >
    //               <h4 className="font-semibold text-gray-800 mb-1">Group Project</h4>
    //               <p className="text-sm text-gray-600">For projects with multiple team members</p>
    //             </button>
    //             <button
    //               onClick={() => handleSelectProjectType('individual')}
    //               className="w-full p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
    //             >
    //               <h4 className="font-semibold text-gray-800 mb-1">Individual Project</h4>
    //               <p className="text-sm text-gray-600">For single person projects</p>
    //             </button>
    //           </div>
    //         </div>
    //         <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
    //           <button
    //             onClick={() => setShowProjectTypeModal(false)}
    //             className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
    //           >
    //             Cancel
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>
    <div>
      hello
    </div>
  );
}
