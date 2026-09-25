import { FiArrowRight } from 'react-icons/fi';

export default function RecentDocuments() {
  const documents = [
    { no: "INV-2024-089", type: "Invoice", client: "Apex Global Logistics", date: "2024-10-24", status: "Pending", statusColor: "text-[#914B00] dark:text-[#B28503] bg-[#914B00]/10 dark:bg-[#B28503]/10" },
    { no: "REC-2024-041", type: "Receipt", client: "Orion BioTech Ltd", date: "2024-10-23", status: "Paid", statusColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20" },
    { no: "DOC-2024-012", type: "Appointment Letter", client: "Kavinda Perera", date: "2024-10-21", status: "Approved", statusColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20" },
  ];

  return (
    <div className="bg-white dark:bg-[#14161A] rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm overflow-hidden transition-colors duration-200">
      <div className="flex justify-between items-center p-5 border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
        <h3 className="text-[15px] font-bold text-[#1F2933] dark:text-white flex items-center gap-2 tracking-tight">
          Recent Documents
        </h3>
        <button className="text-[13px] font-semibold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 flex items-center gap-1.5 transition-colors">
          View All <FiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] dark:bg-[#0B0C0E] border-b border-[#616E7C]/20 dark:border-[#3A3E46]">
              <th className="px-6 py-3.5 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Document No</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Client / Employee</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
            <tbody className="divide-y divide-[#616E7C]/10 dark:divide-[#3A3E46]/50">
            {documents.map((doc, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC]/80 dark:hover:bg-[#3A3E46]/10 transition-colors">
                <td className="px-6 py-3.5 text-[13px] font-semibold text-[#1F2933] dark:text-white">{doc.no}</td>
                <td className="px-6 py-3.5 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">{doc.type}</td>
                <td className="px-6 py-3.5 text-[13px] font-medium text-[#1F2933] dark:text-white">{doc.client}</td>
                <td className="px-6 py-3.5 text-[13px] font-medium text-[#616E7C] dark:text-[#E5E7EB]/70">{doc.date}</td>
                <td className="px-6 py-3.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${doc.statusColor}`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button className="text-[13px] font-semibold text-[#2A5CAA] hover:text-[#2A5CAA]/80 dark:text-[#5B8DD9] dark:hover:text-[#5B8DD9]/80 transition-colors">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-between items-center p-4 border-t border-[#616E7C]/20 dark:border-[#3A3E46] bg-[#F8FAFC] dark:bg-[#0B0C0E]">
        <span className="text-[12px] text-[#616E7C] dark:text-[#E5E7EB]/60 font-semibold">Showing 3 of 142 total entries</span>
        <span className="text-[11px] text-[#616E7C] dark:text-[#E5E7EB]/50 font-bold tracking-wider uppercase">Sync Interval: 60s</span>
      </div>
    </div>
  );
}