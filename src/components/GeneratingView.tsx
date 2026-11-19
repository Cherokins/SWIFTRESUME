import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  'Reviewing your experience',
  'Drafting your CV',
  'Tailoring your cover letter',
  'Formatting ATS layout',
];

export const GeneratingView: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setActiveIndex(1), 1600),
      setTimeout(() => setActiveIndex(2), 4200),
      setTimeout(() => setActiveIndex(3), 7000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="mb-6 h-11 w-11 animate-spin rounded-full border-2 border-[#e3e3e8] border-t-[#14397a]"
        aria-hidden="true"
      />
      <h2 className="font-display text-2xl text-[#111318] mb-1.5">
        Building your documents
      </h2>
      <p className="text-sm text-[#72757f] mb-7">
        This usually takes a few seconds
      </p>

      <div className="w-full max-w-[300px] space-y-2.5 text-left">
        {STEPS.map((label, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          return (
            <div
              key={label}
              className={`flex items-center gap-2.5 text-sm transition-colors ${
                isDone
                  ? 'text-[#166534] font-medium'
                  : isActive
                    ? 'text-[#111318] font-medium'
                    : 'text-[#b0b3bc]'
              }`}
            >
              <span className="flex h-4 w-4 items-center justify-center">
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-[#166534]" />
                ) : (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive ? 'bg-[#14397a]' : 'bg-[#cccdd4]'
                    }`}
                  />
                )}
              </span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
