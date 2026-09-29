import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

export interface BarChartDataPoint {
  name: string;
  bookings: number;
}

export interface StatBarChartProps {
  data: BarChartDataPoint[];
  height?: number;
}

export const StatBarChart: React.FC<StatBarChartProps> = ({ data, height = 240 }) => {
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#146C86',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="bookings" fill="#146C86" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
