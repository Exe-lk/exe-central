export default function MetricsGrid() {
  const metrics = [
    { title: "Active Projects", value: "18", sub1: "+2 this month", sub2: "METRIC-01", highlight: false },
    { title: "Pending Invoices", value: "6", sub1: "LKR 840,000", sub2: "METRIC-02", highlight: true },
    { title: "Outstanding Payments", value: "LKR 1,250,000", sub1: "4 clients", sub2: "METRIC-03", highlight: false },
    { title: "Recent Receipts", value: "12", sub1: "LKR 2,100,000 this week", sub2: "METRIC-04", highlight: false },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, idx) => (
        <div key={idx} className="bg-white dark:bg-[#14161A] p-5 rounded-lg border border-[#616E7C]/20 dark:border-[#3A3E46] shadow-sm transition-colors duration-200">
          <h3 className="text-[11px] font-bold text-[#616E7C] dark:text-[#E5E7EB]/70 uppercase tracking-wider mb-2">
            {metric.title}
          </h3>
          <div className="text-[32px] leading-tight font-bold text-[#1F2933] dark:text-white mb-4">
            {metric.value}
          </div>
          <div className="flex justify-between items-center text-[12px]">
            <span className={`font-semibold ${metric.highlight ? 'text-[#914B00] dark:text-[#B28503]' : 'text-[#616E7C] dark:text-[#E5E7EB]/70 font-medium'}`}>
              {metric.sub1}
            </span>
            <span className="text-[#616E7C]/50 dark:text-[#E5E7EB]/30 font-semibold tracking-wide">
              {metric.sub2}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}