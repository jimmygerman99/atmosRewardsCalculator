import { useMemo } from 'react';
import type { FlightLeg, EliteTier, FlightLegEarnings, EarningMethod2026 } from '../../types';
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
  return { id, airline: 'alaska', bookingChannel: 'atmos', fareClass: 'main', distanceMiles: 0, ticketPrice: 0 };
}

export default function FlightCalculator({ legs, elite, earningMethod, highlightChips, onChange, onEarnings }: Props) {
  const earnings = useMemo(
    () => legs.map((leg) => calculateFlightEarnings(leg, leg.eliteOverride ?? elite, earningMethod)),
    [legs, elite, earningMethod]
  );

  useMemo(() => onEarnings(earnings), [earnings]);

  function addLeg() {
    onChange([...legs, newLeg(crypto.randomUUID())]);
  }

  function updateLeg(updated: FlightLeg) {
    onChange(legs.map((l) => (l.id === updated.id ? updated : l)));
  }

  function removeLeg(id: string) {
    onChange(legs.filter((l) => l.id !== id));
  }

  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Flights</h2>

      <div className="flex flex-col gap-3">
        {legs.map((leg, i) => (
          <FlightLegRow
            key={leg.id}
            leg={leg}
            earnings={earnings[i]}
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
        className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors cursor-pointer"
      >
        <span className="text-lg leading-none">+</span> Add flight leg
      </button>
    </section>
  );
}
