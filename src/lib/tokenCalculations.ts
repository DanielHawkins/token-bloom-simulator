
export interface TokenSimulationParams {
  monthlyRevenue: number;
  onChainSalesPercent: number;
  monthlyRevenueIncrease: number;
  revenueShare: number;
  basicTokenEmission: number;
  basicTokenSpendingDemand: number;
  premiumTokenEmission: number;
  initialPoolSize: number;
  initialTokenRate: number;
  months: number;
  maxMonthlyRevenue: number;
}

export interface MonthData {
  month: number;
  revenue: number;
  productSales: number;
  revenueShare: number;
  poolTopUp: number;
  poolSize: number;
  tokenRate: number;
}

export interface TokenGrowthResults {
  months: MonthData[];
  initialTokenRate: number;
  apy: number;
}

export const calculateTokenGrowth = (params: TokenSimulationParams): TokenGrowthResults => {
  const {
    monthlyRevenue,
    onChainSalesPercent,
    monthlyRevenueIncrease,
    revenueShare,
    initialPoolSize,
    initialTokenRate,
    months,
    premiumTokenEmission
  } = params;

  const results: MonthData[] = [];
  let currentRevenue = monthlyRevenue;
  
  // Ensure initial pool size guarantees a minimum token rate of 1.00
  let currentPoolSize = initialPoolSize || premiumTokenEmission;
  
  for (let i = 1; i <= months; i++) {
    const productSales = currentRevenue * (onChainSalesPercent / 100);
    
    const revenueShareAmount = productSales * (revenueShare / 100);
    
    currentPoolSize += revenueShareAmount;
    
    const tokenRate = currentPoolSize / params.premiumTokenEmission;
    
    results.push({
      month: i,
      revenue: currentRevenue,
      productSales: productSales,
      revenueShare: revenueShareAmount,
      poolTopUp: revenueShareAmount,
      poolSize: currentPoolSize,
      tokenRate: tokenRate,
    });
    
    currentRevenue *= (1 + monthlyRevenueIncrease / 100);
  }
  
  const finalTokenRate = results[results.length - 1].tokenRate;
  const apy = ((finalTokenRate / initialTokenRate) - 1) * 100 * (12 / months);
  
  return {
    months: results,
    initialTokenRate,
    apy,
  };
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getDefaultParams = (): TokenSimulationParams => {
  const premiumTokenEmission = 32000;
  
  return {
    monthlyRevenue: 80000,
    onChainSalesPercent: 40,
    monthlyRevenueIncrease: 7,
    revenueShare: 7,
    basicTokenEmission: 64000,
    basicTokenSpendingDemand: 125,
    premiumTokenEmission: premiumTokenEmission,
    initialPoolSize: premiumTokenEmission, // Setting to premiumTokenEmission to ensure 1.0 initial rate
    initialTokenRate: 1.0,
    months: 12,
    maxMonthlyRevenue: 1000000
  };
};

export const calculateInitialPoolSize = (firstMonthRevenue: number, onChainSalesPercent: number): number => {
  // Calculate initial pool size to ensure token rate starts at 1.0
  const premiumTokenEmission = getDefaultParams().premiumTokenEmission;
  
  // Calculate from formula but ensure it's never less than what's needed for 1.0 rate
  const calculatedPoolSize = (firstMonthRevenue * 0.5) * (onChainSalesPercent / 100);
  
  return Math.max(calculatedPoolSize, premiumTokenEmission);
};
