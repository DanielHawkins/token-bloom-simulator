
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const ModelExplanation = () => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>How It Works</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="model">
            <AccordionTrigger>Token Growth Model</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                This simulator demonstrates how premium tokens appreciate in value based on revenue sharing from digital product sales on a blockchain.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                As revenue is generated and a portion is contributed to the token pool, the value of each token increases proportionally.
              </p>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="calculations">
            <AccordionTrigger>Key Calculations</AccordionTrigger>
            <AccordionContent className="space-y-2">
              <div>
                <p className="text-sm font-medium">Product Sales</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Monthly Revenue × On-Chain Sales %
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Revenue Share</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Product Sales × Revenue Share %
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Pool Size</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Previous Pool Size + Revenue Share
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Token Rate</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Pool Size ÷ Premium Token Emission
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">APY</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ((Final Rate ÷ Initial Rate) - 1) × 100 × (12 ÷ months)
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="parameters">
            <AccordionTrigger>Parameters Explained</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><span className="font-medium">Monthly Revenue:</span> Total revenue generated each month</li>
                <li><span className="font-medium">On-Chain Sales %:</span> Percentage of sales occurring on-chain</li>
                <li><span className="font-medium">Monthly Revenue Increase:</span> Growth rate of revenue month-over-month</li>
                <li><span className="font-medium">Revenue Share %:</span> Percentage of on-chain sales allocated to token pool</li>
                <li><span className="font-medium">Token Emission:</span> Total number of tokens in circulation</li>
                <li><span className="font-medium">Initial Pool Size:</span> Starting value of the token pool in USD</li>
                <li><span className="font-medium">Initial Token Rate:</span> Starting price per token in USD</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};
