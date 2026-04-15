// ── Credit Card ──────────────────────────────────────────────────────────────

export interface CreditCard {
  id: string;
  name: string;
  issuer: string;
  annualFee: number;
  earningRates: {
    alaskaHawaiianFlights: number; // miles per $1
    other: number;                  // miles per $1
  };
  statusPointsPerDollar: number; // Summit = 0.5, others = 0.333...
  anniversaryStatusPoints?: number; // e.g. Summit = 10,000
}

export interface CardSpend {
  cardId: string;
  alaskaHawaiianFlights: number; // dollars
  other: number;                  // dollars
  includeAnniversaryBonus?: boolean;
}

export interface CardEarnings {
  cardId: string;
  miles: number;
  statusPoints: number;
  totalSpend: number;
}

// ── Flights ───────────────────────────────────────────────────────────────────

/** Fare classes for Alaska / Hawaiian operated flights */
export type AlaskaFareClass =
  | 'saver'          // X — 30%
  | 'main'           // most economy — 100%
  | 'main_flexible'  // H, K — 125%
  | 'main_full'      // Y, B — 150%
  | 'first_discount' // D, I — 150%
  | 'first_flexible' // C — 175%
  | 'first_full';    // J — 200%

/** Fare classes for partner-operated flights */
export type PartnerFareClass =
  | 'economy_discount' // 25% direct / 100% via Atmos
  | 'economy'          // 50% direct / 100% via Atmos
  | 'premium_economy'  // 100% direct / 150% via Atmos
  | 'business'         // 125% direct / 250% via Atmos
  | 'domestic_first'   // 150% direct / 150% via Atmos
  | 'first';           // 150% direct / 350% via Atmos (international)

export type FareClass = AlaskaFareClass | PartnerFareClass;

export type Airline = 'alaska' | 'hawaiian' | 'partner';
export type BookingChannel = 'atmos' | 'partner'; // only used when airline === 'partner'
export type EliteTier = 'none' | 'silver' | 'gold' | 'platinum' | 'titanium';

/**
 * 2026 earning method choice — applies to both Atmos Miles and Status Points.
 * Members pick one method per year.
 */
export type EarningMethod2026 = 'distance' | 'spend' | 'segment';

export interface FlightLeg {
  id: string;
  airline: Airline;
  bookingChannel: BookingChannel;
  fareClass: FareClass;
  origin: string;      // IATA code e.g. "SEA"
  destination: string; // IATA code e.g. "HNL"
  ticketPrice: number;         // used for spend-based 2026 earning (cash tickets)
  pointsRedeemed: number;      // used for spend-based 2026 earning (award tickets: 1 SP per 20 pts)
  bookedWithPoints: boolean;   // award tickets earn no miles; status points from pointsRedeemed (spend) or distance
  roundTrip: boolean;          // doubles all earnings
  eliteOverride?: EliteTier;
}

export interface FlightLegEarnings {
  legId: string;
  baseMiles: number;    // before elite bonus
  miles: number;        // after elite bonus
  statusPoints: number; // same rate as miles
}

// ── Partner Earnings ──────────────────────────────────────────────────────────

export interface PartnerSpend {
  shoppingDollars: number;
  shoppingMilesPerDollar: number; // user-adjustable, varies by retailer
  hotelDollars: number;
  carRentals: number;             // number of rentals (1,250 miles each)
  carRentalDollars: number;       // dollar spend for status points (1 SP/$1)
  cruiseDollars: number;
  lyftDollars: number;            // 2 miles/$1, 1 SP/$1
  safDollars: number;             // Sustainable Aviation Fuel — 0 miles, 1 SP/$1
  gciDollars: number;             // GCI Internet/cellular — 0 miles, 1 SP/$1
}

export interface PartnerEarningsResult {
  shopping:   { miles: number; statusPoints: number };
  hotels:     { miles: number; statusPoints: number };
  carRentals: { miles: number; statusPoints: number };
  cruises:    { miles: number; statusPoints: number };
  lyft:       { miles: number; statusPoints: number };
  saf:        { miles: number; statusPoints: number };
  gci:        { miles: number; statusPoints: number };
  total:      { miles: number; statusPoints: number };
}

// ── Totals ────────────────────────────────────────────────────────────────────

export interface TotalEarnings {
  miles: number;
  statusPoints: number;
}
