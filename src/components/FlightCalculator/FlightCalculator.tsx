import { useMemo, useState } from 'react';
import type { FlightLeg, EliteTier, FlightLegEarnings, EarningMethod2026 } from '../../types';
import { ELITE_BONUS, EARNING_2026_SEGMENT_RATE } from '../../data/flights';
import { calculateFlightEarnings } from '../../utils/calculateEarnings';
import FlightLegRow from './FlightLegRow';

interface Props {
  legs: FlightLeg[];
  elite: EliteTier;
  earningMethod: EarningMethod2026;
  highlightChips: boolean;
  onChange: (legs: FlightLeg[]) => void;
  onEarnings: (earnings: FlightLegEarnings[]) => void;
}

function newLeg(id: string): FlightLeg {
  return { id, airline: 'alaska', bookingChannel: 'atmos', fareClass: 'main', origin: '', destination: '', ticketPrice: 0, bookedWithPoints: false };
}

export default function FlightCalculator({ legs, elite, earningMethod, highlightChips, onChange, onEarnings }: Props) {
  const [segmentCount, setSegmentCount] = useState(1);

  const legEarnings = useMemo(
    () => legs.map((leg) => calculateFlightEarnings(leg, leg.eliteOverride ?? elite, earningMethod)),
    [legs, elite, earningMethod]
  );

  // For segment mode: total earnings based on count × rate × elite bonus
  const segmentEarnings = useMemo((): FlightLegEarnings[] => {
    if (earningMethod !== 'segment' || segmentCount <= 0) return [];
    const baseMiles = segmentCount * EARNING_2026_SEGMENT_RATE;
    const miles = Math.round(baseMiles * (1 + (ELITE_BONUS[elite] ?? 0)));
    return [{ legId: '__segment__', baseMiles, miles, statusPoints: baseMiles }];
  }, [earningMethod, segmentCount, elite]);

  useMemo(() => {
    onEarnings(earningMethod === 'segment' ? segmentEarnings : legEarnings);
  }, [segmentEarnings, legEarnings, earningMethod]);

  function addLeg() {
    onChange([...legs, newLeg(crypto.randomUUID())]);
  }

  function updateLeg(updated: FlightLeg) {
    onChange(legs.map((l) => (l.id === updated.id ? updated : l)));
  }

  function removeLeg(id: string) {
    onChange(legs.filter((l) => l.id !== id));
  }

  // ── Segment mode: simple counter ──────────────────────────────────────────
  if (earningMethod === 'segment') {
    const totalMiles = segmentEarnings[0]?.miles ?? 0;
    const totalSP = segmentEarnings[0]?.statusPoints ?? 0;

    return (
      <section className="mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-32">
              <label className="block text-xs text-gray-500 mb-1">Number of segments</label>
              <input
                type="number" min="1" step="1"
                value={segmentCount || ''}
                placeholder="1"
                onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                onChange={(e) => setSegmentCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="text-xs text-gray-400 pt-4">
              × 500 pts per segment
            </div>
            {totalMiles > 0 && (
              <div className="text-right text-xs shrink-0 pt-4">
                <p><span className="font-semibold text-blue-600">{totalMiles.toLocaleString()}</span> <span className="text-gray-400">miles</span></p>
                <p><span className="font-semibold text-emerald-600">{totalSP.toLocaleString()}</span> <span className="text-gray-400">status pts</span></p>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // ── Classic / Distance / Spend: per-leg list ──────────────────────────────
  return (
    <section className="mb-8">
      <div className="flex flex-col gap-3">
        {legs.map((leg, i) => (
          <FlightLegRow
            key={leg.id}
            leg={leg}
            earnings={legEarnings[i]}
            index={i}
            globalElite={elite}
            earningMethod={earningMethod}
            highlightChip={highlightChips}
            onChange={updateLeg}
            onRemove={() => removeLeg(leg.id)}
            canRemove={legs.length > 1}
          />
        ))}
      </div>

      <button
        onClick={addLeg}
        className="mt-3 flex items-center gap-2 text-sm text-blue-900 hover:text-blue-700 font-medium transition-colors cursor-pointer"
      >
        <span className="text-lg leading-none">+</span> Add flight leg
      </button>
    </section>
  );
}
