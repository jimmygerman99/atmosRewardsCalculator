import { useState } from 'react';
import { CARDS } from '../../data/cards';

function MultiplierBadge({ value }: { value: string }) {
  const color =
    value === '3x' ? 'bg-blue-950 text-white' :
    value === '2x' ? 'bg-blue-100 text-blue-800' :
    value === '1x' ? 'bg-gray-100 text-gray-500' :
    'bg-transparent text-gray-300';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {value}
    </span>
  );
}

export default function CardComparisonChart() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-blue-900 hover:text-blue-700 font-medium transition-colors cursor-pointer"
      >
        <span className={`transition-transform text-xs ${open ? 'rotate-90' : ''}`}>▶</span>
        Compare all cards
      </button>

      {open && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100 shadow-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-950 text-white">
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide w-40">Category</th>
                {CARDS.map((card) => (
                  <th key={card.id} className="px-4 py-3 text-center font-semibold text-xs leading-tight">
                    <div>{card.name.replace('Atmos ', '').replace('Alaska Airlines ', '')}</div>
                    <div className="font-normal text-blue-300 mt-0.5">${card.annualFee}/yr</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Alaska/Hawaiian flights — 3x for all */}
              <tr className="border-t border-gray-100 bg-white">
                <td className="px-4 py-3 text-gray-600 text-xs">Alaska & Hawaiian flights</td>
                {CARDS.map((card) => (
                  <td key={card.id} className="px-4 py-3 text-center">
                    <MultiplierBadge value={`${card.earningRates.alaskaHawaiianFlights}x`} />
                  </td>
                ))}
              </tr>


              {/* All other — 1x for all */}
              <tr className="border-t border-gray-100 bg-white">
                <td className="px-4 py-3 text-gray-600 text-xs">All other purchases</td>
                {CARDS.map((card) => (
                  <td key={card.id} className="px-4 py-3 text-center">
                    <MultiplierBadge value={`${card.earningRates.other}x`} />
                  </td>
                ))}
              </tr>

              {/* Status points rate */}
              <tr className="border-t border-gray-200 bg-emerald-50/40">
                <td className="px-4 py-3 text-gray-600 text-xs font-medium">Status pts</td>
                {CARDS.map((card) => (
                  <td key={card.id} className="px-4 py-3 text-center text-xs text-emerald-700 font-semibold">
                    1 / ${card.statusPointsPerDollar === 0.5 ? '2' : '3'}
                  </td>
                ))}
              </tr>

              {/* Anniversary bonus */}
              <tr className="border-t border-gray-100 bg-white">
                <td className="px-4 py-3 text-gray-600 text-xs">Anniversary bonus</td>
                {CARDS.map((card) => (
                  <td key={card.id} className="px-4 py-3 text-center text-xs">
                    {card.anniversaryStatusPoints
                      ? <span className="text-emerald-600 font-semibold">{card.anniversaryStatusPoints.toLocaleString()} SP</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
