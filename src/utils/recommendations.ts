import { Merchant, Recommendation, ScoringBreakdown } from '../types/merchant';

export function getMerchantRecommendation(merchant: Merchant, breakdown: ScoringBreakdown): Recommendation {
  const { paymentFailures, lastActiveDays, supportTickets, monthlyRevenue } = merchant;
  const { revenueDeclineValue, orderDeclineValue } = breakdown;

  // 1. Payment failures (Critical)
  if (paymentFailures > 0) {
    return {
      riskExplanation: `Merchant has ${paymentFailures} failed invoice payments. Subscription suspension is imminent if payment details are not updated.`,
      recommendedAction: 'Alert billing support and reach out to update payment credentials.',
      priority: 'Critical',
      badgeColor: 'red'
    };
  }

  // 2. Inactivity (High)
  if (lastActiveDays >= 7) {
    return {
      riskExplanation: `Merchant has been completely inactive on the platform for ${lastActiveDays} days. High probability of silent churn.`,
      recommendedAction: 'Schedule an immediate, high-priority CS outreach phone call.',
      priority: 'High',
      badgeColor: 'orange'
    };
  }

  // 3. Revenue Decline (High)
  if (revenueDeclineValue <= -0.15) {
    const percentage = Math.abs(Math.round(revenueDeclineValue * 100));
    return {
      riskExplanation: `Monthly revenue has declined by ${percentage}% compared to the previous month, indicating structural loss of transaction volume.`,
      recommendedAction: 'Offer a promotional campaign or a targeted merchant transaction fee rebate.',
      priority: 'High',
      badgeColor: 'orange'
    };
  }

  // 4. Support Tickets (Medium)
  if (supportTickets >= 3) {
    return {
      riskExplanation: `Merchant opened ${supportTickets} support tickets in the last week, signifying potential UX friction or technical issues.`,
      recommendedAction: 'Schedule a screen-share walkthrough or custom platform re-training session.',
      priority: 'Medium',
      badgeColor: 'amber'
    };
  }

  // 5. High-Value Account VIP Outreach (Medium)
  if (monthlyRevenue >= 25000) {
    return {
      riskExplanation: `High-value enterprise merchant with stable metrics ($${monthlyRevenue.toLocaleString()}/mo). Regular VIP relationship check-in is due.`,
      recommendedAction: 'Initiate a quarterly VIP review call with their assigned account manager.',
      priority: 'Medium',
      badgeColor: 'amber'
    };
  }

  // 6. Rapidly Growing Merchant (Low)
  if (revenueDeclineValue >= 0.15 && orderDeclineValue >= 0.15) {
    return {
      riskExplanation: `Account is growing rapidly (revenue up ${Math.round(revenueDeclineValue * 100)}%, orders up ${Math.round(orderDeclineValue * 100)}%). Ready for upsell.`,
      recommendedAction: 'Schedule outreach to pitch premium support SLA or add-on product features.',
      priority: 'Low',
      badgeColor: 'emerald'
    };
  }

  // 7. Healthy and stable (Low)
  return {
    riskExplanation: 'Merchant demonstrates consistent engagement, stable billing, and healthy order/revenue velocity.',
    recommendedAction: 'Maintain current standard email nurture newsletters and product feature updates.',
    priority: 'Low',
    badgeColor: 'emerald'
  };
}
