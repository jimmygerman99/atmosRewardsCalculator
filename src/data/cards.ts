import type { CreditCard } from '../types';

export const CARDS: CreditCard[] = [
  {
    id: 'ascent',
    name: 'Atmos Ascent Visa',
    issuer: 'Bank of America',
    annualFee: 95,
    earningRates: { alaskaHawaiianFlights: 3, other: 1 },
    statusPointsPerDollar: 1 / 3,
    anniversaryStatusPoints: 0,
    bonusCategories: [
      { field: 'gasEvRideshareStreaming', label: 'Gas, EV charging, rideshare, cable & streaming', multiplier: 2 },
    ],
    boaAccountBonus: true,
  },
  {
    id: 'summit',
    name: 'Atmos Summit Visa Infinite',
    issuer: 'Bank of America',
    annualFee: 395,
    earningRates: { alaskaHawaiianFlights: 3, other: 1 },
    statusPointsPerDollar: 1 / 2,
    anniversaryStatusPoints: 10_000,
    bonusCategories: [
      { field: 'diningForeign', label: 'Dining & foreign transactions', multiplier: 3 },
    ],
    boaAccountBonus: true,
  },
  {
    id: 'business',
    name: 'Alaska Airlines Business Visa',
    issuer: 'Bank of America',
    annualFee: 95,
    earningRates: { alaskaHawaiianFlights: 3, other: 1 },
    statusPointsPerDollar: 1 / 3,
    anniversaryStatusPoints: 0,
    bonusCategories: [
      { field: 'gasEvShippingTransitRideshare', label: 'Gas, EV charging, shipping & transit', multiplier: 2 },
    ],
    boaAccountBonus: true,
  },
  {
    id: 'hawaiian-barclays',
    name: 'Hawaiian Airlines World Elite Mastercard',
    issuer: 'Barclays',
    annualFee: 99,
    earningRates: { alaskaHawaiianFlights: 3, other: 1 },
    statusPointsPerDollar: 1 / 3,
    anniversaryStatusPoints: 0,
    bonusCategories: [
      { field: 'gasDiningGrocery', label: 'Gas, dining & grocery', multiplier: 2 },
    ],
    boaAccountBonus: false,
  },
];

export const CARD_MAP: Record<string, CreditCard> = Object.fromEntries(
  CARDS.map((c) => [c.id, c])
);
