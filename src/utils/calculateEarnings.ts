import type {
  CreditCard,
  CardSpend,
  CardEarnings,
  FlightLeg,
  FlightLegEarnings,
  AlaskaFareClass,
  PartnerFareClass,
  EliteTier,
  EarningMethod2026,
  PartnerSpend,
  PartnerEarningsResult,
  TotalEarnings,
} from '../types';
import {
  ALASKA_FARE_MULTIPLIER,
  HAWAIIAN_FARE_MULTIPLIER,
  PARTNER_ATMOS_MULTIPLIER,
  PARTNER_DIRECT_MULTIPLIER,
  ELITE_BONUS,
  MIN_FLIGHT_POINTS,
  EARNING_2026_SPEND_RATE,
  EARNING_2026_SEGMENT_RATE,
} from '../data/flights';
import { haversineDistance } from './haversine';
import {
  HOTEL_MILES_PER_DOLLAR,
  CRUISE_MILES_PER_DOLLAR,
  CAR_RENTAL_MILES_PER_TIER,
  CAR_RENTAL_MILES_CARD_HOLDER,
  LYFT_MILES_PER_DOLLAR,
  PARTNER_STATUS_POINTS_PER_DOLLAR,
  SHOPPING_STATUS_POINTS_RATIO,
} from '../data/partners';

// ── Credit Card ───────────────────────────────────────────────────────────────

export function calculateCardEarnings(card: CreditCard, spend: CardSpend): CardEarnings {
  const baseMiles =
    spend.alaskaHawaiianFlights * card.earningRates.alaskaHawaiianFlights +
    spend.other * card.earningRates.other;

  let bonusMiles = 0;
  let bonusSpendTotal = 0;
  for (const cat of card.bonusCategories) {
    const amt = (spend.bonusSpend ?? {})[cat.field] ?? 0;
    bonusMiles += amt * cat.multiplier;
    bonusSpendTotal += amt;
  }
  const miles = baseMiles + bonusMiles;
  const totalSpend = spend.alaskaHawaiianFlights + spend.other + bonusSpendTotal;
  const anniversaryBonus = spend.includeAnniversaryBonus ? (card.anniversaryStatusPoints ?? 0) : 0;
  const statusPoints = Math.round(totalSpend * card.statusPointsPerDollar) + anniversaryBonus;

  return { cardId: card.id, miles, statusPoints, totalSpend };
}

// ── Flights ───────────────────────────────────────────────────────────────────

// Only called for partner airlines
function getFareMultiplier(leg: FlightLeg): number {
  const map = leg.bookingChannel === 'atmos' ? PARTNER_ATMOS_MULTIPLIER : PARTNER_DIRECT_MULTIPLIER;
  return map[leg.fareClass as PartnerFareClass] ?? 0.5;
}

function applyRoundTrip(result: FlightLegEarnings, roundTrip: boolean): FlightLegEarnings {
  if (!roundTrip) return result;
  return {
    ...result,
    baseMiles: result.baseMiles * 2,
    miles: result.miles * 2,
    statusPoints: result.statusPoints * 2,
  };
}

export function calculateFlightEarnings(
  leg: FlightLeg,
  elite: EliteTier,
  method: EarningMethod2026 = 'distance'
): FlightLegEarnings {
  const empty: FlightLegEarnings = { legId: leg.id, baseMiles: 0, miles: 0, statusPoints: 0 };
  const eliteBonus = ELITE_BONUS[elite] ?? 0;

  // ── Spend method ──
  if (method === 'spend') {
    // Partner booked directly on partner's site → doesn't qualify for 5 pts/$1;
    // falls back to partner direct fare-class multiplier × distance (same for all methods)
    if (leg.airline === 'partner' && leg.bookingChannel === 'partner') {
      if (!leg.origin || !leg.destination) return empty;
      const distanceMiles = haversineDistance(leg.origin, leg.destination);
      if (!distanceMiles) return empty;
      const baseMiles = (distanceMiles * getFareMultiplier(leg)) || 0;
      const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
      return applyRoundTrip({ legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 }, leg.roundTrip);
    }
    // Alaska/Hawaiian, or partner booked via Atmos → 5 pts/$1 (cash) or 1 SP/20 pts redeemed (award)
    if (leg.bookedWithPoints) {
      // Award flight: 0 miles, 1 status point per 20 points redeemed
      const statusPoints = Math.floor((leg.pointsRedeemed || 0) / 20);
      return applyRoundTrip({ legId: leg.id, baseMiles: 0, miles: 0, statusPoints }, leg.roundTrip);
    }
    if (!leg.ticketPrice) return empty;
    const baseMiles = (leg.ticketPrice * EARNING_2026_SPEND_RATE) || 0;
    const miles = Math.round(baseMiles * (1 + eliteBonus)) || 0;
    return applyRoundTrip({ legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 }, leg.roundTrip);
  }

  // ── Segment method ──
  // Partner direct overrides the selected method — always falls back to distance calc
  if (method === 'segment' && !(leg.airline === 'partner' && leg.bookingChannel === 'partner')) {
    const baseMiles = EARNING_2026_SEGMENT_RATE;
    const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
    return applyRoundTrip({ legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 }, leg.roundTrip);
  }

  // ── Distance method (and partner-direct fallback from spend/segment) ──
  if (!leg.origin || !leg.destination) return empty;
  const distanceMiles = haversineDistance(leg.origin, leg.destination);
  if (!distanceMiles) return empty;

  // Partner: fare class multiplier × distance, no minimum
  if (leg.airline === 'partner') {
    const baseMiles = (distanceMiles * getFareMultiplier(leg)) || 0;
    const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
    return applyRoundTrip({ legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 }, leg.roundTrip);
  }

  // Alaska/Hawaiian: apply 500-pt minimum to raw distance first, then scale by fare class multiplier
  const akHawaiianMultiplier = leg.airline === 'hawaiian'
    ? (HAWAIIAN_FARE_MULTIPLIER[leg.fareClass as AlaskaFareClass] ?? 1.0)
    : (ALASKA_FARE_MULTIPLIER[leg.fareClass as AlaskaFareClass] ?? 1.0);
  const baseMiles = Math.max(distanceMiles, MIN_FLIGHT_POINTS) * akHawaiianMultiplier;
  const miles = leg.bookedWithPoints ? 0 : Math.round(baseMiles * (1 + eliteBonus)) || 0;
  return applyRoundTrip({ legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) || 0 }, leg.roundTrip);
}

