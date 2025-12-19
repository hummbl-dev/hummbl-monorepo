/**
 * Finance Domain Definitions - Executable Truth
 * Prevents AI hallucination through validation
 */

export interface FinancialInstrument {
  symbol: string;
  type: 'equity' | 'bond' | 'derivative' | 'commodity';
  price: number;
  currency: string;
}

export interface RiskMetrics {
  var95: number; // 95% Value at Risk
  var99: number; // 99% Value at Risk
  expectedShortfall: number;
  beta: number;
  sharpeRatio: number;
}

// Basel III Capital Requirements
export function validateCapitalRatio(tier1Capital: number, riskWeightedAssets: number): boolean {
  const ratio = tier1Capital / riskWeightedAssets;
  return ratio >= 0.06; // 6% minimum requirement
}

// Black-Scholes Option Pricing
export function blackScholes(
  S: number, // Current stock price
  K: number, // Strike price
  T: number, // Time to expiration
  r: number, // Risk-free rate
  sigma: number // Volatility
): number | null {
  if (S <= 0 || K <= 0 || T <= 0 || sigma <= 0) return null;
  if (!isFinite(S) || !isFinite(K) || !isFinite(T) || !isFinite(r) || !isFinite(sigma)) return null;

  try {
    const logRatio = Math.log(S / K);
    const sqrtT = Math.sqrt(T);

    if (!isFinite(logRatio) || !isFinite(sqrtT)) return null;

    const d1 = (logRatio + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    if (!isFinite(d1) || !isFinite(d2)) return null;

    // Simplified normal CDF approximation
    const N = (x: number) => {
      try {
        const result = 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp((-2 * x * x) / Math.PI)));
        return isFinite(result) ? result : 0.5;
      } catch {
        return 0.5;
      }
    };

    const callPrice = S * N(d1) - K * Math.exp(-r * T) * N(d2);
    return isFinite(callPrice) ? callPrice : null;
  } catch {
    return null;
  }
}

// Portfolio Value at Risk (Monte Carlo)
export function calculateVaR(
  positions: FinancialInstrument[],
  confidence: number = 0.95,
  timeHorizon: number = 1
): number {
  try {
    if (positions.length === 0) return 0;
    if (confidence <= 0 || confidence >= 1) return 0;
    if (timeHorizon <= 0 || !isFinite(timeHorizon)) return 0;

    const portfolioValue = positions.reduce((sum, pos) => {
      if (!isFinite(pos.price) || pos.price < 0) return sum;
      return sum + pos.price;
    }, 0);

    if (portfolioValue <= 0) return 0;

    const volatility = 0.15; // Simplified assumption
    const scenarios = 10000;
    const returns: number[] = [];

    for (let i = 0; i < scenarios; i++) {
      const sqrtTime = Math.sqrt(timeHorizon);
      if (!isFinite(sqrtTime)) continue;

      const randomReturn = Math.random() * volatility * sqrtTime;
      if (isFinite(randomReturn)) {
        returns.push(randomReturn);
      }
    }

    if (returns.length === 0) return 0;

    returns.sort((a, b) => a - b);
    const varIndex = Math.floor((1 - confidence) * returns.length);
    const varReturn = returns[Math.max(0, Math.min(varIndex, returns.length - 1))];

    const result = Math.abs(varReturn * portfolioValue);
    return isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

// Regulatory Validation
export const REGULATIONS = {
  BASEL_III: {
    minTier1Ratio: 0.06,
    minTotalCapitalRatio: 0.08,
    leverageRatio: 0.03,
  },
  DODD_FRANK: {
    volkerRule: true,
    swapPushOut: true,
  },
} as const;

export function validateRegulation(regulation: keyof typeof REGULATIONS, data: any): boolean {
  switch (regulation) {
    case 'BASEL_III':
      return validateCapitalRatio(data.tier1Capital, data.riskWeightedAssets);
    default:
      return false;
  }
}
