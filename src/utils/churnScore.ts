import { Merchant, ScoringBreakdown } from '../types/merchant';

export function calculateHealthScore(merchant: Merchant): ScoringBreakdown {
  const {
    monthlyRevenue,
    previousRevenue,
    totalOrders,
    previousOrders,
    lastActiveDays,
    supportTickets,
    paymentFailures
  } = merchant;

  // 1. Revenue Decline (35%)
  let revenueDeclineValue = 0;
  let revenueDeclineScore = 100;
  if (previousRevenue > 0) {
    revenueDeclineValue = (monthlyRevenue - previousRevenue) / previousRevenue;
    if (revenueDeclineValue < 0) {
      // Decline is negative. Let's say 50% decline or worse is 0 score
      // If change is -0.1 (10% decline), score is ( (-0.1 + 0.5) / 0.5 ) * 100 = 80
      revenueDeclineScore = Math.max(0, Math.min(100, ((revenueDeclineValue + 0.5) / 0.5) * 100));
    } else {
      revenueDeclineScore = 100;
    }
  }
  const revenueDeclineWeighted = Math.round(revenueDeclineScore * 0.35 * 10) / 10;

  // 2. Inactivity (25%)
  let inactivityScore = 100;
  if (lastActiveDays > 1) {
    // 30 days or more is 0 score
    inactivityScore = Math.max(0, Math.min(100, ((30 - lastActiveDays) / 29) * 100));
  }
  const inactivityWeighted = Math.round(inactivityScore * 0.25 * 10) / 10;

  // 3. Order Decline (20%)
  let orderDeclineValue = 0;
  let orderDeclineScore = 100;
  if (previousOrders > 0) {
    orderDeclineValue = (totalOrders - previousOrders) / previousOrders;
    if (orderDeclineValue < 0) {
      // 50% decline or worse is 0 score
      orderDeclineScore = Math.max(0, Math.min(100, ((orderDeclineValue + 0.5) / 0.5) * 100));
    } else {
      orderDeclineScore = 100;
    }
  }
  const orderDeclineWeighted = Math.round(orderDeclineScore * 0.20 * 10) / 10;

  // 4. Support Tickets (10%)
  // 5 tickets or more is 0 score
  const supportTicketsScore = Math.max(0, 100 - (supportTickets * 20));
  const supportTicketsWeighted = Math.round(supportTicketsScore * 0.10 * 10) / 10;

  // 5. Payment Failures (10%)
  // 3 failures or more is 0 score
  const paymentFailuresScore = Math.max(0, Math.round(100 - (paymentFailures * 33.33)));
  const paymentFailuresWeighted = Math.round(paymentFailuresScore * 0.10 * 10) / 10;

  // Cumulative health score
  const rawFinalScore =
    (revenueDeclineScore * 0.35) +
    (inactivityScore * 0.25) +
    (orderDeclineScore * 0.20) +
    (supportTicketsScore * 0.10) +
    (paymentFailuresScore * 0.10);
  
  const finalScore = Math.round(rawFinalScore);

  let riskLevel: 'Healthy' | 'Medium Risk' | 'High Risk' = 'Healthy';
  if (finalScore < 40) {
    riskLevel = 'High Risk';
  } else if (finalScore < 70) {
    riskLevel = 'Medium Risk';
  }

  return {
    revenueDeclineValue,
    revenueDeclineScore: Math.round(revenueDeclineScore),
    revenueDeclineWeighted,
    
    inactivityValue: lastActiveDays,
    inactivityScore: Math.round(inactivityScore),
    inactivityWeighted,
    
    orderDeclineValue,
    orderDeclineScore: Math.round(orderDeclineScore),
    orderDeclineWeighted,
    
    supportTicketsValue: supportTickets,
    supportTicketsScore: Math.round(supportTicketsScore),
    supportTicketsWeighted,
    
    paymentFailuresValue: paymentFailures,
    paymentFailuresScore: Math.round(paymentFailuresScore),
    paymentFailuresWeighted,
    
    finalScore,
    riskLevel
  };
}
