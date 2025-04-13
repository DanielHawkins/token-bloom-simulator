
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ResultsTable } from "@/components/ResultsTable";
import { ArrowRight } from "lucide-react";
import { calculateTokenGrowth, TokenSimulationParams, getDefaultParams, MonthData } from "@/lib/tokenCalculations";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// Number of months to simulate
const NUM_MONTHS = 12;

interface StepperProps {
  onComplete: (results: MonthData[]) => void;
}

interface APYData {
  newRate: string;
  increase: string;
  apy: string;
}

interface MonthlyRevenue {
  month: number;
  revenue: number;
}

export const Stepper = ({ onComplete }: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [revenue, setRevenue] = useState(getDefaultParams().monthlyRevenue.toString());
  const [revenueShare, setRevenueShare] = useState(getDefaultParams().revenueShare.toString());
  const [monthlyRevenues, setMonthlyRevenues] = useState<MonthlyRevenue[]>(() => {
    // Initialize with default values for all months
    return Array.from({ length: NUM_MONTHS }, (_, i) => ({
      month: i + 1,
      revenue: getDefaultParams().monthlyRevenue
    }));
  });
  const [simulationResults, setSimulationResults] = useState<MonthData[] | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Update first month revenue when the main revenue input changes
  useEffect(() => {
    const revenueValue = parseFloat(revenue);
    if (!isNaN(revenueValue)) {
      setMonthlyRevenues(prev => {
        const updated = [...prev];
        updated[0] = { ...updated[0], revenue: revenueValue };
        return updated;
      });
    }
  }, [revenue]);
  
  // Generate chart data whenever monthly revenues change
  useEffect(() => {
    if (currentStep >= 2) {
      const revenueShareValue = parseFloat(revenueShare);
      if (!isNaN(revenueShareValue)) {
        // Create parameters for simulation with custom monthly revenues
        const params: TokenSimulationParams = {
          ...getDefaultParams(),
          monthlyRevenue: monthlyRevenues[0].revenue, // Initial revenue (will be overridden)
          revenueShare: revenueShareValue,
          months: NUM_MONTHS
        };
        
        // Calculate the simulation with the custom monthly revenues
        const baseResults = calculateTokenGrowth(params);
        
        // Override the revenue and recalculate the token rate for each month
        let currentPoolSize = params.initialPoolSize;
        const results = monthlyRevenues.map((monthData, index) => {
          const productSales = monthData.revenue * (params.onChainSalesPercent / 100);
          const revenueShareAmount = productSales * (revenueShareValue / 100);
          
          // Add revenue share to pool
          currentPoolSize += revenueShareAmount;
          
          // Calculate new token rate based on pool size and token emission
          const tokenRate = currentPoolSize / params.premiumTokenEmission;
          
          return {
            month: index + 1,
            revenue: monthData.revenue,
            productSales: productSales,
            revenueShare: revenueShareAmount,
            poolTopUp: revenueShareAmount,
            poolSize: currentPoolSize,
            tokenRate: tokenRate,
          };
        });
        
        setChartData(results);
        
        // If we are at the last step, update the simulation results
        if (simulationResults && simulationResults.length > 0) {
          setSimulationResults(results);
        }
      }
    }
  }, [monthlyRevenues, revenueShare, currentStep]);
  
  const runSimulation = () => {
    // Create parameters for simulation using the first month's revenue
    const params: TokenSimulationParams = {
      ...getDefaultParams(),
      monthlyRevenue: monthlyRevenues[0].revenue,
      revenueShare: parseFloat(revenueShare),
      months: NUM_MONTHS // We need all months for dynamic simulation
    };
    
    // Calculate the simulation with the custom monthly revenues
    let currentPoolSize = params.initialPoolSize;
    const results = monthlyRevenues.map((monthData, index) => {
      const productSales = monthData.revenue * (params.onChainSalesPercent / 100);
      const revenueShareAmount = productSales * (parseFloat(revenueShare) / 100);
      
      // Add revenue share to pool
      currentPoolSize += revenueShareAmount;
      
      // Calculate new token rate based on pool size and token emission
      const tokenRate = currentPoolSize / params.premiumTokenEmission;
      
      return {
        month: index + 1,
        revenue: monthData.revenue,
        productSales: productSales,
        revenueShare: revenueShareAmount,
        poolTopUp: revenueShareAmount,
        poolSize: currentPoolSize,
        tokenRate: tokenRate,
      };
    });
    
    setSimulationResults(results);
    return results;
  };
  
  const handleNext = () => {
    if (currentStep === 1) {
      // First step validation
      if (!revenue || isNaN(parseFloat(revenue)) || parseFloat(revenue) <= 0) {
        alert("Please enter a valid revenue amount");
        return;
      }
    } else if (currentStep === 2) {
      // Second step validation
      if (!revenueShare || isNaN(parseFloat(revenueShare)) || parseFloat(revenueShare) <= 0) {
        alert("Please enter a valid revenue share percentage");
        return;
      }
      
      // Run simulation after step 2
      const results = runSimulation();
      setSimulationResults(results);
    } else if (currentStep === 3) {
      // Validate monthly revenues before proceeding
      const invalidMonths = monthlyRevenues.filter(m => m.revenue <= 0);
      if (invalidMonths.length > 0) {
        alert(`Please enter valid revenue amounts for all months`);
        return;
      }
      
      // Update simulation with the latest monthly revenues
      runSimulation();
    } else if (currentStep === 5) {
      // Complete the stepper
      if (simulationResults) {
        onComplete(simulationResults);
      }
      return;
    }
    
    // Move to next step
    setCurrentStep(currentStep + 1);
  };
  
  // Format APY for display
  const calculateAPY = (): APYData | "0" => {
    if (!simulationResults || simulationResults.length === 0) return "0";
    
    const initialRate = getDefaultParams().initialTokenRate;
    const finalRate = simulationResults[simulationResults.length - 1].tokenRate;
    const increase = finalRate - initialRate;
    const percentIncrease = (increase / initialRate) * 100;
    const apy = percentIncrease; // Already annualized since we're using 12 months
    
    return {
      newRate: finalRate.toFixed(2),
      increase: percentIncrease.toFixed(1),
      apy: apy.toFixed(2)
    };
  };

  const formatYAxis = (value: number) => {
    return `$${value.toFixed(1)}`;
  };
  
  const formatTooltipValue = (value: number) => {
    return `$${value.toFixed(2)}`;
  };
  
  const handleRevenueChange = (month: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setMonthlyRevenues(prev => {
        const updated = [...prev];
        updated[month - 1] = { ...updated[month - 1], revenue: numValue };
        return updated;
      });
    }
  };
  
  const renderMonthlyRevenueInputs = () => {
    // Split months into rows of 3 for better layout
    const rows = [];
    for (let i = 0; i < NUM_MONTHS; i += 3) {
      const monthsInRow = monthlyRevenues.slice(i, i + 3);
      rows.push(
        <div key={`row-${i}`} className="grid grid-cols-3 gap-4 mb-4">
          {monthsInRow.map(month => (
            <div key={`month-${month.month}`} className="space-y-1">
              <Label htmlFor={`revenue-month-${month.month}`}>Month {month.month}</Label>
              <div className="flex gap-2 items-center">
                <span className="text-sm">$</span>
                <Input
                  id={`revenue-month-${month.month}`}
                  value={month.revenue}
                  onChange={(e) => handleRevenueChange(month.month, e.target.value)}
                  placeholder={`Month ${month.month} revenue`}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      );
    }
    return rows;
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Start selling your digital products on chain</h2>
            <div className="space-y-2">
              <Label htmlFor="revenue">Your initial revenue is:</Label>
              <div className="flex gap-2 items-center">
                <span className="text-lg">$</span>
                <Input
                  id="revenue"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="Enter revenue amount"
                  className="text-lg"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Share revenue with the pool</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Your initial monthly revenue: ${parseFloat(revenue).toLocaleString()}
            </p>
            <div className="space-y-2">
              <Label htmlFor="revenueShare">Share this percentage of revenue:</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="revenueShare"
                  value={revenueShare}
                  onChange={(e) => setRevenueShare(e.target.value)}
                  placeholder="Enter percentage"
                  className="text-lg"
                />
                <span className="text-lg">%</span>
              </div>
            </div>
          </div>
        );
      
      case 3:
        if (!simulationResults) return <div>Loading...</div>;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Input monthly revenue</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Enter the expected revenue for each month to see how the token rate grows:
            </p>
            <div className="mt-4">
              {renderMonthlyRevenueInputs()}
            </div>
          </div>
        );
      
      case 4:
        if (!simulationResults) return <div>Loading...</div>;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Increased pool size</h2>
            <p className="text-slate-600 dark:text-slate-400">
              The pool has increased throughout the year:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xl font-bold text-center">
                Initial: {getDefaultParams().initialPoolSize.toLocaleString()} AVY → Final: {simulationResults[simulationResults.length-1].poolSize.toLocaleString()} AVY
              </p>
            </div>
            <div className="pt-4">
              <ResultsTable data={simulationResults.slice(0, 3)} showAllMonths={false} />
              <div className="text-center mt-2 text-sm text-slate-500">
                Showing first 3 months. Full data available in the advanced simulator.
              </div>
            </div>
          </div>
        );
      
      case 5:
        if (!simulationResults) return <div>Loading...</div>;
        const apyData = calculateAPY();
        
        // Make sure apyData is of the correct type
        if (apyData === "0") {
          return <div>Error calculating results</div>;
        }
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Premium token rate increase</h2>
            <p className="text-slate-600 dark:text-slate-400">
              The premium token (AVYX) rate has increased based on your data:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xl font-bold text-center">
                $1.00 → ${apyData.newRate} (+{apyData.increase}% / ~{apyData.apy}% APY)
              </p>
            </div>
            <div className="pt-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This growth is based on your custom monthly revenue projections.
              </p>
              <ResultsTable data={simulationResults.slice(0, 3)} showAllMonths={false} />
              <div className="text-center mt-2 text-sm text-slate-500">
                Showing first 3 months. Full data available in the advanced simulator.
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };

  const renderRateChart = () => {
    if (!chartData || chartData.length === 0 || currentStep < 2) {
      // Show placeholder when no data is available
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500 dark:text-slate-400 text-center">
            Complete steps to see the projected<br />rate growth over {NUM_MONTHS} months
          </p>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Token Rate Projection ({NUM_MONTHS} months)</p>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={formatYAxis}
              domain={['dataMin', 'auto']}
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), 'Token Rate']}
              labelFormatter={(label) => `Month ${label}`}
            />
            <Area 
              type="monotone" 
              dataKey="tokenRate" 
              name="Token Rate" 
              stroke="#8884d8" 
              fill="#8884d8"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
        {currentStep >= 2 && chartData && (
          <div className="mt-4 text-sm">
            <p className="font-medium">Projected Growth:</p>
            <p>Starting: ${getDefaultParams().initialTokenRate.toFixed(2)}</p>
            <p>After {NUM_MONTHS} months: ${chartData.length > 0 ? chartData[chartData.length - 1].tokenRate.toFixed(2) : '0.00'}</p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-3">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div 
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep === step 
                      ? "bg-primary text-primary-foreground" 
                      : currentStep > step 
                        ? "bg-primary/20 text-primary" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext} className="gap-2">
              {currentStep === 5 ? "Complete" : "Next"} 
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Rate Chart Card on the right */}
      <Card className="lg:col-span-2">
        <CardContent className="pt-6 h-[500px]">
          <h3 className="text-lg font-semibold mb-4">Rate Growth Projection</h3>
          {renderRateChart()}
        </CardContent>
      </Card>
    </div>
  );
};
