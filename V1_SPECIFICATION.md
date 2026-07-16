# v1 Specification Document: Merchant Churn Risk Dashboard

**Project Name**: Churn Sentinel (Customer Success Risk Intelligence Platform)  
**Version**: v1.0.0  
**Stack**: React 18, TypeScript, Vite, Tailwind CSS, Recharts  

---

## 1. Executive Summary
**Churn Sentinel** is a production-quality, responsive Customer Success (CS) analytics dashboard designed to identify B2B merchants at risk of churning. It calculates active health scores dynamically using a multi-factor weighted algorithm, issues prioritized actionable outreach alerts, and offers a real-time sandbox simulation environment where CS managers can play out "what-if" resolution scenarios.

---

## 2. Technical Stack & Architecture

### Directory Structure
The codebase follows modular design principles, grouping code logically by concern:
```
/
├── index.html                   # Entry viewport & metadata
├── tailwind.config.js           # Styles variables & tokens
├── vite.config.ts               # Bundler settings
├── tsconfig.json                # TS compiler rules
└── src/
    ├── main.tsx                 # React app initializer
    ├── App.tsx                  # Root state & navigation
    ├── index.css                # Tailwind directives & overrides
    ├── types/
    │   └── merchant.ts          # Type interfaces
    ├── data/
    │   └── merchants.ts         # 20 Mock merchant profiles
    ├── utils/
    │   ├── churnScore.ts        # Churn health score logic
    │   └── recommendations.ts   # Next best action rules
    └── components/
        ├── Sidebar.tsx          # Account manager & category filter
        ├── KpiCards.tsx         # Executive metrics cards
        ├── RiskDistributionChart.tsx   # Recharts risk breakdown
        ├── RevenueChart.tsx            # Sector MRR comparison
        ├── HealthDistributionChart.tsx # Score bracket metrics
        ├── MerchantTable.tsx    # Scrollable dataset with search/filters
        └── DetailDrawer.tsx     # Profiler & sandbox simulation
```

---

## 3. Merchant Data Model (`src/types/merchant.ts`)
Each merchant object consists of the following typed properties:
*   `id` (string): Unique identifier.
*   `name` (string): Business name.
*   `businessType` (string): Business industry (Restaurant, Grocery, Beauty, etc.).
*   `owner` (string): Contact name.
*   `city` (string): Location.
*   `onboardingDate` (string): ISO Onboarding date.
*   `monthlyRevenue` (number): Current Month Recurring Revenue (MRR).
*   `previousRevenue` (number): Previous Month Recurring Revenue.
*   `totalOrders` (number): Current month order count.
*   `previousOrders` (number): Previous month order count.
*   `lastActiveDays` (number): Number of days since last dashboard login.
*   `weeklyLogins` (number): Average logins per week.
*   `supportTickets` (number): Active open support cases.
*   `paymentFailures` (number): Number of failed billing retries.
*   `subscriptionPlan` (Basic | Growth | Enterprise): Billing tier.
*   `accountManager` (string): Assigned CS manager.
*   `actionHistory` (ActivityLog[]): Activity log timeline.

---

## 4. Churn Scoring Model (`src/utils/churnScore.ts`)
The platform calculates a dynamic **Health Score (0-100)**. The weights are as follows:

| Weight Component | Percentage | Description |
| :--- | :--- | :--- |
| **Revenue Decline** | 35% | Evaluates monthly MRR shrinkage |
| **Inactivity** | 25% | Based on days since last platform active date |
| **Order Decline** | 20% | Evaluates transaction drop |
| **Support Tickets** | 10% | Open support cases burden |
| **Payment Failures** | 10% | Active unpaid invoices |

### Scoring Calculations:
1.  **Revenue Decline (35 points)**:
    *   $\%\Delta Revenue = \frac{\text{Current} - \text{Previous}}{\text{Previous}}$
    *   If $\%\Delta \ge 0$, score = $100$.
    *   If $\%\Delta \le -50\%$, score = $0$.
    *   Linear interpolation in-between: $\text{score} = \max(0, \frac{\%\Delta + 0.5}{0.5} \times 100)$.
