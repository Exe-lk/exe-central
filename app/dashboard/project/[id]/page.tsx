// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, useParams } from 'next/navigation';
// import { generateProjectInvoicePDF } from '@/utils/projectPdfGenerator';

// interface ProjectMember {
//   id: string;
//   name: string;
//   contact: string;
// }

// interface InvoiceItem {
//   id: string;
//   type: 'advance' | 'milestone';
//   description: string;
//   status: string;
//   taxes: string | null;
//   date: string;
//   amount: number;
// }

// interface Invoice {
//   id: string;
//   invoiceNo: string;
//   proposalNo: string | null;
//   invoiceDate: string;
//   dueDate: string;
//   currency: string;
//   subtotal: number;
//   discount: number;
//   tax: number;
//   total: number;
//   status: string;
//   items: InvoiceItem[];
// }

// interface Project {
//   id: string;
//   name: string;
//   type: string;
//   projectType: string;
//   description: string | null;
//   clientName: string;
//   companyName: string | null;
//   country: string;
//   totalAmount: number;
//   members: ProjectMember[];
//   invoices: Invoice[];
// }

// export default function ProjectDetailPage() {
//   const router = useRouter();
//   const params = useParams();
//   const projectId = params?.id as string;

//   const [project, setProject] = useState<Project | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showInvoiceModal, setShowInvoiceModal] = useState(false);
//   const [currentItems, setCurrentItems] = useState<InvoiceItem[]>([]);
  
//   // Invoice generation state
//   const [invoiceData, setInvoiceData] = useState({
//     proposalNo: '',
//     invoiceNo: '',
//     invoiceDate: new Date().toISOString().split('T')[0],
//     dueDate: new Date().toISOString().split('T')[0],
//     currency: 'LKR',
//   });

//   useEffect(() => {
//     if (projectId) {
//       fetchProject();
//     }
//   }, [projectId]);

//   const fetchProject = async () => {
//     try {
//       const response = await fetch(`/api/projects/${projectId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setProject(data.project);
        
//         // Load existing items from all previous invoices
//         const allItems: InvoiceItem[] = [];
//         data.project.invoices.forEach((invoice: Invoice) => {
//           allItems.push(...invoice.items);
//         });
//         setCurrentItems(allItems);
//       } else {
//         router.push('/dashboard');
//       }
//     } catch (error) {
//       console.error('Error fetching project:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleOpenInvoiceModal = () => {
//     setShowInvoiceModal(true);
//   };

//   const handleAddItem = (type: 'advance' | 'milestone') => {
//     const newItem: InvoiceItem = {
//       id: `temp-${Date.now()}`,
//       type,
//       description: type === 'advance' ? 'Advance Payment' : 'Milestone',
//       status: 'pending',
//       taxes: null,
//       date: new Date().toISOString().split('T')[0],
//       amount: 0,
//     };
//     setCurrentItems([...currentItems, newItem]);
//   };

//   const handleUpdateItem = (index: number, field: keyof InvoiceItem, value: any) => {
//     const updatedItems = [...currentItems];
//     updatedItems[index] = { ...updatedItems[index], [field]: value };
//     setCurrentItems(updatedItems);
//   };

//   const handleRemoveItem = (index: number) => {
//     setCurrentItems(currentItems.filter((_, i) => i !== index));
//   };

//   const handleSaveItems = async () => {
//     try {
//       const response = await fetch(`/api/projects/${projectId}/items`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           items: currentItems.map(item => ({
//             id: item.id.startsWith('temp-') ? undefined : item.id,
//             type: item.type,
//             description: item.description,
//             status: item.status,
//             taxes: item.taxes,
//             date: item.date,
//             amount: parseFloat(item.amount.toString()),
//           })),
//         }),
//       });

//       if (response.ok) {
//         alert('Items saved successfully!');
//         fetchProject();
//       } else {
//         const data = await response.json();
//         alert(data.error || 'Failed to save items');
//       }
//     } catch (error) {
//       console.error('Error saving items:', error);
//       alert('An error occurred while saving items');
//     }
//   };

