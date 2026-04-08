import type { EarningMethod2026 } from '../../types';

interface Props {
  value: EarningMethod2026;
  onChange: (method: EarningMethod2026) => void;
}

const OPTIONS: { id: EarningMethod2026; label: string; description: string }[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Fare class multipliers apply (current default)',
  },
  {
    id: 'distance',
    label: 'Distance',
    description: '1 pt per mile — no fare class bonus, no minimum',
  },
  {
    id: 'spend',
    label: 'Spend',
    description: '5 pts per $1 of ticket price',
  },
  {
    id: 'segment',
    label: 'Segment',
    description: '500 pts per flight segment',
  },
];

export default function EarningMethodSelector({ value, onChange }: Props) {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">2026 Earning Method</span>
        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-medium">Coming 2026</span>
      </div>
      <p className="text-xs text-blue-600 mb-3">
        Choose how you earn points and status on flights. One method applies to all flights for the year.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              value === opt.id
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-blue-200 text-blue-700 hover:border-blue-400'
            }`}
          >
            <p className="font-semibold mb-0.5">{opt.label}</p>
            <p className={`font-normal leading-tight ${value === opt.id ? 'text-blue-100' : 'text-blue-500'}`}>
              {opt.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
