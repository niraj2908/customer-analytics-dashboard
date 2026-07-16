import { ShieldAlert, Users, TrendingUp, Activity, Award } from 'lucide-react';

interface SidebarProps {
  selectedManager: string;
  setSelectedManager: (manager: string) => void;
  activeFilter: 'all' | 'High Risk' | 'Medium Risk' | 'Healthy';
  setActiveFilter: (filter: 'all' | 'High Risk' | 'Medium Risk' | 'Healthy') => void;
  totalPendingActions: number;
}

export default function Sidebar({
  selectedManager,
  setSelectedManager,
  activeFilter,
  setActiveFilter,
  totalPendingActions
}: SidebarProps) {
  const managers = ['All Managers', 'Sarah Jenkins', 'Marcus Vance', 'Chloe Adams', 'David Miller'];

  const navItems = [
    { id: 'all', label: 'All Merchants', icon: Users, count: null },
    { id: 'High Risk', label: 'High Risk Alerts', icon: ShieldAlert, count: null, color: 'text-red-400' },
    { id: 'Medium Risk', label: 'Medium Risk', icon: Activity, count: null, color: 'text-amber-400' },
    { id: 'Healthy', label: 'Healthy Accounts', icon: Award, count: null, color: 'text-emerald-400' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      <div className="flex flex-col pt-6 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
            <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-white tracking-wide font-sans">
              CHURN SENTINEL
            </h1>
            <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
              CS Risk Engine
            </span>
          </div>
        </div>

        {/* Account Manager Filter Dropdown */}
        <div className="px-4 mb-6">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
            My Portfolio Filter
          </label>
          <div className="relative">
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/80 focus:border-indigo-500 cursor-pointer appearance-none shadow-inner"
            >
              {managers.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 mb-6">
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
            Risk Categories
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFilter(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-md border-l-2 border-indigo-500 pl-2.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${item.color || 'text-slate-400'} ${isActive ? 'scale-110' : ''}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'High Risk' && totalPendingActions > 0 && (
                    <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {totalPendingActions}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Documentation Info Box */}
        <div className="px-4 mt-4">
          <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[11px] font-bold tracking-wide uppercase">Weighted Math</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              Scores are live-computed on: Decline, Support Load, Billing Status, and Logins.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
            <Users className="h-4 w-4 text-slate-300" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Customer Success</div>
            <div className="text-[10px] text-slate-500">Sentinel Agent v1.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