//   const handleGenerateInvoice = async () => {
//     if (!project) return;

//     // Calculate totals
//     const subtotal = currentItems.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);
//     const total = subtotal;

//     try {
//       // First save the invoice to database
//       const response = await fetch(`/api/projects/${projectId}/invoices`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...invoiceData,
//           subtotal,
//           total,
//           items: currentItems.map(item => ({
//             id: item.id.startsWith('temp-') ? undefined : item.id,
//             type: item.type,
//             description: item.description,
//             status: item.status,
//             taxes: item.taxes,
//             date: item.date,
//             amount: parseFloat(item.amount.toString()),
//           })),
//         }),
//       });

//       if (!response.ok) {
//         const data = await response.json();
//         alert(data.error || 'Failed to save invoice');
//         return;
//       }

//       // Generate PDF
//       await generateProjectInvoicePDF({
//         project: {
//           name: project.name,
//           type: project.type,
//           projectType: project.projectType,
//           clientName: project.clientName,
//           companyName: project.companyName || '',
//           country: project.country,
//           members: project.members,
//         },
//         invoice: {
//           ...invoiceData,
//           subtotal: subtotal.toString(),
//           total: total.toString(),
//           items: currentItems,
//         },
//       });

//       alert('Invoice generated successfully!');
//       fetchProject();
//       setShowInvoiceModal(false);
//     } catch (error) {
//       console.error('Error generating invoice:', error);
//       alert('An error occurred while generating the invoice');
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
//         <div className="text-gray-600">Loading project...</div>
//       </div>
//     );
//   }

//   if (!project) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
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
//           <div className="flex justify-between items-start">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
//               <p className="text-gray-600 mt-2">{project.clientName}</p>
//             </div>
//             <span className={`px-4 py-2 rounded-full text-sm font-medium ${
//               project.type === 'final-year' 
//                 ? 'bg-blue-100 text-blue-700' 
//                 : 'bg-green-100 text-green-700'
//             }`}>
//               {project.type === 'final-year' ? 'Final Year' : 'Industry'} - {project.projectType === 'group' ? 'Group' : 'Individual'}
//             </span>
//           </div>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-6">
//           {/* Project Details Card */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
//               <h2 className="text-xl font-semibold text-gray-800 mb-4">Project Details</h2>
              
//               {project.description && (
//                 <div>
//                   <p className="text-sm text-gray-600 font-medium">Description</p>
//                   <p className="text-gray-800 mt-1">{project.description}</p>
//                 </div>
//               )}

//               <div>
//                 <p className="text-sm text-gray-600 font-medium">Client Name</p>
//                 <p className="text-gray-800 mt-1">{project.clientName}</p>
//               </div>

//               {project.companyName && (
//                 <div>
//                   <p className="text-sm text-gray-600 font-medium">Company Name</p>
//                   <p className="text-gray-800 mt-1">{project.companyName}</p>
//                 </div>
//               )}

//               <div>
//                 <p className="text-sm text-gray-600 font-medium">Country</p>
//                 <p className="text-gray-800 mt-1">{project.country}</p>
//               </div>

//               <div>
//                 <p className="text-sm text-gray-600 font-medium">Total Amount</p>
//                 <p className="text-gray-800 mt-1 text-lg font-semibold">
//                   LKR {Number(project.totalAmount).toLocaleString()}
//                 </p>
//               </div>

//               {/* Group Members */}
//               {project.projectType === 'group' && project.members.length > 0 && (
//                 <div className="pt-4 border-t border-gray-200">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-3">Group Members</h3>
//                   <div className="space-y-3">
//                     {project.members.map((member, index) => (
//                       <div key={member.id} className="bg-gray-50 p-3 rounded-lg">
//                         <p className="text-gray-800 font-medium">{index + 1}. {member.name}</p>
//                         <p className="text-sm text-gray-600">{member.contact}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Invoice Management Card */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-lg p-6">
//               <div className="flex justify-between items-center mb-6">
//                 <h2 className="text-xl font-semibold text-gray-800">Invoice Management</h2>
//                 <button
//                   onClick={handleOpenInvoiceModal}
//                   className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all"
//                 >
//                   Generate Invoice
//                 </button>
//               </div>

