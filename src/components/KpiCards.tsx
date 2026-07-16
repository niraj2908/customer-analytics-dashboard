import { Users, ShieldAlert, Award, AlertCircle, Heart } from 'lucide-react';
import { Merchant } from '../types/merchant';

interface KpiCardsProps {
  merchants: Merchant[];
  healthScores: number[];
}

export default function KpiCards({ merchants, healthScores }: KpiCardsProps) {
  const total = merchants.length;
  
  const highRisk = merchants.filter(m => {
    // We compute health score for this merchant
    const score = healthScores[merchants.indexOf(m)];
    return score < 40;
  }).length;

  const medRisk = merchants.filter(m => {
    const score = healthScores[merchants.indexOf(m)];
    return score >= 40 && score < 70;
  }).length;

  const healthy = total - highRisk - medRisk;

  const avgScore = healthScores.length > 0 
    ? Math.round(healthScores.reduce((a, b) => a + b, 0) / healthScores.length)
    : 0;

  // Percentage calculations
  const healthyPct = total > 0 ? Math.round((healthy / total) * 100) : 0;
  const medRiskPct = total > 0 ? Math.round((medRisk / total) * 100) : 0;
  const highRiskPct = total > 0 ? Math.round((highRisk / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Merchants */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 group shadow-lg">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Merchants</span>
          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-950/40 transition-colors duration-300">
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{total}</span>
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Active
          </span>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 font-medium">B2B Merchant Accounts</div>
      </div>

      {/* Healthy (Health >= 70) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 group shadow-lg">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Healthy Accounts</span>
          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-emerald-950/40 transition-colors duration-300">
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{healthy}</span>
          <span className="text-xs font-medium text-emerald-400">{healthyPct}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${healthyPct}%` }}></div>
        </div>
      </div>

      {/* Medium Risk (40 - 69) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 group shadow-lg">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medium Risk</span>
          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-amber-950/40 transition-colors duration-300">
            <AlertCircle className="h-4 w-4 text-amber-400" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white tracking-tight">{medRisk}</span>
          <span className="text-xs font-medium text-amber-400">{medRiskPct}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${medRiskPct}%` }}></div>
        </div>
      </div>

      {/* High Risk (< 40) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 group shadow-lg">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">High Risk Alerts</span>
          <div className={`p-2 rounded-lg transition-colors duration-300 ${highRisk > 0 ? 'bg-rose-950/40 animate-pulse' : 'bg-slate-800'}`}>
            <ShieldAlert className={`h-4 w-4 ${highRisk > 0 ? 'text-rose-400' : 'text-slate-400'}`} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${highRisk > 0 ? 'text-rose-400' : 'text-white'}`}>{highRisk}</span>
          <span className={`text-xs font-medium ${highRisk > 0 ? 'text-rose-400' : 'text-slate-400'}`}>{highRiskPct}%</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${highRiskPct}%` }}></div>
        </div>
      </div>

      {/* Average Health Score */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700/60 transition-all duration-300 group shadow-lg">
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Health Score</span>
          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-indigo-950/40 transition-colors duration-300">
            <Heart className={`h-4 w-4 ${avgScore >= 70 ? 'text-emerald-400' : avgScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`} />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${avgScore >= 70 ? 'text-emerald-400' : avgScore >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
            {avgScore}
          </span>
          <span className="text-[10px] text-slate-400">/ 100</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${avgScore >= 70 ? 'bg-emerald-500' : avgScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${avgScore}%` }}></div>
        </div>
      </div>
    </div>
  );
}
