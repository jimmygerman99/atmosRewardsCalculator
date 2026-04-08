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
  PARTNER_ATMOS_MULTIPLIER,
  PARTNER_DIRECT_MULTIPLIER,
  ELITE_BONUS,
  MIN_FLIGHT_POINTS,
  EARNING_2026_DISTANCE_RATE,
  EARNING_2026_SPEND_RATE,
  EARNING_2026_SEGMENT_RATE,
} from '../data/flights';
import {
  HOTEL_MILES_PER_DOLLAR,
  CRUISE_MILES_PER_DOLLAR,
  CAR_RENTAL_MILES_PER_RENTAL,
  LYFT_MILES_PER_DOLLAR,
  PARTNER_STATUS_POINTS_PER_DOLLAR,
  SHOPPING_STATUS_POINTS_RATIO,
} from '../data/partners';

// ── Credit Card ───────────────────────────────────────────────────────────────

export function calculateCardEarnings(card: CreditCard, spend: CardSpend): CardEarnings {
  const miles =
    spend.alaskaHawaiianFlights * card.earningRates.alaskaHawaiianFlights +
    spend.other * card.earningRates.other;

  const totalSpend = spend.alaskaHawaiianFlights + spend.other;
  const statusPoints = Math.floor(totalSpend * card.statusPointsPerDollar);

  return { cardId: card.id, miles, statusPoints, totalSpend };
}

// ── Flights ───────────────────────────────────────────────────────────────────

function getFareMultiplier(leg: FlightLeg): number {
  if (leg.airline === 'alaska' || leg.airline === 'hawaiian') {
    return ALASKA_FARE_MULTIPLIER[leg.fareClass as AlaskaFareClass] ?? 1.0;
  }
  const map = leg.bookingChannel === 'atmos' ? PARTNER_ATMOS_MULTIPLIER : PARTNER_DIRECT_MULTIPLIER;
  return map[leg.fareClass as PartnerFareClass] ?? 0.5;
}

export function calculateFlightEarnings(
  leg: FlightLeg,
  elite: EliteTier,
  method: EarningMethod2026 = 'classic'
): FlightLegEarnings {
  if (leg.distanceMiles === 0 && leg.ticketPrice === 0) {
    return { legId: leg.id, baseMiles: 0, miles: 0, statusPoints: 0 };
  }

  const eliteBonus = ELITE_BONUS[elite];

  // ── 2026 distance method ──
  if (method === 'distance') {
    // 1 pt/mile, no fare-class bonus, no minimum floor, elite bonus still applies to miles
    const baseMiles = leg.distanceMiles * EARNING_2026_DISTANCE_RATE;
    const miles = Math.round(baseMiles * (1 + eliteBonus));
    return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) };
  }

  // ── 2026 spend method ──
  if (method === 'spend') {
    const baseMiles = leg.ticketPrice * EARNING_2026_SPEND_RATE;
    const miles = Math.round(baseMiles * (1 + eliteBonus));
    return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) };
  }

  // ── 2026 segment method ──
  if (method === 'segment') {
    const baseMiles = EARNING_2026_SEGMENT_RATE;
    const miles = Math.round(baseMiles * (1 + eliteBonus));
    return { legId: leg.id, baseMiles, miles, statusPoints: Math.round(baseMiles) };
  }

  // ── Classic (current) method ──
  if (leg.distanceMiles === 0) return { legId: leg.id, baseMiles: 0, miles: 0, statusPoints: 0 };

  const multiplier = getFareMultiplier(leg);
  const rawBase = leg.distanceMiles * multiplier;
  const baseMiles =
    leg.airline !== 'partner' ? Math.max(rawBase, MIN_FLIGHT_POINTS) : rawBase;

  const miles = Math.round(baseMiles * (1 + eliteBonus));
  const statusPoints = Math.round(baseMiles);

  return { legId: leg.id, baseMiles, miles, statusPoints };
}

// ── Partner / Portal ──────────────────────────────────────────────────────────

function dollarCategory(miles: number, dollars: number): { miles: number; statusPoints: number } {
  return {
    miles: Math.round(miles),
    statusPoints: Math.floor(dollars * PARTNER_STATUS_POINTS_PER_DOLLAR), // 1 SP per $1
  };
}

export function calculatePartnerEarnings(spend: PartnerSpend): PartnerEarningsResult {
  const shoppingMiles = spend.shoppingDollars * spend.shoppingMilesPerDollar;
  const shopping = {
    miles: Math.round(shoppingMiles),
    statusPoints: Math.floor(shoppingMiles * SHOPPING_STATUS_POINTS_RATIO), // 1 SP per 3 miles
  };

  const hotels     = dollarCategory(spend.hotelDollars * HOTEL_MILES_PER_DOLLAR, spend.hotelDollars);
  const carRentals = dollarCategory(spend.carRentals * CAR_RENTAL_MILES_PER_RENTAL, spend.carRentalDollars);
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
