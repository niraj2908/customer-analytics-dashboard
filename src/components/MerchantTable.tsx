import { useState, useMemo } from 'react';
import { Search, ArrowUpDown, Download, Filter, Eye } from 'lucide-react';
import { Merchant, ScoringBreakdown, Recommendation } from '../types/merchant';

interface MerchantTableProps {
  merchants: Merchant[];
  healthBreakdowns: ScoringBreakdown[];
  recommendations: Recommendation[];
  onMerchantClick: (merchant: Merchant) => void;
}

type SortField = 'name' | 'revenue' | 'score' | 'active';
type SortOrder = 'asc' | 'desc';

export default function MerchantTable({
  merchants,
  healthBreakdowns,
  recommendations,
  onMerchantClick
}: MerchantTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // ascending health score puts highest risk first!
  
  // Filters
  const [industryFilter, setIndustryFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [planFilter, setPlanFilter] = useState('All');

  // Extract unique lists for filters
  const industries = useMemo(() => {
    const list = new Set(merchants.map(m => m.businessType));
    return ['All', ...Array.from(list)];
  }, [merchants]);

  const plans = ['All', 'Basic', 'Growth', 'Enterprise'];
  const riskLevels = ['All', 'High Risk', 'Medium Risk', 'Healthy'];

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to desc for new fields
    }
  };

  // Filter & Search Logic
  const processedData = useMemo(() => {
    return merchants
      .map((merchant, idx) => ({
        merchant,
        breakdown: healthBreakdowns[idx],
        recommendation: recommendations[idx]
      }))
      .filter(({ merchant, breakdown }) => {
        // Search filter
        const matchSearch =
          merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          merchant.accountManager.toLowerCase().includes(searchTerm.toLowerCase());

        // Industry filter
        const matchIndustry = industryFilter === 'All' || merchant.businessType === industryFilter;

        // Risk filter
        const matchRisk = riskFilter === 'All' || breakdown.riskLevel === riskFilter;

        // Plan filter
        const matchPlan = planFilter === 'All' || merchant.subscriptionPlan === planFilter;

        return matchSearch && matchIndustry && matchRisk && matchPlan;
      })
      .sort((a, b) => {
        let valueA: any;
        let valueB: any;

        switch (sortField) {
          case 'name':
            valueA = a.merchant.name.toLowerCase();
            valueB = b.merchant.name.toLowerCase();
            break;
          case 'revenue':
            valueA = a.merchant.monthlyRevenue;
            valueB = b.merchant.monthlyRevenue;
            break;
          case 'score':
            valueA = a.breakdown.finalScore;
            valueB = b.breakdown.finalScore;
            break;
          case 'active':
            valueA = a.merchant.lastActiveDays;
            valueB = b.merchant.lastActiveDays;
            break;
          default:
            valueA = a.breakdown.finalScore;
            valueB = b.breakdown.finalScore;
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [merchants, healthBreakdowns, recommendations, searchTerm, sortField, sortOrder, industryFilter, riskFilter, planFilter]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'ID', 'Name', 'Industry', 'Owner', 'City', 'Plan', 
      'Current Revenue', 'Previous Revenue', 'Last Active (Days)', 
      'Tickets', 'Failures', 'Health Score', 'Risk Level', 'Recommendation'
    ];
    
    const rows = processedData.map(({ merchant, breakdown, recommendation }) => [
      merchant.id,
      `"${merchant.name}"`,
      merchant.businessType,
      `"${merchant.owner}"`,
      merchant.city,
      merchant.subscriptionPlan,
      merchant.monthlyRevenue,
      merchant.previousRevenue,
      merchant.lastActiveDays,
      merchant.supportTickets,
      merchant.paymentFailures,
      breakdown.finalScore,
      breakdown.riskLevel,
      `"${recommendation.recommendedAction}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `merchant_risk_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getRiskBadgeStyles = (level: string) => {
    switch (level) {
      case 'High Risk':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Medium Risk':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-rose-400';
    if (score < 70) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Table Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search merchants, owners, managers, cities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg pl-9 pr-4 py-2 text-slate-200 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Industry Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2 py-1">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer"
            >
              {industries.map(ind => (
                <option key={ind} value={ind} className="bg-slate-800">{ind === 'All' ? 'All Industries' : ind}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2 py-1">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer"
            >
              {riskLevels.map(rl => (
                <option key={rl} value={rl} className="bg-slate-800">{rl === 'All' ? 'All Risk Levels' : rl}</option>
              ))}
            </select>
          </div>

          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/40 rounded-lg px-2 py-1">
            <Filter className="h-3 w-3 text-slate-400" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent border-none text-[11px] font-semibold text-slate-300 focus:outline-none cursor-pointer"
            >
              {plans.map(p => (
                <option key={p} value={p} className="bg-slate-800">{p === 'All' ? 'All Plans' : p}</option>
              ))}
            </select>
          </div>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg px-3 py-1.5 transition-colors shadow-sm ml-auto"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table Render */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 tracking-wider select-none">
              <th className="py-3 px-5">
                <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white">
                  <span>Merchant</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4">Industry</th>
              <th className="py-3 px-4">
                <button onClick={() => handleSort('revenue')} className="flex items-center gap-1 hover:text-white">
                  <span>MRR / Trend</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button onClick={() => handleSort('score')} className="flex items-center gap-1 hover:text-white">
                  <span>Health Score</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4">Risk Badge</th>
              <th className="py-3 px-4">
                <button onClick={() => handleSort('active')} className="flex items-center gap-1 hover:text-white">
                  <span>Last Active</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 hidden xl:table-cell">Recommended Action</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
            {processedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                  No merchants match the current filters or search terms
                </td>
              </tr>
            ) : (
              processedData.map(({ merchant, breakdown, recommendation }) => {
                const revChange = breakdown.revenueDeclineValue;
                const revChangePct = Math.round(revChange * 100);
                
                return (
                  <tr
                    key={merchant.id}
                    onClick={() => onMerchantClick(merchant)}
                    className="hover:bg-slate-800/30 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors duration-150">
                        {merchant.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{merchant.city}</span>
                        <span className="text-slate-600">•</span>
                        <span>{merchant.subscriptionPlan}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-400">
                      {merchant.businessType}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-200">
                        ${merchant.monthlyRevenue.toLocaleString()}
                      </div>
                      <div className="mt-0.5">
                        {revChangePct >= 0 ? (
                          <span className="text-[10px] text-emerald-400 font-medium">
                            +{revChangePct}% growth
                          </span>
                        ) : (
                          <span className="text-[10px] text-rose-400 font-medium">
                            {revChangePct}% decline
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(breakdown.finalScore)}`}>
                          {breakdown.finalScore}
                        </span>
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              breakdown.finalScore >= 70 ? 'bg-emerald-500' : breakdown.finalScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${breakdown.finalScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getRiskBadgeStyles(breakdown.riskLevel)}`}>
                        {breakdown.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-medium">
                      {merchant.lastActiveDays === 0 ? (
                        <span className="text-emerald-400 font-semibold">Active today</span>
                      ) : merchant.lastActiveDays === 1 ? (
                        <span>1 day ago</span>
                      ) : (
                        <span>{merchant.lastActiveDays} days ago</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate hidden xl:table-cell text-slate-400">
                      <span className="font-semibold text-slate-200 text-[11px] block truncate">
                        {recommendation.recommendedAction}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                        {recommendation.riskExplanation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="p-1 bg-slate-800/80 hover:bg-indigo-600/25 border border-slate-700 hover:border-indigo-500/40 rounded text-slate-400 hover:text-indigo-400 transition-all duration-150">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Table Footer Summary */}
      <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center text-[10px] text-slate-500 font-medium">
        <div>
          Showing {processedData.length} of {merchants.length} merchants
        </div>
        <div>
          Click any row to open detail view & simulation sandbox
        </div>
      </div>
    </div>
  );
}