2.  **Inactivity (25 points)**:
    *   If `lastActiveDays` $\le 1$ day, score = $100$.
    *   If `lastActiveDays` $\ge 30$ days, score = $0$.
    *   Linear interpolation: $\text{score} = \max(0, 100 - \frac{\text{lastActiveDays} - 1}{29} \times 100)$.
3.  **Order Decline (20 points)**:
    *   $\%\Delta Orders = \frac{\text{Current} - \text{Previous}}{\text{Previous}}$
    *   If $\%\Delta \ge 0$, score = $100$.
    *   If $\%\Delta \le -50\%$, score = $0$.
    *   Linear interpolation: $\text{score} = \max(0, \frac{\%\Delta + 0.5}{0.5} \times 100)$.
4.  **Support Tickets (10 points)**:
    *   $\text{score} = \max(0, 100 - (\text{supportTickets} \times 20))$. (5+ tickets results in 0 score).
5.  **Payment Failures (10 points)**:
    *   $\text{score} = \max(0, 100 - (\text{paymentFailures} \times 33.33))$. (3+ failures results in 0 score).

### Risk Ranges
*   **Healthy** ($\ge 70$): Green UI badge.
*   **Medium Risk** ($40 - 69$): Amber UI badge.
*   **High Risk** ($< 40$): Rose UI badge.

---

## 5. Next Best Action Engine (`src/utils/recommendations.ts`)
The action recommendation engine processes active metrics and returns a prioritized next step:

1.  **Billing Alert** (Critical Priority): Triggered if `paymentFailures > 0`.
    *   *Action*: "Alert billing support and reach out to update payment credentials."
2.  **Inactivity CS Outreach** (High Priority): Triggered if `lastActiveDays >= 7`.
    *   *Action*: "Schedule an immediate, high-priority CS outreach phone call."
3.  **Revenue Drop Campaign** (High Priority): Triggered if MRR decline is $\ge 15\%$.
    *   *Action*: "Offer a promotional campaign or a targeted merchant transaction fee rebate."
4.  **Onboarding/Training** (Medium Priority): Triggered if `supportTickets >= 3`.
    *   *Action*: "Schedule a screen-share walkthrough or custom platform re-training session."
5.  **VIP Outreach** (Medium Priority): Triggered if MRR $\ge \$25,000$ and healthy.
    *   *Action*: "Initiate a quarterly VIP review call with their assigned account manager."
6.  **Growth Upsell** (Low Priority): Triggered if revenue & order growth is $\ge 15\%$.
    *   *Action*: "Schedule outreach to pitch premium support SLA or add-on product features."
7.  **Standard Cadence** (Low Priority): Default fallback.
    *   *Action*: "Maintain current standard email nurture newsletters and product feature updates."

---

## 6. Layout & Key Features

*   **KPI Panel**: Summarizes portfolio stats. Filters adapt instantly as the Account Manager changes.
*   **Analytics Charts**: Visualizes risk distribution (Donut chart), industry current vs. previous revenue (Grouped Bar chart), and health score ranges (Bucket Histogram).
*   **Data Table**: Allows text searches, sorting across key attributes, risk/subscription filters, and exports filtered data to a clean CSV.
*   **Sliding Detail Drawer & Simulation Sandbox**:
    *   Displays full profiling history, timelines, and action logs.
    *   Integrates **real-time sliders** where users can play out modifications (e.g. resolving failures, updating logins) and see the score gauge, risk tier, and action alerts update live.

---

## 7. Build and Compilation Stats
*   **TypeScript Check**: Compiled cleanly with `tsc --noEmit` under strict mode.
*   **Vite Build**: Compiled production files successfully in **2.10 seconds**.
*   **Dist Files**:
    *   `dist/index.html` (1.60 kB)
    *   `dist/assets/index.css` (24.02 kB)
    *   `dist/assets/index.js` (617.35 kB)
