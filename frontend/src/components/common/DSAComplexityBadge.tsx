import React from 'react';
import { Cpu } from 'lucide-react';

interface DSAComplexityBadgeProps {
  structure: string;
  operation: string;
  timeComplexity: string;
  spaceComplexity?: string;
  className?: string;
}

export const DSAComplexityBadge: React.FC<DSAComplexityBadgeProps> = ({
  structure,
  operation,
  timeComplexity,
  spaceComplexity,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-900 font-mono shadow-xs ${className}`}
    >
      <span className="flex items-center gap-1 font-semibold text-indigo-700">
        <Cpu className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        {structure}
      </span>
      <span className="text-indigo-300">•</span>
      <span className="text-slate-600">{operation}</span>
      <span className="text-indigo-300">•</span>
      <span className="font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
        Time: {timeComplexity}
      </span>
      {spaceComplexity && (
        <>
          <span className="text-indigo-300">•</span>
          <span className="text-slate-500">Space: {spaceComplexity}</span>
        </>
      )}
    </div>
  );
};
