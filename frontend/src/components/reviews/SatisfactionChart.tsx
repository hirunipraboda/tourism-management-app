import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SatisfactionTrendPoint } from '../../types/reviewsAndRecommendations';

interface SatisfactionChartProps {
  data: SatisfactionTrendPoint[];
  className?: string;
}

export const SatisfactionChart: React.FC<SatisfactionChartProps> = ({ data, className = '' }) => {
  return (
    <div className={`bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Monthly Trend Analysis</span>
          </div>
          <h3 className="text-lg font-black text-[#0B3A53] font-heading">
            Customer Satisfaction Trend
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Positive sentiment & satisfaction percentage across recent operational months
          </p>
        </div>

        {/* Latest Metric Callout */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-right">
            <div className="text-xl font-black text-emerald-700">95%</div>
            <div className="text-[10px] font-bold text-emerald-600 uppercase">Current Month</div>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="satisfactionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A6A1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16A6A1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[75, 100]}
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as SatisfactionTrendPoint;
                  return (
                    <div className="bg-[#0B3A53] text-white p-3 rounded-xl shadow-xl border border-white/20 text-xs space-y-1">
                      <div className="font-extrabold text-sm">{label} 2026</div>
                      <div className="text-[#16A6A1] font-black">
                        Satisfaction: {item.satisfactionRate}%
                      </div>
                      <div className="text-slate-300">
                        Monthly Reviews: {item.reviewsCount.toLocaleString()}
                      </div>
                      <div className="text-amber-400">Avg Rating: {item.avgRating} ★</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="satisfactionRate"
              stroke="#16A6A1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#satisfactionGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
