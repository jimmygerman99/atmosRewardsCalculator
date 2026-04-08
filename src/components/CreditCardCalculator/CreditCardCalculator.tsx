import { useState, useMemo, useCallback, useRef } from 'react';
import type { CardSpend, FlightLeg, FlightLegEarnings, EliteTier, EarningMethod2026, PartnerSpend } from '../../types';
import { CARD_MAP } from '../../data/cards';
import { SHOPPING_DEFAULT_MILES_PER_DOLLAR } from '../../data/partners';
import { calculateCardEarnings, calculatePartnerEarnings, sumTotals } from '../../utils/calculateEarnings';
import EliteStatusSelector from '../shared/EliteStatusSelector';
import EarningMethodSelector from '../shared/EarningMethodSelector';
import FlightCalculator from '../FlightCalculator/FlightCalculator';
import PartnerEarnings from '../PartnerEarnings/PartnerEarnings';
import CardSelector from './CardSelector';
import CardSpendingInputs from './CardSpendingInputs';
import EarningsSummary from './EarningsSummary';

function defaultSpend(cardId: string): CardSpend {
  return { cardId, alaskaHawaiianFlights: 0, other: 0 };
}

function defaultLeg(): FlightLeg {
  return {
    id: crypto.randomUUID(),
    airline: 'alaska',
    bookingChannel: 'atmos',
    fareClass: 'main',
    distanceMiles: 0,
    ticketPrice: 0,
  };
}

const defaultPartnerSpend: PartnerSpend = {
  shoppingDollars: 0,
  shoppingMilesPerDollar: SHOPPING_DEFAULT_MILES_PER_DOLLAR,
  hotelDollars: 0,
  carRentals: 0,
  carRentalDollars: 0,
  cruiseDollars: 0,
  lyftDollars: 0,
  safDollars: 0,
  gciDollars: 0,
};

export default function AtmosCalculator() {
  const [elite, setElite] = useState<EliteTier>('none');
  const [earningMethod, setEarningMethod] = useState<EarningMethod2026>('classic');
  const [legs, setLegs] = useState<FlightLeg[]>([defaultLeg()]);
  const [flightEarnings, setFlightEarnings] = useState<FlightLegEarnings[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [spendMap, setSpendMap] = useState<Record<string, CardSpend>>({});
  const [partnerSpend, setPartnerSpend] = useState<PartnerSpend>(defaultPartnerSpend);
  const [highlightChips, setHighlightChips] = useState(false);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHighlightFlightChips = useCallback(() => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightChips(true);
    highlightTimer.current = setTimeout(() => setHighlightChips(false), 2000);
  }, []);

  function handleCardChange(ids: string[]) {
    setSelectedCardIds(ids);
    setSpendMap((prev) => {
      const next = { ...prev };
      ids.forEach((id) => { if (!next[id]) next[id] = defaultSpend(id); });
      return next;
    });
  }

  const cardEarnings = useMemo(
    () => selectedCardIds.map((id) => calculateCardEarnings(CARD_MAP[id], spendMap[id] ?? defaultSpend(id))),
    [selectedCardIds, spendMap]
  );

  const partnerEarnings = useMemo(() => calculatePartnerEarnings(partnerSpend), [partnerSpend]);

  const totals = useMemo(
    () => sumTotals(cardEarnings, flightEarnings, partnerEarnings),
    [cardEarnings, flightEarnings, partnerEarnings]
  );

  const hasAnyInput =
    flightEarnings.some((e) => e.miles > 0) ||
    cardEarnings.some((e) => e.miles > 0 || e.statusPoints > 0) ||
    partnerEarnings.total.miles > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Atmos Rewards Calculator</h1>
        <p className="text-gray-500 text-sm">
          Estimate the Atmos Miles and Status Points you can earn from flights, portal purchases, and credit card spending.
        </p>
      </div>

      {/* Elite Status */}
      <EliteStatusSelector value={elite} onChange={setElite} onHighlightFlightChips={handleHighlightFlightChips} />
      <hr className="border-gray-200 mb-8" />

      {/* Flights */}
      <section className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Flights</h2>
        <EarningMethodSelector value={earningMethod} onChange={setEarningMethod} />
      </section>

      <FlightCalculator
        legs={legs}
        elite={elite}
        earningMethod={earningMethod}
        highlightChips={highlightChips}
        onChange={setLegs}
        onEarnings={setFlightEarnings}
      />
      <hr className="border-gray-200 mb-8" />

      {/* Portal & Partner Purchases */}
      <PartnerEarnings
        spend={partnerSpend}
        earnings={partnerEarnings}
        onChange={setPartnerSpend}
      />
      <hr className="border-gray-200 mb-8" />

      {/* Credit Cards */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-1">Credit Card Spending</h2>
        <p className="text-xs text-gray-400 mb-3">
          Select the Atmos co-brand card(s) you hold to add credit card earnings.
        </p>
        <CardSelector selectedIds={selectedCardIds} onChange={handleCardChange} />
        {selectedCardIds.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            {selectedCardIds.map((id) => (
              <CardSpendingInputs
                key={id}
                card={CARD_MAP[id]}
                spend={spendMap[id] ?? defaultSpend(id)}
                onChange={(s) => setSpendMap((prev) => ({ ...prev, [s.cardId]: s }))}
              />
            ))}
          </div>
        )}
      </section>
      <hr className="border-gray-200" />

      {/* Summary */}
      <EarningsSummary totals={totals} hasInputs={hasAnyInput} />
    </div>
  );
}
