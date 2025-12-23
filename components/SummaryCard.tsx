
import React from 'react';

interface SummaryCardProps {
  title: string;
  value: string;
  subValue?: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, subValue, description, icon, iconBg }) => {
  return (
    <div className="bg-white rounded-[24px] p-6 shadow-soft border border-slate-50 flex flex-col justify-between h-40 relative">
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl ${iconBg} text-white`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-[13px] font-medium text-slate-400">{title}</p>
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[12px] text-slate-400">{description}</p>
          {subValue && <p className="text-[11px] text-slate-400 font-medium">{subValue}</p>}
        </div>
      </div>
    </div>
  );
};
