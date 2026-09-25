// 'use client';

// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { InvoiceData } from '@/components/InvoiceModal';

// export function generateInvoicePDF(data: InvoiceData, invoiceType: 'final-year' | 'industry') {
//   // Create a temporary container for the invoice
//   const invoiceContainer = document.createElement('div');
//   invoiceContainer.style.position = 'absolute';
//   invoiceContainer.style.left = '-9999px';
//   invoiceContainer.style.width = '210mm'; // A4 width
//   invoiceContainer.style.padding = '0';
//   invoiceContainer.style.fontFamily = 'Arial, sans-serif';
//   invoiceContainer.style.backgroundColor = '#ffffff';
//   invoiceContainer.innerHTML = generateInvoiceHTML(data);
  
//   document.body.appendChild(invoiceContainer);

//   // Wait for images to load
//   setTimeout(() => {
//     html2canvas(invoiceContainer, {
//       scale: 2,
//       useCORS: true,
//       logging: false,
//       backgroundColor: '#ffffff',
//     }).then((canvas) => {
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
      
//       const imgWidth = 210;
//       const pageHeight = 297;
//       const imgHeight = (canvas.height * imgWidth) / canvas.width;
//       let heightLeft = imgHeight;
//       let position = 0;

//       pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;

//       while (heightLeft > 0) {
//         position = heightLeft - imgHeight;
//         pdf.addPage();
//         pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//       }

//       pdf.save(`Invoice_${data.invoiceNo || 'INVOICE'}.pdf`);
//       document.body.removeChild(invoiceContainer);
//     });
//   }, 500);
// }

// function generateInvoiceHTML(data: InvoiceData): string {
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = String(date.getFullYear()).slice(-2);
//     return `${day}/${month}/${year}`;
//   };

//   const formatDateFull = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = String(date.getFullYear());
//     return `${day}/${month}/${year}`;
//   };

//   const formatCurrency = (amount: string) => {
//     if (!amount || amount === '') return '0.00';
//     const num = parseFloat(amount);
//     if (isNaN(num)) return '0.00';
//     // Format with spaces as thousand separators (e.g., "20 000.00")
//     const parts = num.toFixed(2).split('.');
//     const integerPart = parts[0];
//     const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
//     return `${formattedInteger}.${parts[1]}`;
//   };

//   return `
//     <div style="position: relative; width: 100%; background: white; font-family: Arial, sans-serif; padding: 0; margin: 0; box-sizing: border-box;">
//       <!-- Header with Blue/Green Background -->
//       <div style="background: linear-gradient(to right, #2563eb, #16a34a); padding: 25px 30px; margin-bottom: 0;">
//         <div style="display: flex; justify-content: space-between; align-items: flex-start;">
//           <div>
//             <div style="font-size: 42px; font-weight: bold; color: white; margin-bottom: 5px; letter-spacing: 1px;">
//               EXΞ.lk
//             </div>
//             <div style="color: rgba(255, 255, 255, 0.95); font-size: 13px; margin-top: 3px; font-style: italic;">
//               Make your idea executable.
//             </div>
//           </div>
//           <div style="text-align: right; font-size: 11px; color: white; line-height: 1.8;">
//             <div style="margin-bottom: 3px; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
//               <span style="color: #9333ea; font-size: 16px; font-weight: bold;">🖥</span>
//               <span>www.exe.lk</span>
//             </div>
//             <div style="margin-bottom: 3px; display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
//               <span style="color: #9333ea; font-size: 16px; font-weight: bold;">✉</span>
//               <span>hello@exe.lk</span>
//             </div>
//             <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
//               <span style="color: #9333ea; font-size: 16px; font-weight: bold;">📞</span>
//               <span>+94 70 274 9876 / +94 76 682 8306</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Title -->
//       <div style="text-align: center; font-size: 22px; font-weight: bold; margin: 25px 0; color: #1f2937; letter-spacing: 1px;">
//         PAYMENT INVOICE
//       </div>

//       <!-- Client & Invoice Details -->
//       <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin: 0 30px 25px 30px;">
//         <div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Client Name:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.clientName || ''}</div>
//           </div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Project Name:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.projectName || ''}</div>
//           </div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Company Name:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.companyName || ''}</div>
//           </div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Country:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.country || 'Sri Lanka'}</div>
//           </div>
//           <div>
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Proposal No:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.proposalNo || ''}</div>
//           </div>
//         </div>
//         <div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Cost Estimation:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.proposalNo || ''}</div>
//           </div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Invoice No:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.invoiceNo || ''}</div>
//           </div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Invoice Date:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${formatDate(data.invoiceDate)}</div>
//           </div>
//           <div style="margin-bottom: 12px;">
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Due Date:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${formatDate(data.dueDate)}</div>
//           </div>
//           <div>
//             <div style="font-weight: bold; margin-bottom: 4px; font-size: 13px; color: #374151;">Currency:</div>
//             <div style="border-bottom: 1px dashed #9ca3af; padding-bottom: 3px; font-size: 13px; min-height: 18px;">${data.currency || 'LKR'}</div>
//           </div>
//         </div>
//       </div>

