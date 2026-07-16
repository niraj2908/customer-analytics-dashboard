import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface RiskDistributionChartProps {
  highRiskCount: number;
  medRiskCount: number;
  healthyCount: number;
}

export default function RiskDistributionChart({
  highRiskCount,
  medRiskCount,
  healthyCount
}: RiskDistributionChartProps) {
  const data = [
    { name: 'Healthy', value: healthyCount, color: '#10b981' },
    { name: 'Medium Risk', value: medRiskCount, color: '#f59e0b' },
    { name: 'High Risk', value: highRiskCount, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  const total = healthyCount + medRiskCount + highRiskCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg h-[340px] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide">Risk Distribution</h3>
        <p className="text-xs text-slate-400 mt-1">Portfolio breakdown by risk categorization</p>
      </div>

      <div className="relative flex-grow flex items-center justify-center min-h-[180px]">
        {total === 0 ? (
          <div className="text-slate-500 text-xs font-medium">No merchant data available</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  animationDuration={600}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#cbd5e1' }}
                  formatter={(value: any) => [`${value} Merchants`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text inside Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-100 tracking-tight">{total}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Merchants</span>
            </div>
          </>
        )}
      </div>

      {/* Custom Legend */}
      <div className="flex justify-center gap-6 mt-2 pb-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] font-semibold text-slate-300">
              {item.name} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
