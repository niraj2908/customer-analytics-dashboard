import { useState, useEffect } from 'react';
import { X, User, MapPin, Briefcase, Calendar, Zap, RotateCcw, Save, MessageSquare, CreditCard } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Merchant } from '../types/merchant';
import { calculateHealthScore } from '../utils/churnScore';
import { getMerchantRecommendation } from '../utils/recommendations';

interface DetailDrawerProps {
  merchant: Merchant | null;
  onClose: () => void;
  onSaveMerchant: (updated: Merchant) => void;
}

export default function DetailDrawer({ merchant, onClose, onSaveMerchant }: DetailDrawerProps) {
  // Local state to store simulated metrics
  const [simulated, setSimulated] = useState<Merchant | null>(null);

  // Sync simulated state when merchant is selected
  useEffect(() => {
    if (merchant) {
      setSimulated({ ...merchant });
    } else {
      setSimulated(null);
    }
  }, [merchant]);

  if (!merchant || !simulated) return null;

  // Run calculation engines on current simulated state
  const breakdown = calculateHealthScore(simulated);
  const recommendation = getMerchantRecommendation(simulated, breakdown);

  const isModified =
    simulated.monthlyRevenue !== merchant.monthlyRevenue ||
    simulated.lastActiveDays !== merchant.lastActiveDays ||
    simulated.supportTickets !== merchant.supportTickets ||
    simulated.paymentFailures !== merchant.paymentFailures ||
    simulated.weeklyLogins !== merchant.weeklyLogins ||
    simulated.totalOrders !== merchant.totalOrders;

  // Reset to original merchant values
  const handleReset = () => {
    setSimulated({ ...merchant });
  };

  // Save changes to parent state
  const handleSave = () => {
    if (simulated) {
      // Add a log into history to record this action
      const nowStr = new Date().toISOString().split('T')[0];
      const updatedHistory = [
        {
          id: `act-${Date.now()}`,
          date: nowStr,
          type: 'action' as const,
          description: `Account metrics modified/simulated by Customer Success. Health Score updated to ${breakdown.finalScore}.`
        },
        ...(simulated.actionHistory || [])
      ];
      
      onSaveMerchant({
        ...simulated,
        actionHistory: updatedHistory,
        actionTakenAt: nowStr
      });
    }
  };

  // Mini Chart data (Current vs Previous)
  const revenueChartData = [
    { name: 'Prev Month', revenue: merchant.previousRevenue },
    { name: 'Curr Month', revenue: simulated.monthlyRevenue }
  ];

  const orderChartData = [
    { name: 'Prev Orders', orders: merchant.previousOrders },
    { name: 'Curr Orders', orders: simulated.totalOrders }
  ];

  // Removed unused getScoreColor function

  const getRiskLabelColor = (level: string) => {
    switch (level) {
      case 'High Risk':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium Risk':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop with Blur */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Sliding Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
          <div>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Merchant Profile</span>
            <h2 className="text-base font-bold text-slate-100 mt-1">{merchant.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 border border-slate-700/60 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          {/* Profile Overview */}
          <div className="grid grid-cols-2 gap-3 bg-slate-800/30 border border-slate-800/80 rounded-xl p-4 text-slate-300">
            <div className="flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-slate-500" />
              <div className="text-[11px] truncate">
                <span className="text-slate-500 block">Owner</span>
                <span className="font-semibold text-slate-200">{merchant.owner}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-500" />
              <div className="text-[11px] truncate">
                <span className="text-slate-500 block">Location</span>
                <span className="font-semibold text-slate-200">{merchant.city}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-slate-500" />
              <div className="text-[11px] truncate">
                <span className="text-slate-500 block">Plan</span>
                <span className="font-semibold text-slate-200">{merchant.subscriptionPlan}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <div className="text-[11px] truncate">
                <span className="text-slate-500 block">Onboarded</span>
                <span className="font-semibold text-slate-200">{merchant.onboardingDate}</span>
              </div>
            </div>
            <div className="col-span-2 border-t border-slate-800/60 pt-3 mt-1 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Assigned AM:</span>
              <span className="font-bold text-slate-300">{merchant.accountManager}</span>
            </div>
          </div>

          {/* Dynamic Score Ribbon */}
          <div className="flex items-center gap-4 bg-slate-950/40 border border-slate-800 rounded-xl p-4">
            {/* Health Gauge Ring */}
            <div className="relative h-16 w-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" className="stroke-slate-800" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="28" 
                  className={`transition-all duration-500 ${
                    breakdown.finalScore >= 70 ? 'stroke-emerald-500' : breakdown.finalScore >= 40 ? 'stroke-amber-500' : 'stroke-rose-500'
                  }`} 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray={175} 
                  strokeDashoffset={175 - (175 * breakdown.finalScore) / 100} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-slate-100">{breakdown.finalScore}</span>
                <span className="text-[7px] text-slate-500 uppercase tracking-widest font-semibold">Health</span>
              </div>
            </div>

            {/* Score info */}
            <div className="flex-grow">
              <div className="flex items-center gap-2">
                <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${getRiskLabelColor(breakdown.riskLevel)}`}>
                  {breakdown.riskLevel}
                </span>
                {isModified && (
                  <span className="text-[9px] font-bold text-indigo-400 animate-pulse bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                    Simulated
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal mt-1.5 font-medium">
                {recommendation.riskExplanation}
              </p>
            </div>
          </div>

          {/* Metric Comparison Charts */}
          <div className="grid grid-cols-2 gap-4">
            {/* Revenue Trend */}
            <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-3 h-[120px] flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue Trend</span>
              <div className="h-[60px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData} margin={{ top: 2, right: 2, left: -35, bottom: 2 }}>
                    <defs>
                      <linearGradient id="miniRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '4px', fontSize: '10px' }}
                      formatter={(v) => [`$${v}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#miniRevGrad)" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold px-0.5">
                <span>Prev: ${merchant.previousRevenue.toLocaleString()}</span>
                <span className={simulated.monthlyRevenue >= merchant.previousRevenue ? 'text-emerald-400' : 'text-rose-400'}>
                  Curr: ${simulated.monthlyRevenue.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Orders Trend */}
            <div className="bg-slate-950/20 border border-slate-800/80 rounded-xl p-3 h-[120px] flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Order Volume</span>
              <div className="h-[60px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderChartData} margin={{ top: 2, right: 2, left: -35, bottom: 2 }}>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '4px', fontSize: '10px' }}
                      formatter={(v) => [v, 'Orders']}
                    />
                    <Bar dataKey="orders" fill="#475569" radius={[2, 2, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold px-0.5">
                <span>Prev: {merchant.previousOrders}</span>
                <span className={simulated.totalOrders >= merchant.previousOrders ? 'text-emerald-400' : 'text-rose-400'}>
                  Curr: {simulated.totalOrders}
                </span>
              </div>
            </div>
          </div>

          {/* Next Best Action Card */}
          <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-indigo-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 tracking-wide">Next Best Action Recommended</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                recommendation.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                recommendation.priority === 'High' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                recommendation.priority === 'Medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {recommendation.priority} Priority
              </span>
            </div>
            
            <p className="text-slate-100 text-xs font-semibold leading-relaxed">
              {recommendation.recommendedAction}
            </p>

            <button 
              onClick={() => {
                // Instantly simulate resolving major issues!
                setSimulated(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    paymentFailures: 0,
                    supportTickets: 0,
                    lastActiveDays: 0,
                    weeklyLogins: Math.max(prev.weeklyLogins, 4),
                    monthlyRevenue: Math.max(prev.monthlyRevenue, prev.previousRevenue)
                  };
                });
              }}
              className="mt-4 w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all duration-150"
            >
              <span>Quick Fix: Simulate Issue Resolution</span>
            </button>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <div className="p-3.5 bg-slate-950/40 border-b border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
                <span>Simulation Sandbox</span>
              </span>
              <div className="flex items-center gap-2">
                {isModified && (
                  <button 
                    onClick={handleReset}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button 
                  onClick={handleSave}
                  disabled={!isModified}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded transition-all duration-150 ${
                    isModified 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' 
                      : 'bg-slate-800 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-3 w-3" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950/20 space-y-4">
              {/* Payment Failures Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3 text-rose-400" />
                    <span>Payment Failures</span>
                  </span>
                  <span className={`font-bold ${simulated.paymentFailures > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {simulated.paymentFailures} failed
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  value={simulated.paymentFailures}
                  onChange={(e) => setSimulated(prev => prev ? { ...prev, paymentFailures: parseInt(e.target.value) } : null)}
                  className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Support Tickets Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-amber-400" />
                    <span>Active Support Tickets</span>
                  </span>
                  <span className={`font-bold ${simulated.supportTickets >= 3 ? 'text-rose-400' : simulated.supportTickets > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {simulated.supportTickets} open
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="6" 
                  value={simulated.supportTickets}
                  onChange={(e) => setSimulated(prev => prev ? { ...prev, supportTickets: parseInt(e.target.value) } : null)}
                  className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Inactivity Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Days Inactive</span>
                  <span className={`font-bold ${simulated.lastActiveDays >= 7 ? 'text-rose-400' : 'text-slate-300'}`}>
                    {simulated.lastActiveDays} days ago
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={simulated.lastActiveDays}
                  onChange={(e) => setSimulated(prev => prev ? { ...prev, lastActiveDays: parseInt(e.target.value) } : null)}
                  className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Monthly Revenue Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Monthly MRR</span>
                  <span className="font-bold text-slate-300">
                    ${simulated.monthlyRevenue.toLocaleString()}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={Math.max(1000, Math.round(merchant.previousRevenue * 0.3))} 
                  max={Math.round(merchant.previousRevenue * 1.5)} 
                  step="100"
                  value={simulated.monthlyRevenue}
                  onChange={(e) => setSimulated(prev => prev ? { ...prev, monthlyRevenue: parseInt(e.target.value) } : null)}
                  className="w-full accent-indigo-500 bg-slate-800 h-1 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Previous Month MRR: ${merchant.previousRevenue.toLocaleString()}</span>
                  <span>Change: {Math.round(((simulated.monthlyRevenue - merchant.previousRevenue) / merchant.previousRevenue) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-200 tracking-wide">Activity Logs & Action History</span>
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/20 p-4">
              {merchant.actionHistory && merchant.actionHistory.length > 0 ? (
                <div className="space-y-4">
                  {merchant.actionHistory.map((log) => (
                    <div key={log.id} className="relative pl-5 border-l border-slate-800 last:border-l-0 pb-1">
                      <div className="absolute -left-[4px] top-1.5 h-2 w-2 rounded-full bg-indigo-500/80 shadow" />
                      <div className="flex justify-between text-[10px] text-slate-500 font-semibold mb-1">
                        <span>{log.date}</span>
                        <span className="uppercase text-[8px] tracking-wider text-indigo-400 bg-indigo-950/40 px-1 rounded">{log.type}</span>
                      </div>
                      <p className="text-slate-300 text-xs leading-normal">
                        {log.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs font-medium">
                  No registered outreach logs or events found for this merchant.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
