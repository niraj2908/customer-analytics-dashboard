import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import "./App.css";

// ── DATA ────────────────────────────────────────────────────────────────────

const allData = {
  "Jan": { retention: 72, churn: 28, revenue: 41200, newCustomers: 312, activeCustomers: 1840, campaigns: 8, convRate: 3.2 },
  "Feb": { retention: 74, churn: 26, revenue: 43800, newCustomers: 289, activeCustomers: 1920, campaigns: 10, convRate: 3.5 },
  "Mar": { retention: 71, churn: 29, revenue: 38900, newCustomers: 401, activeCustomers: 1780, campaigns: 7, convRate: 2.9 },
  "Apr": { retention: 76, churn: 24, revenue: 52300, newCustomers: 478, activeCustomers: 2040, campaigns: 12, convRate: 4.1 },
  "May": { retention: 78, churn: 22, revenue: 58100, newCustomers: 534, activeCustomers: 2210, campaigns: 14, convRate: 4.4 },
  "Jun": { retention: 75, churn: 25, revenue: 49700, newCustomers: 392, activeCustomers: 2100, campaigns: 11, convRate: 3.8 },
  "Jul": { retention: 80, churn: 20, revenue: 63400, newCustomers: 612, activeCustomers: 2380, campaigns: 15, convRate: 5.1 },
  "Aug": { retention: 82, churn: 18, revenue: 71200, newCustomers: 689, activeCustomers: 2560, campaigns: 18, convRate: 5.6 },
  "Sep": { retention: 79, churn: 21, revenue: 65800, newCustomers: 521, activeCustomers: 2440, campaigns: 13, convRate: 4.7 },
  "Oct": { retention: 83, churn: 17, revenue: 78300, newCustomers: 743, activeCustomers: 2690, campaigns: 20, convRate: 6.0 },
  "Nov": { retention: 85, churn: 15, revenue: 91500, newCustomers: 891, activeCustomers: 2940, campaigns: 22, convRate: 6.8 },
  "Dec": { retention: 84, churn: 16, revenue: 88700, newCustomers: 812, activeCustomers: 2880, campaigns: 21, convRate: 6.3 },
};

const segments = [
  { name: "Loyal", value: 38, color: "#0f3460" },
  { name: "At Risk", value: 22, color: "#e94560" },
  { name: "New", value: 25, color: "#16213e" },
  { name: "Dormant", value: 15, color: "#a8b2c1" },
];

const channelData = [
  { channel: "Email", sent: 12400, opened: 4340, clicked: 1240, converted: 398 },
  { channel: "SMS", sent: 8900, opened: 6230, clicked: 2140, converted: 642 },
  { channel: "WhatsApp", sent: 5600, opened: 4480, clicked: 2240, converted: 784 },
  { channel: "Push", sent: 18200, opened: 3640, clicked: 728, converted: 182 },
];

const MONTHS = Object.keys(allData);

// ── HELPERS ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (n >= 1000000) return "₹" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
}

function downloadCSV(data, filename) {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(r => Object.values(r).join(",")).join("\n");
  const blob = new Blob([headers + "\n" + rows], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, onExport }) {
  return (
    <div className="section-header">
      <h2>{title}</h2>
      {onExport && (
        <button className="export-btn" onClick={onExport}>
          ↓ Export CSV
        </button>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === "number" && p.name?.toLowerCase().includes("revenue") ? fmt(p.value) : p.value}{p.name?.toLowerCase().includes("rate") || p.name?.toLowerCase().includes("retention") || p.name?.toLowerCase().includes("churn") ? "%" : ""}</strong>
        </p>
      ))}
    </div>
  );
};

// ── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [range, setRange] = useState({ from: 0, to: 11 });
  const [activeTab, setActiveTab] = useState("overview");

  const filtered = useMemo(() => {
    return MONTHS.slice(range.from, range.to + 1).map(m => ({ month: m, ...allData[m] }));
  }, [range]);

  const totals = useMemo(() => ({
    revenue: filtered.reduce((s, d) => s + d.revenue, 0),
    newCustomers: filtered.reduce((s, d) => s + d.newCustomers, 0),
    avgRetention: Math.round(filtered.reduce((s, d) => s + d.retention, 0) / filtered.length),
    avgChurn: Math.round(filtered.reduce((s, d) => s + d.churn, 0) / filtered.length),
  }), [filtered]);

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">ACA</div>
          <div>
            <div className="brand-name">AI Customer Analyzer</div>
            <div className="brand-sub">Analytics Dashboard</div>
          </div>
        </div>
        <nav className="nav">
          {[
            { id: "overview", label: "Overview", icon: "◈" },
            { id: "retention", label: "Retention & Churn", icon: "⟳" },
            { id: "revenue", label: "Revenue", icon: "₹" },
            { id: "channels", label: "Channels", icon: "⊕" },
            { id: "segments", label: "Segments", icon: "◑" },
          ].map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-footer-label">Built by Niraj Kumar Singh</div>
          <div className="sidebar-footer-sub">SRM IST Delhi-NCR · 2025</div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {/* TOP BAR */}
        <header className="topbar">
          <div>
            <h1 className="page-title">
              {activeTab === "overview" && "Dashboard Overview"}
              {activeTab === "retention" && "Retention & Churn Analysis"}
              {activeTab === "revenue" && "Revenue Trends"}
              {activeTab === "channels" && "Campaign Channels"}
              {activeTab === "segments" && "Customer Segments"}
            </h1>
            <p className="page-sub">Retail MarTech Analytics Platform · FY 2025</p>
          </div>

          <div className="filter-bar">
            <label>From</label>
            <select value={range.from} onChange={e => setRange(r => ({ ...r, from: +e.target.value }))}>
              {MONTHS.map((m, i) => i <= range.to && <option key={m} value={i}>{m}</option>)}
            </select>
            <label>To</label>
            <select value={range.to} onChange={e => setRange(r => ({ ...r, to: +e.target.value }))}>
              {MONTHS.map((m, i) => i >= range.from && <option key={m} value={i}>{m}</option>)}
            </select>
          </div>
        </header>

        <div className="content">

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <>
              <div className="stats-grid">
                <StatCard label="Total Revenue" value={fmt(totals.revenue)} sub={`${filtered.length} months`} accent="#0f3460" />
                <StatCard label="New Customers" value={totals.newCustomers.toLocaleString()} sub="acquired" accent="#16c79a" />
                <StatCard label="Avg Retention" value={totals.avgRetention + "%"} sub="monthly average" accent="#0f3460" />
                <StatCard label="Avg Churn" value={totals.avgChurn + "%"} sub="monthly average" accent="#e94560" />
              </div>

              <div className="charts-row">
                <div className="chart-card wide">
                  <SectionHeader title="Revenue + New Customers" onExport={() => downloadCSV(filtered, "revenue_data.csv")} />
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={filtered}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f3460" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0f3460" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis yAxisId="left" tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area yAxisId="left" type="monotone" dataKey="revenue" name="Revenue" stroke="#0f3460" fill="url(#revGrad)" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="newCustomers" name="New Customers" stroke="#16c79a" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <SectionHeader title="Customer Segments" />
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={segments} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                        {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => v + "%"} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── RETENTION ── */}
          {activeTab === "retention" && (
            <>
              <div className="stats-grid">
                <StatCard label="Peak Retention" value={Math.max(...filtered.map(d => d.retention)) + "%"} sub={filtered.find(d => d.retention === Math.max(...filtered.map(d => d.retention)))?.month} accent="#16c79a" />
                <StatCard label="Lowest Churn" value={Math.min(...filtered.map(d => d.churn)) + "%"} accent="#0f3460" />
                <StatCard label="Avg Retention" value={totals.avgRetention + "%"} accent="#0f3460" />
                <StatCard label="Avg Churn" value={totals.avgChurn + "%"} accent="#e94560" />
              </div>
              <div className="chart-card full">
                <SectionHeader title="Retention vs Churn Rate" onExport={() => downloadCSV(filtered.map(d => ({ month: d.month, retention: d.retention, churn: d.churn })), "retention.csv")} />
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={filtered}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tickFormatter={v => v + "%"} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="retention" name="Retention" stroke="#16c79a" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="churn" name="Churn" stroke="#e94560" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card full">
                <SectionHeader title="Active Customers Over Time" />
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={filtered}>
                    <defs>
                      <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16c79a" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#16c79a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="activeCustomers" name="Active Customers" stroke="#16c79a" fill="url(#custGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── REVENUE ── */}
          {activeTab === "revenue" && (
            <>
              <div className="stats-grid">
                <StatCard label="Total Revenue" value={fmt(totals.revenue)} accent="#0f3460" />
                <StatCard label="Peak Month" value={filtered.reduce((best, d) => d.revenue > best.revenue ? d : best, filtered[0])?.month || "-"} accent="#16c79a" />
                <StatCard label="Avg Conv. Rate" value={(filtered.reduce((s, d) => s + d.convRate, 0) / filtered.length).toFixed(1) + "%"} accent="#0f3460" />
                <StatCard label="Total Campaigns" value={filtered.reduce((s, d) => s + d.campaigns, 0)} accent="#f5a623" />
              </div>
              <div className="chart-card full">
                <SectionHeader title="Monthly Revenue" onExport={() => downloadCSV(filtered.map(d => ({ month: d.month, revenue: d.revenue, campaigns: d.campaigns, convRate: d.convRate })), "revenue.csv")} />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filtered}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#0f3460" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="charts-row">
                <div className="chart-card">
                  <SectionHeader title="Conversion Rate %" />
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={v => v + "%"} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="convRate" name="Conv. Rate" stroke="#f5a623" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <SectionHeader title="Campaigns Run" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="campaigns" name="Campaigns" fill="#16213e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ── CHANNELS ── */}
          {activeTab === "channels" && (
            <>
              <div className="stats-grid">
                {channelData.map(c => (
                  <StatCard key={c.channel} label={c.channel} value={(c.converted / c.sent * 100).toFixed(1) + "% conv."} sub={c.converted.toLocaleString() + " converted"} accent="#0f3460" />
                ))}
              </div>
              <div className="chart-card full">
                <SectionHeader title="Channel Performance Funnel" onExport={() => downloadCSV(channelData, "channels.csv")} />
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={channelData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="channel" tick={{ fontSize: 13 }} width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" name="Sent" fill="#e8ecf0" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="opened" name="Opened" fill="#a8b2c1" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="clicked" name="Clicked" fill="#0f3460" radius={[0, 3, 3, 0]} />
                    <Bar dataKey="converted" name="Converted" fill="#16c79a" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* ── SEGMENTS ── */}
          {activeTab === "segments" && (
            <>
              <div className="stats-grid">
                {segments.map(s => (
                  <StatCard key={s.name} label={s.name + " Customers"} value={s.value + "%"} sub="of total base" accent={s.color} />
                ))}
              </div>
              <div className="charts-row">
                <div className="chart-card">
                  <SectionHeader title="Segment Distribution" onExport={() => downloadCSV(segments, "segments.csv")} />
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={segments} cx="50%" cy="50%" outerRadius={100} dataKey="value" paddingAngle={4} label={({ name, value }) => `${name} ${value}%`}>
                        {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => v + "%"} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="chart-card">
                  <SectionHeader title="Segment Breakdown" />
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={segments}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={v => v + "%"} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => v + "%"} />
                      <Bar dataKey="value" name="Share" radius={[4, 4, 0, 0]}>
                        {segments.map((s, i) => <Cell key={i} fill={s.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card full">
                <SectionHeader title="Retention Trend by Month" />
                <div className="segment-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Month</th><th>Retention</th><th>Churn</th><th>New Customers</th><th>Active</th><th>Conv. Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(d => (
                        <tr key={d.month}>
                          <td><strong>{d.month}</strong></td>
                          <td><span className="badge green">{d.retention}%</span></td>
                          <td><span className="badge red">{d.churn}%</span></td>
                          <td>{d.newCustomers.toLocaleString()}</td>
                          <td>{d.activeCustomers.toLocaleString()}</td>
                          <td>{d.convRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
