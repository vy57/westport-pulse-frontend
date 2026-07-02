import { getAffordability } from './api.js';

const FALLBACK = {
  zipCode: '06880',
  inputs: {
    mortgageRate: 0.0649,
    medianHomePrice: 2200000,
    millRate: 13.2,
    medianGrossRent: 3500,
  },
  trueMonthlyHousingCost: 0,
  affordabilityScore: 0,
};

export async function loadDashboardData(zipCode) {
  try {
    return await getAffordability(zipCode);
  } catch (error) {
    console.error('Failed to load affordability data:', error);
    return {
      ...FALLBACK,
      error: error.message,
    };
  }
}
