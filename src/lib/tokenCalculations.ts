
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
  } = params;

  const results: MonthData[] = [];
  let currentRevenue = monthlyRevenue;
  let currentPoolSize = initialPoolSize;
  
  // Calculate for each month
  for (let i = 1; i <= months; i++) {
    // Calculate on-chain product sales
    const productSales = currentRevenue * (onChainSalesPercent / 100);
    
    // Calculate revenue share amount
    const revenueShareAmount = productSales * (revenueShare / 100);
    
    // Add revenue share to pool
    currentPoolSize += revenueShareAmount;
    
    // Calculate new token rate based on pool size and token emission
    const tokenRate = currentPoolSize / params.premiumTokenEmission;
    
    // Add data to results
    results.push({
      month: i,
      revenue: currentRevenue,
      productSales: productSales,
      revenueShare: revenueShareAmount,
      poolTopUp: revenueShareAmount,
      poolSize: currentPoolSize,
      tokenRate: tokenRate,
    });
    
    // Increase revenue for next month
    currentRevenue *= (1 + monthlyRevenueIncrease / 100);
  }
  
  // Calculate APY based on final vs initial token rate
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
  return {
    monthlyRevenue: 80000,
    onChainSalesPercent: 40,
    monthlyRevenueIncrease: 7,
    revenueShare: 7,
    basicTokenEmission: 64000,
    basicTokenSpendingDemand: 125,
    premiumTokenEmission: 32000,
    initialPoolSize: 32000,
    initialTokenRate: 1.0,
    months: 12,
  };
};
