import type { CreditCard } from '../types';

export const CARDS: CreditCard[] = [
  {
    id: 'ascent',
    name: 'Atmos Ascent Visa',
    issuer: 'Bank of America',
    annualFee: 95,
    earningRates: {
      alaskaHawaiianFlights: 3,
      other: 1,
    },
    statusPointsPerDollar: 1 / 3,
  },
  {
    id: 'summit',
    name: 'Atmos Summit Visa Infinite',
    issuer: 'Bank of America',
    annualFee: 395,
    earningRates: {
      alaskaHawaiianFlights: 3,
      other: 1,
    },
    statusPointsPerDollar: 1 / 2,
    anniversaryStatusPoints: 10_000,
  },
  {
    id: 'business',
    name: 'Alaska Airlines Business Visa',
    issuer: 'Bank of America',
    annualFee: 95,
    earningRates: {
      alaskaHawaiianFlights: 3,
      other: 1,
    },
    statusPointsPerDollar: 1 / 3,
  },
  {
    id: 'hawaiian-barclays',
    name: 'Hawaiian Airlines World Elite Mastercard',
    issuer: 'Barclays',
    annualFee: 99,
    earningRates: {
      alaskaHawaiianFlights: 3,
      other: 1,
    },
    statusPointsPerDollar: 1 / 3,
  },
];

export const CARD_MAP: Record<string, CreditCard> = Object.fromEntries(
  CARDS.map((c) => [c.id, c])
);