//               {/* Current Items Table */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Payment Items</h3>
//                 {currentItems.length === 0 ? (
//                   <p className="text-gray-500 text-center py-8">No payment items yet. Click "Generate Invoice" to add items.</p>
//                 ) : (
//                   <div className="overflow-x-auto">
//                     <table className="w-full border-collapse border border-gray-300">
//                       <thead>
//                         <tr className="bg-gray-100">
//                           <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Type</th>
//                           <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Description</th>
//                           <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Status</th>
//                           <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Date</th>
//                           <th className="border border-gray-300 px-3 py-2 text-right text-sm font-medium">Amount</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {currentItems.map((item, index) => (
//                           <tr key={item.id}>
//                             <td className="border border-gray-300 px-3 py-2 text-sm">
//                               <span className={`px-2 py-1 rounded text-xs font-medium ${
//                                 item.type === 'advance' 
//                                   ? 'bg-purple-100 text-purple-700' 
//                                   : 'bg-blue-100 text-blue-700'
//                               }`}>
//                                 {item.type === 'advance' ? 'Advance' : 'Milestone'}
//                               </span>
//                             </td>
//                             <td className="border border-gray-300 px-3 py-2 text-sm">{item.description}</td>
//                             <td className="border border-gray-300 px-3 py-2 text-sm">
//                               <span className={`px-2 py-1 rounded text-xs font-medium ${
//                                 item.status === 'paid' 
//                                   ? 'bg-green-100 text-green-700' 
//                                   : item.status === 'pending' 
//                                   ? 'bg-yellow-100 text-yellow-700'
//                                   : 'bg-red-100 text-red-700'
//                               }`}>
//                                 {item.status}
//                               </span>
//                             </td>
//                             <td className="border border-gray-300 px-3 py-2 text-sm">
//                               {new Date(item.date).toLocaleDateString()}
//                             </td>
//                             <td className="border border-gray-300 px-3 py-2 text-sm text-right font-medium">
//                               LKR {Number(item.amount).toLocaleString()}
//                             </td>
//                           </tr>
//                         ))}
//                         <tr className="bg-gray-50 font-semibold">
//                           <td colSpan={4} className="border border-gray-300 px-3 py-2 text-sm text-right">
//                             Total:
//                           </td>
//                           <td className="border border-gray-300 px-3 py-2 text-sm text-right">
//                             LKR {currentItems.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>

//               {/* Previous Invoices */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice History</h3>
//                 {project.invoices.length === 0 ? (
//                   <p className="text-gray-500 text-center py-8">No invoices generated yet.</p>
//                 ) : (
//                   <div className="space-y-3">
//                     {project.invoices.map((invoice) => (
//                       <div key={invoice.id} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <p className="font-semibold text-gray-800">Invoice #{invoice.invoiceNo}</p>
//                             <p className="text-sm text-gray-600 mt-1">
//                               Date: {new Date(invoice.invoiceDate).toLocaleDateString()} | 
//                               Due: {new Date(invoice.dueDate).toLocaleDateString()}
//                             </p>
//                             <p className="text-sm text-gray-600">
//                               Items: {invoice.items.length} ({invoice.items.filter(i => i.type === 'advance').length} advance, {invoice.items.filter(i => i.type === 'milestone').length} milestone)
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-lg font-bold text-gray-800">
//                               LKR {Number(invoice.total).toLocaleString()}
//                             </p>
//                             <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
//                               invoice.status === 'paid' 
//                                 ? 'bg-green-100 text-green-700' 
//                                 : 'bg-yellow-100 text-yellow-700'
//                             }`}>
//                               {invoice.status}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Invoice Generation Modal */}
//       {showInvoiceModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8">
//             <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
//               <h2 className="text-2xl font-bold text-gray-800">Generate Invoice</h2>
//               <button
//                 onClick={() => setShowInvoiceModal(false)}
//                 className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//               >
//                 ×
//               </button>
//             </div>

