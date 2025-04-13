
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  TokenSimulationParams,
  getDefaultParams
} from "@/lib/tokenCalculations";

interface SimulatorFormProps {
  onSimulate: (params: TokenSimulationParams) => void;
}

export const SimulatorForm = ({ onSimulate }: SimulatorFormProps) => {
  const [params, setParams] = useState<TokenSimulationParams>(getDefaultParams());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSimulate(params);
  };

  const handleInputChange = (field: keyof TokenSimulationParams, value: string) => {
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setParams({ ...params, [field]: numValue });
    }
  };

  const handleSliderChange = (field: keyof TokenSimulationParams, value: number[]) => {
    setParams({ ...params, [field]: value[0] });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Revenue Parameters</h2>
        
        <div className="space-y-2">
          <Label htmlFor="monthlyRevenue">Monthly Revenue ($)</Label>
          <Input
            id="monthlyRevenue"
            type="number"
            value={params.monthlyRevenue}
            onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
            min="1000"
            max="10000000"
          />
          <Slider
            id="monthlyRevenueSlider"
            value={[params.monthlyRevenue]}
            min={1000}
            max={500000}
            step={1000}
            onValueChange={(value) => handleSliderChange("monthlyRevenue", value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="onChainSalesPercent">On-Chain Sales (%)</Label>
          <Input
            id="onChainSalesPercent"
            type="number"
            value={params.onChainSalesPercent}
            onChange={(e) => handleInputChange("onChainSalesPercent", e.target.value)}
            min="0"
            max="100"
          />
          <Slider
            id="onChainSalesPercentSlider"
            value={[params.onChainSalesPercent]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleSliderChange("onChainSalesPercent", value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyRevenueIncrease">Monthly Revenue Increase (%)</Label>
          <Input
            id="monthlyRevenueIncrease"
            type="number"
            value={params.monthlyRevenueIncrease}
            onChange={(e) => handleInputChange("monthlyRevenueIncrease", e.target.value)}
            min="0"
            max="100"
          />
          <Slider
            id="monthlyRevenueIncreaseSlider"
            value={[params.monthlyRevenueIncrease]}
            min={0}
            max={20}
            step={0.5}
            onValueChange={(value) => handleSliderChange("monthlyRevenueIncrease", value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="revenueShare">Revenue Share (%)</Label>
          <Input
            id="revenueShare"
            type="number"
            value={params.revenueShare}
            onChange={(e) => handleInputChange("revenueShare", e.target.value)}
            min="0"
            max="100"
          />
          <Slider
            id="revenueShareSlider"
            value={[params.revenueShare]}
            min={0}
            max={20}
            step={0.5}
            onValueChange={(value) => handleSliderChange("revenueShare", value)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Token Parameters</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basicTokenEmission">Basic Token Emission</Label>
            <Input
              id="basicTokenEmission"
              type="number"
              value={params.basicTokenEmission}
              onChange={(e) => handleInputChange("basicTokenEmission", e.target.value)}
              min="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="basicTokenSpendingDemand">Basic Token Spending Demand (%)</Label>
            <Input
              id="basicTokenSpendingDemand"
              type="number"
              value={params.basicTokenSpendingDemand}
              onChange={(e) => handleInputChange("basicTokenSpendingDemand", e.target.value)}
              min="0"
              max="1000"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="premiumTokenEmission">Premium Token Emission</Label>
            <Input
              id="premiumTokenEmission"
              type="number"
              value={params.premiumTokenEmission}
              onChange={(e) => handleInputChange("premiumTokenEmission", e.target.value)}
              min="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialPoolSize">Initial Pool Size ($)</Label>
            <Input
              id="initialPoolSize"
              type="number"
              value={params.initialPoolSize}
              onChange={(e) => handleInputChange("initialPoolSize", e.target.value)}
              min="1000"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialTokenRate">Initial Token Rate ($)</Label>
          <Input
            id="initialTokenRate"
            type="number"
            value={params.initialTokenRate}
            onChange={(e) => handleInputChange("initialTokenRate", e.target.value)}
            min="0.01"
            step="0.01"
          />
          <Slider
            id="initialTokenRateSlider"
            value={[params.initialTokenRate]}
            min={0.01}
            max={10}
            step={0.01}
            onValueChange={(value) => handleSliderChange("initialTokenRate", value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="months">Simulation Period (months)</Label>
          <Input
            id="months"
            type="number"
            value={params.months}
            onChange={(e) => handleInputChange("months", e.target.value)}
            min="1"
            max="60"
          />
          <Slider
            id="monthsSlider"
            value={[params.months]}
            min={1}
            max={36}
            step={1}
            onValueChange={(value) => handleSliderChange("months", value)}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Run Simulation</Button>
    </form>
  );
};