// ── Partner / Portal ──────────────────────────────────────────────────────────

function dollarCategory(miles: number, dollars: number): { miles: number; statusPoints: number } {
  return {
    miles: Math.round(miles),
    statusPoints: Math.floor(dollars * PARTNER_STATUS_POINTS_PER_DOLLAR), // 1 SP per $1
  };
}

export function calculatePartnerEarnings(
  spend: PartnerSpend,
  elite: EliteTier = 'none',
  hasAtmosCard: boolean = false,
): PartnerEarningsResult {
  const shoppingMiles = spend.shoppingDollars * spend.shoppingMilesPerDollar;
  const shopping = {
    miles: Math.round(shoppingMiles),
    statusPoints: Math.floor(shoppingMiles * SHOPPING_STATUS_POINTS_RATIO), // 1 SP per 3 miles
  };

  const milesPerRental = elite === 'none'
    ? (hasAtmosCard ? CAR_RENTAL_MILES_CARD_HOLDER : CAR_RENTAL_MILES_PER_TIER.none)
    : CAR_RENTAL_MILES_PER_TIER[elite];
  const hotels     = dollarCategory(spend.hotelDollars * HOTEL_MILES_PER_DOLLAR, spend.hotelDollars);
  const carRentals = dollarCategory(spend.carRentals * milesPerRental, spend.carRentalDollars);
  const cruises    = dollarCategory(spend.cruiseDollars * CRUISE_MILES_PER_DOLLAR, spend.cruiseDollars);
  const lyft       = dollarCategory(spend.lyftDollars * LYFT_MILES_PER_DOLLAR, spend.lyftDollars);
  // SAF and GCI earn status points only — no redeemable miles
  const saf  = { miles: 0, statusPoints: Math.floor(spend.safDollars * PARTNER_STATUS_POINTS_PER_DOLLAR) };
  const gci  = { miles: 0, statusPoints: Math.floor(spend.gciDollars * PARTNER_STATUS_POINTS_PER_DOLLAR) };

  return {
    shopping,
    hotels,
    carRentals,
    cruises,
    lyft,
    saf,
    gci,
    total: {
      miles: shopping.miles + hotels.miles + carRentals.miles + cruises.miles + lyft.miles,
      statusPoints: shopping.statusPoints + hotels.statusPoints + carRentals.statusPoints + cruises.statusPoints + lyft.statusPoints + saf.statusPoints + gci.statusPoints,
    },
  };
}

// ── Grand Totals ──────────────────────────────────────────────────────────────

export function sumTotals(
  cardEarnings: CardEarnings[],
  flightEarnings: FlightLegEarnings[],
  partnerEarnings: PartnerEarningsResult
): TotalEarnings {
  const cardMiles    = cardEarnings.reduce((s, e) => s + e.miles, 0);
  const cardStatus   = cardEarnings.reduce((s, e) => s + e.statusPoints, 0);
  const flightMiles  = flightEarnings.reduce((s, e) => s + e.miles, 0);
  const flightStatus = flightEarnings.reduce((s, e) => s + e.statusPoints, 0);

  return {
    miles: cardMiles + flightMiles + partnerEarnings.total.miles,
    statusPoints: cardStatus + flightStatus + partnerEarnings.total.statusPoints,
  };
}
