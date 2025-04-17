
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface TokenIdInputProps {
  onComplete: (basicToken: string, premiumToken: string) => void;
}

export const TokenIdInput = ({ onComplete }: TokenIdInputProps) => {
  const [tokenId, setTokenId] = useState("TKN");

  const handleSubmit = () => {
    // Always use at least "TKN" if the field is empty
    const finalTokenId = tokenId.trim() || "TKN";
    onComplete(finalTokenId, `${finalTokenId}X`);
  };

  return (
    <Card className="glass-card mx-auto max-w-md w-[50%]">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gradient">Enter Your Token ID</h2>
          <div className="space-y-2">
            <Label htmlFor="tokenId" className="text-blue-400">Token ID:</Label>
            <Input
              id="tokenId"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="e.g. TKN"
              className="text-lg bg-secondary border-blue-500/30 focus-visible:ring-blue-500"
            />
          </div>
          <div className="pt-4">
            <Button 
              onClick={handleSubmit} 
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
            >
              Continue
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
