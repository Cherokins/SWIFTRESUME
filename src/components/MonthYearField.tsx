import React from 'react';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(CURRENT_YEAR - i));

interface MonthYearFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allowPresent?: boolean;
  placeholder?: string;
}

export const MonthYearField: React.FC<MonthYearFieldProps> = ({
  label,
  value,
  onChange,
  allowPresent = false,
}) => {
  const isPresent = allowPresent && value === 'Present';
  const parts = !isPresent && value ? value.split(' ') : [];
  const selectedMonth = MONTHS.includes(parts[0]) ? parts[0] : '';
  const selectedYear = YEARS.includes(parts[1]) ? parts[1] : '';

  const handleMonthChange = (m: string) => {
    const y = selectedYear || String(CURRENT_YEAR);
    if (!m) {
      onChange('');
      return;
    }
    onChange(`${m} ${y}`);
  };

  const handleYearChange = (y: string) => {
    const m = selectedMonth || 'Jan';
    if (!y) {
      onChange('');
      return;
    }
    onChange(`${m} ${y}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#3a3d47]">{label}</span>
        {allowPresent && (
          <label className="inline-flex items-center gap-1.5 text-xs text-[#3a3d47] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPresent}
              onChange={(e) => onChange(e.target.checked ? 'Present' : '')}
              className="h-3.5 w-3.5 rounded border-[#cccdd4] accent-[#14397a]"
            />
            Present
          </label>
        )}
      </div>

      {isPresent ? (
        <div className="rounded-lg border border-[#e3e3e8] bg-[#f6f6f7] px-3 py-2 text-sm text-[#3a3d47]">
          Present
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label={`${label} month`}
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full rounded-lg border border-[#cccdd4] bg-white px-2.5 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select
            aria-label={`${label} year`}
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full rounded-lg border border-[#cccdd4] bg-white px-2.5 py-2 text-sm text-[#111318] outline-none focus:border-[#14397a] focus:ring-2 focus:ring-[#14397a]/15"
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
