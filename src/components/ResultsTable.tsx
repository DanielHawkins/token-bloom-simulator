
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthData, formatCurrency } from "@/lib/tokenCalculations";

interface ResultsTableProps {
  data: MonthData[];
}

export const ResultsTable = ({ data }: ResultsTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead className="text-right">Revenue</TableHead>
          <TableHead className="text-right">Product Sales</TableHead>
          <TableHead className="text-right">Revenue Share</TableHead>
          <TableHead className="text-right">Pool Top Up</TableHead>
          <TableHead className="text-right">Pool Size</TableHead>
          <TableHead className="text-right">Token Rate</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.month}>
            <TableCell>{row.month}</TableCell>
            <TableCell className="text-right">{formatCurrency(row.revenue)}</TableCell>
            <TableCell className="text-right">{formatCurrency(row.productSales)}</TableCell>
            <TableCell className="text-right">{formatCurrency(row.revenueShare)}</TableCell>
            <TableCell className="text-right">{formatCurrency(row.poolTopUp)}</TableCell>
            <TableCell className="text-right">{formatCurrency(row.poolSize)}</TableCell>
            <TableCell className="text-right">${row.tokenRate.toFixed(2)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