//             <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//               {/* Invoice Details */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Details</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Proposal No</label>
//                     <input
//                       type="text"
//                       value={invoiceData.proposalNo}
//                       onChange={(e) => setInvoiceData({...invoiceData, proposalNo: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Invoice No *</label>
//                     <input
//                       type="text"
//                       value={invoiceData.invoiceNo}
//                       onChange={(e) => setInvoiceData({...invoiceData, invoiceNo: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
//                     <input
//                       type="date"
//                       value={invoiceData.invoiceDate}
//                       onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
//                     <input
//                       type="date"
//                       value={invoiceData.dueDate}
//                       onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Items */}
//               <div>
//                 <div className="flex justify-between items-center mb-3">
//                   <h3 className="text-lg font-semibold text-gray-800">Payment Items</h3>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleAddItem('advance')}
//                       className="px-3 py-1 bg-purple-500 text-white rounded-md text-sm hover:bg-purple-600"
//                     >
//                       + Add Advance
//                     </button>
//                     <button
//                       onClick={() => handleAddItem('milestone')}
//                       className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
//                     >
//                       + Add Milestone
//                     </button>
//                   </div>
//                 </div>
                
//                 <div className="overflow-x-auto">
//                   <table className="w-full border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-100">
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Type</th>
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Description</th>
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Status</th>
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Taxes</th>
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Date</th>
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Amount</th>
//                         <th className="border border-gray-300 px-2 py-2 text-left text-sm font-medium">Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {currentItems.map((item, index) => (
//                         <tr key={item.id}>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <select
//                               value={item.type}
//                               onChange={(e) => handleUpdateItem(index, 'type', e.target.value)}
//                               className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 text-sm"
//                             >
//                               <option value="advance">Advance</option>
//                               <option value="milestone">Milestone</option>
//                             </select>
//                           </td>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <input
//                               type="text"
//                               value={item.description}
//                               onChange={(e) => handleUpdateItem(index, 'description', e.target.value)}
//                               className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 text-sm"
//                             />
//                           </td>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <select
//                               value={item.status}
//                               onChange={(e) => handleUpdateItem(index, 'status', e.target.value)}
//                               className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 text-sm"
//                             >
//                               <option value="pending">Pending</option>
//                               <option value="paid">Paid</option>
//                               <option value="overdue">Overdue</option>
//                             </select>
//                           </td>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <input
//                               type="text"
//                               value={item.taxes || ''}
//                               onChange={(e) => handleUpdateItem(index, 'taxes', e.target.value)}
//                               className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 text-sm"
//                               placeholder="N/A"
//                             />
//                           </td>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <input
//                               type="date"
//                               value={item.date}
//                               onChange={(e) => handleUpdateItem(index, 'date', e.target.value)}
//                               className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 text-sm"
//                             />
//                           </td>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <input
//                               type="number"
//                               step="0.01"
//                               value={item.amount}
//                               onChange={(e) => handleUpdateItem(index, 'amount', parseFloat(e.target.value) || 0)}
//                               className="w-full px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500 text-sm"
//                               placeholder="0.00"
//                             />
//                           </td>
//                           <td className="border border-gray-300 px-2 py-1">
//                             <button
//                               onClick={() => handleRemoveItem(index)}
//                               className="text-red-500 hover:text-red-700 text-sm px-2"
//                             >
//                               Remove
//                             </button>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>

//                 <div className="mt-4 flex justify-between items-center">
//                   <button
//                     onClick={handleSaveItems}
//                     className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
//                   >
//                     Save Items
//                   </button>
//                   <div className="text-right">
//                     <p className="text-sm text-gray-600">Subtotal</p>
//                     <p className="text-lg font-bold text-gray-800">
//                       LKR {currentItems.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
//               <button
//                 onClick={() => setShowInvoiceModal(false)}
//                 className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleGenerateInvoice}
//                 className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-md hover:from-blue-700 hover:to-green-700 font-medium"
//               >
//                 Generate PDF
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
