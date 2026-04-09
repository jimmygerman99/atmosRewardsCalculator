import { useState, useMemo, useCallback, useRef } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { CardSpend, FlightLeg, FlightLegEarnings, EliteTier, EarningMethod2026, PartnerSpend } from '../../types';
import { CARD_MAP } from '../../data/cards';
import { SHOPPING_DEFAULT_MILES_PER_DOLLAR } from '../../data/partners';
import { calculateCardEarnings, calculatePartnerEarnings, sumTotals } from '../../utils/calculateEarnings';
import EliteStatusSelector from '../shared/EliteStatusSelector';
import EarningMethodSelector from '../shared/EarningMethodSelector';
import CollapsibleSection from '../shared/CollapsibleSection';
import FlightCalculator from '../FlightCalculator/FlightCalculator';
import PartnerEarnings from '../PartnerEarnings/PartnerEarnings';
import CardSelector from './CardSelector';
import CardSpendingInputs from './CardSpendingInputs';
import EarningsSummary from './EarningsSummary';
import StatusProgressBar from '../StatusProgressBar/StatusProgressBar';
import SupportFooter from '../SupportFooter/SupportFooter';

function defaultSpend(cardId: string): CardSpend {
  return { cardId, alaskaHawaiianFlights: 0, other: 0 };
}

function defaultLeg(): FlightLeg {
  return {
    id: crypto.randomUUID(),
    airline: 'alaska',
    bookingChannel: 'atmos',
    fareClass: 'main',
    origin: '',
    destination: '',
    ticketPrice: 0,
    bookedWithPoints: false,
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
  const [elite, setElite] = useLocalStorage<EliteTier>('elite', 'none');
  const [earningMethod, setEarningMethod] = useLocalStorage<EarningMethod2026>('earningMethod', 'distance');
  const [legs, setLegs] = useLocalStorage<FlightLeg[]>('legs', [defaultLeg()]);
  const [flightEarnings, setFlightEarnings] = useState<FlightLegEarnings[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useLocalStorage<string[]>('selectedCardIds', []);
  const [spendMap, setSpendMap] = useLocalStorage<Record<string, CardSpend>>('spendMap', {});
  const [partnerSpend, setPartnerSpend] = useLocalStorage<PartnerSpend>('partnerSpend', defaultPartnerSpend);
  const [showResetModal, setShowResetModal] = useState(false);
  const [highlightChips, setHighlightChips] = useState(false);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHighlightFlightChips = useCallback(() => {
    if (highlightTimer.current) clearTimeout(highlightTimer.current);
    setHighlightChips(true);
    highlightTimer.current = setTimeout(() => setHighlightChips(false), 2000);
  }, []);

  function handleReset() {
    setElite('none');
    setEarningMethod('distance');
    setLegs([defaultLeg()]);
    setFlightEarnings([]);
    setSelectedCardIds([]);
    setSpendMap({});
    setPartnerSpend(defaultPartnerSpend);
    setShowResetModal(false);
  }

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

  // Per-section totals for CollapsibleSection headers
  const flightTotals = useMemo(() => ({
    miles: flightEarnings.reduce((s, e) => s + e.miles, 0),
    statusPoints: flightEarnings.reduce((s, e) => s + e.statusPoints, 0),
  }), [flightEarnings]);

  const cardTotals = useMemo(() => ({
    miles: cardEarnings.reduce((s, e) => s + e.miles, 0),
    statusPoints: cardEarnings.reduce((s, e) => s + e.statusPoints, 0),
  }), [cardEarnings]);

  const hasAnyInput =
    flightEarnings.some((e) => e.miles > 0 || e.statusPoints > 0) ||
    cardEarnings.some((e) => e.miles > 0 || e.statusPoints > 0) ||
    partnerEarnings.total.miles > 0 ||
    partnerEarnings.total.statusPoints > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
        <div className="bg-gradient-to-br from-blue-950 to-blue-800 px-8 py-8 text-center relative">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">Alaska · Hawaiian · Atmos</p>
          <h1 className="text-3xl font-bold text-white mb-2">Atmos Rewards Calculator</h1>
          <p className="text-blue-200 text-sm max-w-md mx-auto">
            Estimate the Atmos Miles and Status Points you can earn from flights, portal purchases, and credit card spending.
          </p>
          <button
            onClick={() => setShowResetModal(true)}
            className="absolute top-4 right-4 text-xs text-blue-300 hover:text-white border border-blue-700 hover:border-blue-400 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            Reset all
          </button>
        </div>
        <div className="bg-white px-8 py-5">
          <EliteStatusSelector value={elite} onChange={setElite} onHighlightFlightChips={handleHighlightFlightChips} />
        </div>
      </div>

      {/* Flights */}
      <CollapsibleSection
        title="Flights"
        description="Add flight legs to calculate miles and status points earned."
        defaultOpen={true}
        miles={flightTotals.miles}
        statusPoints={flightTotals.statusPoints}
      >
        <div className="mb-4">
          <EarningMethodSelector value={earningMethod} onChange={setEarningMethod} />
        </div>
        <FlightCalculator
          legs={legs}
          elite={elite}
          earningMethod={earningMethod}
          highlightChips={highlightChips}
          onChange={setLegs}
          onEarnings={setFlightEarnings}
        />
      </CollapsibleSection>

      {/* Portal & Partner Purchases */}
      <CollapsibleSection
        title="Portal & Partner Purchases"
        description="Earn miles and status points through Atmos partner purchases."
        defaultOpen={false}
        miles={partnerEarnings.total.miles}
        statusPoints={partnerEarnings.total.statusPoints}
      >
        <PartnerEarnings
          spend={partnerSpend}
          earnings={partnerEarnings}
          onChange={setPartnerSpend}
        />
      </CollapsibleSection>

      {/* Credit Cards */}
      <CollapsibleSection
        title="Credit Card Spending"
        description="Select the Atmos co-brand card(s) you hold to add credit card earnings."
        defaultOpen={false}
        miles={cardTotals.miles}
        statusPoints={cardTotals.statusPoints}
      >
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
      </CollapsibleSection>

      {/* Summary */}
      <EarningsSummary totals={totals} hasInputs={hasAnyInput} />

      {/* Status progress */}
      {hasAnyInput && <StatusProgressBar statusPoints={totals.statusPoints} />}

      <SupportFooter />

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">Reset everything?</h2>
            <p className="text-sm text-gray-500 mb-6">
              This will clear all flights, card spending, and partner purchases. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Reset all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
