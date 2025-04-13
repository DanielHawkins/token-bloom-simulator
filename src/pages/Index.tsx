
import { SimulatorForm } from "@/components/SimulatorForm";
import { ResultsTable } from "@/components/ResultsTable";
import { GrowthChart } from "@/components/GrowthChart";
import { ModelExplanation } from "@/components/ModelExplanation";
import { Stepper } from "@/components/Stepper";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateTokenGrowth, TokenGrowthResults, TokenSimulationParams, MonthData, getDefaultParams } from "@/lib/tokenCalculations";

const Index = () => {
  const [results, setResults] = useState<TokenGrowthResults | null>(null);
  const [stepperResults, setStepperResults] = useState<MonthData[] | null>(null);
  const [activeTab, setActiveTab] = useState<"stepper" | "simulator">("stepper");
  
  const handleSimulate = (params: TokenSimulationParams) => {
    const calculatedResults = calculateTokenGrowth(params);
    setResults(calculatedResults);
  };
  
  const handleStepperComplete = (stepperData: MonthData[]) => {
    setStepperResults(stepperData);
    
    // Use the full simulation data from the stepper
    const lastMonth = stepperData[stepperData.length - 1];
    
    // Create a results object with the data from the stepper
    const params = {
      months: stepperData,
      initialTokenRate: getDefaultParams().initialTokenRate,
      apy: ((lastMonth.tokenRate / getDefaultParams().initialTokenRate) - 1) * 100
    };
    
    setResults(params);
    setActiveTab("simulator");
  };
  
  const resetSimulation = () => {
    setStepperResults(null);
    setResults(null);
    setActiveTab("stepper");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Token Bloom Simulator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Visualize premium token rate growth based on revenue share from digital product sales on-chain
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "stepper" | "simulator")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="stepper">Step-by-Step Guide</TabsTrigger>
            <TabsTrigger value="simulator">Advanced Simulator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stepper">
            <div className="max-w-3xl mx-auto">
              {stepperResults ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold">Simulation Complete</h2>
                        <p className="text-slate-600 dark:text-slate-400">
                          You've successfully completed the token growth simulation
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Revenue</p>
                          <p className="text-2xl font-bold">${stepperResults[0].revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Revenue Share</p>
                          <p className="text-2xl font-bold">${stepperResults[0].revenueShare.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                          <p className="text-sm text-slate-500 dark:text-slate-400">Token Rate</p>
                          <p className="text-2xl font-bold">${stepperResults[0].tokenRate.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={resetSimulation}>Start Again</Button>
                        <Button onClick={() => setActiveTab("simulator")}>View Full Projection</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Stepper onComplete={handleStepperComplete} />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="simulator">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Sidebar with form */}
              <div className="lg:col-span-4 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <SimulatorForm onSimulate={handleSimulate} />
                  </CardContent>
                </Card>
                
                <ModelExplanation />
              </div>

              {/* Main content area */}
              <div className="lg:col-span-8 space-y-8">
                {results ? (
                  <>
                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4">Token Growth Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Initial Token Rate</p>
                            <p className="text-2xl font-bold">${results.initialTokenRate.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Final Token Rate</p>
                            <p className="text-2xl font-bold">${results.months[results.months.length-1].tokenRate.toFixed(2)}</p>
                          </div>
                          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                            <p className="text-sm text-slate-500 dark:text-slate-400">APY</p>
                            <p className="text-2xl font-bold">{results.apy.toFixed(2)}%</p>
                          </div>
                        </div>
                        <GrowthChart data={results.months} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4">Monthly Breakdown</h2>
                        <ScrollArea className="h-[400px]">
                          <ResultsTable data={results.months} />
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[500px] bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="text-center">
                      <h3 className="text-2xl font-medium text-slate-600 dark:text-slate-400 mb-2">
                        Configure your simulation
                      </h3>
                      <p className="text-slate-500 dark:text-slate-500 max-w-md">
                        Adjust the parameters in the form to simulate token growth and visualize the results.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
