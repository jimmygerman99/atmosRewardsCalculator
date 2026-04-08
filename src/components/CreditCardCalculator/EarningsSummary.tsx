import type { TotalEarnings } from '../../types';

interface Props {
  totals: TotalEarnings;
  hasInputs: boolean;
}

export default function EarningsSummary({ totals, hasInputs }: Props) {
  if (!hasInputs) {
    return (
      <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-400 text-sm">
        Add a flight or select a card to see your estimated earnings.
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Total Estimated Earnings</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-center">
          <p className="text-xs text-blue-500 uppercase tracking-wide font-medium mb-1">Atmos Miles</p>
          <p className="text-4xl font-bold text-blue-700">{totals.miles.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center">
          <p className="text-xs text-emerald-500 uppercase tracking-wide font-medium mb-1">Status Points</p>
          <p className="text-4xl font-bold text-emerald-700">{totals.statusPoints.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