//       <!-- Payment Breakdown Table -->
//       <div style="margin: 0 30px 25px 30px;">
//         <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
//           <thead>
//             <tr style="background-color: #f3f4f6;">
//               <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-weight: bold; font-size: 12px; color: #374151;">Description</th>
//               <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-weight: bold; font-size: 12px; color: #374151;">Status</th>
//               <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-weight: bold; font-size: 12px; color: #374151;">Taxes</th>
//               <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: left; font-weight: bold; font-size: 12px; color: #374151;">Date</th>
//               <th style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: right; font-weight: bold; font-size: 12px; color: #374151;">Amount (LKR)</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${data.paymentRows.map(row => `
//               <tr>
//                 <td style="border: 1px solid #d1d5db; padding: 10px 12px; font-size: 12px; color: #374151;">${row.description || ''}</td>
//                 <td style="border: 1px solid #d1d5db; padding: 10px 12px; font-size: 12px; color: #374151;">${row.status || ''}</td>
//                 <td style="border: 1px solid #d1d5db; padding: 10px 12px; font-size: 12px; color: #374151;">${row.taxes || ''}</td>
//                 <td style="border: 1px solid #d1d5db; padding: 10px 12px; font-size: 12px; color: #374151;">${formatDateFull(row.date)}</td>
//                 <td style="border: 1px solid #d1d5db; padding: 10px 12px; text-align: right; font-size: 12px; color: #374151;">${formatCurrency(row.amount)}</td>
//               </tr>
//             `).join('')}
//           </tbody>
//         </table>
//       </div>

//       <!-- Bank Details and Summary -->
//       <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 25px; margin: 0 30px 25px 30px;">
//         <!-- Bank Details Box -->
//         <div style="border: 1px solid #d1d5db; padding: 15px; background: #ffffff;">
//           <div style="font-weight: bold; margin-bottom: 12px; font-size: 14px; color: #1f2937;">Bank Details</div>
//           <div style="font-size: 12px; line-height: 1.9; color: #374151;">
//             <div><strong>Account No:</strong> 1000661376</div>
//             <div><strong>Name:</strong> EXE LK (PVT) LTD</div>
//             <div><strong>Swift Code:</strong> CCEYLKLX</div>
//             <div><strong>Bank:</strong> Commercial Bank</div>
//             <div><strong>Branch Name:</strong> Homagama</div>
//             <div><strong>Address:</strong> 289/9A, 5th Lane, Kulasiri Kumarage Mawatha, Katuwana, Homagama.</div>
//             <div><strong>Country:</strong> Sri Lanka</div>
//           </div>
//         </div>
        
//         <!-- Payment Summary -->
//         <div>
//           <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db; margin-bottom: 15px;">
//             <tr>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: bold; font-size: 12px; color: #374151;">SUBTOTAL (LKR)</td>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; font-size: 12px; color: #374151;">${formatCurrency(data.subtotal)}</td>
//             </tr>
//             <tr>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: bold; font-size: 12px; color: #374151;">DISCOUNT (LKR)</td>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; font-size: 12px; color: #374151;">${formatCurrency(data.discount || '0')}</td>
//             </tr>
//             <tr>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: bold; font-size: 12px; color: #374151;">TAX (LKR)</td>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; font-size: 12px; color: #374151;">${formatCurrency(data.tax || '0')}</td>
//             </tr>
//             <tr style="background-color: #f3f4f6;">
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; font-weight: bold; font-size: 12px; color: #374151;">TOTAL (LKR)</td>
//               <td style="border: 1px solid #d1d5db; padding: 8px 10px; text-align: right; font-weight: bold; font-size: 12px; color: #374151;">${formatCurrency(data.total)}</td>
//             </tr>
//           </table>
//           <div style="font-size: 16px; color: #2563eb; font-weight: bold; line-height: 1.5;">
//             This invoice is payment for<br>
//             <span style="font-size: 20px;">${formatCurrency(data.total)} LKR</span>
//           </div>
//         </div>
//       </div>

//       <!-- Comments Box -->
//       <div style="margin: 0 30px 25px 30px; border: 1px solid #d1d5db; padding: 15px; background: #ffffff;">
//         <div style="font-weight: bold; margin-bottom: 10px; font-size: 14px; color: #1f2937;">Comments or Special Instructions</div>
//         <div style="font-size: 11px; line-height: 1.7; color: #374151;">
//           <div style="margin-bottom: 8px;">
//             <strong>Important Note:</strong> Please do not forget to mention your Invoice number as the reference when you are depositing at the bank counter or the deposit machine since your payment is traced via the invoice number. Further, you are requested to email us a copy of the deposit slip or the screenshot of the online transfer / CEFT Transfer to finance@exe.lk on the payment date itself. (Please mention the Invoice Number in the Description).
//           </div>
//           <div>To avoid extending the payment duration, please pay before the due date.</div>
//         </div>
//       </div>

//       <!-- Footer with Blue/Green Background -->
//       <div style="background: linear-gradient(to right, #2563eb, #16a34a); padding: 25px 30px; margin-top: 20px;">
//         <div style="color: rgba(255, 255, 255, 0.9); font-size: 10px; text-align: center;">
//           &nbsp;
//         </div>
//       </div>
//     </div>
//   `;
// }

