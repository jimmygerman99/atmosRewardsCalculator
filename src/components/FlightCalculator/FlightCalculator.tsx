import { useMemo, useState } from "react";
import type { FlightLeg, EliteTier, FlightLegEarnings, EarningMethod2026 } from "../../types";
import { ELITE_BONUS, EARNING_2026_SEGMENT_RATE } from "../../data/flights";
import { calculateFlightEarnings } from "../../utils/calculateEarnings";
import FlightLegRow from "./FlightLegRow";

interface Props {
    legs: FlightLeg[];
    elite: EliteTier;
    earningMethod: EarningMethod2026;
    highlightChips: boolean;
    onChange: (legs: FlightLeg[]) => void;
    onEarnings: (earnings: FlightLegEarnings[]) => void;
}

function newLeg(airline: FlightLeg['airline'] = 'alaska'): FlightLeg {
    return {
        id: crypto.randomUUID(),
        airline,
        bookingChannel: 'atmos',
        fareClass: airline === 'partner' ? 'economy' : 'main',
        origin: '',
        destination: '',
        ticketPrice: 0,
        pointsRedeemed: 0,
        bookedWithPoints: false,
        roundTrip: false,
    };
}

export default function FlightCalculator({ legs, elite, earningMethod, highlightChips, onChange, onEarnings }: Props) {
    const [cashSegmentInput, setCashSegmentInput] = useState('');
    const [pointsSegmentInput, setPointsSegmentInput] = useState('');
    const cashSegmentCount  = Math.max(0, parseInt(cashSegmentInput)   || 0);
    const pointsSegmentCount = Math.max(0, parseInt(pointsSegmentInput) || 0);

    // Per-leg earnings (partner flights, award tickets, etc.)
    const legEarnings = useMemo(
        () => legs.map((leg) => calculateFlightEarnings(leg, leg.eliteOverride ?? elite, earningMethod)),
        [legs, elite, earningMethod],
    );

    // Alaska/Hawaiian segment count earnings (segment mode only)
    // Cash segments: earn miles + status points. Points/award segments: status points only.
    const akSegmentEarnings = useMemo((): FlightLegEarnings | null => {
        if (earningMethod !== 'segment') return null;
        const eliteBonus = ELITE_BONUS[elite] ?? 0;
        const cashBase   = cashSegmentCount   * EARNING_2026_SEGMENT_RATE;
        const pointsBase = pointsSegmentCount * EARNING_2026_SEGMENT_RATE;
        const totalBase  = cashBase + pointsBase;
        if (totalBase <= 0) return null;
        const miles = Math.round(cashBase * (1 + eliteBonus)); // points segments earn 0 miles
        const statusPoints = Math.round(totalBase);            // both earn status points
        return { legId: '__ak_segment__', baseMiles: totalBase, miles, statusPoints };
    }, [earningMethod, cashSegmentCount, pointsSegmentCount, elite]);

    useMemo(() => {
        const all: FlightLegEarnings[] = akSegmentEarnings ? [akSegmentEarnings, ...legEarnings] : legEarnings;
        onEarnings(all);
    }, [akSegmentEarnings, legEarnings]);

    function addLeg(airline: FlightLeg['airline'] = 'alaska') {
        onChange([...legs, newLeg(airline)]);
    }

    function updateLeg(updated: FlightLeg) {
        onChange(legs.map((l) => (l.id === updated.id ? updated : l)));
    }

    function removeLeg(id: string) {
        onChange(legs.filter((l) => l.id !== id));
    }

    return (
        <section className="mb-8">
            <div className="flex flex-col gap-3">
                {/* Segment mode: Alaska/Hawaiian count shortcut */}
                {earningMethod === 'segment' && (
                    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-lg">
                        <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Alaska / Hawaiian Segments</p>
                        <div className="flex flex-col gap-2">
                            {/* Cash row */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs w-14 text-center py-0.5 rounded-full bg-blue-950 text-white font-medium shrink-0">Cash</span>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0 segments"
                                        value={cashSegmentInput}
                                        onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        onChange={(e) => setCashSegmentInput(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div className="text-right text-xs shrink-0 w-28 text-gray-400">
                                    miles <span className="font-semibold text-blue-600">+</span> status pts
                                </div>
                            </div>
                            {/* Points/Award row */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs w-14 text-center py-0.5 rounded-full bg-amber-500 text-white font-medium shrink-0">Points</span>
                                <div className="flex-1 min-w-0">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0 segments"
                                        value={pointsSegmentInput}
                                        onKeyDown={(e) => { if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault(); }}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        onChange={(e) => setPointsSegmentInput(e.target.value.replace(/[^0-9]/g, ''))}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                </div>
                                <div className="text-right text-xs shrink-0 w-28 text-gray-400">
                                    status pts only
                                </div>
                            </div>
                        </div>
                        {/* Combined earnings */}
                        {(akSegmentEarnings) && (
                            <div className="mt-3 flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                                <span><span className="font-semibold text-blue-600">{akSegmentEarnings.miles.toLocaleString()}</span> miles</span>
                                <span><span className="font-semibold text-emerald-600">{akSegmentEarnings.statusPoints.toLocaleString()}</span> status pts</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Per-leg list (partner flights, award tickets, partner-direct overrides) */}
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
                        canRemove={true}
                    />
                ))}
            </div>

            {earningMethod === 'segment' ? (
                <button
                    onClick={() => addLeg('partner')}
                    className="mt-3 flex items-center gap-2 text-sm text-blue-900 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                >
                    <span className="text-lg leading-none">+</span> Add partner / award flight
                </button>
            ) : (
                <button
                    onClick={() => addLeg('alaska')}
                    className="mt-3 flex items-center gap-2 text-sm text-blue-900 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                >
                    <span className="text-lg leading-none">+</span> Add flight leg
                </button>
            )}
        </section>
    );
}
