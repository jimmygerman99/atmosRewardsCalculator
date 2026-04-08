import { useState } from 'react';

interface Props {
  title: string;
  description: string;
  defaultOpen?: boolean;
  miles: number;
  statusPoints: number;
  children: React.ReactNode;
}

export default function CollapsibleSection({ title, description, defaultOpen = true, miles, statusPoints, children }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const hasEarnings = miles > 0 || statusPoints > 0;

  return (
    <div className={`rounded-2xl border transition-colors mb-4 shadow-sm ${hasEarnings ? 'border-blue-900/20 bg-white' : 'border-gray-200 bg-white'}`}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          {/* Active dot */}
          <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${hasEarnings ? 'bg-blue-900' : 'bg-gray-300'}`} />
          <div>
            <p className={`text-base font-semibold transition-colors ${hasEarnings ? 'text-blue-950' : 'text-gray-700'}`}>{title}</p>
            {!open && !hasEarnings && (
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          {hasEarnings && (
            <div className="text-right text-xs">
              <p><span className="font-semibold text-blue-800">{miles.toLocaleString()}</span> <span className="text-gray-400">miles</span></p>
              <p><span className="font-semibold text-emerald-600">{statusPoints.toLocaleString()}</span> <span className="text-gray-400">status pts</span></p>
            </div>
          )}
          <span className={`text-gray-400 text-sm transition-transform duration-200 group-hover:text-gray-600 ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {/* Collapsible content */}
      {open && (
        <div className="px-5 pb-5">
          {!hasEarnings && <p className="text-xs text-gray-400 mb-4">{description}</p>}
          {children}
        </div>
      )}
    </div>
  );
}
