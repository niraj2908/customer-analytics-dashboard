# Customer Analytics Dashboard

A responsive **MarTech analytics SPA** built with React, Tailwind CSS, and Recharts — visualising customer retention, churn, revenue trends, and campaign performance for retail brands.

**Live demo → [niraj-dashboard.vercel.app](https://niraj-dashboard.vercel.app)**

---

## Features

- **Overview** — revenue, new customers, retention KPIs at a glance
- **Retention & Churn** — month-by-month trend lines with active customer tracking
- **Revenue** — bar charts, conversion rates, campaign volume
- **Channel Performance** — funnel analysis across Email, SMS, WhatsApp, Push
- **Segments** — Loyal / At-Risk / New / Dormant breakdown (pie + bar)
- **Date-range filter** — slice any metric across any month range
- **CSV Export** — one-click download on every chart

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, functional components, custom hooks |
| State | Context API |
| Charts | Recharts (AreaChart, BarChart, LineChart, PieChart) |
| Styling | CSS variables, DM Sans + Syne fonts |
| Deploy | Vercel + GitHub Actions CI/CD |

## Getting Started

```bash
git clone https://github.com/nirajsingh0925/customer-analytics-dashboard
cd customer-analytics-dashboard
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repo directly at [vercel.com](https://vercel.com) — zero config needed.

---

Built by **Niraj Kumar Singh** · SRM IST Delhi-NCR · 2025
