import type { TotalEarnings } from '../../types';

interface Props {
  totals: TotalEarnings;
  hasInputs: boolean;
}

export default function EarningsSummary({ totals, hasInputs }: Props) {
  if (!hasInputs) {
    return (
      <div className="mt-6 p-6 bg-white border border-gray-100 rounded-2xl text-center text-gray-500 text-sm shadow-xl shadow-slate-900/20">
        Add a flight or select a card to see your estimated earnings.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-3">Total Estimated Earnings</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-950 to-blue-800 rounded-2xl p-5 text-center shadow-md">
          <p className="text-xs text-blue-300 uppercase tracking-widest font-medium mb-1">Atmos Miles</p>
          <p className="text-4xl font-bold text-white">{totals.miles.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-600 rounded-2xl p-5 text-center shadow-md">
          <p className="text-xs text-emerald-200 uppercase tracking-widest font-medium mb-1">Status Points</p>
          <p className="text-4xl font-bold text-white">{totals.statusPoints.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
