export type SubscriptionPlan = 'Basic' | 'Growth' | 'Enterprise';

export interface Merchant {
  id: string;
  name: string;
  businessType: string;
  owner: string;
  city: string;
  onboardingDate: string;
  monthlyRevenue: number;
  previousRevenue: number;
  totalOrders: number;
  previousOrders: number;
  lastActiveDays: number;
  weeklyLogins: number;
  supportTickets: number;
  paymentFailures: number;
  subscriptionPlan: SubscriptionPlan;
  accountManager: string;
  notes?: string;
  actionTakenStatus?: 'Pending' | 'In Progress' | 'Resolved';
  actionTakenAt?: string;
  actionHistory?: ActivityLog[];
}

export interface ScoringBreakdown {
  revenueDeclineValue: number; // percentage change (e.g. -0.15 for -15%)
  revenueDeclineScore: number; // subscore 0-100
  revenueDeclineWeighted: number; // weighted contribution

  inactivityValue: number; // days
  inactivityScore: number;
  inactivityWeighted: number;

  orderDeclineValue: number; // percentage change
  orderDeclineScore: number;
  orderDeclineWeighted: number;

  supportTicketsValue: number; // count
  supportTicketsScore: number;
  supportTicketsWeighted: number;

  paymentFailuresValue: number; // count
  paymentFailuresScore: number;
  paymentFailuresWeighted: number;

  finalScore: number; // sum of weighted scores (0-100)
  riskLevel: 'Healthy' | 'Medium Risk' | 'High Risk';
}

export interface Recommendation {
  riskExplanation: string;
  recommendedAction: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  badgeColor: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  type: 'billing' | 'support' | 'login' | 'system' | 'action';
  description: string;
  user?: string;
}
