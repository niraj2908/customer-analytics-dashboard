import { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import KpiCards from './components/KpiCards';
import RiskDistributionChart from './components/RiskDistributionChart';
import RevenueChart from './components/RevenueChart';
import HealthDistributionChart from './components/HealthDistributionChart';
import MerchantTable from './components/MerchantTable';
import DetailDrawer from './components/DetailDrawer';
import { mockMerchants } from './data/merchants';
import { Merchant } from './types/merchant';
import { calculateHealthScore } from './utils/churnScore';
import { getMerchantRecommendation } from './utils/recommendations';

export default function App() {
  const [merchants, setMerchants] = useState<Merchant[]>(mockMerchants);
  const [selectedManager, setSelectedManager] = useState<string>('All Managers');
  const [activeFilter, setActiveFilter] = useState<'all' | 'High Risk' | 'Medium Risk' | 'Healthy'>('all');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Filter merchants based on Account Manager selection
  const amFilteredMerchants = useMemo(() => {
    if (selectedManager === 'All Managers') return merchants;
    return merchants.filter(m => m.accountManager === selectedManager);
  }, [merchants, selectedManager]);

  // Precompute health scores and recommendations for the current AM selection
  const amScoringData = useMemo(() => {
    return amFilteredMerchants.map(m => {
      const breakdown = calculateHealthScore(m);
      const recommendation = getMerchantRecommendation(m, breakdown);
      return {
        merchant: m,
        breakdown,
        recommendation
      };
    });
  }, [amFilteredMerchants]);

  // Extract individual arrays for charts & KPIs
  const amMerchantsList = useMemo(() => amScoringData.map(d => d.merchant), [amScoringData]);
  const amScores = useMemo(() => amScoringData.map(d => d.breakdown.finalScore), [amScoringData]);

  // Calculate totals for Risk Categories in the AM's portfolio
  const riskCounts = useMemo(() => {
    let high = 0;
    let med = 0;
    let healthy = 0;
    amScoringData.forEach(d => {
      if (d.breakdown.riskLevel === 'High Risk') high++;
      else if (d.breakdown.riskLevel === 'Medium Risk') med++;
      else healthy++;
    });
    return { high, med, healthy };
  }, [amScoringData]);

  // Filter data further for the Merchant Table based on Risk Level (activeFilter)
  const tableData = useMemo(() => {
    if (activeFilter === 'all') return amScoringData;
    return amScoringData.filter(d => d.breakdown.riskLevel === activeFilter);
  }, [amScoringData, activeFilter]);

  // Re-extract lists for the table component
  const tableMerchantsList = useMemo(() => tableData.map(d => d.merchant), [tableData]);
  const tableBreakdowns = useMemo(() => tableData.map(d => d.breakdown), [tableData]);
  const tableRecommendations = useMemo(() => tableData.map(d => d.recommendation), [tableData]);

  // Total pending actions (high risk merchants in the AM's portfolio)
  const totalPendingActions = useMemo(() => {
    return amScoringData.filter(d => d.breakdown.riskLevel === 'High Risk').length;
  }, [amScoringData]);

  // Handle saving modifications from simulation sandbox
  const handleSaveMerchant = (updatedMerchant: Merchant) => {
    setMerchants(prev => prev.map(m => m.id === updatedMerchant.id ? updatedMerchant : m));
    
    // Update active selection to reflect newly saved values in the drawer
    setSelectedMerchant(updatedMerchant);
  };

  return (
    <div className="flex bg-slate-950 min-h-screen">
      {/* Sidebar */}
      <Sidebar
        selectedManager={selectedManager}
        setSelectedManager={setSelectedManager}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        totalPendingActions={totalPendingActions}
      />

      {/* Main Dashboard Panel */}
      <main className="flex-grow p-6 md:p-8 overflow-x-hidden space-y-6 max-w-7xl mx-auto">
        
        {/* Top Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Customer Success Risk Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {selectedManager === 'All Managers' 
                ? 'Consolidated view of all B2B merchant churn risk metrics.' 
                : `Viewing active portfolio of Account Manager: ${selectedManager}.`}
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span className="font-semibold tracking-wider uppercase text-[10px]">Real-Time calculations active</span>
          </div>
        </header>

        {/* KPI Cards Row */}
        <KpiCards 
          merchants={amMerchantsList} 
          healthScores={amScores} 
        />

        {/* Visual Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RiskDistributionChart
            highRiskCount={riskCounts.high}
            medRiskCount={riskCounts.med}
            healthyCount={riskCounts.healthy}
          />
          <RevenueChart merchants={amMerchantsList} />
          <HealthDistributionChart healthScores={amScores} />
        </div>

        {/* Merchant Directory Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                {activeFilter === 'all' ? 'Merchant Directory' : `${activeFilter} Merchants`}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed metrics, recent activities, and recommended actions
              </p>
            </div>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-xs text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
              >
                Clear Category Filter
              </button>
            )}
          </div>

          <MerchantTable
            merchants={tableMerchantsList}
            healthBreakdowns={tableBreakdowns}
            recommendations={tableRecommendations}
            onMerchantClick={(m) => setSelectedMerchant(m)}
          />
        </section>
      </main>

      {/* Side Slide-Out Detail Panel */}
      <DetailDrawer
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        onSaveMerchant={handleSaveMerchant}
      />
    </div>
  );
}
