
import { SimulatorForm } from "@/components/SimulatorForm";
import { ResultsTable } from "@/components/ResultsTable";
import { GrowthChart } from "@/components/GrowthChart";
import { ModelExplanation } from "@/components/ModelExplanation";
import { Stepper } from "@/components/Stepper";
import { useState } from "react";
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 lg:px-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-gradient">
            Token Bloom Simulator
          </h1>
          <p className="text-lg text-blue-400/80 dark:text-blue-400/80 max-w-2xl mx-auto">
            Visualize premium token rate growth based on revenue share from digital product sales on-chain
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "stepper" | "simulator")} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-secondary">
            <TabsTrigger value="stepper" className="data-[state=active]:bg-primary data-[state=active]:text-white">Step-by-Step Guide</TabsTrigger>
            <TabsTrigger value="simulator" className="data-[state=active]:bg-primary data-[state=active]:text-white">Advanced Simulator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stepper">
            <div className="max-w-3xl mx-auto">
              {stepperResults ? (
                <div className="space-y-6">
                  <Card className="glass-card">
                    <CardContent className="pt-6">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-semibold text-gradient">Simulation Complete</h2>
                        <p className="text-blue-400/80">
                          You've successfully completed the token growth simulation
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                          <p className="text-2xl font-bold text-white">${stepperResults[0].revenue.toLocaleString()}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Revenue Share</p>
                          <p className="text-2xl font-bold text-white">${stepperResults[0].revenueShare.toLocaleString()}</p>
                        </div>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">Token Rate</p>
                          <p className="text-2xl font-bold text-white">${stepperResults[0].tokenRate.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center gap-4">
                        <Button variant="outline" onClick={resetSimulation} className="border-blue-500/50 hover:bg-blue-500/10">Start Again</Button>
                        <Button onClick={() => setActiveTab("simulator")} className="bg-primary hover:bg-primary/90">View Full Projection</Button>
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
                <Card className="glass-card">
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
                    <Card className="glass-card">
                      <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gradient">Token Growth Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Initial Token Rate</p>
                            <p className="text-2xl font-bold text-white">${results.initialTokenRate.toFixed(2)}</p>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Final Token Rate</p>
                            <p className="text-2xl font-bold text-white">${results.months[results.months.length-1].tokenRate.toFixed(2)}</p>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">APY</p>
                            <p className="text-2xl font-bold text-white">{results.apy.toFixed(2)}%</p>
                          </div>
                        </div>
                        <GrowthChart data={results.months} />
                      </CardContent>
                    </Card>

                    <Card className="glass-card">
                      <CardContent className="pt-6">
                        <h2 className="text-2xl font-semibold mb-4 text-gradient">Monthly Breakdown</h2>
                        <ScrollArea className="h-[400px]">
                          <ResultsTable data={results.months} />
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-[500px] bg-muted rounded-lg glass-card">
                    <div className="text-center">
                      <h3 className="text-2xl font-medium text-gradient mb-2">
                        Configure your simulation
                      </h3>
                      <p className="text-muted-foreground max-w-md">
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
