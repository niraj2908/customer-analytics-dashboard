import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Merchant } from '../types/merchant';

interface RevenueChartProps {
  merchants: Merchant[];
}

export default function RevenueChart({ merchants }: RevenueChartProps) {
  // Aggregate revenue data by industry (businessType)
  const industryDataMap: { [key: string]: { current: number; previous: number } } = {};

  merchants.forEach(m => {
    const type = m.businessType;
    if (!industryDataMap[type]) {
      industryDataMap[type] = { current: 0, previous: 0 };
    }
    industryDataMap[type].current += m.monthlyRevenue;
    industryDataMap[type].previous += m.previousRevenue;
  });

  const chartData = Object.keys(industryDataMap).map(industry => ({
    name: industry,
    'Current Month': industryDataMap[industry].current,
    'Previous Month': industryDataMap[industry].previous,
    decline: industryDataMap[industry].current < industryDataMap[industry].previous
  }));

  const formatRevenue = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-[340px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide">Industry Revenue Comparison</h3>
        <p className="text-xs text-slate-400 mt-1">Current vs. Previous month revenue comparison by sector</p>
      </div>

      <div className="flex-grow min-h-[200px] mt-2">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-medium">
            No merchant data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={formatRevenue}
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#cbd5e1' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
              />
              <Legend 
                verticalAlign="top"
                height={32}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}
              />
              <Bar 
                dataKey="Previous Month" 
                fill="#334155" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={28}
                animationDuration={600}
              />
              <Bar 
                dataKey="Current Month" 
                fill="#6366f1" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={28}
                animationDuration={600}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
