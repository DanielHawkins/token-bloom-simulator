
import { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';
import { MonthData } from '@/lib/tokenCalculations';
import { useIsMobile } from '@/hooks/use-mobile';

interface GrowthChartProps {
  data: MonthData[];
}

export const GrowthChart = ({ data }: GrowthChartProps) => {
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<'tokenRate' | 'poolSize' | 'revenue'>('tokenRate');

  const formatYAxis = (value: number) => {
    if (activeView === 'tokenRate') {
      return `$${value.toFixed(1)}`;
    } else {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      }
      return `$${value}`;
    }
  };

  const formatTooltipValue = (value: number) => {
    if (activeView === 'tokenRate') {
      return `$${value.toFixed(2)}`;
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
  };

  const getMaxValue = (): number => {
    if (activeView === 'tokenRate') {
      return Math.max(...data.map(d => d.tokenRate)) * 1.1;
    } else if (activeView === 'poolSize') {
      return Math.max(...data.map(d => d.poolSize)) * 1.1;
    } else {
      return Math.max(...data.map(d => d.revenue)) * 1.1;
    }
  };

  const renderChart = () => {
    if (activeView === 'tokenRate') {
      return (
        <LineChart 
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 40 }} // Increased bottom margin
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            label={{ 
              value: 'Month', 
              position: 'insideBottom',
              offset: 25 // Increased offset to prevent overlap
            }} 
          />
          <YAxis 
            domain={[0, getMaxValue()]}
            tickFormatter={formatYAxis}
            label={{ 
              value: 'Token Rate ($)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10
            }} 
          />
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), 'Token Rate']}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="tokenRate" 
            name="Token Rate" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      );
    } else if (activeView === 'poolSize') {
      return (
        <ComposedChart 
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 40 }} // Increased bottom margin
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month"
            label={{ 
              value: 'Month', 
              position: 'insideBottom',
              offset: 25 // Increased offset to prevent overlap
            }}
          />
          <YAxis 
            domain={[0, getMaxValue()]}
            tickFormatter={formatYAxis}
            label={{ 
              value: 'Pool Size ($)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10
            }}
            width={80} // Increased width to accommodate labels
          />
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), 'Pool Size']}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="poolSize" 
            name="Pool Size" 
            fill="#8884d8" 
            stroke="#8884d8"
            fillOpacity={0.3}
          />
          <Line 
            type="monotone" 
            dataKey="poolTopUp" 
            name="Monthly Pool Top Up" 
            stroke="#82ca9d"
            strokeWidth={2}
          />
        </ComposedChart>
      );
    } else {
      return (
        <ComposedChart 
          data={data}
          margin={{ top: 10, right: 10, left: 20, bottom: 40 }} // Increased bottom margin
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month"
            label={{ 
              value: 'Month', 
              position: 'insideBottom',
              offset: 25 // Increased offset to prevent overlap
            }}
          />
          <YAxis 
            domain={[0, getMaxValue()]}
            tickFormatter={formatYAxis}
            label={{ 
              value: 'Revenue ($)', 
              angle: -90, 
              position: 'insideLeft',
              offset: 10
            }}
            width={80} // Increased width to accommodate labels
          />
          <Tooltip 
            formatter={(value: number) => [formatTooltipValue(value), 'Revenue']}
            labelFormatter={(label) => `Month ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            name="Total Revenue" 
            stroke="#8884d8"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="productSales" 
            name="On-Chain Product Sales" 
            stroke="#82ca9d"
            strokeWidth={2}
          />
        </ComposedChart>
      );
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1.5 text-sm rounded-md ${
            activeView === 'tokenRate' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}
          onClick={() => setActiveView('tokenRate')}
        >
          Token Rate
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-md ${
            activeView === 'poolSize' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}
          onClick={() => setActiveView('poolSize')}
        >
          Pool Size
        </button>
        <button
          className={`px-3 py-1.5 text-sm rounded-md ${
            activeView === 'revenue' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}
          onClick={() => setActiveView('revenue')}
        >
          Revenue
        </button>
      </div>
      <div className="w-full h-[350px]"> {/* Increased height to 350px */}
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

