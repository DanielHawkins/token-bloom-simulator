
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ResultsTable } from "@/components/ResultsTable";
import { ArrowRight } from "lucide-react";
import { calculateTokenGrowth, TokenSimulationParams, getDefaultParams, MonthData } from "@/lib/tokenCalculations";

interface StepperProps {
  onComplete: (results: MonthData[]) => void;
}

export const Stepper = ({ onComplete }: StepperProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [revenue, setRevenue] = useState(getDefaultParams().monthlyRevenue.toString());
  const [revenueShare, setRevenueShare] = useState(getDefaultParams().revenueShare.toString());
  const [simulationResults, setSimulationResults] = useState<MonthData[] | null>(null);
  
  const runSimulation = () => {
    // Create parameters for simulation
    const params: TokenSimulationParams = {
      ...getDefaultParams(),
      monthlyRevenue: parseFloat(revenue),
      revenueShare: parseFloat(revenueShare),
      months: 1 // We just need one month for the stepper
    };
    
    // Run simulation
    const results = calculateTokenGrowth(params);
    setSimulationResults(results.months);
    return results.months;
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
  const calculateAPY = () => {
    if (!simulationResults || simulationResults.length === 0) return "0";
    
    const initialRate = getDefaultParams().initialTokenRate;
    const finalRate = simulationResults[0].tokenRate;
    const increase = finalRate - initialRate;
    const percentIncrease = (increase / initialRate) * 100;
    const apy = percentIncrease * 12; // Annualized
    
    return {
      newRate: finalRate.toFixed(2),
      increase: percentIncrease.toFixed(1),
      apy: apy.toFixed(2)
    };
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Start selling your digital products on chain</h2>
            <div className="space-y-2">
              <Label htmlFor="revenue">Your revenue is:</Label>
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
              Your monthly revenue: ${parseFloat(revenue).toLocaleString()}
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
            <h2 className="text-xl font-semibold">Pool topped up with tokens</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Based on your inputs, the revenue share has topped up the pool with:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xl font-bold text-center">
                {simulationResults[0].revenueShare.toLocaleString()} AVY basic tokens
              </p>
            </div>
            <div className="pt-4">
              <ResultsTable data={simulationResults} showAllMonths={false} />
            </div>
          </div>
        );
      
      case 4:
        if (!simulationResults) return <div>Loading...</div>;
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Increased pool size</h2>
            <p className="text-slate-600 dark:text-slate-400">
              The pool has been increased to:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xl font-bold text-center">
                {simulationResults[0].poolSize.toLocaleString()} AVY basic tokens
              </p>
            </div>
            <div className="pt-4">
              <ResultsTable data={simulationResults} showAllMonths={false} />
            </div>
          </div>
        );
      
      case 5:
        if (!simulationResults) return <div>Loading...</div>;
        const apyData = calculateAPY();
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Premium token rate increase</h2>
            <p className="text-slate-600 dark:text-slate-400">
              The premium token (AVYX) rate has increased:
            </p>
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xl font-bold text-center">
                $1.00 → ${apyData.newRate} (+{apyData.increase}% / ~{apyData.apy}% APY)
              </p>
            </div>
            <div className="pt-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                This is just for one month. Over a year, the growth can be substantial.
              </p>
              <ResultsTable data={simulationResults} showAllMonths={false} />
            </div>
          </div>
        );
      
      default:
        return <div>Unknown step</div>;
    }
  };
  
  return (
    <Card>
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
  );
};
