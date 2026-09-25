import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

export interface AreaChartDataPoint {
  name: string;
  value: number;
  aiOptimized?: number;
}

export interface StatAreaChartProps {
  data: AreaChartDataPoint[];
  height?: number;
}

export const StatAreaChart: React.FC<StatAreaChartProps> = ({ data, height = 240 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="novaPrimaryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0B3A53" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0B3A53" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="novaAccentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16A6A1" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#16A6A1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#0B3A53',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#0B3A53"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#novaPrimaryGrad)"
          />
          {data[0]?.aiOptimized !== undefined && (
            <Area
              type="monotone"
              dataKey="aiOptimized"
              stroke="#16A6A1"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#novaAccentGrad)"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
