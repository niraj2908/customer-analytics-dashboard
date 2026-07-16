import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HealthDistributionChartProps {
  healthScores: number[];
}

export default function HealthDistributionChart({ healthScores }: HealthDistributionChartProps) {
  // Buckets: 0-20, 21-40, 41-60, 61-80, 81-100
  const buckets = [
    { range: '0-20', count: 0, color: '#f43f5e' },
    { range: '21-40', count: 0, color: '#fda4af' },
    { range: '41-60', count: 0, color: '#fcd34d' },
    { range: '61-80', count: 0, color: '#86efac' },
    { range: '81-100', count: 0, color: '#10b981' }
  ];

  healthScores.forEach(score => {
    if (score <= 20) buckets[0].count++;
    else if (score <= 40) buckets[1].count++;
    else if (score <= 60) buckets[2].count++;
    else if (score <= 80) buckets[3].count++;
    else buckets[4].count++;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-[340px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide">Health Score Distribution</h3>
        <p className="text-xs text-slate-400 mt-1">Merchant count segmented by health score ranges</p>
      </div>

      <div className="flex-grow min-h-[200px] mt-2">
        {healthScores.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-medium">
            No merchant data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buckets}
              margin={{ top: 15, right: 10, left: -30, bottom: 0 }}
            >
              <defs>
                {/* Custom gradient for general rendering if needed, or we use solid colors per cell */}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="range" 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false}
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
                formatter={(value: any) => [`${value} Merchants`, 'Volume']}
              />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
                animationDuration={600}
              >
                {buckets.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
