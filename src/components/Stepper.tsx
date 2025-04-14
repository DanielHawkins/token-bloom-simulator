
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ResultsTable } from "@/components/ResultsTable";
import { ArrowRight, ArrowLeft, DollarSign, BarChart3, LineChart } from "lucide-react";
import { calculateTokenGrowth, TokenSimulationParams, getDefaultParams, MonthData } from "@/lib/tokenCalculations";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

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
  const [currentMonth, setCurrentMonth] = useState(1);
  const [revenue, setRevenue] = useState(getDefaultParams().monthlyRevenue.toString());
  const [revenueShare, setRevenueShare] = useState(getDefaultParams().revenueShare.toString());
  const [monthlyRevenues, setMonthlyRevenues] = useState<MonthlyRevenue[]>(() => {
    return Array.from({ length: NUM_MONTHS }, (_, i) => ({
      month: i + 1,
      revenue: getDefaultParams().monthlyRevenue
    }));
  });
  const [simulationResults, setSimulationResults] = useState<MonthData[] | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
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
  
  useEffect(() => {
    if (currentStep >= 2) {
      const revenueShareValue = parseFloat(revenueShare);
      if (!isNaN(revenueShareValue)) {
        const params: TokenSimulationParams = {
          ...getDefaultParams(),
          monthlyRevenue: monthlyRevenues[0].revenue,
          revenueShare: revenueShareValue,
          months: NUM_MONTHS
        };
        
        const baseResults = calculateTokenGrowth(params);
        
        let currentPoolSize = params.initialPoolSize;
        const results = monthlyRevenues.map((monthData, index) => {
          const productSales = monthData.revenue * (params.onChainSalesPercent / 100);
          const revenueShareAmount = productSales * (revenueShareValue / 100);
          
          currentPoolSize += revenueShareAmount;
          
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
        
        const limitedResults = currentStep === 3 
          ? results.slice(0, Math.min(currentMonth, results.length))
          : results;
          
        setChartData(limitedResults);
        
        if (simulationResults && simulationResults.length > 0) {
          setSimulationResults(results);
        }
      }
    }
  }, [monthlyRevenues, revenueShare, currentStep, currentMonth]);
  
  const runSimulation = () => {
    const params: TokenSimulationParams = {
      ...getDefaultParams(),
      monthlyRevenue: monthlyRevenues[0].revenue,
      revenueShare: parseFloat(revenueShare),
      months: NUM_MONTHS
    };
    
    let currentPoolSize = params.initialPoolSize;
    const results = monthlyRevenues.map((monthData, index) => {
      const productSales = monthData.revenue * (params.onChainSalesPercent / 100);
      const revenueShareAmount = productSales * (parseFloat(revenueShare) / 100);
      
      currentPoolSize += revenueShareAmount;
      
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
      if (!revenue || isNaN(parseFloat(revenue)) || parseFloat(revenue) <= 0) {
        alert("Please enter a valid revenue amount");
        return;
      }
    } else if (currentStep === 2) {
      if (!revenueShare || isNaN(parseFloat(revenueShare)) || parseFloat(revenueShare) <= 0) {
        alert("Please enter a valid revenue share percentage");
        return;
      }
      
      const results = runSimulation();
      setSimulationResults(results);
    } else if (currentStep === 3) {
      const monthRevenue = monthlyRevenues[currentMonth - 1].revenue;
      if (isNaN(monthRevenue) || monthRevenue <= 0) {
        alert(`Please enter a valid revenue amount for month ${currentMonth}`);
        return;
      }

      if (currentMonth < NUM_MONTHS) {
        setCurrentMonth(currentMonth + 1);
        return;
      }
      
      runSimulation();
    } else if (currentStep === 5) {
      if (simulationResults) {
        onComplete(simulationResults);
      }
      return;
    }
    
    setCurrentStep(currentStep + 1);
    
    if (currentStep === 2) {
      setCurrentMonth(1);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 3 && currentMonth > 1) {
      setCurrentMonth(currentMonth - 1);
    } else {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const calculateAPY = (): APYData | "0" => {
    if (!simulationResults || simulationResults.length === 0) return "0";
    
    const initialRate = getDefaultParams().initialTokenRate;
    const finalRate = simulationResults[simulationResults.length - 1].tokenRate;
    const increase = finalRate - initialRate;
    const percentIncrease = (increase / initialRate) * 100;
    const apy = percentIncrease;
    
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
  
  const renderStepContent = () => {
    // Calculate APY data outside of the case statements to avoid redeclaration
    let apyData: APYData | "0" = "0";
    if (simulationResults && simulationResults.length > 0 && (currentStep === 4 || currentStep === 5)) {
      apyData = calculateAPY();
    }
    
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gradient">Start selling your digital products on chain</h2>
            <div className="space-y-2">
              <Label htmlFor="revenue" className="text-blue-400">Your initial revenue is:</Label>
              <div className="flex gap-2 items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <DollarSign size={20} className="text-blue-400" />
                </div>
                <Input
                  id="revenue"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="Enter revenue amount"
                  className="text-lg bg-secondary border-blue-500/30 focus-visible:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gradient">Share revenue with the pool</h2>
            <p className="text-blue-400/80">
              Your initial monthly revenue: ${parseFloat(revenue).toLocaleString()}
            </p>
            <div className="space-y-2">
              <Label htmlFor="revenueShare" className="text-blue-400">Share this percentage of revenue:</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="revenueShare"
                  value={revenueShare}
                  onChange={(e) => setRevenueShare(e.target.value)}
                  placeholder="Enter percentage"
                  className="text-lg bg-secondary border-blue-500/30 focus-visible:ring-blue-500"
                />
                <div className="text-lg text-blue-400">%</div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        if (!simulationResults) return <div>Loading...</div>;
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gradient">Input monthly revenue</h2>
            <p className="text-blue-400/80">
              Month {currentMonth} of {NUM_MONTHS}:
            </p>
            <div className="space-y-2">
              <Label htmlFor={`revenue-month-${currentMonth}`} className="text-blue-400">
                Revenue for Month {currentMonth}:
              </Label>
              <div className="flex gap-2 items-center">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <DollarSign size={20} className="text-blue-400" />
                </div>
                <Input
                  id={`revenue-month-${currentMonth}`}
                  value={monthlyRevenues[currentMonth - 1].revenue}
                  onChange={(e) => handleRevenueChange(currentMonth, e.target.value)}
                  placeholder={`Month ${currentMonth} revenue`}
                  className="text-lg bg-secondary border-blue-500/30 focus-visible:ring-blue-500"
                />
              </div>
            </div>
            
            {currentMonth > 1 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-blue-400 mb-2">Revenue Progress:</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                  {monthlyRevenues.slice(0, currentMonth).map((month) => (
                    <div key={month.month} className="bg-muted p-2 rounded border border-blue-500/20">
                      <p className="font-medium text-blue-400">Month {month.month}</p>
                      <p className="text-white">${month.revenue.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      
      case 4:
        if (!simulationResults) return <div>Loading...</div>;
        
        if (apyData === "0") {
          return <div>Error calculating results</div>;
        }
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gradient">Increased pool size</h2>
            <div className="bg-muted p-4 rounded-lg border border-blue-500/20 animate-pulse-glow">
              <p className="text-xl font-bold text-center text-gradient">
                Initial: {getDefaultParams().initialPoolSize.toLocaleString()} AVY → Final: {simulationResults[simulationResults.length-1].poolSize.toLocaleString()} AVY
                <br />
                <span className="text-sm text-blue-400">APY ~{apyData.apy}%</span>
              </p>
            </div>
            <div className="pt-4">
              <ResultsTable data={simulationResults.slice(0, 3)} showAllMonths={false} />
            </div>
          </div>
        );
      
      case 5:
        if (!simulationResults) return <div>Loading...</div>;
        
        if (apyData === "0") {
          return <div>Error calculating results</div>;
        }
        
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gradient">Premium token rate increase</h2>
            <p className="text-blue-400/80">
              The premium token (AVYX) rate has increased based on your data:
            </p>
            <div className="bg-muted p-4 rounded-lg border border-blue-500/20 animate-pulse-glow">
              <p className="text-xl font-bold text-center text-gradient">
                $1.00 → ${apyData.newRate} (+{apyData.increase}% / ~{apyData.apy}% APY)
              </p>
            </div>
            <div className="pt-4">
              <p className="text-blue-400/80 mb-4">
                This growth is based on your custom monthly revenue projections.
              </p>
              <ResultsTable data={simulationResults.slice(0, 3)} showAllMonths={false} />
              <div className="text-center mt-2 text-sm text-blue-400/60">
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
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-blue-400 mx-auto mb-2 opacity-50" />
            <p className="text-blue-400/80 text-center">
              Complete steps to see the projected<br />rate growth over {NUM_MONTHS} months
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <p className="text-sm text-blue-400/80 mb-2">
          {currentStep === 3 
            ? `Token Rate Projection (Month 1 to ${Math.min(currentMonth, NUM_MONTHS)})` 
            : `Token Rate Projection (${NUM_MONTHS} months)`}
        </p>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 130, 246, 0.2)" />
            <XAxis dataKey="month" stroke="rgba(59, 130, 246, 0.5)" />
            <YAxis 
              tickFormatter={formatYAxis}
              domain={['dataMin', 'auto']}
              stroke="rgba(59, 130, 246, 0.5)"
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltipValue(value), 'Token Rate']}
              labelFormatter={(label) => `Month ${label}`}
              contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(59, 130, 246, 0.3)' }}
            />
            <Area 
              type="monotone" 
              dataKey="tokenRate" 
              name="Token Rate" 
              stroke="rgb(59, 130, 246)" 
              fill="rgba(59, 130, 246, 0.2)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
        {currentStep >= 2 && chartData && (
          <div className="mt-4 text-sm">
            <p className="font-medium text-blue-400">Projected Growth:</p>
            <p className="text-white">Starting: ${getDefaultParams().initialTokenRate.toFixed(2)}</p>
            <p className="text-gradient font-semibold">
              {currentStep === 3 && currentMonth < NUM_MONTHS 
                ? `Month ${currentMonth}: $${chartData.length > 0 ? chartData[chartData.length - 1].tokenRate.toFixed(2) : '0.00'}`
                : `After ${NUM_MONTHS} months: $${chartData.length > 0 ? chartData[chartData.length - 1].tokenRate.toFixed(2) : '0.00'}`
              }
            </p>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <Card className="lg:col-span-3 glass-card">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4, 5].map((step) => (
                <div 
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    currentStep === step 
                      ? "bg-primary text-white border-primary" 
                      : currentStep > step 
                        ? "bg-primary/20 text-primary border-primary/50" 
                        : "bg-secondary text-blue-400/50 border-blue-500/20"
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-secondary rounded-full overflow-hidden border border-blue-500/20">
              <div 
                className="absolute top-0 left-0 h-full bg-primary transition-all duration-300"
                style={{ 
                  width: currentStep === 3 
                    ? `${(((currentStep - 1) + (currentMonth - 1) / NUM_MONTHS) / 4) * 100}%` 
                    : `${((currentStep - 1) / 4) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          
          <div className="min-h-[300px]">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between mt-6">
            <Button 
              onClick={handlePrevious} 
              variant="outline" 
              disabled={currentStep === 1 && currentMonth === 1}
              className="gap-2 border-blue-500/30 hover:bg-blue-500/10 text-blue-400"
            >
              <ArrowLeft className="h-4 w-4" /> 
              Previous
            </Button>
            <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
              {currentStep === 5 ? "Complete" : (
                currentStep === 3 && currentMonth < NUM_MONTHS ? `Next Month (${currentMonth + 1})` : "Next"
              )} 
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2 glass-card">
        <CardContent className="pt-6 h-[500px]">
          <h3 className="text-lg font-semibold mb-4 text-gradient flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rate Growth Projection
          </h3>
          {renderRateChart()}
        </CardContent>
      </Card>
    </div>
  );
};
